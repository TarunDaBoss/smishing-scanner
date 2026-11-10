// The rule-based scorer. It reads one message and returns a risk level, a
// confidence label, and the phrases that caused the flag with plain reasons.
// It runs entirely in the browser.

import { analyzeLink, BRANDS, findLinks, hostBelongsToBrand, linkHost } from './linkCheck'
import type { FoundLink, LinkAnalysis } from './linkCheck'

export type RiskLevel = 'none' | 'unknown_sender' | 'likely_spam' | 'known_scam'
export type Confidence = 'High' | 'Medium' | 'Low'
export type Signal = 'urgency' | 'money' | 'prize' | 'bad_link' | 'shortener' | 'brand_with_link' | 'unknown_sender'

export interface Highlight {
  start: number
  end: number
  text: string
  reason: string
  signal: Signal
}

export interface Detection {
  level: RiskLevel
  confidence: Confidence
  score: number
  signals: Signal[]
  highlights: Highlight[]
  links: FoundLink[]
  /** The most worrying link in the message, if there is one. */
  worstLink: LinkAnalysis | null
  /** One sentence for the warning banner. */
  summary: string
  senderInContacts: boolean
}

interface PhraseRule {
  signal: Signal
  pattern: RegExp
  reason: string
}

// Each rule is one kind of phrase and the reason shown next to it.
const PHRASE_RULES: PhraseRule[] = [
  // Urgency
  { signal: 'urgency', pattern: /\bfinal (?:notice|warning|reminder)\b/gi, reason: 'Pushes you to act fast' },
  { signal: 'urgency', pattern: /\bwithin \d+ ?(?:hours?|hrs?|minutes?|mins?|days?)\b/gi, reason: 'Gives you a short deadline' },
  { signal: 'urgency', pattern: /\b(?:act|respond|reply|claim|pay|click|tap) (?:now|immediately|today)\b/gi, reason: 'Pushes you to act fast' },
  { signal: 'urgency', pattern: /\b(?:urgent(?:ly)?|immediately|asap|last chance|expires? (?:today|soon|tonight))\b/gi, reason: 'Pushes you to act fast' },
  { signal: 'urgency', pattern: /\bon hold\b/gi, reason: 'Invents a problem so you’ll want to fix it' },
  { signal: 'urgency', pattern: /\b(?:suspended|locked|deactivated|will be (?:closed|canceled|cancelled))\b/gi, reason: 'Threatens to take something away' },

  // Money and payment
  { signal: 'money', pattern: /\b(?:unpaid |outstanding |overdue )?\$\s?\d[\d,]*(?:\.\d+)?\s+(?:fee|charge|balance|fine|toll|payment|bill)\b/gi, reason: 'Asks for money. Small fees are often used to get card details' },
  { signal: 'money', pattern: /\b(?:unpaid|overdue) (?:fee|charge|balance|fine|toll|bill|invoice)s?\b/gi, reason: 'Claims you owe money' },
  { signal: 'money', pattern: /\bpay(?= (?:now|here|today|online|within|the|your|this|at|by)\b|:)/gi, reason: 'Asks you to send money' },
  { signal: 'money', pattern: /\b(?:wire transfer|bank transfer|bitcoin|crypto|zelle|cash ?app)\b/gi, reason: 'Asks for a payment that’s hard to get back' },
  { signal: 'money', pattern: /\b(?:(?:confirm|verify|update|enter) your (?:card|payment|billing|bank|account)(?: details| info(?:rmation)?)?)\b/gi, reason: 'Asks for your payment or account details' },

  // Prizes
  { signal: 'prize', pattern: /\bcongrat(?:s|ulations)\b/gi, reason: 'Opens with good news to lower your guard' },
  { signal: 'prize', pattern: /\byou(?:['’]ve| have)? (?:been )?(?:selected|chosen|picked)\b/gi, reason: 'Says you were picked, a common bait' },
  { signal: 'prize', pattern: /\byou(?:['’]ve| have)? won\b|\bwinner\b|\blottery\b|\bsweepstakes\b/gi, reason: 'Claims you won something' },
  { signal: 'prize', pattern: /\$\s?\d[\d,]*(?:\.\d+)?\s+(?:gift ?card|prize|reward|voucher|cash)\b/gi, reason: 'Promises a valuable prize' },
  { signal: 'prize', pattern: /\bfree (?:gift|prize|iphone|ipad|money|cash)\b|\bgift ?card\b/gi, reason: 'Promises something for free' },
  { signal: 'prize', pattern: /\bclaim your\b/gi, reason: 'Asks you to collect something you didn’t expect' },
]

const WEIGHTS: Record<Signal, number> = {
  urgency: 2,
  money: 2,
  prize: 3,
  shortener: 3,
  bad_link: 3,
  brand_with_link: 2,
  unknown_sender: 1,
}

/** Content signals needed before a message from an unknown number becomes "Likely spam". */
const LIKELY_SPAM_SCORE = 3

const SIGNAL_SUMMARY: Partial<Record<Signal, string>> = {
  money: 'asks for money',
  prize: 'promises a prize',
  shortener: 'hides where its link goes',
  bad_link: 'has a suspicious link',
  urgency: 'pushes you to act fast',
  brand_with_link: 'names a company next to an unrelated link',
}

const SUMMARY_ORDER: Signal[] = ['money', 'prize', 'shortener', 'bad_link', 'brand_with_link', 'urgency']

export const LEVEL_RANK: Record<RiskLevel, number> = { none: 0, unknown_sender: 1, likely_spam: 2, known_scam: 3 }

/** The words people see for each level. "known_scam" is only an internal name. */
export const LEVEL_LABEL: Record<RiskLevel, string> = {
  none: '',
  unknown_sender: 'Unknown sender',
  likely_spam: 'Likely spam',
  known_scam: 'Possible scam',
}

function phraseHighlights(text: string): Highlight[] {
  const found: Highlight[] = []
  for (const rule of PHRASE_RULES) {
    for (const match of text.matchAll(rule.pattern)) {
      found.push({ start: match.index, end: match.index + match[0].length, text: match[0], reason: rule.reason, signal: rule.signal })
    }
  }
  return found
}

function brandHighlights(text: string, links: FoundLink[]): Highlight[] {
  if (links.length === 0) return []
  const found: Highlight[] = []
  for (const brand of BRANDS) {
    const match = brand.mention.exec(text)
    if (!match) continue
    const linkIsElsewhere = links.some((link) => !hostBelongsToBrand(linkHost(link.raw), brand.name))
    if (linkIsElsewhere) {
      found.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        reason: 'Names a company, but the link isn’t on its website',
        signal: 'brand_with_link',
      })
    }
  }
  return found
}

function linkHighlights(links: FoundLink[], analyses: LinkAnalysis[]): Highlight[] {
  return links.flatMap((link, index): Highlight[] => {
    const analysis = analyses[index]
    if (analysis.verdict === 'no_issues') return []
    return [{
      start: link.start,
      end: link.end,
      text: link.raw,
      reason: analysis.reason,
      signal: analysis.isShortener ? 'shortener' : 'bad_link',
    }]
  })
}

/** Keeps the earliest, longest phrase wherever two rules matched the same words. */
function removeOverlaps(highlights: Highlight[]): Highlight[] {
  const sorted = [...highlights].sort((a, b) => a.start - b.start || b.end - a.end)
  const kept: Highlight[] = []
  for (const highlight of sorted) {
    const previous = kept[kept.length - 1]
    if (!previous || highlight.start >= previous.end) kept.push(highlight)
  }
  return kept
}

function worstOf(analyses: LinkAnalysis[]): LinkAnalysis | null {
  const rank = { unsafe: 2, suspicious: 1, no_issues: 0 }
  return analyses.reduce<LinkAnalysis | null>(
    (worst, analysis) => (!worst || rank[analysis.verdict] > rank[worst.verdict] ? analysis : worst),
    null,
  )
}

function summarize(level: RiskLevel, signals: Signal[]): string {
  if (level === 'unknown_sender') return 'This number isn’t in your contacts.'
  const parts = SUMMARY_ORDER.filter((signal) => signals.includes(signal))
    .slice(0, 2)
    .map((signal) => SIGNAL_SUMMARY[signal])
  const sentence = `This message ${parts.join(' and ')}.`
  return sentence
}

function chooseLevel(signals: Signal[], score: number, worst: LinkAnalysis | null): RiskLevel {
  const has = (signal: Signal) => signals.includes(signal)
  const unsafeLink = worst?.verdict === 'unsafe'
  const anyBadLink = has('bad_link') || has('shortener')

  // A scam needs more than one warning sign pointing the same way.
  if ((has('money') && anyBadLink) || (unsafeLink && (has('urgency') || has('brand_with_link')))) {
    return 'known_scam'
  }
  // The unknown-sender point doesn't count toward spam on its own.
  if (score - WEIGHTS.unknown_sender >= LIKELY_SPAM_SCORE) return 'likely_spam'
  return 'unknown_sender'
}

function chooseConfidence(signals: Signal[], worst: LinkAnalysis | null): Confidence {
  const contentSignals = signals.filter((signal) => signal !== 'unknown_sender').length
  if (contentSignals >= 3 && worst?.verdict === 'unsafe') return 'High'
  if (contentSignals >= 2 || (worst !== null && worst.verdict !== 'no_issues')) return 'Medium'
  return 'Low'
}

export function detect(text: string, senderInContacts: boolean): Detection {
  const links = findLinks(text)
  const analyses = links.map((link) => analyzeLink(link.raw))
  const worstLink = worstOf(analyses)

  // People in your contacts are never flagged.
  if (senderInContacts) {
    return { level: 'none', confidence: 'Low', score: 0, signals: [], highlights: [], links, worstLink, summary: '', senderInContacts }
  }

  const highlights = removeOverlaps([
    ...linkHighlights(links, analyses),
    ...phraseHighlights(text),
    ...brandHighlights(text, links),
  ])

  // Signals come from the surviving highlights, so everything counted is
  // something the sheet can actually point at.
  const signals = [...new Set(highlights.map((highlight) => highlight.signal)), 'unknown_sender' as const]
  const score = signals.reduce((total, signal) => total + WEIGHTS[signal], 0)
  const level = chooseLevel(signals, score, worstLink)

  return {
    level,
    confidence: chooseConfidence(signals, worstLink),
    score,
    signals,
    highlights,
    links,
    worstLink,
    summary: summarize(level, signals),
    senderInContacts,
  }
}

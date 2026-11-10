// Finds links in a message and judges them from the address alone.
// Nothing here fetches or opens a link: it only reads the text of the address.

export interface FoundLink {
  raw: string
  start: number
  end: number
}

export type LinkVerdict = 'unsafe' | 'suspicious' | 'no_issues'

export interface LinkAnalysis {
  raw: string
  host: string
  verdict: LinkVerdict
  isShortener: boolean
  /** Short reason shown next to the highlighted link. Empty when nothing was found. */
  reason: string
  /** "Unsafe link", "Suspicious link" or "Nothing unusual found". */
  headline: string
  /** One plain-English sentence explaining the headline. */
  explanation: string
}

type BrandKind = 'delivery' | 'bank' | 'store' | 'tech' | 'government'

interface Brand {
  name: string
  /** How the name appears inside a web address. */
  tokens: string[]
  domains: string[]
  kind: BrandKind
  /** True for names that are also everyday words, like "apple". */
  commonWord?: boolean
  /** How the name has to appear in the message text to count as a mention. */
  mention: RegExp
}

export const BRANDS: Brand[] = [
  { name: 'UPS', tokens: ['ups'], domains: ['ups.com'], kind: 'delivery', mention: /\bUPS\b/ },
  { name: 'USPS', tokens: ['usps'], domains: ['usps.com'], kind: 'delivery', mention: /\bUSPS\b/ },
  { name: 'FedEx', tokens: ['fedex'], domains: ['fedex.com'], kind: 'delivery', mention: /\bfedex\b/i },
  { name: 'DHL', tokens: ['dhl'], domains: ['dhl.com'], kind: 'delivery', mention: /\bDHL\b/ },
  { name: 'Amazon', tokens: ['amazon'], domains: ['amazon.com'], kind: 'store', mention: /\bamazon\b/i },
  { name: 'Walmart', tokens: ['walmart'], domains: ['walmart.com'], kind: 'store', mention: /\bwalmart\b/i },
  { name: 'Costco', tokens: ['costco'], domains: ['costco.com'], kind: 'store', mention: /\bcostco\b/i },
  { name: 'Target', tokens: ['target'], domains: ['target.com'], kind: 'store', commonWord: true, mention: /\bTarget\b/ },
  { name: 'Apple', tokens: ['apple', 'icloud'], domains: ['apple.com', 'icloud.com'], kind: 'tech', commonWord: true, mention: /\b(?:Apple|iCloud)\b/ },
  { name: 'Microsoft', tokens: ['microsoft'], domains: ['microsoft.com'], kind: 'tech', mention: /\bmicrosoft\b/i },
  { name: 'Google', tokens: ['google'], domains: ['google.com'], kind: 'tech', mention: /\bgoogle\b/i },
  { name: 'Netflix', tokens: ['netflix'], domains: ['netflix.com'], kind: 'tech', mention: /\bnetflix\b/i },
  { name: 'PayPal', tokens: ['paypal'], domains: ['paypal.com'], kind: 'bank', mention: /\bpaypal\b/i },
  { name: 'Venmo', tokens: ['venmo'], domains: ['venmo.com'], kind: 'bank', mention: /\bvenmo\b/i },
  { name: 'Chase', tokens: ['chase'], domains: ['chase.com'], kind: 'bank', commonWord: true, mention: /\bChase\b/ },
  { name: 'Wells Fargo', tokens: ['wellsfargo'], domains: ['wellsfargo.com'], kind: 'bank', mention: /\bwells fargo\b/i },
  { name: 'Bank of America', tokens: ['bankofamerica', 'bofa'], domains: ['bankofamerica.com'], kind: 'bank', mention: /\bbank of america\b/i },
  { name: 'the IRS', tokens: ['irs'], domains: ['irs.gov'], kind: 'government', mention: /\bIRS\b/ },
]

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rb.gy',
  'tiny.cc', 'shorturl.at', 'rebrand.ly', 't.ly', 'v.gd', 'lnkd.in', 'btly.com',
])

/** Common, ordinary address endings. */
const NORMAL_ENDINGS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'es', 'it', 'nl',
  'se', 'no', 'jp', 'in', 'br', 'mx', 'ie', 'nz', 'ch', 'io', 'ai', 'app', 'dev',
])

/** Real endings that are unusual for a company's text message link. */
const ODD_ENDINGS = new Set([
  'co', 'xyz', 'top', 'click', 'icu', 'vip', 'loan', 'win', 'tk', 'ml', 'ga', 'cf', 'gq', 'buzz',
  'cam', 'rest', 'sbs', 'cfd', 'lat', 'work', 'info', 'biz', 'shop', 'site', 'online', 'store',
  'live', 'link', 'club', 'cc', 'ws', 'me', 'ly', 'gl', 'gd', 'to',
])

const TWO_PART_ENDINGS = new Set(['co.uk', 'org.uk', 'ac.uk', 'com.au', 'co.nz', 'co.jp', 'com.br', 'com.mx'])

const DELIVERY_WORDS = new Set(['parcel', 'redelivery', 'delivery', 'courier', 'shipping', 'package', 'tracking', 'postal'])
const BANK_WORDS = new Set(['bank', 'banking', 'secure', 'login', 'signin', 'verify', 'account', 'billing'])
const GOVERNMENT_WORDS = new Set(['toll', 'tolls', 'tax', 'dmv', 'refund'])
const PRIZE_WORDS = new Set(['reward', 'rewards', 'prize', 'prizes', 'claim', 'win', 'winner', 'gift', 'gifts', 'free', 'bonus', 'lucky'])
const LURE_WORDS = new Set([...BANK_WORDS, 'support', 'update', 'pay', 'payment', 'id', 'help'])

const LINK_PATTERN =
  /(?:https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?:[/?#][^\s]*)?)|(?:(?:https?:\/\/)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:[/?#][^\s]*)?)/gi

export function findLinks(text: string): FoundLink[] {
  const links: FoundLink[] = []
  for (const match of text.matchAll(LINK_PATTERN)) {
    const start = match.index
    const before = text[start - 1]
    if (before === '@' || (before && /[a-z0-9]/i.test(before))) continue

    const raw = match[0].replace(/[.,;:!?)'"]+$/, '')
    const hasScheme = /^https?:\/\//i.test(raw)
    const host = hostOf(raw)
    const hasPath = raw.length > raw.toLowerCase().indexOf(host) + host.length
    const ending = host.split('.').pop() ?? ''

    // Without "https://" or a path, "Sam.How" is a typo rather than a link, so
    // only accept endings that are recognizably web addresses. "https.btly.ups"
    // is a fake-https trick seen in real scams, so it counts too.
    const looksLikeLink =
      hasScheme ||
      hasPath ||
      NORMAL_ENDINGS.has(ending) ||
      ODD_ENDINGS.has(ending) ||
      SHORTENERS.has(host) ||
      /^https?\./.test(host)
    if (!looksLikeLink) continue

    links.push({ raw, start, end: start + raw.length })
  }
  return links
}

function hostOf(raw: string): string {
  return raw.replace(/^https?:\/\//i, '').split(/[/?#]/)[0].toLowerCase()
}

function registeredDomain(host: string): string {
  const labels = host.split('.')
  const lastTwo = labels.slice(-2).join('.')
  return TWO_PART_ENDINGS.has(lastTwo) ? labels.slice(-3).join('.') : lastTwo
}

function isOfficial(host: string, brand: Brand): boolean {
  return brand.domains.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

/** True when `host` is a website belonging to the named company. */
export function hostBelongsToBrand(host: string, brandName: string): boolean {
  const brand = BRANDS.find((candidate) => candidate.name === brandName)
  return brand ? isOfficial(host, brand) : false
}

export function linkHost(raw: string): string {
  return hostOf(raw)
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const saved = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = saved
    }
  }
  return row[b.length]
}

/** Turns the character swaps scammers use back into letters: amaz0n, paypa1, rnicrosoft. */
function unswap(token: string): string {
  return token
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/rn/g, 'm')
    .replace(/vv/g, 'w')
}

function isLookalike(token: string, brandToken: string): boolean {
  if (brandToken.length < 5 || token === brandToken) return false
  if (unswap(token) === brandToken) return true
  const allowed = brandToken.length >= 8 ? 2 : 1
  return Math.abs(token.length - brandToken.length) <= allowed && editDistance(token, brandToken) <= allowed
}

function looksRandom(token: string): boolean {
  if (token.length < 7) return false
  const digits = token.replace(/\D/g, '').length
  const letters = token.length - digits
  if (digits >= 2 && letters >= 2) return true
  return /[bcdfghjklmnpqrstvwxz]{6,}/.test(token)
}

function result(
  raw: string,
  host: string,
  verdict: LinkVerdict,
  reason: string,
  explanation: string,
  isShortener = false,
): LinkAnalysis {
  const headline =
    verdict === 'unsafe' ? 'Unsafe link' : verdict === 'suspicious' ? 'Suspicious link' : 'Nothing unusual found'
  return { raw, host, verdict, isShortener, reason, headline, explanation }
}

const KIND_PHRASE: Record<BrandKind, string> = {
  delivery: 'a delivery company',
  bank: 'a bank',
  store: 'a store',
  tech: 'a tech company',
  government: 'a government agency',
}

export function analyzeLink(raw: string): LinkAnalysis {
  const host = hostOf(raw)

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    return result(raw, host, 'unsafe', 'Goes to a bare number, not a named website', 'This link goes to a bare number address instead of a named website.')
  }

  if (SHORTENERS.has(host)) {
    return result(raw, host, 'suspicious', 'Short link hides where it really goes', 'This is a shortened link, so you can’t see where it really goes.', true)
  }

  const domain = registeredDomain(host)
  const ending = domain.slice(domain.indexOf('.') + 1)
  const name = domain.slice(0, domain.indexOf('.'))
  const nameTokens = name.split('-').filter(Boolean)
  const allTokens = host.split('.').flatMap((label) => label.split('-')).filter(Boolean)
  const hyphens = name.split('-').length - 1
  const oddEnding = ODD_ENDINGS.has(ending) || (!NORMAL_ENDINGS.has(ending) && !ending.includes('.'))
  const hasLureWord = allTokens.some((token) => LURE_WORDS.has(token))

  for (const brand of BRANDS) {
    if (isOfficial(host, brand)) {
      return result(raw, host, 'no_issues', '', 'That doesn’t prove this link is safe.')
    }
  }

  for (const brand of BRANDS) {
    for (const brandToken of brand.tokens) {
      if (allTokens.some((token) => isLookalike(token, brandToken))) {
        return result(raw, host, 'unsafe', `Spelled to look like ${brand.name}`, `This address is pretending to be ${brand.name}.`)
      }
      if (allTokens.includes(brandToken) && (!brand.commonWord || oddEnding || hasLureWord)) {
        return result(raw, host, 'unsafe', `Uses ${brand.name}’s name, but isn’t its website`, `This address uses ${brand.name}’s name, but isn’t ${brand.name}’s website.`)
      }
    }
  }

  const riskyShape = oddEnding || hyphens >= 2
  if (riskyShape && nameTokens.some((token) => DELIVERY_WORDS.has(token))) {
    return result(raw, host, 'unsafe', 'Made to sound like a delivery company', `This address is pretending to be ${KIND_PHRASE.delivery}.`)
  }
  if (riskyShape && nameTokens.some((token) => BANK_WORDS.has(token))) {
    return result(raw, host, 'unsafe', 'Made to sound like a bank or login page', `This address is pretending to be ${KIND_PHRASE.bank}.`)
  }
  if (riskyShape && nameTokens.some((token) => GOVERNMENT_WORDS.has(token))) {
    return result(raw, host, 'unsafe', 'Made to sound like a government agency', `This address is pretending to be ${KIND_PHRASE.government}.`)
  }

  const hasPrizeWord = nameTokens.some((token) => PRIZE_WORDS.has(token))
  if (hasPrizeWord && oddEnding) {
    return result(raw, host, 'suspicious', 'Prize words and an unusual address ending', `This address uses prize words and an unusual ending (.${ending}).`)
  }
  if (hasPrizeWord) {
    return result(raw, host, 'suspicious', 'Address uses prize words', 'This address uses prize words to get you to tap.')
  }

  const pathTokens = raw.replace(/^https?:\/\//i, '').split(/[/?#=&]/).slice(1)
  if ([...allTokens, ...pathTokens].some((token) => looksRandom(token))) {
    return result(raw, host, 'suspicious', 'Address looks randomly generated', 'This address contains a random-looking string.')
  }

  if (oddEnding) {
    return result(raw, host, 'suspicious', 'Unusual address ending', `This address has an unusual ending (.${ending}).`)
  }

  return result(raw, host, 'no_issues', '', 'That doesn’t prove this link is safe.')
}

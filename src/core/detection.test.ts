import { describe, expect, it } from 'vitest'
import { detect } from './detection'
import { analyzeLink, findLinks } from './linkCheck'

const SCAM = 'FINAL NOTICE: Your package is on hold due to an unpaid $1.99 fee. Pay within 24 hrs: parcel-redelivery-help.co/pay'
const SPAM = 'Congrats! You’ve been selected for a $500 gift card. Claim now: rewards-claim.co/win'
const SAM = 'Hey, is this Sam? Got your number from the meetup.'

describe('the three test cases from the brief', () => {
  it('flags the package text as a scam with High confidence', () => {
    const result = detect(SCAM, false)
    expect(result.level).toBe('known_scam')
    expect(result.confidence).toBe('High')
    expect(result.highlights.map((h) => h.text)).toEqual([
      'FINAL NOTICE',
      'on hold',
      'unpaid $1.99 fee',
      'Pay',
      'within 24 hrs',
      'parcel-redelivery-help.co/pay',
    ])
  })

  it('flags the gift card text as likely spam with Medium confidence', () => {
    const result = detect(SPAM, false)
    expect(result.level).toBe('likely_spam')
    expect(result.confidence).toBe('Medium')
    expect(result.highlights.map((h) => h.text)).toEqual([
      'Congrats',
      'You’ve been selected',
      '$500 gift card',
      'Claim now',
      'rewards-claim.co/win',
    ])
  })

  it('accepts a straight apostrophe too', () => {
    expect(detect(SPAM.replace('’', "'"), false).level).toBe('likely_spam')
  })

  it('marks the Sam text as unknown sender with Low confidence and nothing highlighted', () => {
    const result = detect(SAM, false)
    expect(result.level).toBe('unknown_sender')
    expect(result.confidence).toBe('Low')
    expect(result.highlights).toEqual([])
  })
})

describe('contacts', () => {
  it.each([
    'Are you coming for dinner Sunday?',
    'also you owe me $12 for lunch, no rush',
    'Pay the $40 bill immediately, it’s urgent!',
    SCAM,
  ])('does not flag a contact: %s', (text) => {
    expect(detect(text, true).level).toBe('none')
  })
})

describe('other messages from unknown numbers', () => {
  it('leaves a harmless text as unknown sender', () => {
    expect(detect('Running 10 minutes late, sorry!', false).level).toBe('unknown_sender')
  })

  it('does not treat one urgent word as spam', () => {
    expect(detect('Can you call me back? It’s urgent', false).level).toBe('unknown_sender')
  })

  it('flags your original UPS design as a scam', () => {
    const text = 'Your UPS package had some difficulty arriving and therefore cannot be delivered. Please claim your refund in the link: https.btly.ups'
    const result = detect(text, false)
    expect(result.level).toBe('known_scam')
    expect(result.signals).toContain('brand_with_link')
  })

  it('treats a lone shortened link as likely spam', () => {
    expect(detect('check this out bit.ly/3xYzAb', false).level).toBe('likely_spam')
  })

  it('does not fault a company name next to its real website', () => {
    const result = detect('Your UPS package is out for delivery. Track it at ups.com/track', false)
    expect(result.signals).not.toContain('brand_with_link')
    expect(result.signals).not.toContain('bad_link')
    expect(result.level).toBe('unknown_sender')
  })

  it('never produces overlapping highlights', () => {
    const result = detect('URGENT: Pay now! Claim your $500 gift card, pay the $5 fee at x.xyz', false)
    for (let i = 1; i < result.highlights.length; i++) {
      expect(result.highlights[i].start).toBeGreaterThanOrEqual(result.highlights[i - 1].end)
    }
  })

  it('points every highlight at the exact words in the message', () => {
    const result = detect(SCAM, false)
    for (const highlight of result.highlights) {
      expect(SCAM.slice(highlight.start, highlight.end)).toBe(highlight.text)
    }
  })
})

describe('finding links', () => {
  it('finds a bare address and leaves off trailing punctuation', () => {
    expect(findLinks('Go to example.com/a.').map((l) => l.raw)).toEqual(['example.com/a'])
  })

  it.each(['Hey.What is up', 'I paid $1.99 today', 'mail me at sam@example.com'])('finds no link in: %s', (text) => {
    expect(findLinks(text)).toEqual([])
  })
})

describe('link check, based on the address only', () => {
  it('uses the wording from the brief for the delivery lookalike', () => {
    const result = analyzeLink('parcel-redelivery-help.co/pay')
    expect(result.verdict).toBe('unsafe')
    expect(`${result.headline}. ${result.explanation}`).toBe('Unsafe link. This address is pretending to be a delivery company.')
  })

  it('calls the prize address suspicious, not unsafe', () => {
    expect(analyzeLink('rewards-claim.co/win').verdict).toBe('suspicious')
  })

  it.each([
    ['amaz0n-support.com', 'Amazon'],
    ['paypa1.com', 'PayPal'],
    ['rnicrosoft.com', 'Microsoft'],
  ])('catches the lookalike %s', (address, brand) => {
    const result = analyzeLink(address)
    expect(result.verdict).toBe('unsafe')
    expect(result.explanation).toContain(brand)
  })

  it('catches a real company name used as a subdomain', () => {
    expect(analyzeLink('ups.com.delivery-check.net').verdict).toBe('unsafe')
  })

  it('catches odd endings and random strings', () => {
    expect(analyzeLink('hello-world.xyz').verdict).toBe('suspicious')
    expect(analyzeLink('example.com/a8f3k2q9x').explanation).toContain('random')
  })

  it('does not confuse everyday words with companies', () => {
    expect(analyzeLink('apple-orchard-farm.com').verdict).toBe('no_issues')
    expect(analyzeLink('groups.com').verdict).toBe('no_issues')
  })

  it('never calls a clean address safe', () => {
    const result = analyzeLink('ups.com/track')
    expect(result.verdict).toBe('no_issues')
    expect(`${result.headline}. ${result.explanation}`).toBe('Nothing unusual found. That doesn’t prove this link is safe.')
  })
})

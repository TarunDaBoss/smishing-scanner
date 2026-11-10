import { detect } from './detection'
import type { Message, Thread } from './types'

export const SAMPLE_SCAM =
  'FINAL NOTICE: Your package is on hold due to an unpaid $1.99 fee. Pay within 24 hrs: parcel-redelivery-help.co/pay'
export const SAMPLE_SPAM = 'Congrats! You’ve been selected for a $500 gift card. Claim now: rewards-claim.co/win'
export const SAMPLE_UNKNOWN = 'Hey, is this Sam? Got your number from the meetup.'

const MINUTE = 60_000

type Line = [direction: 'in' | 'out', text: string, minutesAgo: number]

function messages(threadId: string, inContacts: boolean, lines: Line[], now: number): Message[] {
  return lines.map(([direction, text, minutesAgo], index) => ({
    id: `${threadId}-${index}`,
    direction,
    text,
    at: now - minutesAgo * MINUTE,
    detection: direction === 'in' ? detect(text, inContacts) : null,
  }))
}

function thread(id: string, name: string, isContact: boolean, lines: Line[], now: number, tint?: string): Thread {
  return { id, name, isContact, tint, messages: messages(id, isContact, lines, now), unread: !isContact, markedSafe: false, blocked: false }
}

// Numbers use 555-01xx, the range reserved for fiction, so no real person's
// number is ever shown as a scammer.
export function createThreads(now = Date.now()): Thread[] {
  return [
    thread('scam', '+1 (555) 010-0142', false, [['in', SAMPLE_SCAM, 12]], now),
    thread('mom', 'Mom', true, [
      ['in', 'Are you coming for dinner Sunday?', 180],
      ['out', 'Yes! What can I bring?', 172],
      ['in', 'Just yourself. Dad’s making his chili', 170],
      ['out', 'Perfect', 168],
      ['in', 'Call me when you land Friday, ok? Love you', 38],
    ], now, 'linear-gradient(180deg, #C8406A, #A32E55)'),
    thread('spam', '+1 (555) 010-0187', false, [['in', SAMPLE_SPAM, 125]], now),
    thread('jake', 'Jake', true, [
      ['in', 'you still good for pickup basketball thursday', 330],
      ['out', 'yeah 7 right?', 325],
      ['in', '7:30, gym on Oak. bring the good ball', 322],
      ['out', 'lol fine', 320],
      ['in', 'also you owe me $12 for lunch, no rush', 300],
    ], now, 'linear-gradient(180deg, #3A6FC4, #2C5AA6)'),
    thread('unknown', '+1 (555) 010-0119', false, [['in', SAMPLE_UNKNOWN, 400]], now),
  ]
}

function testNumber(taken: Set<string>): string {
  for (let suffix = 20; suffix <= 99; suffix++) {
    const number = `+1 (555) 010-01${suffix}`
    if (!taken.has(number)) return number
  }
  return '+1 (555) 010-0100'
}

/** A text from the test panel. It always comes from an unknown, fictional number. */
export function createIncomingThread(id: string, text: string, at: number, existing: Thread[]): Thread {
  const name = testNumber(new Set(existing.map((thread) => thread.name)))
  return {
    id,
    name,
    isContact: false,
    messages: [{ id: `${id}-0`, direction: 'in', text, at, detection: detect(text, false) }],
    unread: true,
    markedSafe: false,
    blocked: false,
  }
}

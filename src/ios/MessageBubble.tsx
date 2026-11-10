import type { Message } from '../core/types'
import type { LinkVerdict } from '../core/linkCheck'
import { MessageText } from '../shared/MessageText'

interface Props {
  message: Message
  hasTail: boolean
  flagged: boolean
  isContact: boolean
  scanVerdict?: LinkVerdict
}

export function MessageBubble({ message, hasTail, flagged, isContact, scanVerdict }: Props) {
  const side = message.direction === 'in' ? 'in' : isContact ? 'out' : 'out-sms'
  return (
    <div className="ios-bubble-row" data-side={message.direction}>
      <p className="ios-bubble" data-side={side} data-tail={hasTail}>
        <span className="sr-only">{message.direction === 'in' ? 'Received: ' : 'You sent: '}</span>
        <MessageText text={message.text} detection={message.detection} flagged={flagged} scanVerdict={scanVerdict} />
      </p>
    </div>
  )
}

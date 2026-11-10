import type { LinkVerdict } from '../core/linkCheck'
import type { Message } from '../core/types'
import { formatTime } from '../core/ui'
import { MessageText } from '../shared/MessageText'

interface Props {
  message: Message
  showTime: boolean
  flagged: boolean
  scanVerdict?: LinkVerdict
}

export function MessageBubble({ message, showTime, flagged, scanVerdict }: Props) {
  return (
    <div className="android-bubble-row" data-side={message.direction} data-last={showTime}>
      <p className="android-bubble" data-side={message.direction}>
        <span className="sr-only">{message.direction === 'in' ? 'Received: ' : 'You sent: '}</span>
        <MessageText text={message.text} detection={message.detection} flagged={flagged} scanVerdict={scanVerdict} />
      </p>
      {showTime && <span className="android-bubble-time">{formatTime(message.at)}</span>}
    </div>
  )
}

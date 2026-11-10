import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

const LETTERS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const SYMBOLS = ['1234567890', '-/:;()$&@"', ".,?!'"]

interface Props {
  open: boolean
  text: string
  ready: boolean
  onText: (text: string) => void
  onSend: () => void
}

interface KeyProps {
  className?: string
  on?: boolean
  ready?: boolean
  onPress: () => void
  children: ReactNode
}

function Key({ className = '', on, ready, onPress, children }: KeyProps) {
  return (
    <button type="button" tabIndex={-1} className={`ios-key ${className}`} data-on={on} data-ready={ready} onClick={onPress}>
      {children}
    </button>
  )
}

/** Stops a click on the keyboard from taking focus away from the message field. */
const keepFocus = (event: MouseEvent) => event.preventDefault()

/**
 * Screen readers and keyboard users type with the real keyboard, so this
 * stays out of their way. Every key on it works.
 */
export function Keyboard({ open, text, ready, onText, onSend }: Props) {
  const [symbols, setSymbols] = useState(false)
  const [shiftPressed, setShiftPressed] = useState(false)

  // Capitalizes automatically at the start of a message or sentence.
  const autoShift = text === '' || /[.!?]\s$/.test(text)
  const upper = shiftPressed !== autoShift
  const rows = symbols ? SYMBOLS : LETTERS

  const type = (character: string) => {
    onText(text + character)
    setShiftPressed(false)
  }

  const deleteLast = () => onText(Array.from(text).slice(0, -1).join(''))

  const letterKeys = (row: string) =>
    Array.from(row).map((character) => {
      const shown = !symbols && upper ? character.toUpperCase() : character
      return <Key key={character} onPress={() => type(shown)}>{shown}</Key>
    })

  return (
    <div className="ios-keyboard" data-open={open} aria-hidden="true" onMouseDown={keepFocus} data-no-edge-swipe>
      <div className="ios-keyboard-rows">
        <div className="ios-keyboard-row">{letterKeys(rows[0])}</div>
        <div className="ios-keyboard-row">{letterKeys(rows[1])}</div>
        <div className="ios-keyboard-row">
          {!symbols && (
            <Key className="ios-key-special" on={upper} onPress={() => setShiftPressed(!shiftPressed)}>
              <svg width="19" height="17" viewBox="0 0 19 17" fill={upper ? 'currentColor' : 'none'}>
                <path d="M9.5 1.5 1.5 9.5H6V15.5H13V9.5H17.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </Key>
          )}
          {!symbols && <span className="ios-keyboard-spacer" />}
          {letterKeys(rows[2])}
          {!symbols && <span className="ios-keyboard-spacer" />}
          <Key className="ios-key-special" onPress={deleteLast}>
            <svg width="23" height="17" viewBox="0 0 23 17" fill="none">
              <path d="M7 1.5h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7L1 8.5l6-7ZM11 5.5l6 6M17 5.5l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Key>
        </div>
        <div className="ios-keyboard-row">
          <Key className="ios-key-special ios-key-bottom" onPress={() => setSymbols(!symbols)}>{symbols ? 'ABC' : '123'}</Key>
          <Key className="ios-key-space" onPress={() => type(' ')}>space</Key>
          <Key className="ios-key-special ios-key-bottom ios-key-send" ready={ready} onPress={onSend}>send</Key>
        </div>
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'

export const IPHONE_FRAME_WIDTH = 428
export const IPHONE_FRAME_HEIGHT = 900

/** A current Pro shape, drawn entirely in CSS. */
export function IPhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="iphone">
      <span className="iphone-button iphone-action" />
      <span className="iphone-button iphone-volume-up" />
      <span className="iphone-button iphone-volume-down" />
      <span className="iphone-button iphone-power" />
      <div className="iphone-bezel">
        <div className="iphone-screen">
          {children}
          <div className="iphone-island" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

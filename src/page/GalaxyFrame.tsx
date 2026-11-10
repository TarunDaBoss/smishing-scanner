import type { ReactNode } from 'react'

/** A Galaxy-style phone, drawn entirely in CSS. Same outer size as the iPhone, so switching doesn't move the page. */
export function GalaxyFrame({ children }: { children: ReactNode }) {
  return (
    <div className="galaxy">
      <span className="galaxy-button galaxy-volume" />
      <span className="galaxy-button galaxy-power" />
      <div className="galaxy-bezel">
        <div className="galaxy-screen">
          {children}
          <div className="galaxy-camera" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}

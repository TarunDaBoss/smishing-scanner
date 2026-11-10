import { useEffect, useState } from 'react'
import { useApp } from '../core/store'
import { useMediaQuery } from '../core/ui'
import { AndroidApp } from '../android/AndroidApp'
import { IOSApp } from '../ios/IOSApp'
import { GalaxyFrame } from './GalaxyFrame'
import { IPHONE_FRAME_HEIGHT, IPHONE_FRAME_WIDTH, IPhoneFrame } from './IPhoneFrame'
import { PlatformSwitch } from './PlatformSwitch'

const ROOM_AROUND_PHONE = 104
const MIN_SCALE = 0.8

function useFrameScale() {
  const compute = () => Math.max(MIN_SCALE, Math.min(1, (window.innerHeight - ROOM_AROUND_PHONE) / IPHONE_FRAME_HEIGHT))
  const [scale, setScale] = useState(compute)
  useEffect(() => {
    const onResize = () => setScale(compute())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

export function PhoneStage() {
  const { state } = useApp()
  const framed = useMediaQuery('(min-width: 640px)')
  const scale = useFrameScale()
  const isIOS = state.platform === 'ios'
  const app = isIOS ? <IOSApp framed={framed} /> : <AndroidApp framed={framed} />

  if (!framed) {
    return (
      <section className="stage stage-bare" aria-label="Phone" data-platform={state.platform}>
        <div className="bare-screen">{app}</div>
        <div className="bare-strip">
          <PlatformSwitch />
        </div>
      </section>
    )
  }

  return (
    <section className="stage" aria-label="Phone">
      <div className="frame-space" style={{ width: IPHONE_FRAME_WIDTH * scale, height: IPHONE_FRAME_HEIGHT * scale }}>
        <div className="frame-scale" style={{ width: IPHONE_FRAME_WIDTH, height: IPHONE_FRAME_HEIGHT, transform: `scale(${scale})` }}>
          {isIOS ? <IPhoneFrame>{app}</IPhoneFrame> : <GalaxyFrame>{app}</GalaxyFrame>}
        </div>
      </div>
      <PlatformSwitch />
    </section>
  )
}

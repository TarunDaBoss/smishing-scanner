import { AppProvider } from './core/AppProvider'
import { Footer } from './page/Footer'
import { PhoneStage } from './page/PhoneStage'

export function App() {
  return (
    <AppProvider>
      <div className="page">
        <main className="page-main">
          <PhoneStage />
          <aside className="page-side">
            <h1 className="page-title">Smishing Scanner</h1>
            <p className="page-intro">A concept for scam text warnings built into your phone’s own messaging app. Open a conversation to try it.</p>
          </aside>
        </main>
        <Footer />
      </div>
    </AppProvider>
  )
}

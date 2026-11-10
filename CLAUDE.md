# Smishing Scanner

A working web prototype: a phone mockup running the phone's native messaging
app with scam detection built in. iPhone (iOS Messages, Liquid Glass) and
Android (Samsung Messages, One UI), switchable with shared state.

- **Stack:** React + TypeScript + Vite. No UI or animation libraries.
- **Live link:** not published yet (planned: https://tarundaboss.github.io/smishing-scanner/)
- **Commands:** `npm run dev`, `npm test`, `npm run lint`, `npm run build`

## Status
- Done: detection, iPhone version, Android version.
- Next: the test-text panel and notifications, then publishing.

## Key decisions

### No Figma calls
This project replaced an earlier Figma approach. Do not use Figma tools. The
original designs are reference only, and live outside this repo in
`../PNG Exports/`. Never commit them. Nothing outside this folder gets committed.

### Risk levels
Every level has its own icon shape and words, so color is never the only signal.

| Internal level   | On screen      | Color  | Icon              |
|------------------|----------------|--------|-------------------|
| `unknown_sender` | Unknown sender | Gray   | Question mark     |
| `likely_spam`    | Likely spam    | Orange | Exclamation circle|
| `known_scam`     | Possible scam  | Red    | Warning triangle  |

"Known scam" is only the internal name. The screen says "Possible scam" because
the detection is rule-based and there is no list of known scams.

### Detection is rule-based
`src/core/detection.ts` scores messages with clear rules. Confidence is shown
only as High, Medium or Low, never as a percentage. Expected results for the
three test cases: scam = red/High, spam = orange/Medium, Sam = gray/Low. Contacts
are never flagged. Any unknown number is at least gray, so a harmless text from
the test panel still arrives as "Unknown sender". `npm test` locks this in.

### Everything must be true
The interface only claims what the app really does.
- Detection runs in the browser. No analytics, no outside requests, and fonts are
  self-hosted, so the footer's "no messages leave this page" stays accurate.
- State lives in memory only. Refreshing resets the demo.
- Scan Link looks at the address only and says so. It never says a link is safe.
  A clean address gets "Nothing unusual found. That doesn't prove this link is safe."
  The 1.5 second wait is cosmetic, as the brief asked.
- Links never navigate anywhere, even after "This Is Safe". The sample domains
  could be real sites.
- Report and Block are simulated inside the phone. The "Concept prototype" footer
  covers that.
- Sample numbers use the reserved fictional 555-01xx range, so no real person is
  labeled a scammer.
- No control that does nothing: if it can't work, it isn't drawn as a button.

### Accessibility
Text contrast at least 4.5:1, tap targets at least 44px, keyboard navigation with
visible focus, screen reader labels on warnings and buttons.
- Apple's stock orange, red and iMessage blue are under 4.5:1 for text, so the
  tokens use slightly darker shades.
- The phone can scale down to 0.8 on short screens, so hit areas inside it are
  56px (56 x 0.8 = 44.8).

### Layout
- Both phone frames are drawn in code. No device photos, no Apple or Samsung logos.
- iPhone is light and Android is dark, matching the original designs.
- iPhone font: system stack, Inter as fallback. Android font: Roboto.
- Narrow screens (under 640px): no frame, no fake status bar, the app fills the
  screen, with the platform switch in a strip at the bottom.
- Both frames have the same outer size, so switching doesn't move the page.
- Switching phones keeps everything: conversations, the open thread or sheet, a
  scan in progress, drafts and search text. It all lives in `src/core/store.ts`.
- Logic is shared in `src/shared/` and `src/core/`. Only the look lives in
  `src/ios/` and `src/android/`.
- Motion: iPhone uses a push slide and left-edge swipe. Android uses Material
  shared-axis transitions and a predictive back gesture from either edge.
- Navigation is tied to browser history, so the phone's back gesture and the
  browser's Back button close the sheet or thread.

## Publishing to GitHub Pages
Not set up yet. This section gets filled in at the publish step.

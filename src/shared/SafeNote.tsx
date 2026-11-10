export function SafeNote({ onUndo }: { onUndo: () => void }) {
  return (
    <p className="safe-note">
      You marked this as safe.{' '}
      <button type="button" className="safe-undo tap" onClick={onUndo} aria-label="Undo marking this as safe">
        Undo
      </button>
    </p>
  )
}

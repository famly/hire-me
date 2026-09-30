import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * A button that opens a floating panel. Closes on outside click and Escape.
 * Used by Menu (ellipsis actions) and the board's colour legend.
 */
export function Popover({
  button,
  label,
  buttonClassName = '',
  panelClassName = 'w-52',
  align = 'right',
  panelRole = 'dialog',
  children,
}: {
  button: ReactNode
  label: string
  buttonClassName?: string
  panelClassName?: string
  align?: 'left' | 'right'
  panelRole?: 'dialog' | 'menu'
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup={panelRole}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
      >
        {button}
      </button>
      {open && (
        <div
          role={panelRole}
          aria-label={label}
          className={`absolute z-30 mt-1 rounded-xl bg-white shadow-lg ring-1 ring-stone-200 ${align === 'right' ? 'right-0' : 'left-0'} ${panelClassName}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

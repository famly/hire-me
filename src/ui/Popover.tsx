import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * A button that opens a floating panel. Closes on outside click and Escape.
 * Used by Menu (ellipsis actions), the board's colour legend, the match score and the CV chip.
 * `hover` also opens it on mouse-over (click still works, for touch and keyboard).
 * `fixed` places the panel against the viewport, so a scrolling board can't clip it.
 */
export function Popover({
  button,
  label,
  buttonClassName = '',
  panelClassName = 'w-52',
  align = 'right',
  panelRole = 'dialog',
  hover = false,
  fixed = false,
  children,
}: {
  button: ReactNode
  label: string
  buttonClassName?: string
  panelClassName?: string
  align?: 'left' | 'right'
  panelRole?: 'dialog' | 'menu'
  hover?: boolean
  fixed?: boolean
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [place, setPlace] = useState<CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const leaveTimer = useRef<number | undefined>(undefined)
  const close = () => setOpen(false)

  function show() {
    window.clearTimeout(leaveTimer.current)
    if (fixed && ref.current) {
      const r = ref.current.getBoundingClientRect()
      const below = r.bottom < window.innerHeight * 0.6
      setPlace({
        position: 'fixed',
        ...(below ? { top: r.bottom + 4 } : { bottom: window.innerHeight - r.top + 4 }),
        ...(align === 'right' ? { right: window.innerWidth - r.right } : { left: r.left }),
      })
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onScroll = () => fixed && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, fixed])

  return (
    <div
      ref={ref}
      className="relative"
      onClick={(e) => e.stopPropagation()}
      // Keep Enter/Space on the button from also activating a clickable parent (the pipeline card).
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && e.stopPropagation()}
      onMouseEnter={hover ? show : undefined}
      onMouseLeave={hover ? () => (leaveTimer.current = window.setTimeout(close, 150)) : undefined}
    >
      <button
        type="button"
        aria-label={label}
        aria-haspopup={panelRole}
        aria-expanded={open}
        onClick={() => (open && !hover ? close() : show())}
        className={buttonClassName}
      >
        {button}
      </button>
      {open && (
        <div
          role={panelRole}
          aria-label={label}
          style={place}
          className={`absolute z-30 rounded-xl bg-white shadow-lg ring-1 ring-stone-200 ${fixed ? '' : `mt-1 ${align === 'right' ? 'right-0' : 'left-0'}`} ${panelClassName}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}

import { MoreHorizontal } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

export interface MenuItem {
  label: string
  onSelect: () => void
  icon?: ReactNode
  danger?: boolean
}

/** Ellipsis quick-actions menu. Closes on outside click, Escape or selection. */
export function Menu({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="grid size-8 place-items-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-800"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1 w-52 rounded-xl bg-white py-1 shadow-lg ring-1 ring-stone-200">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                item.onSelect()
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-stone-50 ${item.danger ? 'text-red-700' : 'text-stone-800'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

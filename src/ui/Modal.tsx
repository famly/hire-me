import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded p-1 text-stone-500 hover:bg-stone-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-stone-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

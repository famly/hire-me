import type { ReactNode } from 'react'

/** Accessible on/off switch with its label. */
export function Switch({
  id,
  checked,
  onChange,
  children,
  invalid,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
  invalid?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-invalid={invalid || undefined}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${checked ? 'bg-brand-600' : invalid ? 'bg-red-200' : 'bg-stone-300'}`}
      >
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
      </button>
      <label htmlFor={id} className="text-sm text-stone-800">
        {children}
      </label>
    </div>
  )
}

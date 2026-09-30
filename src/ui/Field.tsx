import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export const inputClass =
  'block w-full rounded-lg border-0 bg-white px-3 py-2.5 text-base text-stone-900 ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-brand-600 focus:outline-none aria-[invalid=true]:ring-red-500 sm:text-sm'

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : hint ? (
        <p className="text-sm text-stone-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputClass} {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={inputClass} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={inputClass} rows={3} {...props} />
}

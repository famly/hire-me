import type { ReactNode } from 'react'

export type Tone = 'neutral' | 'green' | 'amber' | 'red' | 'brand' | 'blue'

const TONE: Record<Tone, string> = {
  neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
  green: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-100',
  blue: 'bg-sky-50 text-sky-800 ring-sky-200',
}

export function Badge({ tone = 'neutral', children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE[tone]}`}
    >
      {children}
    </span>
  )
}

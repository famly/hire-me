import type { ReactNode } from 'react'

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 px-6 py-10 text-center">
      <p className="font-medium text-stone-800">{title}</p>
      {children && <div className="mt-1 text-sm text-stone-500">{children}</div>}
    </div>
  )
}

import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl bg-white ring-1 ring-stone-200 ${className}`} {...props} />
}

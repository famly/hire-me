// Shared button styles, usable on <button> and <Link>.

export type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-stone-300',
  secondary: 'bg-white text-stone-800 ring-1 ring-inset ring-stone-300 hover:bg-stone-50',
  ghost: 'text-stone-700 hover:bg-stone-100',
  danger: 'bg-white text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-50',
}

const SIZE: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base w-full',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md') {
  return `inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]}`
}

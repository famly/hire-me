import type { ButtonHTMLAttributes } from 'react'
import { buttonClass, type Size, type Variant } from './buttonClass'

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={`${buttonClass(variant, size)} ${className}`} {...props} />
}

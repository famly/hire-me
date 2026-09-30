import type { Timestamp } from './types'

export const HOUR = 60 * 60 * 1000
export const DAY = 24 * HOUR

/** Compact duration for badges: "45m", "30h", "6d". */
export function formatDuration(ms: number): string {
  if (ms < HOUR) return `${Math.max(1, Math.round(ms / 60000))}m`
  if (ms < 72 * HOUR) return `${Math.floor(ms / HOUR)}h`
  return `${Math.floor(ms / DAY)}d`
}

const rtf = new Intl.RelativeTimeFormat('en-GB', { numeric: 'auto' })

export function relativeTime(at: Timestamp, now: Timestamp): string {
  const diff = at - now
  const abs = Math.abs(diff)
  if (abs < HOUR) return rtf.format(Math.round(diff / 60000), 'minute')
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour')
  return rtf.format(Math.round(diff / DAY), 'day')
}

export function formatDate(at: Timestamp | string): string {
  return new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** "Thu 3 Oct, 10:00" */
export function formatDateTime(at: Timestamp): string {
  const d = new Date(at)
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

/** "Thursday 3 October at 10:00" */
export function formatDateTimeLong(at: Timestamp): string {
  const d = new Date(at)
  return `${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
}

export function isoDate(at: Timestamp): string {
  return new Date(at).toISOString().slice(0, 10)
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

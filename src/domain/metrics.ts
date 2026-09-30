import { needsReply } from './queue'
import { HOUR, median } from './time'
import type { Application, Position, Timestamp } from './types'

// The brief's hypothesis: speed of first reply matters most. We measure it rather than assume it.

export function medianTimeToFirstReply(applications: Application[]): number | null {
  return median(
    applications.filter((a) => a.firstRepliedAt !== undefined).map((a) => a.firstRepliedAt! - a.createdAt),
  )
}

/**
 * Share of applications answered within 48h. Only counts applications whose outcome
 * is known: replied, or still unreplied past 48h. Newer unreplied ones are still in time.
 */
export function repliedWithin48hShare(applications: Application[], now: Timestamp): number | null {
  const limit = 48 * HOUR
  const replied = applications.filter((a) => a.firstRepliedAt !== undefined)
  const overdue = applications.filter((a) => needsReply(a) && now - a.createdAt > limit)
  const total = replied.length + overdue.length
  if (total === 0) return null
  return replied.filter((a) => a.firstRepliedAt! - a.createdAt <= limit).length / total
}

export function medianTimeToFill(positions: Position[]): number | null {
  return median(positions.filter((p) => p.filledAt !== undefined).map((p) => p.filledAt! - p.createdAt))
}

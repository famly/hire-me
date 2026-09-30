import { isActive, lastActivityAt } from './application'
import { HOUR } from './time'
import type { Application, Timestamp } from './types'

// The manager's home is a queue sorted by who has waited longest for a first reply
// (docs/SPEC.md §6: queue over kanban).

export type WaitLevel = 'fresh' | 'amber' | 'red'

export function needsReply(app: Application): boolean {
  return app.state === 'new' && app.firstRepliedAt === undefined
}

/** Time since arrival without a first reply, or null once replied. */
export function waitingFor(app: Application, now: Timestamp): number | null {
  return needsReply(app) ? now - app.createdAt : null
}

export function waitLevel(app: Application, now: Timestamp): WaitLevel | null {
  const waited = waitingFor(app, now)
  if (waited === null) return null
  if (waited > 48 * HOUR) return 'red'
  if (waited > 24 * HOUR) return 'amber'
  return 'fresh'
}

/**
 * 1. Needs a reply, oldest first.
 * 2. Other active applications, least recently touched first.
 * 3. Closed applications, most recent first.
 */
export function sortQueue(applications: Application[]): Application[] {
  const bucket = (a: Application) => (needsReply(a) ? 0 : isActive(a) ? 1 : 2)
  return [...applications].sort((a, b) => {
    const diff = bucket(a) - bucket(b)
    if (diff !== 0) return diff
    if (bucket(a) === 0) return a.createdAt - b.createdAt
    if (bucket(a) === 1) return lastActivityAt(a) - lastActivityAt(b)
    return lastActivityAt(b) - lastActivityAt(a)
  })
}

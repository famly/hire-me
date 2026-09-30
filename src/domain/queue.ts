import { HOUR } from './time'
import type { Application, Timestamp } from './types'

// Reply speed (docs/SPEC.md §1): the one thing we flag in red.

/** No first reply after this long → overdue. */
export const OVERDUE_AFTER = 48 * HOUR

export function needsReply(app: Application): boolean {
  return app.state === 'new' && app.firstRepliedAt === undefined
}

/** Time since arrival without a first reply, or null once replied. */
export function waitingFor(app: Application, now: Timestamp): number | null {
  return needsReply(app) ? now - app.createdAt : null
}

export function isOverdue(app: Application, now: Timestamp): boolean {
  const waited = waitingFor(app, now)
  return waited !== null && waited > OVERDUE_AFTER
}

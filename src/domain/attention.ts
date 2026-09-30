import { lastActivityAt } from './application'
import { interviewPhase } from './pipeline'
import { isOverdue, needsReply } from './queue'
import type { Application, Timestamp } from './types'

// What needs the manager today, in the order they'd deal with it. Each list is
// sorted so its first item is the one to open first. Drives the overview tiles.

export interface Attention {
  /** No first reply yet, longest wait first. */
  awaitingReply: Application[]
  /** The subset of awaitingReply past 48h. */
  overdue: Application[]
  /** Interviewed, no decision yet, longest ago first. */
  toDecide: Application[]
  /** Interviews still to come, soonest first. */
  upcoming: Application[]
  /** Offers made, no answer yet, oldest offer first. */
  offersOut: Application[]
}

export function attention(applications: Application[], now: Timestamp): Attention {
  const awaitingReply = applications.filter(needsReply).sort((a, b) => a.createdAt - b.createdAt)
  const byInterview = (a: Application, b: Application) => (a.interview?.at ?? 0) - (b.interview?.at ?? 0)
  return {
    awaitingReply,
    overdue: awaitingReply.filter((a) => isOverdue(a, now)),
    toDecide: applications.filter((a) => interviewPhase(a, now) === 'done').sort(byInterview),
    upcoming: applications.filter((a) => interviewPhase(a, now) === 'upcoming').sort(byInterview),
    offersOut: applications.filter((a) => a.state === 'offer').sort((a, b) => lastActivityAt(a) - lastActivityAt(b)),
  }
}

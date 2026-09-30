import { canTransition, lastActivityAt, type ApplicationAction } from './application'
import { needsReply } from './queue'
import type { Application, Timestamp } from './types'

// The hiring pipeline is a board with a few static lanes. Lanes never appear or
// disappear, so the manager always knows where to look.

export type Lane = 'candidates' | 'interview' | 'offer' | 'closed'

/** Always in this order. "Closed" holds every outcome: hired, rejected, withdrawn, lapsed. */
export const LANES: Lane[] = ['candidates', 'interview', 'offer', 'closed']

export const LANE_LABEL: Record<Lane, string> = {
  candidates: 'Candidates',
  interview: 'Interview',
  offer: 'Offer',
  closed: 'Closed',
}

export function laneOf(app: Application): Lane {
  switch (app.state) {
    case 'new':
    case 'contacted':
      return 'candidates'
    case 'interview':
      return 'interview'
    case 'offer':
      return 'offer'
    default:
      return 'closed'
  }
}

/**
 * Within the Interview lane: still to come, or happened and waiting for a decision.
 * Derived from the interview time, so it moves on its own. No interview on record
 * counts as "done" (a decision is due).
 */
export type InterviewPhase = 'upcoming' | 'done'

export function interviewPhase(app: Application, now: Timestamp): InterviewPhase | null {
  if (app.state !== 'interview') return null
  return app.interview && app.interview.at > now ? 'upcoming' : 'done'
}

export const INTERVIEW_PHASE_LABEL: Record<InterviewPhase, string> = {
  done: 'Interviewed · needs a decision',
  upcoming: 'Upcoming',
}

const LANE_ACTION: Partial<Record<Lane, ApplicationAction>> = {
  interview: 'invite',
  offer: 'offer',
  closed: 'reject',
}

/** The action that moves this application into `lane`, if allowed. Forward only; dropping on "closed" rejects. */
export function actionForLane(app: Application, lane: Lane): ApplicationAction | null {
  const action = LANE_ACTION[lane]
  return action && laneOf(app) !== lane && canTransition(app, action) ? action : null
}

/**
 * Candidates: waiting for a first reply on top, longest wait first; then the ones
 *   you've contacted, the longest-ago contact first.
 * Interview: by interview date, earliest first. That puts the ones needing a
 *   decision (past, oldest first) above the upcoming ones (soonest first).
 * Offer: the ones that have been sitting there longest first.
 * Closed: most recent first.
 */
export function sortLane(lane: Lane, apps: Application[]): Application[] {
  return [...apps].sort((a, b) => {
    if (lane === 'closed') return lastActivityAt(b) - lastActivityAt(a)
    if (lane === 'candidates') {
      const diff = Number(needsReply(b)) - Number(needsReply(a))
      if (diff !== 0) return diff
      if (needsReply(a)) return a.createdAt - b.createdAt
    }
    if (lane === 'interview') return (a.interview?.at ?? lastActivityAt(a)) - (b.interview?.at ?? lastActivityAt(b))
    return lastActivityAt(a) - lastActivityAt(b)
  })
}

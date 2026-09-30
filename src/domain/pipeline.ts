import { canTransition, lastActivityAt, type ApplicationAction } from './application'
import { needsReply } from './queue'
import type { Application } from './types'

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
 * Interview / Offer: the ones that have been sitting there longest first.
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
    return lastActivityAt(a) - lastActivityAt(b)
  })
}

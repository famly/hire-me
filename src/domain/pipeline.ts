import { canTransition, lastActivityAt, type ApplicationAction } from './application'
import type { Application } from './types'

// The hiring pipeline is a board with static lanes, one per stage. Lanes never
// appear or disappear, so the manager always knows where to look.

export type Lane = 'new' | 'contacted' | 'interview' | 'offer' | 'hired' | 'closed'

/** Always shown, in this order. "Closed" (rejected / withdrawn / lapsed) is shown on demand. */
export const LANES: Lane[] = ['new', 'contacted', 'interview', 'offer', 'hired']

export const LANE_LABEL: Record<Lane, string> = {
  new: 'New',
  contacted: 'Contacted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  closed: 'Closed',
}

export function laneOf(app: Application): Lane {
  switch (app.state) {
    case 'rejected':
    case 'withdrawn':
    case 'lapsed':
      return 'closed'
    default:
      return app.state
  }
}

const LANE_ACTION: Partial<Record<Lane, ApplicationAction>> = {
  contacted: 'contact',
  interview: 'invite',
  offer: 'offer',
  hired: 'hire',
  closed: 'reject',
}

/** The action that moves this application into `lane`, if allowed. Forward only; "closed" means reject. */
export function actionForLane(app: Application, lane: Lane): ApplicationAction | null {
  const action = LANE_ACTION[lane]
  return action && canTransition(app, action) ? action : null
}

/**
 * New: longest waiting first (reply speed matters most).
 * Contacted / Interview / Offer: least recently touched first.
 * Hired / Closed: most recent first.
 */
export function sortLane(lane: Lane, apps: Application[]): Application[] {
  return [...apps].sort((a, b) => {
    if (lane === 'new') return a.createdAt - b.createdAt
    if (lane === 'hired' || lane === 'closed') return lastActivityAt(b) - lastActivityAt(a)
    return lastActivityAt(a) - lastActivityAt(b)
  })
}

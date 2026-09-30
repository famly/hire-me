import { isActive, transitionApplication } from './application'
import type { Application, Message, Position, PositionState, Timestamp } from './types'

// Position lifecycle (docs/SPEC.md §4): draft → open → filled, open ⇄ paused, any → closed.

export type PositionAction = 'publish' | 'pause' | 'resume' | 'fill' | 'close'

const TRANSITIONS: Record<PositionAction, { from: PositionState[]; to: PositionState }> = {
  publish: { from: ['draft'], to: 'open' },
  pause: { from: ['open'], to: 'paused' },
  resume: { from: ['paused'], to: 'open' },
  fill: { from: ['open', 'paused'], to: 'filled' },
  close: { from: ['draft', 'open', 'paused'], to: 'closed' },
}

export const POSITION_ACTION_LABEL: Record<PositionAction, string> = {
  publish: 'Publish',
  pause: 'Pause',
  resume: 'Resume',
  fill: 'Mark as filled',
  close: 'Close',
}

export const POSITION_STATE_LABEL: Record<PositionState, string> = {
  draft: 'Draft',
  open: 'Open',
  paused: 'Paused',
  filled: 'Filled',
  closed: 'Closed',
}

/** Only open positions appear on the public portal. */
export function isPublic(position: Position): boolean {
  return position.state === 'open'
}

export function allowedPositionActions(position: Position): PositionAction[] {
  return (Object.keys(TRANSITIONS) as PositionAction[]).filter((a) =>
    TRANSITIONS[a].from.includes(position.state),
  )
}

export function transitionPosition(position: Position, action: PositionAction, now: Timestamp): Position {
  if (!TRANSITIONS[action].from.includes(position.state)) {
    throw new Error(`Cannot "${action}" a position that is ${position.state}`)
  }
  const to = TRANSITIONS[action].to
  return { ...position, state: to, filledAt: to === 'filled' ? now : position.filledAt }
}

export function hiredCount(position: Position, applications: Application[]): number {
  return applications.filter((a) => a.positionId === position.id && a.state === 'hired').length
}

/** Suggest "filled" once hires reach headcount. The manager confirms, we never auto-fill. */
export function shouldSuggestFilled(position: Position, applications: Application[]): boolean {
  return (
    (position.state === 'open' || position.state === 'paused') &&
    hiredCount(position, applications) >= position.headcount
  )
}

/**
 * Fill the position and close every remaining active application with a
 * "position filled" message, so nobody is left in silence.
 */
export function fillPosition(
  position: Position,
  applications: Application[],
  now: Timestamp,
  messageFor: (app: Application) => Message,
): { position: Position; applications: Application[] } {
  return {
    position: transitionPosition(position, 'fill', now),
    applications: applications.map((app) =>
      app.positionId === position.id && isActive(app)
        ? transitionApplication(app, 'reject', now, { message: messageFor(app), reason: 'position_filled' })
        : app,
    ),
  }
}

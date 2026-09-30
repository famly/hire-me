import { DAY } from './time'
import type {
  Actor,
  Application,
  ApplicationState,
  Interview,
  InterviewSlots,
  CandidateStatus,
  Message,
  RejectionReason,
  Timestamp,
  TimelineEvent,
} from './types'

// Application lifecycle (docs/SPEC.md §4):
// new → contacted → interview → offer → hired, with exits rejected / withdrawn / lapsed,
// and declined when they turn the offer down.

export const ACTIVE_STATES: ApplicationState[] = ['new', 'contacted', 'interview', 'offer']

export type ApplicationAction = 'contact' | 'invite' | 'offer' | 'hire' | 'reject' | 'lapse' | 'withdraw' | 'decline'

const TRANSITIONS: Record<ApplicationAction, { from: ApplicationState[]; to: ApplicationState; by: Actor }> = {
  contact: { from: ['new'], to: 'contacted', by: 'manager' },
  invite: { from: ['new', 'contacted'], to: 'interview', by: 'manager' },
  offer: { from: ['new', 'contacted', 'interview'], to: 'offer', by: 'manager' },
  hire: { from: ACTIVE_STATES, to: 'hired', by: 'manager' },
  reject: { from: ACTIVE_STATES, to: 'rejected', by: 'manager' },
  lapse: { from: ACTIVE_STATES, to: 'lapsed', by: 'manager' },
  withdraw: { from: ACTIVE_STATES, to: 'withdrawn', by: 'candidate' },
  decline: { from: ['offer'], to: 'declined', by: 'manager' },
}

export const ACTION_LABEL: Record<ApplicationAction, string> = {
  contact: 'Contact',
  invite: 'Invite to interview',
  offer: 'Make offer',
  hire: 'Hire',
  reject: 'Reject',
  lapse: 'Mark as lapsed',
  withdraw: 'Withdraw',
  decline: 'Offer declined',
}

export const STATE_LABEL: Record<ApplicationState, string> = {
  new: 'New',
  contacted: 'Contacted',
  interview: 'Interview',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  lapsed: 'Lapsed',
  declined: 'Offer declined',
}

/** No activity for this long after the first reply → the application has "gone quiet". */
export const STALE_AFTER = 5 * DAY

export function isActive(app: Application): boolean {
  return ACTIVE_STATES.includes(app.state)
}

export function canTransition(app: Application, action: ApplicationAction): boolean {
  return TRANSITIONS[action].from.includes(app.state)
}

export function lastActivityAt(app: Application): Timestamp {
  return app.timeline.reduce((latest, e) => Math.max(latest, e.at), app.createdAt)
}

/**
 * Derived, never stored. Only applies after the first reply: an unreplied "new"
 * application is the nursery's delay, tracked by the wait badge instead.
 */
/** Last sign of life: the latest timeline event, or an interview that has taken place. */
export function quietSince(app: Application, now: Timestamp): Timestamp {
  const interview = app.interview && app.interview.at <= now ? app.interview.at : 0
  return Math.max(lastActivityAt(app), interview)
}

export function isStale(app: Application, now: Timestamp): boolean {
  if (!isActive(app) || app.state === 'new') return false
  // An interview still to come isn't silence.
  if (app.interview && app.interview.at > now) return false
  return now - quietSince(app, now) > STALE_AFTER
}

/**
 * The step we expect next. The UI shows it as the link on the card and the primary
 * button in the panel. For anyone not yet interviewed it's the invite: that's the
 * reply that moves things on. "Contact" stays available in the panel.
 */
export function nextAction(app: Application): ApplicationAction | null {
  switch (app.state) {
    case 'new':
    case 'contacted':
      return 'invite'
    case 'interview':
      return 'offer'
    case 'offer':
      return 'hire'
    default:
      return null
  }
}

/** Everything the manager may do right now. "Lapse" appears only once the application is stale. */
export function managerActions(app: Application, now: Timestamp): ApplicationAction[] {
  return (Object.keys(TRANSITIONS) as ApplicationAction[]).filter(
    (action) =>
      TRANSITIONS[action].by === 'manager' &&
      canTransition(app, action) &&
      (action !== 'lapse' || isStale(app, now)),
  )
}

export function transitionApplication(
  app: Application,
  action: ApplicationAction,
  now: Timestamp,
  opts: { message?: Message; reason?: RejectionReason; interview?: Interview; slots?: InterviewSlots } = {},
): Application {
  if (!canTransition(app, action)) {
    throw new Error(`Cannot "${action}" an application that is ${app.state}`)
  }
  const { to, by } = TRANSITIONS[action]
  const events: TimelineEvent[] = [
    { id: eventId(app, 0), at: now, by, kind: 'status', from: app.state, to },
  ]
  if (opts.message) {
    events.push({ id: eventId(app, 1), at: now, by, kind: 'message', ...opts.message })
  }
  return {
    ...app,
    state: to,
    firstRepliedAt: app.firstRepliedAt ?? (by === 'manager' ? now : undefined),
    rejectionReason: action === 'reject' ? opts.reason : app.rejectionReason,
    interview: action === 'invite' && opts.interview ? opts.interview : app.interview,
    interviewSlots: action === 'invite' ? (opts.interview ? undefined : opts.slots) : app.interviewSlots,
    timeline: [...app.timeline, ...events],
  }
}

/** When they were invited to interview (the latest move into that state). */
export function invitedAt(app: Application): Timestamp | undefined {
  return app.timeline.findLast((e) => e.kind === 'status' && e.to === 'interview')?.at
}

/** Offered times the candidate can still pick: the ones not yet passed. */
export function openSlots(app: Application, now: Timestamp): Timestamp[] {
  return (app.interviewSlots?.options ?? []).filter((at) => at > now).sort((a, b) => a - b)
}

/** The candidate picks one of the offered times; it becomes the interview. */
export function pickInterviewSlot(app: Application, slot: Timestamp, now: Timestamp): Application {
  const slots = app.interviewSlots
  if (app.state !== 'interview' || !slots || !openSlots(app, now).includes(slot)) {
    throw new Error('That interview time is not on offer')
  }
  return {
    ...app,
    interview: { at: slot, mode: slots.mode, location: slots.location },
    interviewSlots: undefined,
    timeline: [...app.timeline, { id: eventId(app, 0), at: now, by: 'candidate', kind: 'booked', slot }],
  }
}

/** Interview notes can only be written once the interview has happened. */
export function canAddInterviewNotes(app: Application, now: Timestamp): boolean {
  return !!app.interview && app.interview.at <= now
}

export function addNote(app: Application, body: string, now: Timestamp, about?: 'interview'): Application {
  if (about === 'interview' && !canAddInterviewNotes(app, now)) {
    throw new Error('Interview notes need an interview that has taken place')
  }
  return {
    ...app,
    timeline: [...app.timeline, { id: eventId(app, 0), at: now, by: 'manager', kind: 'note', body, ...(about && { about }) }],
  }
}

export type NoteEvent = Extract<TimelineEvent, { kind: 'note' }>

export function interviewNotes(app: Application): NoteEvent[] {
  return app.timeline.filter((e): e is NoteEvent => e.kind === 'note' && e.about === 'interview')
}

function eventId(app: Application, offset: number): string {
  return `${app.id}-e${app.timeline.length + offset}`
}

// ---- Candidate-facing projection (docs/USER_JOURNEYS.md "Candidate-facing status") ----

const PROJECTION: Record<ApplicationState, CandidateStatus> = {
  new: 'received',
  contacted: 'being_reviewed',
  interview: 'invited_to_interview',
  offer: 'offer',
  hired: 'hired',
  rejected: 'not_progressing',
  withdrawn: 'closed',
  lapsed: 'closed',
  declined: 'offer_declined',
}

export function candidateStatus(app: Application): CandidateStatus {
  return PROJECTION[app.state]
}

export const CANDIDATE_STATUS_LABEL: Record<CandidateStatus, string> = {
  received: 'Received',
  being_reviewed: 'Being reviewed',
  invited_to_interview: 'Invited to interview',
  offer: 'Offer',
  hired: 'Hired',
  not_progressing: 'Not progressing',
  offer_declined: 'Offer declined',
  closed: 'Closed',
}

export function candidateStatusLine(app: Application, nurseryName: string, now?: Timestamp): string {
  switch (app.state) {
    case 'new':
      return `${nurseryName} has your application. You'll hear from them here and by email.`
    case 'contacted':
      return 'The nursery is looking at your application.'
    case 'interview':
      if (!app.interview && app.interviewSlots) {
        return 'The nursery would like to meet you. Pick the time that suits you best below.'
      }
      if (app.interview && now !== undefined && app.interview.at <= now) {
        return "Thanks for meeting the nursery. They'll let you know the outcome here and by email."
      }
      return app.interview
        ? 'The nursery would like to meet you. The details are below and in your email.'
        : 'The nursery would like to meet you. Check your email for details.'
    case 'offer':
      return "You've been offered the role. The nursery will be in touch about next steps."
    case 'hired':
      return 'Welcome to the team.'
    case 'rejected':
      return app.rejectionReason === 'position_filled'
        ? "This position has now been filled, so the nursery won't be taking your application further."
        : "The nursery won't be taking your application further this time."
    case 'withdrawn':
      return 'You withdrew this application.'
    case 'lapsed':
      return 'This application has been closed.'
    case 'declined':
      return "You turned down the offer. Thanks for letting the nursery know, and good luck with what's next."
  }
}

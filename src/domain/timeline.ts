import type { Actor, Application, ApplicationState, Message, Timestamp } from './types'

// The application's history as a list of plain steps for the manager's panel.
// A status change and the email sent with it are one step, not two lines; the
// interview itself shows up as a step at the time it happens (or will happen), with
// the notes from it underneath.

export type TimelineEntry =
  | { id: string; kind: 'step'; at: Timestamp; by: Actor; title: string; email?: Message }
  | { id: string; kind: 'interview'; at: Timestamp; title: string; upcoming: boolean; notes: InterviewNote[] }
  | { id: string; kind: 'note'; at: Timestamp; by: Actor; body: string }
  | { id: string; kind: 'email'; at: Timestamp; by: Actor; email: Message }

export interface InterviewNote {
  id: string
  at: Timestamp
  by: Actor
  body: string
}

const STEP_TITLE: Record<ApplicationState, string> = {
  new: 'Applied',
  contacted: 'Contacted',
  interview: 'Invited to interview',
  offer: 'Offer made',
  hired: 'Hired',
  rejected: 'Rejected',
  withdrawn: 'Withdrew',
  lapsed: 'Closed as lapsed',
  declined: 'Offer declined',
}

/** Newest first. An upcoming interview sits on top as the next thing to happen. */
export function timelineEntries(app: Application, now: Timestamp): TimelineEntry[] {
  const entries: TimelineEntry[] = []
  const notes: InterviewNote[] = []
  for (const e of app.timeline) {
    if (e.kind === 'note' && e.about === 'interview') {
      notes.push({ id: e.id, at: e.at, by: e.by, body: e.body })
      continue
    }
    const last = entries[entries.length - 1]
    if (e.kind === 'status') {
      const title =
        e.to === 'rejected' && app.rejectionReason === 'position_filled' ? 'Rejected: position filled' : STEP_TITLE[e.to]
      entries.push({ id: e.id, kind: 'step', at: e.at, by: e.by, title })
    } else if (e.kind === 'message' && last?.kind === 'step' && last.at === e.at && !last.email) {
      last.email = { subject: e.subject, body: e.body }
    } else if (e.kind === 'message') {
      entries.push({ id: e.id, kind: 'email', at: e.at, by: e.by, email: { subject: e.subject, body: e.body } })
    } else {
      entries.push({ id: e.id, kind: 'note', at: e.at, by: e.by, body: e.body })
    }
  }
  if (app.interview) {
    const upcoming = app.interview.at > now
    const where = app.interview.mode === 'online' ? 'online' : 'in person'
    entries.push({
      id: `${app.id}-interview`,
      kind: 'interview',
      at: app.interview.at,
      title: upcoming ? `Interview ${where}` : `Interviewed ${where}`,
      upcoming,
      notes,
    })
  }
  return entries.sort((a, b) => b.at - a.at)
}

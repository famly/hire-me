import { describe, expect, it } from 'vitest'
import { transitionApplication } from './application'
import { DAY, HOUR } from './time'
import { makeApp, T0 } from './testing'
import { timelineEntries } from './timeline'

const email = { subject: 's', body: 'b' }

describe('timeline entries', () => {
  it('folds the email sent with a step into that step, newest first', () => {
    let app = makeApp({ timeline: [{ id: 'e0', at: T0, by: 'candidate', kind: 'status', from: null, to: 'new' }] })
    app = transitionApplication(app, 'contact', T0 + HOUR, { message: email })
    const entries = timelineEntries(app, T0 + 2 * HOUR)
    expect(entries.map((e) => (e.kind === 'step' ? e.title : e.kind))).toEqual(['Contacted', 'Applied'])
    expect(entries[0].kind === 'step' && entries[0].email).toEqual(email)
  })

  it('shows an upcoming interview on top and a past one in its place', () => {
    const interview = { at: T0 + 2 * DAY, mode: 'online' as const, location: 'https://meet.example.com/x' }
    const app = transitionApplication(makeApp(), 'invite', T0, { interview })
    const before = timelineEntries(app, T0 + DAY)
    expect(before[0]).toMatchObject({ kind: 'interview', upcoming: true, title: 'Interview online' })
    const after = timelineEntries({ ...app, timeline: [...app.timeline, { id: 'n', at: T0 + 3 * DAY, by: 'manager', kind: 'note', body: 'Great' }] }, T0 + 4 * DAY)
    expect(after.map((e) => e.kind)).toEqual(['note', 'interview', 'step'])
    expect(after[1]).toMatchObject({ upcoming: false, title: 'Interviewed online' })
  })

  it('names a filled-position rejection', () => {
    const app = transitionApplication({ ...makeApp(), rejectionReason: 'position_filled' }, 'reject', T0, { reason: 'position_filled' })
    expect(timelineEntries(app, T0)[0]).toMatchObject({ title: 'Rejected: position filled' })
  })
})

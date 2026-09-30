import { describe, expect, it } from 'vitest'
import {
  candidateStatus,
  candidateStatusLine,
  isStale,
  managerActions,
  nextAction,
  STALE_AFTER,
  transitionApplication,
} from './application'
import { HOUR } from './time'
import { makeApp, T0 } from './testing'
import type { ApplicationState } from './types'

describe('application transitions', () => {
  it('moves forward and records a status event plus message', () => {
    const app = transitionApplication(makeApp(), 'invite', T0 + HOUR, { message: { subject: 's', body: 'b' } })
    expect(app.state).toBe('interview')
    expect(app.timeline.map((e) => e.kind)).toEqual(['status', 'message'])
  })

  it('sets firstRepliedAt on the first manager action only', () => {
    const contacted = transitionApplication(makeApp(), 'contact', T0 + HOUR)
    expect(contacted.firstRepliedAt).toBe(T0 + HOUR)
    const invited = transitionApplication(contacted, 'invite', T0 + 5 * HOUR)
    expect(invited.firstRepliedAt).toBe(T0 + HOUR)
  })

  it('counts a rejection as a reply', () => {
    expect(transitionApplication(makeApp(), 'reject', T0 + HOUR).firstRepliedAt).toBe(T0 + HOUR)
  })

  it('does not count a candidate withdrawal as a reply', () => {
    expect(transitionApplication(makeApp(), 'withdraw', T0 + HOUR).firstRepliedAt).toBeUndefined()
  })

  it('rejects illegal transitions', () => {
    expect(() => transitionApplication(makeApp({ state: 'hired' }), 'reject', T0)).toThrow()
    expect(() => transitionApplication(makeApp({ state: 'interview' }), 'contact', T0)).toThrow()
  })

  it('suggests the expected next step', () => {
    expect(nextAction(makeApp({ state: 'new' }))).toBe('contact')
    expect(nextAction(makeApp({ state: 'offer' }))).toBe('hire')
    expect(nextAction(makeApp({ state: 'rejected' }))).toBeNull()
  })
})

describe('stale ("gone quiet")', () => {
  const contacted = makeApp({
    state: 'contacted',
    firstRepliedAt: T0,
    timeline: [{ id: 'e', at: T0, by: 'manager', kind: 'status', from: 'new', to: 'contacted' }],
  })

  it('flags active applications with no activity past the threshold', () => {
    expect(isStale(contacted, T0 + STALE_AFTER)).toBe(false)
    expect(isStale(contacted, T0 + STALE_AFTER + 1)).toBe(true)
  })

  it('never flags unreplied new applications (the wait badge covers those)', () => {
    expect(isStale(makeApp(), T0 + 10 * STALE_AFTER)).toBe(false)
  })

  it('never flags closed applications', () => {
    expect(isStale({ ...contacted, state: 'rejected' }, T0 + 10 * STALE_AFTER)).toBe(false)
  })

  it('offers "lapse" only once stale', () => {
    expect(managerActions(contacted, T0)).not.toContain('lapse')
    expect(managerActions(contacted, T0 + STALE_AFTER + 1)).toContain('lapse')
  })

  it('never offers "withdraw" to the manager', () => {
    expect(managerActions(makeApp(), T0)).not.toContain('withdraw')
  })
})

describe('candidate-facing projection', () => {
  const cases: [ApplicationState, string][] = [
    ['new', 'received'],
    ['contacted', 'being_reviewed'],
    ['interview', 'invited_to_interview'],
    ['offer', 'offer'],
    ['hired', 'hired'],
    ['rejected', 'not_progressing'],
    ['withdrawn', 'closed'],
    ['lapsed', 'closed'],
  ]
  it.each(cases)('%s → %s', (state, status) => {
    expect(candidateStatus(makeApp({ state }))).toBe(status)
  })

  it('never uses internal wording in public copy', () => {
    for (const [state] of cases) {
      const line = candidateStatusLine(makeApp({ state }), 'Oak Tree Nursery').toLowerCase()
      expect(line).not.toMatch(/stale|lapsed|rejected/)
    }
  })

  it('explains a "position filled" rejection', () => {
    const app = makeApp({ state: 'rejected', rejectionReason: 'position_filled' })
    expect(candidateStatusLine(app, 'Oak Tree Nursery')).toMatch(/filled/)
  })
})

describe('interviews and stale', () => {
  const invited = transitionApplication(makeApp({ state: 'contacted', firstRepliedAt: T0 }), 'invite', T0, {
    interview: { at: T0 + 10 * STALE_AFTER, mode: 'online', location: 'https://meet.example/abc' },
  })

  it('stores the interview on invite', () => {
    expect(invited.interview?.mode).toBe('online')
  })

  it('is never quiet while an interview is still to come', () => {
    expect(isStale(invited, T0 + 9 * STALE_AFTER)).toBe(false)
  })

  it('counts a past interview as activity', () => {
    const at = T0 + 10 * STALE_AFTER
    expect(isStale(invited, at + STALE_AFTER - 1)).toBe(false)
    expect(isStale(invited, at + STALE_AFTER + 1)).toBe(true)
  })
})

describe('candidate line after the interview', () => {
  it('thanks them once the interview has happened', () => {
    const app = makeApp({ state: 'interview', interview: { at: T0, mode: 'in_person', location: 'Oak Tree' } })
    expect(candidateStatusLine(app, 'Oak Tree Nursery', T0 - 1)).toMatch(/details are below/)
    expect(candidateStatusLine(app, 'Oak Tree Nursery', T0 + 1)).toMatch(/outcome/)
  })
})

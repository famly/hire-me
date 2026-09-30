import { describe, expect, it } from 'vitest'
import { actionForLane, interviewPhase, laneOf, sortLane } from './pipeline'
import { DAY, HOUR } from './time'
import { makeApp, T0 } from './testing'

const at = (h: number) => [{ id: `e${h}`, at: T0 + h * HOUR, by: 'manager' as const, kind: 'note' as const, body: '' }]

describe('pipeline lanes', () => {
  it('puts every state in exactly one lane', () => {
    expect(laneOf(makeApp({ state: 'new' }))).toBe('candidates')
    expect(laneOf(makeApp({ state: 'contacted' }))).toBe('candidates')
    expect(laneOf(makeApp({ state: 'interview' }))).toBe('interview')
    expect(laneOf(makeApp({ state: 'offer' }))).toBe('offer')
    for (const state of ['hired', 'rejected', 'withdrawn', 'lapsed'] as const) {
      expect(laneOf(makeApp({ state }))).toBe('closed')
    }
  })

  it('allows forward moves, including skips, and never backward or in place', () => {
    const contacted = makeApp({ state: 'contacted' })
    expect(actionForLane(contacted, 'interview')).toBe('invite')
    expect(actionForLane(contacted, 'offer')).toBe('offer')
    expect(actionForLane(contacted, 'closed')).toBe('reject')
    expect(actionForLane(contacted, 'candidates')).toBeNull()
    expect(actionForLane(makeApp({ state: 'offer' }), 'interview')).toBeNull()
    expect(actionForLane(makeApp({ state: 'rejected' }), 'closed')).toBeNull()
  })

  it('puts unreplied candidates first, longest wait on top, then contacted ones', () => {
    const apps = [
      makeApp({ id: 'contacted', state: 'contacted', firstRepliedAt: T0, createdAt: T0 - 100 * HOUR, timeline: at(0) }),
      makeApp({ id: 'recent', createdAt: T0 + 40 * HOUR }),
      makeApp({ id: 'oldest', createdAt: T0 }),
    ]
    expect(sortLane('candidates', apps).map((a) => a.id)).toEqual(['oldest', 'recent', 'contacted'])
  })

  it('sorts working lanes by longest untouched first, closed by most recent', () => {
    const apps = [makeApp({ id: 'fresh', state: 'offer', timeline: at(50) }), makeApp({ id: 'old', state: 'offer', timeline: at(1) })]
    expect(sortLane('offer', apps).map((a) => a.id)).toEqual(['old', 'fresh'])
    expect(sortLane('closed', apps).map((a) => a.id)).toEqual(['fresh', 'old'])
  })
})

describe('interview phases', () => {
  const at = T0 + 48 * HOUR
  const invited = makeApp({ state: 'interview', interview: { at, mode: 'in_person', location: 'Oak Tree' } })

  it('is upcoming until the interview time, then needs a decision', () => {
    expect(interviewPhase(invited, at - 1)).toBe('upcoming')
    expect(interviewPhase(invited, at)).toBe('done')
  })

  it('treats a missing interview as needing a decision, and other states as no phase', () => {
    expect(interviewPhase(makeApp({ state: 'interview' }), T0)).toBe('done')
    expect(interviewPhase(makeApp({ state: 'offer' }), T0)).toBeNull()
  })

  it('orders decisions first (oldest first), then upcoming (soonest first)', () => {
    const now = T0 + 100 * HOUR
    const iv = (id: string, h: number) => makeApp({ id, state: 'interview', interview: { at: T0 + h * HOUR, mode: 'online', location: 'x' } })
    const sorted = sortLane('interview', [iv('later', 150), iv('done-recent', 90), iv('soon', 110), iv('done-old', 10)])
    expect(sorted.map((a) => a.id)).toEqual(['done-old', 'done-recent', 'soon', 'later'])
    expect(sorted.map((a) => interviewPhase(a, now))).toEqual(['done', 'done', 'upcoming', 'upcoming'])
  })
})

describe('interview phase: waiting for a time', () => {
  it('is "awaiting" while the candidate has offered times and no interview', () => {
    const app = makeApp({ state: 'interview', interviewSlots: { options: [T0 + DAY], mode: 'online', location: 'https://x.y' } })
    expect(interviewPhase(app, T0)).toBe('awaiting')
  })
})

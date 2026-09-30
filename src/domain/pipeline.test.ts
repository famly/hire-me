import { describe, expect, it } from 'vitest'
import { actionForLane, laneOf, sortLane } from './pipeline'
import { HOUR } from './time'
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

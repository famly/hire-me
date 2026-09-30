import { describe, expect, it } from 'vitest'
import { actionForLane, laneOf, sortLane } from './pipeline'
import { HOUR } from './time'
import { makeApp, T0 } from './testing'

describe('pipeline lanes', () => {
  it('puts every state in exactly one lane', () => {
    expect(laneOf(makeApp({ state: 'interview' }))).toBe('interview')
    for (const state of ['rejected', 'withdrawn', 'lapsed'] as const) {
      expect(laneOf(makeApp({ state }))).toBe('closed')
    }
  })

  it('allows forward moves, including skips, and never backward', () => {
    const contacted = makeApp({ state: 'contacted' })
    expect(actionForLane(contacted, 'interview')).toBe('invite')
    expect(actionForLane(contacted, 'offer')).toBe('offer')
    expect(actionForLane(contacted, 'hired')).toBe('hire')
    expect(actionForLane(contacted, 'new')).toBeNull()
    expect(actionForLane(contacted, 'contacted')).toBeNull()
    expect(actionForLane(makeApp({ state: 'rejected' }), 'offer')).toBeNull()
    expect(actionForLane(contacted, 'closed')).toBe('reject')
  })

  it('sorts the New lane by longest wait first', () => {
    const apps = [makeApp({ id: 'recent', createdAt: T0 + 40 * HOUR }), makeApp({ id: 'oldest', createdAt: T0 })]
    expect(sortLane('new', apps).map((a) => a.id)).toEqual(['oldest', 'recent'])
  })

  it('sorts working lanes by least recently touched first', () => {
    const at = (h: number) => [{ id: `e${h}`, at: T0 + h * HOUR, by: 'manager' as const, kind: 'note' as const, body: '' }]
    const apps = [makeApp({ id: 'fresh', state: 'contacted', timeline: at(50) }), makeApp({ id: 'stale', state: 'contacted', timeline: at(1) })]
    expect(sortLane('contacted', apps).map((a) => a.id)).toEqual(['stale', 'fresh'])
  })
})

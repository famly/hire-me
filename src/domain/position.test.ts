import { describe, expect, it } from 'vitest'
import { allowedPositionActions, fillPosition, isPublic, shouldSuggestFilled, transitionPosition } from './position'
import { makeApp, makePosition, T0 } from './testing'

describe('position lifecycle', () => {
  it('only open positions are public', () => {
    expect(isPublic(makePosition({ state: 'open' }))).toBe(true)
    for (const state of ['draft', 'paused', 'filled', 'archived'] as const) {
      expect(isPublic(makePosition({ state }))).toBe(false)
    }
  })

  it('pauses and resumes', () => {
    const paused = transitionPosition(makePosition(), 'pause', T0)
    expect(paused.state).toBe('paused')
    expect(transitionPosition(paused, 'resume', T0).state).toBe('open')
  })

  it('treats filled and archived as terminal', () => {
    expect(allowedPositionActions(makePosition({ state: 'filled' }))).toEqual([])
    expect(allowedPositionActions(makePosition({ state: 'archived' }))).toEqual([])
  })

  it('suggests filled when hires reach headcount', () => {
    const position = makePosition({ headcount: 2 })
    const hired = makeApp({ id: 'a1', state: 'hired' })
    expect(shouldSuggestFilled(position, [hired])).toBe(false)
    expect(shouldSuggestFilled(position, [hired, makeApp({ id: 'a2', state: 'hired' })])).toBe(true)
  })
})

describe('fillPosition', () => {
  it('rejects every remaining active application with a message, leaves others alone', () => {
    const apps = [
      makeApp({ id: 'hired', state: 'hired' }),
      makeApp({ id: 'new', state: 'new' }),
      makeApp({ id: 'interview', state: 'interview' }),
      makeApp({ id: 'withdrawn', state: 'withdrawn' }),
      makeApp({ id: 'other', positionId: 'p2', state: 'new' }),
    ]
    const result = fillPosition(makePosition(), apps, T0 + 1, () => ({ subject: 'Filled', body: 'Sorry' }))
    const byId = Object.fromEntries(result.applications.map((a) => [a.id, a]))

    expect(result.position.state).toBe('filled')
    expect(result.position.filledAt).toBe(T0 + 1)
    for (const id of ['new', 'interview']) {
      expect(byId[id].state).toBe('rejected')
      expect(byId[id].rejectionReason).toBe('position_filled')
      expect(byId[id].timeline.some((e) => e.kind === 'message')).toBe(true)
    }
    expect(byId.hired.state).toBe('hired')
    expect(byId.withdrawn.state).toBe('withdrawn')
    expect(byId.other.state).toBe('new')
  })
})

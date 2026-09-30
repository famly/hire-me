import { describe, expect, it } from 'vitest'
import { sortQueue, waitLevel } from './queue'
import { HOUR } from './time'
import { makeApp, T0 } from './testing'

const now = T0 + 100 * HOUR

describe('wait badge', () => {
  it('is fresh, amber, then red', () => {
    expect(waitLevel(makeApp({ createdAt: now - 4 * HOUR }), now)).toBe('fresh')
    expect(waitLevel(makeApp({ createdAt: now - 30 * HOUR }), now)).toBe('amber')
    expect(waitLevel(makeApp({ createdAt: now - 52 * HOUR }), now)).toBe('red')
  })

  it('disappears after the first reply', () => {
    expect(waitLevel(makeApp({ state: 'contacted', firstRepliedAt: now, createdAt: T0 }), now)).toBeNull()
  })
})

describe('sortQueue', () => {
  it('puts the longest-waiting unreplied first, then active, then closed', () => {
    const apps = [
      makeApp({ id: 'closed', state: 'rejected', firstRepliedAt: T0, createdAt: T0 }),
      makeApp({ id: 'active', state: 'interview', firstRepliedAt: T0, createdAt: T0 }),
      makeApp({ id: 'new-4h', createdAt: now - 4 * HOUR }),
      makeApp({ id: 'new-52h', createdAt: now - 52 * HOUR }),
    ]
    expect(sortQueue(apps).map((a) => a.id)).toEqual(['new-52h', 'new-4h', 'active', 'closed'])
  })
})

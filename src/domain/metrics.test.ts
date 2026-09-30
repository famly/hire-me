import { describe, expect, it } from 'vitest'
import { medianTimeToFill, medianTimeToFirstReply, repliedWithin48hShare } from './metrics'
import { DAY, HOUR } from './time'
import { makeApp, makePosition, T0 } from './testing'

const now = T0 + 10 * DAY

describe('metrics', () => {
  it('median time to first reply ignores unreplied applications', () => {
    const apps = [
      makeApp({ firstRepliedAt: T0 + 2 * HOUR }),
      makeApp({ firstRepliedAt: T0 + 10 * HOUR }),
      makeApp({ firstRepliedAt: T0 + 30 * HOUR }),
      makeApp(),
    ]
    expect(medianTimeToFirstReply(apps)).toBe(10 * HOUR)
    expect(medianTimeToFirstReply([makeApp()])).toBeNull()
  })

  it('48h share counts overdue unreplied as misses and skips ones still in time', () => {
    const apps = [
      makeApp({ firstRepliedAt: T0 + 2 * HOUR }), // hit
      makeApp({ firstRepliedAt: T0 + 60 * HOUR }), // miss
      makeApp({ createdAt: now - 72 * HOUR }), // overdue, miss
      makeApp({ createdAt: now - 4 * HOUR }), // still in time, excluded
    ]
    expect(repliedWithin48hShare(apps, now)).toBeCloseTo(1 / 3)
  })

  it('median time to fill uses filled positions only', () => {
    const positions = [
      makePosition({ state: 'filled', filledAt: T0 + 12 * DAY }),
      makePosition({ state: 'open' }),
    ]
    expect(medianTimeToFill(positions)).toBe(12 * DAY)
  })
})

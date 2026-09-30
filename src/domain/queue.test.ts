import { describe, expect, it } from 'vitest'
import { isOverdue, waitingFor } from './queue'
import { HOUR } from './time'
import { makeApp, T0 } from './testing'

const now = T0 + 100 * HOUR

describe('reply speed', () => {
  it('is overdue only after 48h without a first reply', () => {
    expect(isOverdue(makeApp({ createdAt: now - 30 * HOUR }), now)).toBe(false)
    expect(isOverdue(makeApp({ createdAt: now - 48 * HOUR }), now)).toBe(false)
    expect(isOverdue(makeApp({ createdAt: now - 52 * HOUR }), now)).toBe(true)
  })

  it('stops counting after the first reply', () => {
    const replied = makeApp({ state: 'contacted', firstRepliedAt: now, createdAt: T0 })
    expect(waitingFor(replied, now)).toBeNull()
    expect(isOverdue(replied, now)).toBe(false)
  })
})

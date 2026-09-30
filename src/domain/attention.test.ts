import { describe, expect, it } from 'vitest'
import { attention } from './attention'
import { DAY, HOUR } from './time'
import { makeApp, T0 } from './testing'

const now = T0 + 10 * DAY
const iv = (at: number) => ({ at, mode: 'in_person' as const, location: 'Oak Tree' })

describe('attention', () => {
  const apps = [
    makeApp({ id: 'new-recent', createdAt: now - 5 * HOUR }),
    makeApp({ id: 'new-overdue', createdAt: now - 60 * HOUR }),
    makeApp({ id: 'iv-soon', state: 'interview', interview: iv(now + DAY) }),
    makeApp({ id: 'iv-later', state: 'interview', interview: iv(now + 3 * DAY) }),
    makeApp({ id: 'iv-done', state: 'interview', interview: iv(now - 2 * DAY) }),
    makeApp({ id: 'offer', state: 'offer' }),
    makeApp({ id: 'hired', state: 'hired' }),
  ]
  const a = attention(apps, now)
  const ids = (xs: { id: string }[]) => xs.map((x) => x.id)

  it('lists who is waiting for a reply, longest first, and which are overdue', () => {
    expect(ids(a.awaitingReply)).toEqual(['new-overdue', 'new-recent'])
    expect(ids(a.overdue)).toEqual(['new-overdue'])
  })

  it('splits interviews into decisions due and upcoming, soonest first', () => {
    expect(ids(a.toDecide)).toEqual(['iv-done'])
    expect(ids(a.upcoming)).toEqual(['iv-soon', 'iv-later'])
  })

  it('counts offers still waiting for an answer', () => {
    expect(ids(a.offersOut)).toEqual(['offer'])
  })
})

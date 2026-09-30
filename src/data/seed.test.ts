import { describe, expect, it } from 'vitest'
import { isStale } from '../domain/application'
import { sortQueue, waitLevel } from '../domain/queue'
import { buildSeed, MANAGER_NURSERY_ID } from './seed'

// Guards the demo script in docs/USER_JOURNEYS.md against seed drift.
const now = Date.UTC(2026, 9, 1, 9, 0)
const seed = buildSeed(now)
const oakPositionIds = new Set(seed.positions.filter((p) => p.nurseryId === MANAGER_NURSERY_ID).map((p) => p.id))
const oakApps = seed.applications.filter((a) => oakPositionIds.has(a.positionId))
const name = (candidateId: string) => seed.candidates.find((c) => c.id === candidateId)!.name

describe('seed supports the journeys', () => {
  it('J3: queue starts Amira (red), Chloe (amber), Daniel (amber); Ben is not visible', () => {
    const queue = sortQueue(oakApps)
    expect(queue.slice(0, 3).map((a) => name(a.candidateId))).toEqual(['Amira Khan', 'Chloe Evans', 'Daniel Hughes'])
    expect(queue.slice(0, 3).map((a) => waitLevel(a, now))).toEqual(['red', 'amber', 'amber'])
    expect(oakApps.some((a) => a.candidateId === 'c-ben')).toBe(false)
  })

  it('J6: Amira is one candidate across two sites', () => {
    expect(seed.applications.filter((a) => a.candidateId === 'c-amira')).toHaveLength(2)
  })

  it('J8: Marcus is the only stale application', () => {
    expect(seed.applications.filter((a) => isStale(a, now)).map((a) => name(a.candidateId))).toEqual(['Marcus Bell'])
  })
})

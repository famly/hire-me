import { describe, expect, it } from 'vitest'
import { isStale } from '../domain/application'
import { interviewPhase, laneOf, sortLane } from '../domain/pipeline'
import { isOverdue } from '../domain/queue'
import { buildSeed, MANAGER_NURSERY_ID } from './seed'

// Guards the demo script in docs/USER_JOURNEYS.md against seed drift.
const now = Date.UTC(2026, 9, 1, 9, 0)
const seed = buildSeed(now)
const oakPositionIds = new Set(seed.positions.filter((p) => p.nurseryId === MANAGER_NURSERY_ID).map((p) => p.id))
const oakApps = seed.applications.filter((a) => oakPositionIds.has(a.positionId))
const name = (candidateId: string) => seed.candidates.find((c) => c.id === candidateId)!.name

describe('seed supports the journeys', () => {
  it('J3: Candidates lane starts Amira (overdue), Chloe, Daniel, Sophie, then contacted; Ben is not visible', () => {
    const lane = sortLane('candidates', oakApps.filter((a) => laneOf(a) === 'candidates'))
    expect(lane.map((a) => name(a.candidateId))).toEqual(['Amira Khan', 'Chloe Evans', 'Daniel Hughes', 'Sophie Turner', 'Ella Morgan'])
    expect(oakApps.filter((a) => isOverdue(a, now)).map((a) => name(a.candidateId))).toEqual(['Amira Khan'])
    expect(oakApps.some((a) => a.candidateId === 'c-ben')).toBe(false)
  })

  it('J3: Interview lane has a past interview needing a decision (Marcus) and an upcoming one (Jordan)', () => {
    const lane = sortLane('interview', oakApps.filter((a) => laneOf(a) === 'interview'))
    expect(lane.map((a) => [name(a.candidateId), interviewPhase(a, now)])).toEqual([
      ['Marcus Bell', 'done'],
      ['Jordan Reid', 'upcoming'],
    ])
  })

  it('J6: Amira is one candidate across two sites', () => {
    expect(seed.applications.filter((a) => a.candidateId === 'c-amira')).toHaveLength(2)
  })

  it('J8: Marcus is the only stale application', () => {
    expect(seed.applications.filter((a) => isStale(a, now)).map((a) => name(a.candidateId))).toEqual(['Marcus Bell'])
  })
})

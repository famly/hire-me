// Test fixtures only.
import type { Application, Position } from './types'

export const T0 = Date.UTC(2026, 9, 1, 9, 0)

export function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'a1',
    candidateId: 'c1',
    positionId: 'p1',
    state: 'new',
    answers: { qualification: 'L3', earliestStart: '2026-10-15', availability: 'full_time', rightToWork: true },
    statusToken: 'tok',
    createdAt: T0,
    timeline: [],
    ...overrides,
  }
}

export function makePosition(overrides: Partial<Position> = {}): Position {
  return {
    id: 'p1',
    nurseryId: 'n1',
    title: 'Level 3 Practitioner',
    requiredQualification: 'L3',
    hoursPerWeek: 40,
    contract: 'Permanent',
    payRange: '£13.20–14.00/h',
    headcount: 1,
    description: '',
    state: 'open',
    createdAt: T0,
    ...overrides,
  }
}

import { describe, expect, it } from 'vitest'
import { findOrCreateCandidate, otherApplications } from './candidate'
import { makeApp } from './testing'
import type { Candidate } from './types'

const amira: Candidate = { id: 'c1', groupId: 'g1', email: 'amira@example.com', name: 'Amira Khan', phone: '1' }

describe('findOrCreateCandidate', () => {
  it('reuses the candidate for the same email in the same group, ignoring case and spaces', () => {
    const r = findOrCreateCandidate([amira], { groupId: 'g1', email: ' Amira@Example.com ', name: 'Amira Khan', phone: '2' }, 'new')
    expect(r.created).toBe(false)
    expect(r.candidate.id).toBe('c1')
    expect(r.candidate.phone).toBe('2')
    expect(r.candidates).toHaveLength(1)
  })

  it('never matches across groups', () => {
    const r = findOrCreateCandidate([amira], { groupId: 'g2', email: 'amira@example.com', name: 'Amira Khan', phone: '1' }, 'c2')
    expect(r.created).toBe(true)
    expect(r.candidate.id).toBe('c2')
    expect(r.candidates).toHaveLength(2)
  })
})

describe('otherApplications', () => {
  it('finds the same candidate on other positions only', () => {
    const apps = [
      makeApp({ id: 'a1', candidateId: 'c1', positionId: 'p1' }),
      makeApp({ id: 'a2', candidateId: 'c1', positionId: 'p5' }),
      makeApp({ id: 'a3', candidateId: 'c9', positionId: 'p1' }),
    ]
    expect(otherApplications(apps[0], apps).map((a) => a.id)).toEqual(['a2'])
  })
})

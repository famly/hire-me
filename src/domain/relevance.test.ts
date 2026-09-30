import { describe, expect, it } from 'vitest'
import { matchApplication } from './relevance'
import { makeApp, makePosition, T0 } from './testing'

const withAnswers = (answers: Partial<ReturnType<typeof makeApp>['answers']>) =>
  makeApp({ answers: { ...makeApp().answers, ...answers } })

describe('match score', () => {
  it('scores a full fit at 100 and says so', () => {
    const m = matchApplication(withAnswers({ qualifications: ['l3-eye', 'pfa'] }), makePosition(), T0)
    expect(m.score).toBe(100)
    expect(m.band).toBe('strong')
    expect(m.summary).toMatch(/^Strong match\./)
    expect(m.summary).not.toMatch(/Worth checking/)
  })

  it('takes points off for each gap and names it in the summary', () => {
    const m = matchApplication(
      withAnswers({ qualifications: ['l2-eyp'], rightToWork: false, availability: 'part_time', earliestStart: '2027-01-15' }),
      makePosition(),
      T0,
    )
    // Qualification one level short (20), no right to work (0), hours mismatch (5), start far off (3), no first aid (0).
    expect(m.score).toBe(28)
    expect(m.band).toBe('weak')
    expect(m.summary).toMatch(/Worth checking: .*below the Level 3.*right to work/)
  })

  it('gives full qualification points when the role needs none', () => {
    const m = matchApplication(withAnswers({ qualifications: ['none'] }), makePosition({ requiredQualification: 'none' }), T0)
    expect(m.factors[0].points).toBe(40)
  })

  it('treats "either" as fitting any hours', () => {
    const m = matchApplication(withAnswers({ availability: 'either' }), makePosition({ hoursPerWeek: 25 }), T0)
    expect(m.factors.find((f) => f.label === 'Hours')!.points).toBe(15)
  })
})

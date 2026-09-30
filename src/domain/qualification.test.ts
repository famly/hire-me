import { describe, expect, it } from 'vitest'
import { levelOf, meetsRequirement, normaliseQualifications } from './qualification'

describe('qualifications', () => {
  it('takes the highest level across everything picked', () => {
    expect(levelOf(['l2-eyp', 'l3-cache', 'pfa'])).toBe('L3')
    expect(levelOf(['wt-l3', 'pfa'])).toBe('working_towards')
    expect(levelOf(['l6-qts'])).toBe('L3')
  })

  it('treats nothing, or certificates only, as no qualification', () => {
    expect(levelOf([])).toBe('none')
    expect(levelOf(['pfa'])).toBe('none')
  })

  it('matches against a position requirement', () => {
    expect(meetsRequirement(levelOf(['l2-eyp']), 'L3')).toBe(false)
    expect(meetsRequirement(levelOf(['l5-fd']), 'L3')).toBe(true)
  })

  it('keeps "no qualification yet" exclusive', () => {
    expect(normaliseQualifications(['l2-eyp'], ['l2-eyp', 'none'])).toEqual(['none'])
    expect(normaliseQualifications(['none'], ['none', 'l2-eyp'])).toEqual(['l2-eyp'])
    expect(normaliseQualifications(['l2-eyp', 'pfa'], ['pfa'])).toEqual(['pfa'])
  })
})

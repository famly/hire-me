import { levelOf, QUALIFICATION_LABEL, rankOf } from './qualification'
import { DAY } from './time'
import type { Application, Position, Qualification, Timestamp } from './types'

// How well an application fits the position, 0–100, from the structured answers only.
// A hint for where to look first. It never reorders the board (the reply-fast order
// wins) and never rejects anyone. No name, age, address or anything that could proxy
// a protected characteristic goes in.

export interface MatchFactor {
  label: string
  points: number
  max: number
  /** One plain sentence on why it scored what it did. */
  detail: string
}

export type MatchBand = 'strong' | 'good' | 'partial' | 'weak'

export interface Match {
  score: number
  band: MatchBand
  factors: MatchFactor[]
  /** A short explanation in words, strongest points first, then the gaps. */
  summary: string
}

export const MATCH_BAND_LABEL: Record<MatchBand, string> = {
  strong: 'Strong match',
  good: 'Good match',
  partial: 'Partial match',
  weak: 'Weak match',
}

const HOLDS: Record<Qualification, string> = {
  none: 'Has no childcare qualification yet',
  working_towards: 'Is working towards a qualification',
  L2: 'Holds Level 2',
  L3: 'Holds Level 3',
}

/** Roles of 35h a week or more count as full-time. */
const FULL_TIME_HOURS = 35

export function matchApplication(app: Application, position: Position, now: Timestamp): Match {
  const a = app.answers
  const level = levelOf(a.qualifications)
  const gap = rankOf(position.requiredQualification) - rankOf(level)
  const required = QUALIFICATION_LABEL[position.requiredQualification]

  const has = HOLDS[level]
  const qualification: MatchFactor = {
    label: 'Qualification',
    points: gap <= 0 ? 40 : gap === 1 ? 20 : gap === 2 ? 10 : 0,
    max: 40,
    detail:
      position.requiredQualification === 'none'
        ? 'No qualification needed for this role.'
        : gap === 0
          ? `${has}, as this role needs.`
          : `${has}, ${gap < 0 ? 'above' : 'below'} the ${required} this role needs.`,
  }

  const rightToWork: MatchFactor = a.rightToWork
    ? { label: 'Right to work', points: 20, max: 20, detail: 'Has the right to work in the UK.' }
    : { label: 'Right to work', points: 0, max: 20, detail: "Said they don't have the right to work in the UK." }

  const fullTimeRole = position.hoursPerWeek >= FULL_TIME_HOURS
  const hoursFit = a.availability === 'either' || (a.availability === 'full_time') === fullTimeRole
  const wants = a.availability === 'either' ? 'full- or part-time' : a.availability === 'full_time' ? 'full-time' : 'part-time'
  const hours: MatchFactor = {
    label: 'Hours',
    points: hoursFit ? 15 : 5,
    max: 15,
    detail: `Wants ${wants} work; the role is ${position.hoursPerWeek}h a week.`,
  }

  const daysToStart = Math.ceil((new Date(`${a.earliestStart}T00:00`).getTime() - now) / DAY)
  const start: MatchFactor = {
    label: 'Start date',
    points: daysToStart <= 30 ? 15 : daysToStart <= 60 ? 8 : 3,
    max: 15,
    detail:
      daysToStart <= 0
        ? 'Can start straight away.'
        : daysToStart <= 30
          ? `Can start within ${daysToStart <= 14 ? 'two weeks' : 'a month'}.`
          : `Can't start for about ${Math.round(daysToStart / 7)} weeks.`,
  }

  const firstAid: MatchFactor = a.qualifications.includes('pfa')
    ? { label: 'Paediatric first aid', points: 10, max: 10, detail: 'Has paediatric first aid, so counts in ratios from day one.' }
    : { label: 'Paediatric first aid', points: 0, max: 10, detail: 'No paediatric first aid yet (a short course).' }

  const factors = [qualification, rightToWork, hours, start, firstAid]
  const score = factors.reduce((sum, f) => sum + f.points, 0)
  const band: MatchBand = score >= 80 ? 'strong' : score >= 60 ? 'good' : score >= 40 ? 'partial' : 'weak'
  return { score, band, factors, summary: summarise(band, factors) }
}

function summarise(band: MatchBand, factors: MatchFactor[]): string {
  const strengths = factors.filter((f) => f.points === f.max).map((f) => lowerFirst(f.detail))
  const gaps = factors.filter((f) => f.points < f.max).map((f) => lowerFirst(f.detail))
  const parts = [`${MATCH_BAND_LABEL[band]}.`]
  if (strengths.length) parts.push(`${capitalise(joinAnd(strengths.slice(0, 3)))}.`)
  if (gaps.length) parts.push(`Worth checking: ${joinAnd(gaps)}.`)
  return parts.join(' ')
}

const trimDot = (s: string) => s.replace(/\.$/, '')
const lowerFirst = (s: string) => trimDot(s.charAt(0).toLowerCase() + s.slice(1))
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const joinAnd = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join('; ')} and ${xs[xs.length - 1]}`)

import { Check, Clock, Moon, TriangleAlert } from 'lucide-react'
import { isStale, lastActivityAt } from '../domain/application'
import { POSITION_STATE_LABEL } from '../domain/position'
import { meetsRequirement, QUALIFICATION_SHORT } from '../domain/qualification'
import { waitingFor, waitLevel, type WaitLevel } from '../domain/queue'
import { formatDuration } from '../domain/time'
import type { Application, PositionState, Qualification, Timestamp } from '../domain/types'
import { Badge, type Tone } from '../ui/Badge'

const STATE_TONE: Record<PositionState, Tone> = {
  draft: 'neutral',
  open: 'green',
  paused: 'amber',
  filled: 'brand',
  closed: 'neutral',
}

const WAIT_TONE: Record<WaitLevel, Tone> = { fresh: 'neutral', amber: 'amber', red: 'red' }

export function PositionStateBadge({ state }: { state: PositionState }) {
  return <Badge tone={STATE_TONE[state]}>{POSITION_STATE_LABEL[state]}</Badge>
}

export function WaitCountBadge({ count, level }: { count: number; level: WaitLevel }) {
  return <Badge tone={WAIT_TONE[level]}>{count} waiting</Badge>
}

/** M5 — how long this person has waited for a first reply. Neutral <24h, amber 24–48h, red >48h. */
export function WaitBadge({ app, now }: { app: Application; now: Timestamp }) {
  const level = waitLevel(app, now)
  const waited = waitingFor(app, now)
  if (level === null || waited === null) return null
  return (
    <Badge tone={WAIT_TONE[level]} title="Time since applying, with no reply yet">
      <Clock size={12} aria-hidden /> Waiting {formatDuration(waited)}
    </Badge>
  )
}

/** M7 — replaces "reads the CV and guesses". Flags, never blocks. */
export function QualificationBadge({ has, required }: { has: Qualification; required: Qualification }) {
  return meetsRequirement(has, required) ? (
    <Badge tone="green" title={`Meets the ${QUALIFICATION_SHORT[required]} requirement`}>
      <Check size={12} aria-hidden /> {QUALIFICATION_SHORT[has]}
    </Badge>
  ) : (
    <Badge tone="amber" title="Below the qualification this position requires">
      <TriangleAlert size={12} aria-hidden /> {QUALIFICATION_SHORT[has]} · needs {QUALIFICATION_SHORT[required]}
    </Badge>
  )
}

export function RightToWorkBadge({ app }: { app: Application }) {
  if (app.answers.rightToWork) return null
  return (
    <Badge tone="amber" title="The applicant didn't confirm the right to work in the UK">
      <TriangleAlert size={12} aria-hidden /> Right to work not confirmed
    </Badge>
  )
}

/** S4 — derived, never stored: no activity for 5 days after the first reply. */
export function StaleBadge({ app, now }: { app: Application; now: Timestamp }) {
  if (!isStale(app, now)) return null
  return (
    <Badge tone="amber" title="No activity for over 5 days. Chase them, or mark as lapsed.">
      <Moon size={12} aria-hidden /> Gone quiet · {formatDuration(now - lastActivityAt(app))}
    </Badge>
  )
}

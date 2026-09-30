import { Clock } from 'lucide-react'
import { POSITION_STATE_LABEL } from '../domain/position'
import { waitingFor, waitLevel, type WaitLevel } from '../domain/queue'
import { formatDuration } from '../domain/time'
import type { Application, PositionState, Timestamp } from '../domain/types'
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

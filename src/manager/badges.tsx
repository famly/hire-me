import { Building2, Clock, Moon, TriangleAlert } from 'lucide-react'
import { isStale, lastActivityAt } from '../domain/application'
import { otherApplications } from '../domain/candidate'
import { POSITION_STATE_LABEL } from '../domain/position'
import { meetsRequirement, QUALIFICATION_SHORT } from '../domain/qualification'
import { isOverdue, waitingFor } from '../domain/queue'
import { formatDuration } from '../domain/time'
import type { Application, PositionState, Qualification, Timestamp } from '../domain/types'
import { nurseryById, positionById } from '../store/selectors'
import { useStore } from '../store/store'
import { Badge } from '../ui/Badge'

// One colour, one meaning (docs/ARCHITECTURE.md "Badges"):
//   red   = act now: no first reply after 48h. The only red thing in the product.
//   amber = worth a check before you move them on.
//   grey  = for information.
//   green = live / done.
// Badges only appear for exceptions. No badge means nothing to worry about.

export function PositionStateBadge({ state }: { state: PositionState }) {
  return <Badge tone={state === 'open' ? 'green' : 'neutral'}>{POSITION_STATE_LABEL[state]}</Badge>
}

/** Time waiting for a first reply: plain text, or red once overdue. */
export function WaitIndicator({ app, now }: { app: Application; now: Timestamp }) {
  const waited = waitingFor(app, now)
  if (waited === null) return null
  return isOverdue(app, now) ? (
    <Badge tone="red" title={`No reply for ${formatDuration(waited)}, over 48 hours`}>
      <Clock size={12} aria-hidden /> {formatDuration(waited)}
    </Badge>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-stone-500" title="Waiting for a first reply">
      <Clock size={12} aria-hidden /> {formatDuration(waited)}
    </span>
  )
}

export function OverdueCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <Badge tone="red" title="No reply after 48 hours">
      {count} overdue
    </Badge>
  )
}

/** Amber / grey exceptions, always in this order, always under the name. Renders nothing if all is fine. */
export function ExceptionBadges({ app, required, now }: { app: Application; required: Qualification; now: Timestamp }) {
  const data = useStore()
  const below = !meetsRequirement(app.answers.qualification, required)
  const stale = isStale(app, now)
  const otherSites = otherApplications(app, data.applications)
    .map((a) => nurseryById(data, positionById(data, a.positionId)!.nurseryId))
    .filter((n) => n.id !== data.managerNurseryId)

  if (!below && app.answers.rightToWork && !stale && otherSites.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {below && (
        <Badge tone="amber" title="Below the qualification this position requires">
          <TriangleAlert size={12} aria-hidden /> Needs {QUALIFICATION_SHORT[required]}
        </Badge>
      )}
      {!app.answers.rightToWork && (
        <Badge tone="amber" title="They didn't confirm the right to work in the UK">
          <TriangleAlert size={12} aria-hidden /> Right to work?
        </Badge>
      )}
      {stale && (
        <Badge tone="amber" title="No activity for over 5 days. Chase them, or mark as lapsed.">
          <Moon size={12} aria-hidden /> Quiet {formatDuration(now - lastActivityAt(app))}
        </Badge>
      )}
      {otherSites.length > 0 && (
        <Badge tone="neutral" title={`Also applied at ${otherSites.map((n) => n.name).join(', ')}`}>
          <Building2 size={12} aria-hidden /> Also at {otherSites[0].name}
          {otherSites.length > 1 && ` +${otherSites.length - 1}`}
        </Badge>
      )}
    </div>
  )
}

export function BadgeLegend() {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-red-500" /> Act now: no reply after 48h
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-amber-400" /> Worth a check
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-stone-300" /> For information
      </span>
    </p>
  )
}

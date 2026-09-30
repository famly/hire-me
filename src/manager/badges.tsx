import { Building2, Clock, Info, Moon, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { isStale, lastActivityAt } from '../domain/application'
import { otherApplications } from '../domain/candidate'
import { POSITION_STATE_LABEL } from '../domain/position'
import { levelOf, meetsRequirement, QUALIFICATION_SHORT } from '../domain/qualification'
import { isOverdue, waitingFor } from '../domain/queue'
import { formatDuration } from '../domain/time'
import type { Application, PositionState, Qualification, Timestamp } from '../domain/types'
import { nurseryById, positionById } from '../store/selectors'
import { useStore } from '../store/store'
import { Badge } from '../ui/Badge'
import { Popover } from '../ui/Popover'

// One colour, one meaning (docs/ARCHITECTURE.md "Badges"):
//   red   = act now: no first reply after 48h. The only red thing in the product.
//   amber = worth a check before you move them on.
//   grey  = for information.
//   green = live / done.
// Badges only appear for exceptions. No badge means nothing to worry about.

export function PositionStateBadge({ state }: { state: PositionState }) {
  return <Badge tone={state === 'open' ? 'green' : 'neutral'}>{POSITION_STATE_LABEL[state]}</Badge>
}

/** Time waiting for a first reply, in words: grey while in time, a red badge once overdue. */
export function WaitIndicator({ app, now }: { app: Application; now: Timestamp }) {
  const waited = waitingFor(app, now)
  if (waited === null) return null
  return isOverdue(app, now) ? (
    <Badge tone="red" title="Over 48 hours without a first reply">
      <Clock size={12} aria-hidden /> No reply for {formatDuration(waited)}
    </Badge>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs whitespace-nowrap text-stone-500">
      <Clock size={12} aria-hidden /> Waiting {formatDuration(waited)} for a reply
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
  const below = !meetsRequirement(levelOf(app.answers.qualifications), required)
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

/** What every colour and flag means, one click away from the board. Flags are derived; nobody sets them by hand. */
export function LegendPopover() {
  const row = (badge: ReactNode, text: string) => (
    <li className="grid grid-cols-[10rem_1fr] items-start gap-x-3">
      <span className="pt-0.5">{badge}</span>
      <span className="text-sm text-stone-600">{text}</span>
    </li>
  )
  return (
    <Popover
      label="What the colours and flags mean"
      button={
        <>
          <Info size={16} aria-hidden /> Colours &amp; flags
        </>
      }
      buttonClassName="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm text-stone-600 hover:bg-stone-100"
      panelClassName="w-[min(24rem,calc(100vw-2rem))] p-4"
    >
      {() => (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-stone-900">What the colours and flags mean</p>
          <ul className="space-y-3">
            {row(
              <Badge tone="red">
                <Clock size={12} /> No reply for 52h
              </Badge>,
              'Red means act now: they have waited over 48 hours for a first reply. Nothing else is red.',
            )}
            {row(
              <Badge tone="amber">
                <TriangleAlert size={12} /> Needs L3
              </Badge>,
              'The qualifications on their application are below what this position requires.',
            )}
            {row(
              <Badge tone="amber">
                <TriangleAlert size={12} /> Right to work?
              </Badge>,
              "They said they don't have the right to work in the UK.",
            )}
            {row(
              <Badge tone="amber">
                <Moon size={12} /> Quiet 6d
              </Badge>,
              'No activity for over 5 days since you last contacted them. Chase them, or mark as lapsed.',
            )}
            {row(
              <Badge tone="neutral">
                <Building2 size={12} /> Also at Willow House
              </Badge>,
              'The same person (same email) has applied to another nursery in your group.',
            )}
          </ul>
          <p className="border-t border-stone-100 pt-3 text-xs text-stone-500">
            Amber means worth a check, grey is for information. Flags come from the application and its activity: nobody
            adds them by hand, and they never block anything. No flag means nothing to worry about.
          </p>
        </div>
      )}
    </Popover>
  )
}

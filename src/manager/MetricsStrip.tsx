import { medianTimeToFill, medianTimeToFirstReply, repliedWithin48hShare } from '../domain/metrics'
import { needsReply } from '../domain/queue'
import { formatDuration, HOUR } from '../domain/time'
import type { Application, Position } from '../domain/types'
import { useNow } from '../store/store'

// S5 — the brief's hunch is that first-reply speed matters most. We measure it rather than assume it.

export function MetricsStrip({ applications, positions }: { applications: Application[]; positions: Position[] }) {
  const now = useNow()
  const replied = applications.filter((a) => a.firstRepliedAt !== undefined)
  const overdue = applications.filter((a) => needsReply(a) && now - a.createdAt > 48 * HOUR)
  const within = replied.filter((a) => a.firstRepliedAt! - a.createdAt <= 48 * HOUR).length
  const share = repliedWithin48hShare(applications, now)
  const ttfr = medianTimeToFirstReply(applications)
  const ttf = medianTimeToFill(positions)
  const filled = positions.filter((p) => p.filledAt !== undefined).length
  const open = positions.filter((p) => p.state === 'open').length
  const paused = positions.filter((p) => p.state === 'paused').length

  return (
    <section aria-label="Recruitment metrics">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-stone-200 ring-1 ring-stone-200 lg:grid-cols-4">
        <Tile
          label="Median time to first reply"
          value={ttfr === null ? '–' : formatDuration(ttfr)}
          detail={`across ${replied.length} replied ${replied.length === 1 ? 'application' : 'applications'}`}
        />
        <Tile
          label="Replied within 48h"
          value={share === null ? '–' : `${Math.round(share * 100)}%`}
          detail={`${within} of ${replied.length + overdue.length} due a reply`}
        />
        <Tile label="Open positions" value={String(open)} detail={paused > 0 ? `${paused} paused` : 'none paused'} />
        <Tile
          label="Median time to fill"
          value={ttf === null ? '–' : formatDuration(ttf)}
          detail={`from ${filled} filled ${filled === 1 ? 'position' : 'positions'}`}
        />
      </dl>
    </section>
  )
}

function Tile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-stone-900">{value}</dd>
      <dd className="text-xs text-stone-500">{detail}</dd>
    </div>
  )
}

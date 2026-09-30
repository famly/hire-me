import { CalendarClock, Gauge, Handshake, ListChecks, MailQuestion, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { attention } from '../domain/attention'
import { lastActivityAt } from '../domain/application'
import { medianTimeToFill, medianTimeToFirstReply, repliedWithin48hShare } from '../domain/metrics'
import { waitingFor } from '../domain/queue'
import { formatDateTime, formatDuration, relativeTime } from '../domain/time'
import type { Application, Position } from '../domain/types'
import { candidateById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { OverdueCount } from './badges'

/**
 * The top of the overview answers "what needs me today?": four counts, each naming
 * the person to deal with first and opening them in one click. Reply speed (the
 * brief's hunch, S5) sits underneath as one plain sentence rather than as headline numbers.
 */
export function OverviewStats({ applications, positions }: { applications: Application[]; positions: Position[] }) {
  const data = useStore()
  const now = useNow()
  const a = attention(applications, now)
  const name = (app: Application) => candidateById(data, app.candidateId).name

  const longest = a.awaitingReply[0]
  const decide = a.toDecide[0]
  const next = a.upcoming[0]
  const offer = a.offersOut[0]

  return (
    <section aria-label="What needs you now" className="space-y-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile
          icon={MailQuestion}
          label="Waiting for your reply"
          count={a.awaitingReply.length}
          first={longest}
          detail={
            longest ? (
              <span className="flex flex-wrap items-center gap-1.5">
                <OverdueCount count={a.overdue.length} />
                <span>
                  {name(longest)}, waiting {formatDuration(waitingFor(longest, now)!)}
                </span>
              </span>
            ) : (
              'Everyone has had a reply'
            )
          }
        />
        <Tile
          icon={ListChecks}
          label="Interviewed, needs a decision"
          count={a.toDecide.length}
          first={decide}
          detail={decide ? `${name(decide)}, interviewed ${relativeTime(decide.interview?.at ?? lastActivityAt(decide), now)}` : 'Nothing to decide'}
        />
        <Tile
          icon={CalendarClock}
          label="Upcoming interviews"
          count={a.upcoming.length}
          first={next}
          detail={next ? `Next: ${name(next)}, ${formatDateTime(next.interview!.at)}` : 'None booked'}
        />
        <Tile
          icon={Handshake}
          label="Offers waiting for an answer"
          count={a.offersOut.length}
          first={offer}
          detail={offer ? `${name(offer)}, offered ${relativeTime(lastActivityAt(offer), now)}` : 'No offers out'}
        />
      </div>
      <ReplySpeed applications={applications} positions={positions} now={now} />
    </section>
  )
}

function Tile({ icon: Icon, label, count, first, detail }: { icon: LucideIcon; label: string; count: number; first?: Application; detail: ReactNode }) {
  return (
    <Link
      to={first ? `/manage/pipeline?app=${first.id}` : '/manage/pipeline'}
      className="block rounded-xl bg-white px-4 py-3 ring-1 ring-stone-200 hover:ring-brand-300 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
    >
      <p className="flex items-center gap-2 text-sm text-stone-600">
        <Icon size={16} aria-hidden className="shrink-0 text-stone-400" /> {label}
      </p>
      <p className={`mt-1 text-3xl font-semibold ${count ? 'text-stone-900' : 'text-stone-300'}`}>{count}</p>
      <div className="mt-0.5 truncate text-xs text-stone-500">{detail}</div>
    </Link>
  )
}

function ReplySpeed({ applications, positions, now }: { applications: Application[]; positions: Position[]; now: number }) {
  const ttfr = medianTimeToFirstReply(applications)
  const share = repliedWithin48hShare(applications, now)
  const ttf = medianTimeToFill(positions)
  if (ttfr === null && ttf === null) return null
  const parts = [
    ttfr !== null && `you usually reply within ${formatDuration(ttfr)}`,
    share !== null && `${Math.round(share * 100)}% of applicants heard back within 48h`,
    ttf !== null && `positions take about ${formatDuration(ttf)} to fill`,
  ].filter(Boolean)
  return (
    <p className="flex items-start gap-2 px-1 text-sm text-stone-500">
      <Gauge size={16} aria-hidden className="mt-0.5 shrink-0 text-stone-400" />
      <span>
        <span className="font-medium text-stone-700">Reply speed:</span> {parts.join(' · ')}.
      </span>
    </p>
  )
}

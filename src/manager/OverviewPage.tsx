import { ChevronRight, ExternalLink, Plus } from 'lucide-react'
import { Link } from 'react-router'
import { isActive } from '../domain/application'
import { hiredCount } from '../domain/position'
import { needsReply, waitLevel, type WaitLevel } from '../domain/queue'
import type { Position, PositionState } from '../domain/types'
import { roomLabel } from '../store/selectors'
import { useNow } from '../store/store'
import { buttonClass } from '../ui/buttonClass'
import { Card } from '../ui/Card'
import { PositionStateBadge, WaitCountBadge } from './badges'
import { MetricsStrip } from './MetricsStrip'
import { useManagerData } from './useManagerData'

const WAIT_RANK: WaitLevel[] = ['fresh', 'amber', 'red']

const STATE_ORDER: PositionState[] = ['open', 'paused', 'draft', 'filled', 'closed']

/** M4 — every position at the nursery, with what needs attention. */
export function OverviewPage() {
  const { data, nursery, positions, applications } = useManagerData()
  const now = useNow()
  const sorted = [...positions].sort(
    (a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || b.createdAt - a.createdAt,
  )
  const waiting = applications.filter(needsReply).length

  const counts = (p: Position) => {
    const apps = applications.filter((a) => a.positionId === p.id)
    const levels = apps.map((a) => waitLevel(a, now)).filter((l) => l !== null)
    return {
      worstWait: levels.sort((x, y) => WAIT_RANK.indexOf(y) - WAIT_RANK.indexOf(x))[0] ?? 'fresh',
      needsReply: apps.filter(needsReply).length,
      active: apps.filter(isActive).length,
      total: apps.length,
      hired: hiredCount(p, applications),
    }
  }

  return (
    <div className="space-y-5">
      {waiting > 0 && (
        <Link to="/manage/applicants" className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700">
          <span>
            <strong>{waiting} {waiting === 1 ? 'applicant is' : 'applicants are'}</strong> waiting for a first reply
          </span>
          <ChevronRight size={18} />
        </Link>
      )}

      <MetricsStrip applications={applications} positions={positions} />

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Positions</h2>
        <div className="flex items-center gap-4">
          <a href={`#/n/${nursery.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
            Public page <ExternalLink size={14} />
          </a>
          <Link to="/manage/positions/new" className={buttonClass('primary', 'sm')}>
            <Plus size={14} /> New position
          </Link>
        </div>
      </div>

      <Card className="divide-y divide-stone-100 overflow-hidden">
        <div className="hidden grid-cols-[1fr_7rem_6rem_6rem_6rem_1.5rem] gap-3 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-500 sm:grid">
          <span>Position</span>
          <span>State</span>
          <span className="text-right">Needs reply</span>
          <span className="text-right">In progress</span>
          <span className="text-right">Hired</span>
          <span />
        </div>
        {sorted.map((p) => {
          const c = counts(p)
          return (
            <Link
              key={p.id}
              to={`/manage/positions/${p.id}`}
              className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-stone-50 sm:grid-cols-[1fr_7rem_6rem_6rem_6rem_1.5rem]"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{p.title}</span>
                <span className="block truncate text-sm text-stone-500">{roomLabel(data, p.roomId)}</span>
              </span>
              <span>
                <PositionStateBadge state={p.state} />
              </span>
              <span className="text-sm sm:text-right">
                {c.needsReply > 0 ? (
                  <WaitCountBadge count={c.needsReply} level={c.worstWait} />
                ) : (
                  <span className="hidden text-stone-400 sm:inline">–</span>
                )}
              </span>
              <span className="text-sm text-stone-700 sm:text-right">
                {c.active}
                <span className="sm:hidden"> in progress</span>
              </span>
              <span className="hidden text-sm text-stone-700 sm:block sm:text-right">
                {c.hired}/{p.headcount}
              </span>
              <ChevronRight size={16} className="hidden text-stone-400 sm:block" />
            </Link>
          )
        })}
      </Card>
    </div>
  )
}

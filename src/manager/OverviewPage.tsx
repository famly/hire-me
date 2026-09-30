import { Archive, ChevronRight, ExternalLink, Kanban, Pause, Pencil, Play, Plus, Send, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { isActive } from '../domain/application'
import { allowedPositionActions, hiredCount, shouldSuggestFilled } from '../domain/position'
import { isOverdue, needsReply } from '../domain/queue'
import type { Position, PositionState } from '../domain/types'
import { roomLabel } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { Menu, type MenuItem } from '../ui/Menu'
import { useActions } from './actionsContext'
import { OverdueCount, PositionStateBadge } from './badges'
import { MetricsStrip } from './MetricsStrip'
import { useManagerData } from './useManagerData'

const STATE_ORDER: PositionState[] = ['open', 'paused', 'draft', 'filled', 'archived']
const ACTIVE_STATES: PositionState[] = ['open', 'paused', 'draft']

type Filter = 'active' | 'all'

/** M4 — every position at the nursery, with what needs attention. */
export function OverviewPage() {
  const { data, nursery, positions, applications } = useManagerData()
  const now = useNow()
  const navigate = useNavigate()
  const actions = useActions()
  const transition = useStore((s) => s.transitionPosition)
  const [filter, setFilter] = useState<Filter>('active')

  const visible = positions
    .filter((p) => filter === 'all' || ACTIVE_STATES.includes(p.state))
    .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || b.createdAt - a.createdAt)
  const waiting = applications.filter(needsReply).length
  const hiddenCount = positions.length - positions.filter((p) => ACTIVE_STATES.includes(p.state)).length

  const counts = (p: Position) => {
    const apps = applications.filter((a) => a.positionId === p.id)
    return {
      needsReply: apps.filter(needsReply).length,
      overdue: apps.filter((a) => isOverdue(a, now)).length,
      active: apps.filter(isActive).length,
      hired: hiredCount(p, applications),
    }
  }

  const menuFor = (p: Position): MenuItem[] => {
    const allowed = allowedPositionActions(p)
    const items: MenuItem[] = [
      { label: 'Open hiring pipeline', icon: <Kanban size={16} />, onSelect: () => navigate(`/manage/pipeline?position=${p.id}`) },
    ]
    if (p.state !== 'filled' && p.state !== 'archived') {
      items.push({ label: 'Edit…', icon: <Pencil size={16} />, onSelect: () => actions.editPosition(p.id) })
    }
    if (allowed.includes('publish')) items.push({ label: 'Publish', icon: <Send size={16} />, onSelect: () => transition(p.id, 'publish') })
    if (allowed.includes('pause')) items.push({ label: 'Pause', icon: <Pause size={16} />, onSelect: () => transition(p.id, 'pause') })
    if (allowed.includes('resume')) items.push({ label: 'Resume', icon: <Play size={16} />, onSelect: () => transition(p.id, 'resume') })
    if (allowed.includes('fill')) items.push({ label: 'Mark as filled…', icon: <UserCheck size={16} />, onSelect: () => actions.fill(p.id) })
    if (p.state === 'open') {
      items.push({
        label: 'View public listing',
        icon: <ExternalLink size={16} />,
        onSelect: () => window.open(`#/n/${nursery.slug}/p/${p.id}`, '_blank'),
      })
    }
    if (allowed.includes('archive')) {
      items.push({ label: 'Archive…', icon: <Archive size={16} />, danger: true, onSelect: () => actions.archive(p.id) })
    }
    return items
  }

  return (
    <div className="space-y-5">
      {waiting > 0 && (
        <Link to="/manage/pipeline" className="flex items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white hover:bg-brand-700">
          <span>
            <strong>
              {waiting} {waiting === 1 ? 'applicant is' : 'applicants are'}
            </strong>{' '}
            waiting for a first reply
          </span>
          <ChevronRight size={18} />
        </Link>
      )}

      <MetricsStrip applications={applications} positions={positions} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold">Positions</h2>
          <div role="group" aria-label="Filter positions" className="inline-flex rounded-lg bg-stone-100 p-0.5 text-sm">
            {(['active', 'all'] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1 ${filter === f ? 'bg-white font-medium text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
              >
                {f === 'active' ? 'Active' : `All (${positions.length})`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href={`#/n/${nursery.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-700 hover:underline">
            Public page <ExternalLink size={14} />
          </a>
          <Button size="sm" onClick={() => actions.editPosition()}>
            <Plus size={14} /> New position
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No active positions">Create one, or switch to All to see filled and archived ones.</EmptyState>
      ) : (
        <Card className="divide-y divide-stone-100">
          <div className="hidden grid-cols-[1fr_8rem_8rem_6rem_5rem_2rem] gap-3 rounded-t-xl bg-stone-50 px-4 py-2 text-xs font-medium text-stone-500 sm:grid">
            <span>Position</span>
            <span>State</span>
            <span>Needs reply</span>
            <span className="text-right">In progress</span>
            <span className="text-right">Hired</span>
            <span />
          </div>
          {visible.map((p) => {
            const c = counts(p)
            return (
              <div
                key={p.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/manage/pipeline?position=${p.id}`)}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/manage/pipeline?position=${p.id}`)}
                className="grid cursor-pointer grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 px-4 py-3 hover:bg-stone-50 sm:grid-cols-[1fr_8rem_8rem_6rem_5rem_2rem]"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="block truncate text-sm text-stone-500">{roomLabel(data, p.roomId) ?? 'Any room'}</span>
                </span>
                <span className="order-first col-start-2 row-start-1 flex flex-col items-end gap-1 sm:order-none sm:col-auto sm:row-auto sm:items-start">
                  <PositionStateBadge state={p.state} />
                  {shouldSuggestFilled(p, applications) && <span className="text-xs text-emerald-700">Ready to mark filled</span>}
                </span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="text-stone-500 sm:hidden">Needs reply</span>
                  <span className={c.needsReply ? 'font-medium text-stone-900' : 'text-stone-400'}>{c.needsReply || '–'}</span>
                  <OverdueCount count={c.overdue} />
                </span>
                <span className="text-sm text-stone-700 sm:text-right">
                  {c.active}
                  <span className="text-stone-500 sm:hidden"> in progress · {c.hired}/{p.headcount} hired</span>
                </span>
                <span className="hidden text-sm text-stone-700 sm:block sm:text-right">
                  {c.hired}/{p.headcount}
                </span>
                <span className="col-start-2 row-start-2 justify-self-end sm:col-auto sm:row-auto">
                  <Menu items={menuFor(p)} label={`Actions for ${p.title}`} />
                </span>
              </div>
            )
          })}
        </Card>
      )}
      {filter === 'active' && hiddenCount > 0 && (
        <p className="text-sm text-stone-500">
          {hiddenCount} filled or archived {hiddenCount === 1 ? 'position is' : 'positions are'} hidden.{' '}
          <button type="button" className="text-brand-700 hover:underline" onClick={() => setFilter('all')}>
            Show all
          </button>
        </p>
      )}
    </div>
  )
}

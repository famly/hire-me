import { useState, type DragEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ACTION_LABEL, nextAction } from '../domain/application'
import {
  actionForLane,
  INTERVIEW_PHASE_LABEL,
  interviewPhase,
  LANE_LABEL,
  LANES,
  laneOf,
  sortLane,
  type Lane,
} from '../domain/pipeline'
import { hiredCount, POSITION_STATE_LABEL, shouldSuggestFilled } from '../domain/position'
import { needsReply } from '../domain/queue'
import { relativeTime } from '../domain/time'
import type { Application, ID, Timestamp } from '../domain/types'
import { candidateById, positionById, roomLabel } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { MultiCombobox } from '../ui/MultiCombobox'
import { InterviewDetails } from '../ui/InterviewDetails'
import { StatusPill } from '../ui/StatusPill'
import { useActions } from './actionsContext'
import { ExceptionBadges, LegendPopover, WaitIndicator } from './badges'
import { useManagerData } from './useManagerData'

const LANE_HINT: Record<Lane, string> = {
  candidates: 'Unanswered first, longest wait on top',
  interview: 'Decisions first, then upcoming',
  offer: 'Longest in this stage first',
  closed: 'Every outcome, newest first',
}

/**
 * M5 — the hiring pipeline: one board, static lanes, one card per application.
 * Filter to one or more positions (?position=p1,p2). Move a card by dragging it
 * forward, or with its next-step link; either way the action dialog opens with a message.
 */
export function PipelinePage() {
  const { data, positions, applications } = useManagerData()
  const now = useNow()
  const actions = useActions()
  const [params, setParams] = useSearchParams()
  const [dragId, setDragId] = useState<ID | null>(null)

  const selectedIds = (params.get('position') ?? '').split(',').filter((id) => positions.some((p) => p.id === id))
  const showClosed = params.get('closed') !== '0'
  const scoped = selectedIds.length ? applications.filter((a) => selectedIds.includes(a.positionId)) : applications
  const lanes = showClosed ? LANES : LANES.filter((l) => l !== 'closed')
  const dragged = scoped.find((a) => a.id === dragId)
  const single = selectedIds.length === 1 ? positions.find((p) => p.id === selectedIds[0]) : undefined
  const readyToFill = positions.filter((p) => selectedIds.includes(p.id) && shouldSuggestFilled(p, applications))

  const setParam = (key: string, value: string | null) =>
    setParams((p) => {
      if (value) p.set(key, value)
      else p.delete(key)
      return p
    })

  const positionOptions = positions
    .filter((p) => p.state !== 'archived' || selectedIds.includes(p.id))
    .map((p) => ({
      value: p.id,
      label: p.title,
      hint: [roomLabel(data, p.roomId) ?? 'Any room', POSITION_STATE_LABEL[p.state]].join(' · '),
    }))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="w-full sm:w-96">
          <MultiCombobox
            options={positionOptions}
            value={selectedIds}
            onChange={(ids) => setParam('position', ids.length ? ids.join(',') : null)}
            placeholder="All positions · type to filter"
          />
        </div>
        <label className="inline-flex h-10 items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => setParam('closed', e.target.checked ? null : '0')}
            className="size-4 accent-brand-600"
          />
          Show closed
        </label>
        <div className="sm:ml-auto">
          <LegendPopover />
        </div>
      </div>

      {single && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600">
          <span>
            {roomLabel(data, single.roomId) ?? 'Any room'} · {single.hoursPerWeek}h · {single.payRange} ·{' '}
            {hiredCount(single, applications)}/{single.headcount} hired
          </span>
          {single.state !== 'filled' && single.state !== 'archived' && (
            <button type="button" className="text-brand-700 hover:underline" onClick={() => actions.editPosition(single.id)}>
              Edit position
            </button>
          )}
        </div>
      )}

      {readyToFill.map((p) => (
        <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <p className="text-sm text-emerald-900">
            {p.title}: you've hired {hiredCount(p, applications)} of {p.headcount}. Mark it as filled and let everyone else
            know?
          </p>
          <Button size="sm" onClick={() => actions.fill(p.id)}>
            Mark as filled…
          </Button>
        </div>
      ))}

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {lanes.map((lane) => {
          const apps = sortLane(lane, scoped.filter((a) => laneOf(a) === lane))
          const action = dragged ? actionForLane(dragged, lane) : null
          return (
            <section
              key={lane}
              aria-label={`${LANE_LABEL[lane]}, ${apps.length}`}
              onDragOver={(e: DragEvent) => action && e.preventDefault()}
              onDrop={(e: DragEvent) => {
                e.preventDefault()
                if (dragged && action) actions.start(dragged.id, action)
                setDragId(null)
              }}
              className={`flex w-[85%] shrink-0 snap-start flex-col rounded-xl border-2 p-2 transition sm:w-80 xl:w-auto xl:min-w-0 xl:flex-1 ${
                !dragged
                  ? 'border-transparent bg-stone-100'
                  : action
                    ? 'border-dashed border-brand-500 bg-brand-50'
                    : 'border-transparent bg-stone-100 opacity-40'
              }`}
            >
              <header className="px-1.5 pt-1 pb-2">
                <h3 className="flex items-baseline justify-between text-sm font-semibold text-stone-800">
                  {LANE_LABEL[lane]} <span className="font-normal text-stone-500">{apps.length}</span>
                </h3>
                <p className="text-xs text-stone-500">{LANE_HINT[lane]}</p>
              </header>
              {action && (
                <p className="mb-2 rounded-lg bg-white/70 px-3 py-2 text-center text-sm font-medium text-brand-700">
                  Drop to {ACTION_LABEL[action].toLowerCase()}
                </p>
              )}
              <div className="flex flex-1 flex-col gap-2">
                {apps.map((a, i) => (
                  <div key={a.id} className="contents">
                    {lane === 'interview' && phaseStarts(apps, i, now) && (
                      <p className="px-1.5 pt-1 text-xs font-medium text-stone-500">
                        {INTERVIEW_PHASE_LABEL[interviewPhase(a, now)!]}
                      </p>
                    )}
                    <PipelineCard
                      app={a}
                      showPosition={selectedIds.length !== 1}
                      onDragStart={() => setDragId(a.id)}
                      onDragEnd={() => setDragId(null)}
                    />
                  </div>
                ))}
                {apps.length === 0 && !action && (
                  <p className="rounded-lg border border-dashed border-stone-300 px-3 py-4 text-center text-xs text-stone-400">Nobody here</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

/** True where a new interview phase begins in the (sorted) lane, to draw its subheading. */
function phaseStarts(apps: Application[], i: number, now: Timestamp): boolean {
  return i === 0 || interviewPhase(apps[i], now) !== interviewPhase(apps[i - 1], now)
}

function PipelineCard({
  app,
  showPosition,
  onDragStart,
  onDragEnd,
}: {
  app: Application
  showPosition: boolean
  onDragStart: () => void
  onDragEnd: () => void
}) {
  const data = useStore()
  const now = useNow()
  const { open, start } = useActions()
  const candidate = candidateById(data, app.candidateId)
  const position = positionById(data, app.positionId)!
  const closed = laneOf(app) === 'closed'
  // Nothing to decide before the interview has happened; offering early stays possible from the panel.
  const next = interviewPhase(app, now) === 'upcoming' ? null : nextAction(app)

  return (
    <article
      draggable={!closed}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', app.id)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      role="button"
      tabIndex={0}
      onClick={() => open(app.id)}
      onKeyDown={(e) => e.key === 'Enter' && open(app.id)}
      className="space-y-2 rounded-lg bg-white p-3 shadow-xs ring-1 ring-stone-200 hover:ring-brand-300 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate font-medium">{candidate.name}</p>
        {closed && <StatusPill state={app.state} />}
      </div>
      {showPosition && <p className="-mt-1.5 truncate text-xs text-stone-500">{position.title}</p>}
      <div>
        <WaitIndicator app={app} now={now} />
      </div>
      {app.state === 'contacted' && !needsReply(app) && app.firstRepliedAt && (
        <p className="text-xs text-stone-500">Contacted {relativeTime(app.firstRepliedAt, now)}</p>
      )}
      {app.state === 'interview' && app.interview && <InterviewDetails interview={app.interview} now={now} compact />}
      <ExceptionBadges app={app} required={position.requiredQualification} now={now} />
      {next && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            start(app.id, next)
          }}
          className="block text-sm font-medium text-brand-700 hover:underline"
        >
          {ACTION_LABEL[next]} →
        </button>
      )}
    </article>
  )
}

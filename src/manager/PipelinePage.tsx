import { useState, type DragEvent } from 'react'
import { useSearchParams } from 'react-router'
import { ACTION_LABEL, nextAction } from '../domain/application'
import { actionForLane, LANE_LABEL, LANES, laneOf, sortLane, type Lane } from '../domain/pipeline'
import { hiredCount, shouldSuggestFilled } from '../domain/position'
import { QUALIFICATION_SHORT } from '../domain/qualification'
import type { Application, ID } from '../domain/types'
import { candidateById, positionById, roomLabel } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Select } from '../ui/Field'
import { StatusPill } from '../ui/StatusPill'
import { useActions } from './actionsContext'
import { BadgeLegend, ExceptionBadges, PositionStateBadge, WaitIndicator } from './badges'
import { useManagerData } from './useManagerData'

const LANE_HINT: Partial<Record<Lane, string>> = {
  new: 'Longest wait first',
  contacted: 'Least recently touched first',
  interview: 'Least recently touched first',
  offer: 'Least recently touched first',
}

/**
 * M5 — the hiring pipeline: one board, static lanes, one card per application.
 * Filter to a single position with ?position=. Move a card by dragging it forward,
 * or with its next-step button; either way the action dialog opens with a message.
 */
export function PipelinePage() {
  const { data, positions, applications } = useManagerData()
  const actions = useActions()
  const [params, setParams] = useSearchParams()
  const [dragId, setDragId] = useState<ID | null>(null)

  const position = positions.find((p) => p.id === params.get('position'))
  const showClosed = params.get('closed') === '1'
  const scoped = position ? applications.filter((a) => a.positionId === position.id) : applications
  const lanes: Lane[] = showClosed ? [...LANES, 'closed'] : LANES
  const closedCount = scoped.filter((a) => laneOf(a) === 'closed').length
  const dragged = scoped.find((a) => a.id === dragId)

  const setParam = (key: string, value: string | null) =>
    setParams((p) => {
      if (value) p.set(key, value)
      else p.delete(key)
      return p
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-72">
          <Select aria-label="Position" value={position?.id ?? ''} onChange={(e) => setParam('position', e.target.value || null)}>
            <option value="">All positions</option>
            {positions
              .filter((p) => p.state !== 'archived' || p.id === position?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                  {p.state !== 'open' ? ` (${p.state})` : ''}
                </option>
              ))}
          </Select>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={showClosed} onChange={(e) => setParam('closed', e.target.checked ? '1' : null)} className="size-4 accent-brand-600" />
          Show closed ({closedCount})
        </label>
        <div className="sm:ml-auto">
          <BadgeLegend />
        </div>
      </div>

      {position && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-600">
          <PositionStateBadge state={position.state} />
          <span>
            {roomLabel(data, position.roomId) ?? 'Any room'} · needs {QUALIFICATION_SHORT[position.requiredQualification]} ·{' '}
            {position.hoursPerWeek}h · {position.payRange} · {hiredCount(position, applications)}/{position.headcount} hired
          </span>
          {position.state !== 'filled' && position.state !== 'archived' && (
            <button type="button" className="text-brand-700 hover:underline" onClick={() => actions.editPosition(position.id)}>
              Edit
            </button>
          )}
        </div>
      )}

      {position && shouldSuggestFilled(position, applications) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <p className="text-sm text-emerald-900">
            You've hired {hiredCount(position, applications)} of {position.headcount}. Mark this position as filled and let
            everyone else know?
          </p>
          <Button size="sm" onClick={() => actions.fill(position.id)}>
            Mark as filled…
          </Button>
        </div>
      )}

      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {lanes.map((lane) => {
          const apps = sortLane(lane, scoped.filter((a) => laneOf(a) === lane))
          const action = dragged ? actionForLane(dragged, lane) : null
          const accepts = action !== null
          return (
            <section
              key={lane}
              aria-label={`${LANE_LABEL[lane]}, ${apps.length}`}
              onDragOver={(e: DragEvent) => accepts && e.preventDefault()}
              onDrop={(e: DragEvent) => {
                e.preventDefault()
                if (dragged && action) actions.start(dragged.id, action)
                setDragId(null)
              }}
              className={`flex w-[82%] shrink-0 snap-start flex-col rounded-xl p-2 transition sm:w-64 xl:w-auto xl:min-w-0 xl:flex-1 ${
                dragged ? (accepts ? 'bg-brand-50 ring-2 ring-brand-300' : 'bg-stone-100 opacity-50') : 'bg-stone-100'
              }`}
            >
              <header className="px-1.5 pt-1 pb-2">
                <h3 className="flex items-baseline justify-between text-sm font-semibold text-stone-800">
                  {LANE_LABEL[lane]} <span className="font-normal text-stone-500">{apps.length}</span>
                </h3>
                {LANE_HINT[lane] && <p className="text-xs text-stone-400">{LANE_HINT[lane]}</p>}
              </header>
              <div className="flex flex-1 flex-col gap-2">
                {apps.map((a) => (
                  <PipelineCard
                    key={a.id}
                    app={a}
                    showPosition={!position}
                    onDragStart={() => setDragId(a.id)}
                    onDragEnd={() => setDragId(null)}
                  />
                ))}
                {apps.length === 0 && (
                  <p className="rounded-lg border border-dashed border-stone-300 px-3 py-4 text-center text-xs text-stone-400">
                    {accepts ? `Drop to ${ACTION_LABEL[action].toLowerCase()}` : 'Nobody here'}
                  </p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
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
  const next = nextAction(app)

  return (
    <article
      draggable={next !== null}
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
        <WaitIndicator app={app} now={now} />
      </div>
      {showPosition && <p className="truncate text-xs text-stone-500">{position.title}</p>}
      <ExceptionBadges app={app} required={position.requiredQualification} now={now} />
      {laneOf(app) === 'closed' && <StatusPill state={app.state} />}
      {next && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            start(app.id, next)
          }}
          className="text-sm font-medium text-brand-700 hover:underline"
        >
          {ACTION_LABEL[next]} →
        </button>
      )}
    </article>
  )
}

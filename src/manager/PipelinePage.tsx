import { ArrowLeft, ExternalLink, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { allowedPositionActions, hiredCount, POSITION_ACTION_LABEL, shouldSuggestFilled } from '../domain/position'
import { QUALIFICATION_SHORT } from '../domain/qualification'
import { positionById, roomLabel } from '../store/selectors'
import { useStore } from '../store/store'
import { Button } from '../ui/Button'
import { buttonClass } from '../ui/buttonClass'
import { useActions } from './actionsContext'
import { ApplicantList } from './ApplicantList'
import { PositionStateBadge } from './badges'
import { useManagerData } from './useManagerData'

/** One position's applicants, plus the position's own lifecycle controls. */
export function PipelinePage() {
  const { positionId } = useParams()
  const { data, nursery, applications } = useManagerData()
  const position = positionById(data, positionId)
  const { fill } = useActions()
  const transition = useStore((s) => s.transitionPosition)

  if (!position || position.nurseryId !== nursery.id) {
    return <p className="text-stone-600">Position not found.</p>
  }

  return (
    <div className="space-y-5">
      <div>
        <Link to="/manage" className="inline-flex items-center gap-1 text-sm text-stone-600">
          <ArrowLeft size={14} /> All positions
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">{position.title}</h2>
          <PositionStateBadge state={position.state} />
          <div className="ml-auto flex flex-wrap gap-2">
            {allowedPositionActions(position).map((action) => (
              <Button
                key={action}
                size="sm"
                variant={action === 'publish' ? 'primary' : action === 'close' ? 'danger' : 'secondary'}
                onClick={() => {
                  if (action === 'fill') return fill(position.id)
                  if (action === 'close' && !confirm('Close this position? It comes off your public page. Applicants stay in your queue so you can still reply.')) return
                  transition(position.id, action)
                }}
              >
                {POSITION_ACTION_LABEL[action]}
                {action === 'fill' && '…'}
              </Button>
            ))}
            {(position.state === 'draft' || position.state === 'open' || position.state === 'paused') && (
              <Link to="edit" className={buttonClass('ghost', 'sm')}>
                <Pencil size={14} /> Edit
              </Link>
            )}
          </div>
        </div>
        <p className="text-sm text-stone-500">
          {roomLabel(data, position.roomId)} · requires {QUALIFICATION_SHORT[position.requiredQualification]} ·{' '}
          {position.hoursPerWeek}h · {position.payRange} · headcount {position.headcount}
        </p>
        {position.state === 'paused' && (
          <p className="mt-2 text-sm text-amber-800">Paused: hidden from your public page. Existing applicants are unaffected.</p>
        )}
        {position.state === 'draft' && <p className="mt-2 text-sm text-stone-600">Draft: not on your public page until you publish it.</p>}
        {position.state === 'open' && (
          <a
            href={`#/n/${nursery.slug}/p/${position.id}`}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-sm text-brand-700 hover:underline"
          >
            View public listing <ExternalLink size={14} />
          </a>
        )}
      </div>
      {shouldSuggestFilled(position, applications) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
          <p className="text-sm text-emerald-900">
            You've hired {hiredCount(position, applications)} of {position.headcount}. Mark this position as filled and let
            everyone else know?
          </p>
          <Button size="sm" onClick={() => fill(position.id)}>
            Mark as filled…
          </Button>
        </div>
      )}
      <ApplicantList applications={applications.filter((a) => a.positionId === position.id)} />
    </div>
  )
}

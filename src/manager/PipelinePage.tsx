import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { hiredCount, shouldSuggestFilled } from '../domain/position'
import { QUALIFICATION_SHORT } from '../domain/qualification'
import { positionById, roomLabel } from '../store/selectors'
import { Button } from '../ui/Button'
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
        </div>
        <p className="text-sm text-stone-500">
          {roomLabel(data, position.roomId)} · requires {QUALIFICATION_SHORT[position.requiredQualification]} ·{' '}
          {position.hoursPerWeek}h · {position.payRange} · headcount {position.headcount}
        </p>
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

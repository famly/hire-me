import { ArrowLeft, ExternalLink } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { QUALIFICATION_SHORT } from '../domain/qualification'
import { positionById, roomLabel } from '../store/selectors'
import { ApplicantList } from './ApplicantList'
import { PositionStateBadge } from './badges'
import { useManagerData } from './useManagerData'

/** One position's applicants, plus the position's own lifecycle controls. */
export function PipelinePage() {
  const { positionId } = useParams()
  const { data, nursery, applications } = useManagerData()
  const position = positionById(data, positionId)

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
      <ApplicantList applications={applications.filter((a) => a.positionId === position.id)} />
    </div>
  )
}

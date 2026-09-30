import { CalendarDays, CircleDot, ExternalLink, Mail, Phone, StickyNote, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { isActive } from '../domain/application'
import { qualificationLabel } from '../domain/qualification'
import { formatDate, formatDateTime, relativeTime } from '../domain/time'
import { timelineEntries, type TimelineEntry } from '../domain/timeline'
import type { Actor, ID } from '../domain/types'
import { candidateById, nurseryById, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Field'
import { InterviewDetails } from '../ui/InterviewDetails'
import { StatusPill } from '../ui/StatusPill'
import { ExceptionBadges, WaitIndicator } from './badges'
import { AllActions } from './AllActions'
import { CrossSiteSection } from './CrossSite'
import { CvChip } from './CvChip'
import { MatchScore } from './MatchScore'

const AVAILABILITY_LABEL = { full_time: 'Full-time', part_time: 'Part-time', either: 'Full- or part-time' }

/** The whole application on one screen: answers, actions, and the timeline of everything that happened. */
export function ApplicationPanel({ applicationId, onClose }: { applicationId: ID; onClose: () => void }) {
  const data = useStore()
  const addNote = useStore((s) => s.addNote)
  const now = useNow()
  const [note, setNote] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const app = data.applications.find((a) => a.id === applicationId)
  if (!app) return null
  const candidate = candidateById(data, app.candidateId)
  const position = positionById(data, app.positionId)!
  const nursery = nurseryById(data, position.nurseryId)
  const actorName = (by: Actor) => (by === 'manager' ? nursery.managerName : by === 'candidate' ? candidate.name : 'Sent automatically')
  const firstName = candidate.name.split(/\s+/)[0]

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-stone-900/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-label={`Application from ${candidate.name}`}
        className="flex h-full w-full max-w-lg flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-stone-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{candidate.name}</h2>
                <StatusPill state={app.state} />
                {isActive(app) && <MatchScore app={app} position={position} now={now} />}
              </div>
              <p className="text-sm text-stone-500">
                <Link to={`/manage/pipeline?position=${position.id}`} className="hover:underline">
                  {position.title}
                </Link>{' '}
                · applied {relativeTime(app.createdAt, now)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <a href={`mailto:${candidate.email}`} className="flex min-w-0 items-center gap-1.5 text-brand-700 hover:underline">
                  <Mail size={14} className="shrink-0" /> <span className="truncate">{candidate.email}</span>
                </a>
                <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 text-brand-700 hover:underline">
                  <Phone size={14} /> {candidate.phone}
                </a>
                <CvChip cv={app.answers.cv} full />
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded p-1 text-stone-500 hover:bg-stone-100" aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <WaitIndicator app={app} now={now} />
            <ExceptionBadges app={app} required={position.requiredQualification} now={now} />
          </div>
          <div className="mt-4">
            <AllActions app={app} />
          </div>
          {app.state === 'hired' && data.staff.some((s) => s.fromApplicationId === app.id) && (
            <Link to="/manage/staff" className="mt-3 inline-block text-sm text-emerald-700 hover:underline">
              ✓ Staff record created in Famly: view
            </Link>
          )}
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <CrossSiteSection app={app} />
          {app.interview && (
            <section className="rounded-lg bg-stone-50 p-3">
              <h3 className="mb-2 text-xs font-medium text-stone-500">Interview</h3>
              <InterviewDetails interview={app.interview} now={now} />
            </section>
          )}
          <section className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Earliest start" value={formatDate(app.answers.earliestStart)} />
            <Detail label="Hours" value={AVAILABILITY_LABEL[app.answers.availability]} />
            <Detail label="Right to work in the UK" value={app.answers.rightToWork ? 'Yes' : 'No'} />
            <div className="col-span-2">
              <p className="text-xs text-stone-500">Qualifications</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {app.answers.qualifications.map((id) => (
                  <li key={id} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-700">
                    {qualificationLabel(id)}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          <section>
            <h3 className="text-xs text-stone-500">Message from {firstName}</h3>
            <blockquote className="mt-1 rounded-lg bg-stone-50 p-3 text-sm text-stone-700">{app.answers.note}</blockquote>
          </section>

          <section>
            <h3 className="text-sm font-semibold">Timeline</h3>
            <form
              className="mt-3 space-y-2"
              onSubmit={(e) => {
                e.preventDefault()
                if (!note.trim()) return
                addNote(app.id, note.trim())
                setNote('')
              }}
            >
              <Textarea rows={2} placeholder="Add an internal note (never shown to the candidate)" value={note} onChange={(e) => setNote(e.target.value)} aria-label="Internal note" />
              {note.trim() && (
                <Button type="submit" size="sm" variant="secondary">
                  Add note
                </Button>
              )}
            </form>
            <ol className="mt-5 ml-2.5 space-y-5 border-l-2 border-stone-200 pl-6">
              {timelineEntries(app, now).map((e) => (
                <TimelineItem key={e.id} entry={e} actorName={actorName} now={now} />
              ))}
            </ol>
          </section>

          <a
            href={`#/status/${app.statusToken}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-stone-500 hover:underline"
          >
            Demo: open the candidate's status page <ExternalLink size={14} />
          </a>
        </div>
      </aside>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-stone-800">{value}</p>
    </div>
  )
}

/** One step on the rail: what happened, who did it and when, and the email that went with it. */
function TimelineItem({ entry, actorName, now }: { entry: TimelineEntry; actorName: (by: Actor) => string; now: number }) {
  const when = (
    <span title={formatDateTime(entry.at)}>{entry.kind === 'interview' && entry.upcoming ? formatDateTime(entry.at) : relativeTime(entry.at, now)}</span>
  )
  const dot = (icon: ReactNode, className = 'bg-white text-stone-500 ring-stone-300') => (
    <span className={`absolute top-0 -left-[37px] grid size-6 place-items-center rounded-full ring-1 ${className}`}>{icon}</span>
  )

  if (entry.kind === 'note') {
    return (
      <li className="relative text-sm">
        {dot(<StickyNote size={12} />, 'bg-amber-50 text-amber-600 ring-amber-200')}
        <p className="text-xs text-stone-500">
          Internal note · {actorName(entry.by)} · {when}
        </p>
        <p className="mt-1 rounded-lg bg-amber-50 p-2.5 whitespace-pre-line">{entry.body}</p>
      </li>
    )
  }
  if (entry.kind === 'interview') {
    return (
      <li className="relative text-sm">
        {dot(<CalendarDays size={12} />, entry.upcoming ? 'border border-dashed border-brand-500 bg-white text-brand-600 ring-transparent' : undefined)}
        <p className="font-medium text-stone-900">
          {entry.title}
          {entry.upcoming && <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">Next</span>}
        </p>
        <p className="text-xs text-stone-500">{when}</p>
      </li>
    )
  }
  const email = entry.email
  return (
    <li className="relative text-sm">
      {entry.kind === 'step' ? dot(<CircleDot size={12} />) : dot(<Mail size={12} />)}
      <p className="font-medium text-stone-900">{entry.kind === 'step' ? entry.title : 'Email'}</p>
      <p className="text-xs text-stone-500">
        {actorName(entry.by)} · {when}
      </p>
      {email && (
        <details className="group mt-1.5">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs text-brand-700 hover:underline">
            <Mail size={12} aria-hidden className="shrink-0" />
            <span className="truncate">Email: {email.subject}</span>
          </summary>
          <p className="mt-2 rounded-lg bg-stone-50 p-2.5 whitespace-pre-line text-stone-700">{email.body}</p>
        </details>
      )}
    </li>
  )
}

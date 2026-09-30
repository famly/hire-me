import { ArrowRightLeft, ExternalLink, FileText, Mail, Phone, StickyNote, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { STATE_LABEL } from '../domain/application'
import { qualificationLabel } from '../domain/qualification'
import { formatDate, relativeTime } from '../domain/time'
import type { Actor, ID, TimelineEvent } from '../domain/types'
import { candidateById, nurseryById, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Field'
import { InterviewDetails } from '../ui/InterviewDetails'
import { StatusPill } from '../ui/StatusPill'
import { ExceptionBadges, WaitIndicator } from './badges'
import { CrossSiteSection } from './CrossSite'
import { AllActions } from './AllActions'

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
  const actorName = (by: Actor) => (by === 'manager' ? nursery.managerName : by === 'candidate' ? candidate.name : 'Famly')

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
              </div>
              <p className="text-sm text-stone-500">
                <Link to={`/manage/pipeline?position=${position.id}`} className="hover:underline">
                  {position.title}
                </Link>{' '}
                · applied {relativeTime(app.createdAt, now)}
              </p>
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
            <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 truncate text-brand-700 hover:underline">
              <Mail size={14} className="shrink-0" /> {candidate.email}
            </a>
            <a href={`tel:${candidate.phone}`} className="flex items-center gap-2 text-brand-700 hover:underline">
              <Phone size={14} /> {candidate.phone}
            </a>
            <Detail label="Earliest start" value={formatDate(app.answers.earliestStart)} />
            <Detail label="Hours" value={AVAILABILITY_LABEL[app.answers.availability]} />
            <Detail label="Right to work in the UK" value={app.answers.rightToWork ? 'Yes' : 'No'} />
            <div>
              <p className="text-xs text-stone-500">CV</p>
              <p className="flex items-center gap-1.5 text-stone-800" title="Prototype: only the file name is kept, not the file">
                <FileText size={14} className="shrink-0 text-stone-400" />
                <span className="truncate">{app.answers.cv.name}</span>
                <span className="shrink-0 text-xs text-stone-500">{Math.max(1, Math.round(app.answers.cv.sizeBytes / 1024))} KB</span>
              </p>
            </div>
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
          <blockquote className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700 italic">"{app.answers.note}"</blockquote>

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
            <ol className="mt-4 space-y-4">
              {[...app.timeline].reverse().map((e) => (
                <TimelineItem key={e.id} event={e} actor={actorName(e.by)} now={now} />
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

function TimelineItem({ event, actor, now }: { event: TimelineEvent; actor: string; now: number }) {
  const when = <span className="text-xs text-stone-400">{relativeTime(event.at, now)}</span>
  if (event.kind === 'status') {
    return (
      <li className="flex gap-3 text-sm">
        <ArrowRightLeft size={16} className="mt-0.5 shrink-0 text-stone-400" />
        <p>
          {event.from === null ? `${actor} applied` : `${actor} moved to ${STATE_LABEL[event.to]}`} {when}
        </p>
      </li>
    )
  }
  if (event.kind === 'note') {
    return (
      <li className="flex gap-3 text-sm">
        <StickyNote size={16} className="mt-0.5 shrink-0 text-amber-500" />
        <div className="min-w-0 flex-1 rounded-lg bg-amber-50 p-2.5">
          <p className="text-xs text-stone-500">
            Note by {actor} {when}
          </p>
          <p className="mt-1 whitespace-pre-line">{event.body}</p>
        </div>
      </li>
    )
  }
  return (
    <li className="flex gap-3 text-sm">
      <Mail size={16} className="mt-0.5 shrink-0 text-brand-500" />
      <details className="min-w-0 flex-1">
        <summary className="cursor-pointer">
          Email from {actor}: <span className="font-medium">{event.subject}</span> {when}
        </summary>
        <p className="mt-2 rounded-lg bg-stone-50 p-2.5 whitespace-pre-line text-stone-700">{event.body}</p>
      </details>
    </li>
  )
}

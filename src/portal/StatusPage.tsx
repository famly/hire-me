import { MapPin, Mail, Video } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { CANDIDATE_STATUS_LABEL, candidateStatus, candidateStatusLine, openSlots } from '../domain/application'
import { formatDate, formatDateTimeLong } from '../domain/time'
import type { Application, CandidateStatus } from '../domain/types'
import { applicationByToken, candidateById, nurseryById, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { InterviewDetails } from '../ui/InterviewDetails'
import { NotFound } from './NurseryPage'
import { NurseryHeader } from './PortalLayout'

const STEPS: CandidateStatus[] = ['received', 'being_reviewed', 'invited_to_interview', 'offer', 'hired']

/** J2 — what the candidate sees. Only the public projection and sent messages, never internal state or notes. */
export function StatusPage() {
  const { token } = useParams()
  const data = useStore()
  const app = applicationByToken(data, token)
  const now = useNow()

  if (!app) {
    return (
      <NotFound message="We couldn't find that application. Check the link in your email." />
    )
  }

  const position = positionById(data, app.positionId)!
  const nursery = nurseryById(data, position.nurseryId)
  const candidate = candidateById(data, app.candidateId)
  const status = candidateStatus(app)
  const step = STEPS.indexOf(status)
  const closed = step === -1
  const messages = app.timeline.filter((e) => e.kind === 'message').reverse()

  return (
    <>
      <NurseryHeader name={nursery.name} area={nursery.area} />
      <div className="px-4 pt-5">
        <p className="text-sm text-stone-500">Application for</p>
        <h1 className="text-xl font-semibold">{position.title}</h1>
        <p className="text-sm text-stone-500">
          {candidate.name} · applied {formatDate(app.createdAt)}
        </p>

        <section className="mt-5 rounded-xl bg-white p-4 ring-1 ring-stone-200" aria-live="polite">
          <p className="text-sm text-stone-500">Status</p>
          <p className={`mt-0.5 text-2xl font-semibold ${closed ? 'text-stone-600' : 'text-brand-700'}`}>
            {CANDIDATE_STATUS_LABEL[status]}
          </p>
          <p className="mt-2 text-stone-700">{candidateStatusLine(app, nursery.name, now)}</p>

          {!closed && (
            <ol className="mt-5 grid grid-cols-5 gap-1" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s} className="space-y-1.5">
                  <div className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-stone-200'}`} />
                  <p className={`text-[11px] leading-tight ${i === step ? 'font-medium text-stone-900' : 'text-stone-500'}`}>
                    {CANDIDATE_STATUS_LABEL[s]}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        {app.state === 'interview' && !app.interview && app.interviewSlots && <PickATime app={app} now={now} />}

        {app.state === 'interview' && app.interview && (
          <section className="mt-4 rounded-xl bg-white p-4 ring-1 ring-stone-200">
            <h2 className="mb-2 text-sm font-semibold">Your interview</h2>
            <InterviewDetails interview={app.interview} now={now} />
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-sm font-semibold">Messages from {nursery.name}</h2>
          <ul className="mt-3 space-y-3">
            {messages.map((m) =>
              m.kind === 'message' ? (
                <li key={m.id} className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
                  <div className="flex items-start gap-2">
                    <Mail size={16} className="mt-0.5 shrink-0 text-stone-400" />
                    <div className="min-w-0">
                      <p className="font-medium">{m.subject}</p>
                      <p className="text-xs text-stone-500">{formatDate(m.at)}</p>
                      <p className="mt-2 text-sm whitespace-pre-line text-stone-700">{m.body}</p>
                    </div>
                  </div>
                </li>
              ) : null,
            )}
          </ul>
        </section>

        <p className="mt-6 text-center text-sm text-stone-500">
          <Link to={`/n/${nursery.slug}`} className="underline">
            See other roles at {nursery.name}
          </Link>
        </p>
      </div>
    </>
  )
}

/** The candidate chooses one of the times the nursery offered. It becomes their interview. */
function PickATime({ app, now }: { app: Application; now: number }) {
  const pick = useStore((s) => s.pickInterviewSlot)
  const options = openSlots(app, now)
  const [chosen, setChosen] = useState<number | null>(null)
  const slots = app.interviewSlots!

  return (
    <section className="mt-4 rounded-xl bg-white p-4 ring-1 ring-stone-200">
      <h2 className="text-sm font-semibold">Pick a time for your interview</h2>
      <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
        {slots.mode === 'online' ? <Video size={16} className="mt-0.5 shrink-0 text-stone-400" /> : <MapPin size={16} className="mt-0.5 shrink-0 text-stone-400" />}
        {slots.mode === 'online' ? "Online. You'll see the link here once you've picked." : slots.location}
      </p>
      {options.length === 0 ? (
        <p className="mt-3 text-sm text-stone-600">These times have passed. Reply to the nursery's email and they'll find another.</p>
      ) : (
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (chosen !== null) pick(app.id, chosen)
          }}
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">Interview times</legend>
            {options.map((at) => (
              <label
                key={at}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm ring-1 ring-inset has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-600 ${chosen === at ? 'font-medium ring-2 ring-brand-600' : 'ring-stone-300'}`}
              >
                <input type="radio" name="slot" value={at} checked={chosen === at} onChange={() => setChosen(at)} className="size-4 accent-brand-600" />
                {formatDateTimeLong(at)}
              </label>
            ))}
          </fieldset>
          <Button type="submit" size="lg" disabled={chosen === null}>
            Confirm this time
          </Button>
          <p className="text-xs text-stone-500">None of these work? Reply to the nursery's email and they'll find another.</p>
        </form>
      )}
    </section>
  )
}

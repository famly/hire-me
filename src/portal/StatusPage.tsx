import { Mail } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { CANDIDATE_STATUS_LABEL, candidateStatus, candidateStatusLine } from '../domain/application'
import { formatDate } from '../domain/time'
import type { CandidateStatus } from '../domain/types'
import { applicationByToken, candidateById, nurseryById, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
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
          <p className="mt-2 text-stone-700">{candidateStatusLine(app, nursery.name)}</p>

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

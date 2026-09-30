import { Pencil, Video } from 'lucide-react'
import { useState } from 'react'
import { ACTION_LABEL, STATE_LABEL, type ApplicationAction } from '../domain/application'
import { messageFor, type MessageKind } from '../domain/messages'
import { DAY, isoDate } from '../domain/time'
import type { ID, Interview } from '../domain/types'
import { candidateById, nurseryById, positionById } from '../store/selectors'
import { newMeetingLink } from '../store/ids'
import { messageContext, useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { ChoiceGroup } from '../ui/ChoiceGroup'
import { Field, Input, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'
import { Switch } from '../ui/Switch'

const TARGET: Partial<Record<ApplicationAction, keyof typeof STATE_LABEL>> = {
  contact: 'contacted',
  invite: 'interview',
  offer: 'offer',
  reject: 'rejected',
  lapse: 'lapsed',
  decline: 'declined',
}

/** The confirm button: [with an email, without]. Short, so the footer never wraps. */
const CONFIRM: Partial<Record<ApplicationAction, [string, string]>> = {
  contact: ['Send', 'Mark as contacted'],
  invite: ['Send invite', 'Schedule'],
  offer: ['Send offer', 'Mark as offered'],
  reject: ['Reject & send', 'Reject'],
  lapse: ['Close & send', 'Close'],
  decline: ['Send reply', 'Mark as declined'],
}

type Mode = Interview['mode']

/**
 * M6 — every action sends a templated message (editable) and logs to the timeline.
 * Inviting also schedules the interview: when, and in person or online.
 */
export function ActionDialog({ applicationId, action, onClose }: { applicationId: ID; action: ApplicationAction; onClose: () => void }) {
  const data = useStore()
  const applyAction = useStore((s) => s.applyAction)
  const now = useNow()
  const app = data.applications.find((a) => a.id === applicationId)!
  const candidate = candidateById(data, app.candidateId)
  const nursery = nurseryById(data, positionById(data, app.positionId)!.nurseryId)
  const isInvite = action === 'invite'

  const [date, setDate] = useState(isoDate(now + DAY))
  const [time, setTime] = useState('10:00')
  const [mode, setMode] = useState<Mode>('in_person')
  const [address, setAddress] = useState(nursery.address)
  const [autoLink, setAutoLink] = useState(true)
  const [generatedLink] = useState(newMeetingLink)
  const [manualLink, setManualLink] = useState('')
  const link = autoLink ? generatedLink : manualLink.trim()
  const at = new Date(`${date}T${time}`).getTime()
  const interview: Interview | undefined = isInvite ? { at, mode, location: mode === 'online' ? link : address.trim() } : undefined
  const interviewProblem = !isInvite
    ? null
    : !date || !time || Number.isNaN(at)
      ? 'Pick a date and time'
      : at <= now
        ? 'Pick a time in the future'
        : mode === 'online' && !/^https?:\/\/\S+\.\S+/.test(link)
          ? 'Paste the meeting link (starting with https://)'
          : mode === 'in_person' && !address.trim()
            ? 'Add the address'
            : null

  // The message follows the interview details until the manager edits it by hand.
  const template = messageFor(action as MessageKind, messageContext(data, app), { interview: interviewProblem ? undefined : interview })
  const [send, setSend] = useState(true)
  const [editing, setEditing] = useState(false)
  const [subject, setSubject] = useState<string | null>(null)
  const [body, setBody] = useState<string | null>(null)
  const [withEmail, withoutEmail] = CONFIRM[action] ?? [ACTION_LABEL[action], ACTION_LABEL[action]]

  function confirm() {
    applyAction(app.id, action, send ? { subject: subject ?? template.subject, body: body ?? template.body } : undefined, { interview })
    onClose()
  }

  return (
    <Modal
      title={`${ACTION_LABEL[action]}: ${candidate.name}`}
      onClose={onClose}
      footer={
        <>
          {interviewProblem && <p className="mr-auto self-center text-sm text-stone-500">{interviewProblem}</p>}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={action === 'reject' ? 'danger' : 'primary'} onClick={confirm} disabled={!!interviewProblem}>
            {send ? withEmail : withoutEmail}
          </Button>
        </>
      }
    >
      <p className="text-sm text-stone-600">
        Status: <strong>{STATE_LABEL[app.state]}</strong> → <strong>{STATE_LABEL[TARGET[action]!]}</strong>
      </p>

      {isInvite && (
        <section className="space-y-3 rounded-lg bg-stone-50 p-3">
          <p className="text-sm font-semibold">Interview</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" htmlFor="iv-date">
              <Input id="iv-date" type="date" min={isoDate(now)} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Time" htmlFor="iv-time">
              <Input id="iv-time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <ChoiceGroup
            id="iv-mode"
            legend="Where"
            options={[
              { value: 'in_person', label: 'In person' },
              { value: 'online', label: 'Online' },
            ]}
            value={mode}
            onChange={setMode}
          />
          {mode === 'in_person' ? (
            <Field label="Address" htmlFor="iv-address">
              <Input id="iv-address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
          ) : (
            <div className="space-y-2">
              <Switch id="iv-autolink" checked={autoLink} onChange={setAutoLink}>
                Create a meeting link for me
              </Switch>
              {autoLink ? (
                <p className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-stone-200 ring-inset">
                  <Video size={16} className="shrink-0 text-brand-600" aria-hidden />
                  <span className="truncate font-mono text-stone-700">{generatedLink}</span>
                </p>
              ) : (
                <Field label="Meeting link" htmlFor="iv-link" hint="Paste a Google Meet, Teams or Zoom link.">
                  <Input id="iv-link" type="url" inputMode="url" placeholder="https://…" value={manualLink} onChange={(e) => setManualLink(e.target.value)} />
                </Field>
              )}
              <p className="text-xs text-stone-500">The candidate gets the link in the email and on their status page.</p>
            </div>
          )}
        </section>
      )}

      <section className="space-y-3 rounded-lg p-3 ring-1 ring-stone-200">
        <div className="flex items-start justify-between gap-3">
          <Switch id="msg-send" checked={send} onChange={setSend}>
            Email {candidate.email}
          </Switch>
          {send && !editing && (
            <button type="button" onClick={() => setEditing(true)} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
              <Pencil size={14} aria-hidden /> Edit
            </button>
          )}
        </div>
        {send && !editing && (
          <div className="rounded-md bg-stone-50 px-3 py-2 text-sm">
            <p className="font-medium text-stone-900">{subject ?? template.subject}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line text-stone-600">{body ?? template.body}</p>
          </div>
        )}
        {send && editing && (
          <>
            <Field label="Subject" htmlFor="msg-subject">
              <Input id="msg-subject" value={subject ?? template.subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="Message" htmlFor="msg-body" hint="Also shown on the candidate's status page.">
              <Textarea id="msg-body" rows={9} value={body ?? template.body} onChange={(e) => setBody(e.target.value)} />
            </Field>
          </>
        )}
      </section>
      {!send && action === 'reject' && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          They'll see "Not progressing" on their status page, but won't get a message explaining why.
        </p>
      )}
    </Modal>
  )
}

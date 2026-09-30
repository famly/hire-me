import { useState } from 'react'
import { ACTION_LABEL, STATE_LABEL, type ApplicationAction } from '../domain/application'
import { messageFor, type MessageKind } from '../domain/messages'
import { DAY, isoDate } from '../domain/time'
import type { ID, Interview } from '../domain/types'
import { candidateById, nurseryById, positionById } from '../store/selectors'
import { messageContext, useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { ChoiceGroup } from '../ui/ChoiceGroup'
import { Field, Input, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'

const TARGET: Partial<Record<ApplicationAction, keyof typeof STATE_LABEL>> = {
  contact: 'contacted',
  invite: 'interview',
  offer: 'offer',
  reject: 'rejected',
  lapse: 'lapsed',
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
  const [link, setLink] = useState('')
  const at = new Date(`${date}T${time}`).getTime()
  const interview: Interview | undefined = isInvite ? { at, mode, location: mode === 'online' ? link.trim() : address.trim() } : undefined
  const interviewProblem = !isInvite
    ? null
    : !date || !time || Number.isNaN(at)
      ? 'Pick a date and time'
      : at <= now
        ? 'Pick a time in the future'
        : mode === 'online' && !/^https?:\/\/\S+\.\S+/.test(link.trim())
          ? 'Paste the meeting link (starting with https://)'
          : mode === 'in_person' && !address.trim()
            ? 'Add the address'
            : null

  // The message follows the interview details until the manager edits it by hand.
  const template = messageFor(action as MessageKind, messageContext(data, app), { interview: interviewProblem ? undefined : interview })
  const [send, setSend] = useState(true)
  const [subject, setSubject] = useState<string | null>(null)
  const [body, setBody] = useState<string | null>(null)

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
            {ACTION_LABEL[action]}
            {send && ' & send'}
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
            <Field label="Meeting link" htmlFor="iv-link" hint="Google Meet, Teams or Zoom. The candidate gets it in the email and on their status page.">
              <Input id="iv-link" type="url" inputMode="url" placeholder="https://meet.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} />
            </Field>
          )}
        </section>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={send} onChange={(e) => setSend(e.target.checked)} className="size-4 accent-brand-600" />
        Email {candidate.email}
      </label>
      {send && (
        <>
          <Field label="Subject" htmlFor="msg-subject">
            <Input id="msg-subject" value={subject ?? template.subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Message" htmlFor="msg-body" hint="Also shown on the candidate's status page.">
            <Textarea id="msg-body" rows={9} value={body ?? template.body} onChange={(e) => setBody(e.target.value)} />
          </Field>
        </>
      )}
      {!send && action === 'reject' && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          They'll see "Not progressing" on their status page, but won't get a message explaining why.
        </p>
      )}
    </Modal>
  )
}

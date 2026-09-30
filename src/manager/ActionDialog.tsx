import { useState } from 'react'
import { ACTION_LABEL, STATE_LABEL, type ApplicationAction } from '../domain/application'
import { messageFor, type MessageKind } from '../domain/messages'
import type { ID } from '../domain/types'
import { candidateById } from '../store/selectors'
import { messageContext, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Field, Input, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'

const TARGET: Partial<Record<ApplicationAction, keyof typeof STATE_LABEL>> = {
  contact: 'contacted',
  invite: 'interview',
  offer: 'offer',
  reject: 'rejected',
  lapse: 'lapsed',
}

/** M6 — every action sends a templated message (editable) and logs to the timeline. */
export function ActionDialog({ applicationId, action, onClose }: { applicationId: ID; action: ApplicationAction; onClose: () => void }) {
  const data = useStore()
  const applyAction = useStore((s) => s.applyAction)
  const app = data.applications.find((a) => a.id === applicationId)!
  const candidate = candidateById(data, app.candidateId)
  const template = messageFor(action as MessageKind, messageContext(data, app))

  const [send, setSend] = useState(true)
  const [subject, setSubject] = useState(template.subject)
  const [body, setBody] = useState(template.body)

  function confirm() {
    applyAction(app.id, action, send ? { subject, body } : undefined)
    onClose()
  }

  return (
    <Modal
      title={`${ACTION_LABEL[action]}: ${candidate.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={action === 'reject' ? 'danger' : 'primary'} onClick={confirm}>
            {ACTION_LABEL[action]}
            {send && ' & send'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-stone-600">
        Status: <strong>{STATE_LABEL[app.state]}</strong> → <strong>{STATE_LABEL[TARGET[action]!]}</strong>
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={send} onChange={(e) => setSend(e.target.checked)} className="size-4 accent-brand-600" />
        Email {candidate.email}
      </label>
      {send && (
        <>
          <Field label="Subject" htmlFor="msg-subject">
            <Input id="msg-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </Field>
          <Field label="Message" htmlFor="msg-body" hint="Also shown on the candidate's status page.">
            <Textarea id="msg-body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
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

import { useState } from 'react'
import { QUALIFICATION_LABEL } from '../domain/qualification'
import { messageFor } from '../domain/messages'
import type { ID } from '../domain/types'
import { candidateById, nurseryById, positionById } from '../store/selectors'
import { messageContext, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'

/** M8 — hiring creates the Famly staff record, prefilled from the application. Nobody retypes it. */
export function HireDialog({ applicationId, onClose, onHired }: { applicationId: ID; onClose: () => void; onHired: () => void }) {
  const data = useStore()
  const hire = useStore((s) => s.hire)
  const app = data.applications.find((a) => a.id === applicationId)!
  const candidate = candidateById(data, app.candidateId)
  const position = positionById(data, app.positionId)!
  const nursery = nurseryById(data, position.nurseryId)
  const rooms = data.rooms.filter((r) => r.nurseryId === nursery.id)
  const template = messageFor('hire', messageContext(data, app))

  const [roomId, setRoomId] = useState(position.roomId ?? '')
  const [startDate, setStartDate] = useState(app.answers.earliestStart)
  const [send, setSend] = useState(true)
  const [body, setBody] = useState(template.body)

  function confirm() {
    hire(app.id, send ? { subject: template.subject, body } : undefined, { roomId: roomId || undefined, startDate })
    onHired()
  }

  return (
    <Modal
      title={`Hire ${candidate.name}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm}>Hire & create staff record</Button>
        </>
      }
    >
      {app.state !== 'offer' && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {candidate.name.split(' ')[0]} hasn't had an offer yet. You can still hire directly.
        </p>
      )}
      <div>
        <p className="text-sm font-semibold">New staff record in Famly</p>
        <p className="text-sm text-stone-500">Prefilled from the application. Check it and confirm.</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-stone-50 p-3 text-sm">
        <ReadOnly label="Name" value={candidate.name} />
        <ReadOnly label="Nursery" value={nursery.name} />
        <ReadOnly label="Email" value={candidate.email} />
        <ReadOnly label="Phone" value={candidate.phone} />
        <ReadOnly label="Qualification" value={QUALIFICATION_LABEL[app.answers.qualification]} />
        <ReadOnly label="Role" value={position.title} />
      </dl>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Room" htmlFor="hire-room">
          <Select id="hire-room" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
            <option value="">No room yet</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Start date" htmlFor="hire-start">
          <Input id="hire-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={send} onChange={(e) => setSend(e.target.checked)} className="size-4 accent-brand-600" />
        Send a welcome email to {candidate.email}
      </label>
      {send && <Textarea aria-label="Welcome message" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />}
    </Modal>
  )
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-stone-500">{label}</dt>
      <dd className="truncate text-stone-900">{value}</dd>
    </div>
  )
}

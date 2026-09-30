import { useState, type FormEvent } from 'react'
import { QUALIFICATION_LABEL, QUALIFICATIONS } from '../domain/qualification'
import type { ID, Qualification } from '../domain/types'
import { positionById } from '../store/selectors'
import { useStore, type PositionInput } from '../store/store'
import { Button } from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/Field'
import { Modal } from '../ui/Modal'
import { useManagerData } from './useManagerData'

/** S3 — create or edit a position in a modal, without leaving the overview. New positions start as Draft or go straight to Open. */
export function PositionFormModal({ positionId, onClose }: { positionId?: ID; onClose: () => void }) {
  const { data, nursery } = useManagerData()
  const createPosition = useStore((s) => s.createPosition)
  const updatePosition = useStore((s) => s.updatePosition)
  const existing = positionById(data, positionId)
  const rooms = data.rooms.filter((r) => r.nurseryId === nursery.id)

  const [form, setForm] = useState<PositionInput>(
    existing ?? {
      nurseryId: nursery.id,
      roomId: rooms[0]?.id,
      title: '',
      requiredQualification: 'L3',
      hoursPerWeek: 40,
      contract: 'Permanent',
      payRange: '',
      headcount: 1,
      description: '',
    },
  )
  const [error, setError] = useState<string | null>(null)
  const set = <K extends keyof PositionInput>(key: K, value: PositionInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  function save(publish: boolean) {
    if (!form.title.trim()) return setError('Give the position a title')
    if (!form.payRange.trim()) return setError('Add a pay range. Adverts with pay get more applicants')
    const input: PositionInput = {
      nurseryId: form.nurseryId,
      roomId: form.roomId,
      title: form.title.trim(),
      requiredQualification: form.requiredQualification,
      hoursPerWeek: form.hoursPerWeek,
      contract: form.contract,
      payRange: form.payRange.trim(),
      headcount: Math.max(1, form.headcount),
      description: form.description.trim(),
    }
    if (existing) updatePosition(existing.id, input)
    else createPosition(input, publish)
    onClose()
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    save(true)
  }

  return (
    <Modal title={existing ? `Edit ${existing.title}` : 'New position'} onClose={onClose} wide>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title" htmlFor="pf-title">
            <Input id="pf-title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Level 3 Practitioner" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room" htmlFor="pf-room">
              <Select id="pf-room" value={form.roomId ?? ''} onChange={(e) => set('roomId', e.target.value || undefined)}>
                <option value="">Any room / floating</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.ageRange})
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Qualification required" htmlFor="pf-qual">
              <Select id="pf-qual" value={form.requiredQualification} onChange={(e) => set('requiredQualification', e.target.value as Qualification)}>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>
                    {q === 'none' ? 'None' : QUALIFICATION_LABEL[q]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Hours per week" htmlFor="pf-hours">
              <Input id="pf-hours" type="number" min={1} max={60} value={form.hoursPerWeek} onChange={(e) => set('hoursPerWeek', Number(e.target.value))} />
            </Field>
            <Field label="Contract" htmlFor="pf-contract">
              <Input id="pf-contract" value={form.contract} onChange={(e) => set('contract', e.target.value)} />
            </Field>
            <Field label="Pay range" htmlFor="pf-pay">
              <Input id="pf-pay" value={form.payRange} onChange={(e) => set('payRange', e.target.value)} placeholder="£13.20–14.00/h" />
            </Field>
            <Field label="How many people?" htmlFor="pf-hc" hint="We suggest marking it filled once you've hired this many.">
              <Input id="pf-hc" type="number" min={1} max={20} value={form.headcount} onChange={(e) => set('headcount', Number(e.target.value))} />
            </Field>
          </div>
          <Field label="Description" htmlFor="pf-desc" hint="What the day looks like, who they'd work with, what support you offer.">
            <Textarea id="pf-desc" rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {existing ? (
              <Button type="submit">Save changes</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => save(false)}>
                  Save as draft
                </Button>
                <Button type="submit">Publish now</Button>
              </>
            )}
          </div>
        </form>
    </Modal>
  )
}

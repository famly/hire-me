import { ArrowLeft, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { isPublic } from '../domain/position'
import { QUALIFICATION_LABEL, QUALIFICATIONS } from '../domain/qualification'
import { isoDate } from '../domain/time'
import type { Availability, Qualification } from '../domain/types'
import { nurseryBySlug, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Field, Input, Textarea } from '../ui/Field'
import { NotFound } from './NurseryPage'

const AVAILABILITY: { value: Availability; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'either', label: 'Either' },
]

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'qualification' | 'earliestStart', string>>

/** M2 — one pass, one screen, phone-first. Structured qualification instead of a CV. */
export function ApplyPage() {
  const { slug, positionId } = useParams()
  const data = useStore()
  const submitApplication = useStore((s) => s.submitApplication)
  const navigate = useNavigate()
  const now = useNow()
  const nursery = nurseryBySlug(data, slug)
  const position = positionById(data, positionId)
  const group = data.groups.find((g) => g.id === nursery?.groupId)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [qualification, setQualification] = useState<Qualification | null>(null)
  const [earliestStart, setEarliestStart] = useState('')
  const [availability, setAvailability] = useState<Availability>('either')
  const [rightToWork, setRightToWork] = useState(false)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const clear = (key: keyof Errors) => errors[key] && setErrors((e) => ({ ...e, [key]: undefined }))

  if (!nursery || !position || position.nurseryId !== nursery.id) return <NotFound />
  if (!isPublic(position)) return <NotFound message="This position isn't open for applications right now." />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (!name.trim()) next.name = 'Please tell us your name'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'We need a valid email to send your status link'
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a phone number the nursery can call'
    if (!qualification) next.qualification = 'Please pick one'
    if (!earliestStart) next.earliestStart = 'Please pick a date'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const { token, duplicate } = submitApplication({
      positionId: position!.id,
      name,
      email,
      phone,
      answers: { qualification: qualification!, earliestStart, availability, rightToWork, note: note.trim() || undefined },
    })
    navigate(`/applied/${token}${duplicate ? '?existing=1' : ''}`)
  }

  return (
    <div className="px-4 pt-4">
      <Link to={`/n/${nursery.slug}/p/${position.id}`} className="inline-flex items-center gap-1 text-sm text-stone-600">
        <ArrowLeft size={14} /> Back to role
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Apply: {position.title}</h1>
      <p className="mt-1 text-stone-600">{nursery.name} · takes about two minutes</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <Input id="name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clear('name') }} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="email" hint="We'll send your private status link here." error={errors.email}>
          <Input id="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email') }} aria-invalid={!!errors.email} />
        </Field>
        <Field label="Mobile number" htmlFor="phone" error={errors.phone}>
          <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clear('phone') }} aria-invalid={!!errors.phone} />
        </Field>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-medium text-stone-800">Your childcare qualification</legend>
          <div className="grid gap-2 pt-1.5">
            {QUALIFICATIONS.map((q) => (
              <label
                key={q}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg bg-white px-3 ring-1 ring-inset ${qualification === q ? 'ring-2 ring-brand-600' : 'ring-stone-300'}`}
              >
                <input type="radio" name="qualification" value={q} checked={qualification === q} onChange={() => { setQualification(q); clear('qualification') }} className="size-4 accent-brand-600" />
                <span>{QUALIFICATION_LABEL[q]}</span>
              </label>
            ))}
          </div>
          {errors.qualification && <p className="text-sm text-red-700">{errors.qualification}</p>}
        </fieldset>

        <Field label="Earliest start date" htmlFor="start" error={errors.earliestStart}>
          <Input id="start" type="date" min={isoDate(now)} value={earliestStart} onChange={(e) => { setEarliestStart(e.target.value); clear('earliestStart') }} aria-invalid={!!errors.earliestStart} />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-stone-800">Hours you're looking for</legend>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {AVAILABILITY.map((a) => (
              <label
                key={a.value}
                className={`flex h-12 cursor-pointer items-center justify-center rounded-lg bg-white text-sm ring-1 ring-inset ${availability === a.value ? 'font-medium ring-2 ring-brand-600' : 'ring-stone-300'}`}
              >
                <input type="radio" name="availability" value={a.value} checked={availability === a.value} onChange={() => setAvailability(a.value)} className="sr-only" />
                {a.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-stone-300 ring-inset">
          <input type="checkbox" checked={rightToWork} onChange={(e) => setRightToWork(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
          <span className="text-sm">I have the right to work in the UK</span>
        </label>

        <Field label="Anything you'd like the nursery to know? (optional)" htmlFor="note">
          <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Experience, the hours that suit you, questions…" />
        </Field>

        <div className="space-y-3">
          <Button type="submit" size="lg">
            Send application
          </Button>
          <p className="flex items-start gap-2 text-xs text-stone-500">
            <Lock size={14} className="mt-0.5 shrink-0" />
            Only {nursery.name} and its group, {group?.name}, can see your details. We'll only use them for this application.
          </p>
        </div>
      </form>
    </div>
  )
}

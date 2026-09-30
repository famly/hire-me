import { ArrowLeft, FileText, Lock, Upload, X } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { isPublic } from '../domain/position'
import { normaliseQualifications, QUALIFICATION_CATALOG } from '../domain/qualification'
import { isoDate } from '../domain/time'
import type { Availability, CvFile } from '../domain/types'
import { nurseryBySlug, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Button } from '../ui/Button'
import { ChoiceGroup } from '../ui/ChoiceGroup'
import { Field, Input, Textarea } from '../ui/Field'
import { MultiCombobox } from '../ui/MultiCombobox'
import { Switch } from '../ui/Switch'
import { NotFound } from './NurseryPage'

const AVAILABILITY: { value: Availability; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'either', label: 'Either' },
]

const CV_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const CV_MAX_BYTES = 5 * 1024 * 1024

type Key = 'name' | 'email' | 'phone' | 'qualifications' | 'earliestStart' | 'availability' | 'rightToWork' | 'cv' | 'consent'
type Errors = Partial<Record<Key, string>>

/** M2 — one screen, phone-first, every field required except the note about themselves. */
export function ApplyPage() {
  const { slug, positionId } = useParams()
  const data = useStore()
  const submitApplication = useStore((s) => s.submitApplication)
  const navigate = useNavigate()
  const now = useNow()
  const fileRef = useRef<HTMLInputElement>(null)
  const nursery = nurseryBySlug(data, slug)
  const position = positionById(data, positionId)
  const group = data.groups.find((g) => g.id === nursery?.groupId)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [qualifications, setQualifications] = useState<string[]>([])
  const [earliestStart, setEarliestStart] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [rightToWork, setRightToWork] = useState<boolean | null>(null)
  const [cv, setCv] = useState<CvFile | null>(null)
  const [note, setNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const clear = (key: Key) => errors[key] && setErrors((e) => ({ ...e, [key]: undefined }))

  if (!nursery || !position || position.nurseryId !== nursery.id) return <NotFound />
  if (!isPublic(position)) return <NotFound message="This position isn't open for applications right now." />

  function pickFile(file: File | undefined) {
    if (!file) return
    if (!CV_TYPES.includes(file.type) && !/\.(pdf|docx?)$/i.test(file.name)) {
      setErrors((e) => ({ ...e, cv: 'Please upload a PDF or Word document' }))
      return
    }
    if (file.size > CV_MAX_BYTES) {
      setErrors((e) => ({ ...e, cv: 'That file is over 5 MB. Try a smaller PDF' }))
      return
    }
    setCv({ name: file.name, sizeBytes: file.size, type: file.type })
    clear('cv')
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Errors = {}
    if (!name.trim()) next.name = 'Please tell us your name'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'We need a valid email to send your status link'
    if (phone.replace(/\D/g, '').length < 10) next.phone = 'Please enter a phone number the nursery can call'
    if (qualifications.length === 0) next.qualifications = 'Pick at least one. Choose "No childcare qualification yet" if that applies'
    if (!earliestStart) next.earliestStart = 'Please pick a date'
    if (!availability) next.availability = 'Please pick one'
    if (rightToWork === null) next.rightToWork = 'Please answer yes or no'
    if (!cv) next.cv = 'Please upload your CV'
    if (!consent) next.consent = 'Please confirm before sending'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`f-${Object.keys(next)[0]}`)?.focus()
      return
    }

    const { token, duplicate } = submitApplication({
      positionId: position!.id,
      name,
      email,
      phone,
      answers: {
        qualifications,
        earliestStart,
        availability: availability!,
        rightToWork: rightToWork!,
        note: note.trim(),
        cv: cv!,
        confirmedTrue: true,
      },
    })
    navigate(`/applied/${token}${duplicate ? '?existing=1' : ''}`)
  }

  return (
    <div className="px-4 pt-4">
      <Link to={`/n/${nursery.slug}/p/${position.id}`} className="inline-flex items-center gap-1 text-sm text-stone-600">
        <ArrowLeft size={14} /> Back to role
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Apply: {position.title}</h1>
      <p className="mt-1 text-stone-600">{nursery.name} · takes a few minutes</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        <Field label="Full name" htmlFor="f-name" error={errors.name}>
          <Input id="f-name" autoComplete="name" value={name} onChange={(e) => { setName(e.target.value); clear('name') }} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="f-email" hint="We'll send your private status link here." error={errors.email}>
          <Input id="f-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); clear('email') }} aria-invalid={!!errors.email} />
        </Field>
        <Field label="Mobile number" htmlFor="f-phone" error={errors.phone}>
          <Input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => { setPhone(e.target.value); clear('phone') }} aria-invalid={!!errors.phone} />
        </Field>

        <Field label="Childcare qualifications" htmlFor="f-qualifications" hint="Pick all that apply. Type to search." error={errors.qualifications}>
          <MultiCombobox
            id="f-qualifications"
            options={QUALIFICATION_CATALOG.map((q) => ({ value: q.id, label: q.label, hint: q.hint }))}
            value={qualifications}
            onChange={(next) => {
              setQualifications((prev) => normaliseQualifications(prev, next))
              clear('qualifications')
            }}
            placeholder="e.g. Level 3, CACHE, first aid…"
            invalid={!!errors.qualifications}
          />
        </Field>

        <Field label="Earliest start date" htmlFor="f-earliestStart" error={errors.earliestStart}>
          <Input id="f-earliestStart" type="date" min={isoDate(now)} value={earliestStart} onChange={(e) => { setEarliestStart(e.target.value); clear('earliestStart') }} aria-invalid={!!errors.earliestStart} />
        </Field>

        <ChoiceGroup
          id="f-availability"
          legend="Hours you're looking for"
          options={AVAILABILITY}
          value={availability}
          onChange={(v) => { setAvailability(v); clear('availability') }}
          error={errors.availability}
        />

        <ChoiceGroup
          id="f-rightToWork"
          legend="Do you have the right to work in the UK?"
          options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
          value={rightToWork === null ? null : rightToWork ? 'yes' : 'no'}
          onChange={(v) => { setRightToWork(v === 'yes'); clear('rightToWork') }}
          error={errors.rightToWork}
        />

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-stone-800">Your CV</p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              pickFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          {cv ? (
            <div className="flex min-h-12 items-center gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-stone-300 ring-inset">
              <FileText size={18} className="shrink-0 text-brand-600" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{cv.name}</span>
                <span className="block text-xs text-stone-500">{Math.max(1, Math.round(cv.sizeBytes / 1024))} KB</span>
              </span>
              <button type="button" aria-label="Remove CV" onClick={() => setCv(null)} className="grid size-8 place-items-center rounded text-stone-500 hover:bg-stone-100">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              id="f-cv"
              type="button"
              aria-invalid={!!errors.cv}
              onClick={() => fileRef.current?.click()}
              className={`flex min-h-16 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-white px-3 text-sm ${errors.cv ? 'border-red-400 text-red-700' : 'border-stone-300 text-stone-600 hover:border-brand-500 hover:text-brand-700'}`}
            >
              <Upload size={18} /> Upload CV · PDF or Word, up to 5 MB
            </button>
          )}
          {errors.cv && <p className="text-sm text-red-700">{errors.cv}</p>}
        </div>

        <Field label="Tell the nursery a bit about yourself (optional)" htmlFor="f-note">
          <Textarea id="f-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Your experience, the hours that suit you, anything you'd like to ask…" />
        </Field>

        <div className="space-y-1.5">
          <Switch id="f-consent" checked={consent} onChange={(v) => { setConsent(v); clear('consent') }} invalid={!!errors.consent}>
            I confirm the information I've given is true and complete, and understand the nursery may check it.
          </Switch>
          {errors.consent && <p className="text-sm text-red-700">{errors.consent}</p>}
        </div>

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

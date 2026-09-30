import { Check, CircleCheckBig, Copy } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { applicationByToken, candidateById, nurseryById, positionById } from '../store/selectors'
import { useStore } from '../store/store'
import { Button } from '../ui/Button'
import { buttonClass } from '../ui/buttonClass'
import { NotFound } from './NurseryPage'
import { statusUrl } from './urls'

/** M3 — confirmation plus the private status link. The link is the candidate's only "account". */
export function AppliedPage() {
  const { token } = useParams()
  const [params] = useSearchParams()
  const data = useStore()
  const [copied, setCopied] = useState(false)
  const app = applicationByToken(data, token)
  if (!app) return <NotFound message="We couldn't find that application." />

  const position = positionById(data, app.positionId)!
  const nursery = nurseryById(data, position.nurseryId)
  const candidate = candidateById(data, app.candidateId)
  const url = statusUrl(app.statusToken)
  const existing = params.get('existing') === '1'

  async function copy() {
    await navigator.clipboard?.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 pt-10 text-center">
      <CircleCheckBig className="mx-auto text-emerald-600" size={48} />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {existing ? "You've already applied" : `Application sent to ${nursery.name}`}
      </h1>
      <p className="mt-2 text-stone-600">
        {existing
          ? `There's already an application for ${position.title} from ${candidate.email}. Here's its status link.`
          : `Thanks, ${candidate.name.split(' ')[0]}. ${nursery.managerName} will get back to you. We've emailed your status link to ${candidate.email}.`}
      </p>

      <div className="mt-8 rounded-xl bg-white p-4 text-left ring-1 ring-stone-200">
        <p className="text-sm font-semibold">Your private status link</p>
        <p className="mt-1 text-sm text-stone-600">
          Bookmark it. It shows where your application stands, with no login. Anyone with the link can see the status, so
          keep it to yourself.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-stone-100 px-3 py-2.5 text-xs">{url}</code>
          <Button variant="secondary" onClick={copy} aria-label="Copy link">
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Link to={`/status/${app.statusToken}`} className={buttonClass('primary', 'lg')}>
          See my application status
        </Link>
        <Link to={`/n/${nursery.slug}`} className="block text-sm text-stone-600 underline">
          Back to {nursery.name}
        </Link>
      </div>
    </div>
  )
}

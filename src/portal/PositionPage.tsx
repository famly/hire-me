import { ArrowLeft, Link2, MailCheck, MessageSquareReply } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { isPublic } from '../domain/position'
import { nurseryBySlug, positionById, roomLabel } from '../store/selectors'
import { useStore } from '../store/store'
import { buttonClass } from '../ui/buttonClass'
import { NotFound } from './NurseryPage'
import { NurseryHeader } from './PortalLayout'
import { PositionFacts } from './PositionFacts'

export function PositionPage() {
  const { slug, positionId } = useParams()
  const data = useStore()
  const nursery = nurseryBySlug(data, slug)
  const position = positionById(data, positionId)

  if (!nursery || !position || position.nurseryId !== nursery.id) return <NotFound />

  return (
    <>
      <NurseryHeader name={nursery.name} area={nursery.area} />
      <div className="px-4 pt-4">
        <Link to={`/n/${nursery.slug}`} className="inline-flex items-center gap-1 text-sm text-stone-600">
          <ArrowLeft size={14} /> All open roles
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{position.title}</h1>

        {!isPublic(position) ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-900">
            This position isn't open for applications right now.{' '}
            <Link to={`/n/${nursery.slug}`} className="underline">
              See what's open
            </Link>
          </p>
        ) : (
          <>
            <div className="mt-4">
              <PositionFacts position={position} room={roomLabel(data, position.roomId)} />
            </div>
            <p className="mt-5 leading-relaxed text-stone-700">{position.description}</p>

            <section className="mt-6 rounded-xl bg-white p-4 ring-1 ring-stone-200">
              <h2 className="text-sm font-semibold">What happens when you apply</h2>
              <ul className="mt-3 space-y-3 text-sm text-stone-600">
                <li className="flex gap-3">
                  <MailCheck size={18} className="shrink-0 text-brand-600" /> One short form, about two minutes. No account or CV.
                </li>
                <li className="flex gap-3">
                  <Link2 size={18} className="shrink-0 text-brand-600" /> You get a private link showing where your application stands.
                </li>
                <li className="flex gap-3">
                  <MessageSquareReply size={18} className="shrink-0 text-brand-600" /> {nursery.managerName}, the nursery manager, replies to you directly.
                </li>
              </ul>
            </section>

            <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 p-3 backdrop-blur sm:static sm:mt-6 sm:border-0 sm:bg-transparent sm:p-0">
              <div className="mx-auto max-w-xl">
                <Link to="apply" className={buttonClass('primary', 'lg')}>
                  Apply now
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

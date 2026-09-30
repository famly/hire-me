import { ChevronRight } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { isPublic } from '../domain/position'
import { nurseryBySlug, positionsOfNursery, roomLabel } from '../store/selectors'
import { useStore } from '../store/store'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { NurseryHeader } from './PortalLayout'
import { PositionFacts } from './PositionFacts'

/** M1 — one shareable URL per nursery, showing what's open right now. */
export function NurseryPage() {
  const { slug } = useParams()
  const data = useStore()
  const nursery = nurseryBySlug(data, slug)
  const open = useMemo(
    () => (nursery ? positionsOfNursery(data, nursery.id).filter(isPublic) : []),
    [data, nursery],
  )

  if (!nursery) return <NotFound />

  return (
    <>
      <NurseryHeader name={nursery.name} area={nursery.area} />
      <section className="px-4 pt-5">
        <p className="text-stone-700">{nursery.about}</p>
      </section>

      <section className="px-4 pt-6">
        <h1 className="text-xl font-semibold">
          {open.length === 0 ? "We're not hiring right now" : `We're hiring · ${open.length} open ${open.length === 1 ? 'role' : 'roles'}`}
        </h1>
        <div className="mt-3 space-y-3">
          {open.length === 0 && (
            <EmptyState title="No open positions right now">Check back soon: this page always shows what's open.</EmptyState>
          )}
          {open.map((p) => (
            <Link key={p.id} to={`/n/${nursery.slug}/p/${p.id}`} className="block">
              <Card className="flex items-center gap-3 p-4 transition hover:ring-brand-500 active:bg-stone-50">
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{p.title}</h2>
                  <PositionFacts position={p} room={roomLabel(data, p.roomId)} compact />
                </div>
                <ChevronRight className="shrink-0 text-stone-400" />
              </Card>
            </Link>
          ))}
        </div>
        {open.length > 0 && (
          <p className="mt-4 text-sm text-stone-500">Apply in a few minutes from your phone. No account needed, just your CV.</p>
        )}
      </section>
    </>
  )
}

export function NotFound({ message = "We couldn't find that page." }: { message?: string }) {
  return (
    <div className="px-4 pt-16 text-center">
      <p className="text-lg font-semibold">{message}</p>
      <Link to="/" className="mt-3 inline-block text-brand-700 underline">
        Go to the start
      </Link>
    </div>
  )
}

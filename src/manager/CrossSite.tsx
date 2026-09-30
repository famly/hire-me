import { STATE_LABEL } from '../domain/application'
import { otherApplications } from '../domain/candidate'
import type { Application } from '../domain/types'
import { nurseryById, positionById } from '../store/selectors'
import { useStore } from '../store/store'

// S2 — one person, several sites in the same group. Candidates are group-scoped,
// so this never shows applications to nurseries outside the group.

function useOtherSites(app: Application) {
  const data = useStore()
  return otherApplications(app, data.applications).map((other) => {
    const position = positionById(data, other.positionId)!
    return { app: other, position, nursery: nurseryById(data, position.nurseryId) }
  })
}

export function CrossSiteSection({ app }: { app: Application }) {
  const others = useOtherSites(app)
  const group = useStore((s) => s.groups.find((g) => g.id === s.candidates.find((c) => c.id === app.candidateId)?.groupId))
  if (others.length === 0) return null
  return (
    <section className="rounded-lg bg-sky-50 p-3 text-sm ring-1 ring-sky-200">
      <p className="font-medium text-sky-900">Also applied within {group?.name}</p>
      <ul className="mt-2 space-y-1.5">
        {others.map(({ app: other, position, nursery }) => (
          <li key={other.id} className="text-sky-900">
            <strong>{nursery.name}</strong>: {position.title} · {STATE_LABEL[other.state]}
            <span className="text-sky-700"> (manager: {nursery.managerName})</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-sky-800">One candidate, one conversation: coordinate before you both make offers.</p>
    </section>
  )
}

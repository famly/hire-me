// Derived lookups over the store data. Plain functions: components call them inside useMemo.

import type { Data } from '../data/seed'
import type { Application, ID, Nursery, Position } from '../domain/types'

export function nurseryBySlug(data: Data, slug: string | undefined): Nursery | undefined {
  return data.nurseries.find((n) => n.slug === slug)
}

export function nurseryById(data: Data, id: ID): Nursery {
  return data.nurseries.find((n) => n.id === id)!
}

export function positionById(data: Data, id: ID | undefined): Position | undefined {
  return data.positions.find((p) => p.id === id)
}

export function roomLabel(data: Data, roomId: ID | undefined): string | undefined {
  const room = data.rooms.find((r) => r.id === roomId)
  return room ? `${room.name} (${room.ageRange})` : undefined
}

export function candidateById(data: Data, id: ID) {
  return data.candidates.find((c) => c.id === id)!
}

export function applicationByToken(data: Data, token: string | undefined): Application | undefined {
  return token ? data.applications.find((a) => a.statusToken === token) : undefined
}

export function positionsOfNursery(data: Data, nurseryId: ID): Position[] {
  return data.positions.filter((p) => p.nurseryId === nurseryId)
}

export function applicationsOfNursery(data: Data, nurseryId: ID): Application[] {
  const ids = new Set(positionsOfNursery(data, nurseryId).map((p) => p.id))
  return data.applications.filter((a) => ids.has(a.positionId))
}

export function applicationsOfPosition(data: Data, positionId: ID): Application[] {
  return data.applications.filter((a) => a.positionId === positionId)
}

import { useMemo } from 'react'
import { applicationsOfNursery, nurseryById, positionsOfNursery } from '../store/selectors'
import { useStore } from '../store/store'

/** Everything scoped to the signed-in manager's nursery (the faked session). */
export function useManagerData() {
  const data = useStore()
  const nursery = nurseryById(data, data.managerNurseryId)
  const positions = useMemo(() => positionsOfNursery(data, nursery.id), [data, nursery.id])
  const applications = useMemo(() => applicationsOfNursery(data, nursery.id), [data, nursery.id])
  return { data, nursery, positions, applications }
}

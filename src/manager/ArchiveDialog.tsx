import { isActive } from '../domain/application'
import type { ID } from '../domain/types'
import { positionById } from '../store/selectors'
import { useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

export function ArchiveDialog({ positionId, onClose }: { positionId: ID; onClose: () => void }) {
  const data = useStore()
  const transition = useStore((s) => s.transitionPosition)
  const position = positionById(data, positionId)!
  const active = data.applications.filter((a) => a.positionId === positionId && isActive(a)).length

  return (
    <Modal
      title={`Archive ${position.title}?`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              transition(positionId, 'archive')
              onClose()
            }}
          >
            Archive
          </Button>
        </>
      }
    >
      <p className="text-sm text-stone-700">It comes off your public page and moves out of your active positions.</p>
      {active > 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          {active} {active === 1 ? 'applicant is' : 'applicants are'} still in progress. They stay in your hiring pipeline so
          you can still reply to them.
        </p>
      )}
    </Modal>
  )
}

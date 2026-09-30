import { isActive } from '../domain/application'
import { messageFor } from '../domain/messages'
import { hiredCount } from '../domain/position'
import type { ID } from '../domain/types'
import { candidateById, nurseryById, positionById } from '../store/selectors'
import { useStore } from '../store/store'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

/** Filling a position closes every remaining application with a message. Nobody gets silence. */
export function FillDialog({ positionId, onClose }: { positionId: ID; onClose: () => void }) {
  const data = useStore()
  const fillPosition = useStore((s) => s.fillPosition)
  const position = positionById(data, positionId)!
  const nursery = nurseryById(data, position.nurseryId)
  const remaining = data.applications.filter((a) => a.positionId === position.id && isActive(a))
  const hired = hiredCount(position, data.applications)
  const preview = messageFor('position_filled', {
    candidateName: remaining[0] ? candidateById(data, remaining[0].candidateId).name : 'there',
    positionTitle: position.title,
    nurseryName: nursery.name,
    managerName: nursery.managerName,
  })

  return (
    <Modal
      title={`Mark ${position.title} as filled?`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not yet
          </Button>
          <Button
            onClick={() => {
              fillPosition(position.id)
              onClose()
            }}
          >
            {remaining.length > 0 ? `Mark filled & notify ${remaining.length}` : 'Mark filled'}
          </Button>
        </>
      }
    >
      <p className="text-sm text-stone-700">
        You've hired {hired} of {position.headcount}. The position comes off your public page.
      </p>
      {remaining.length > 0 ? (
        <>
          <p className="text-sm text-stone-700">
            {remaining.length === 1 ? 'This applicant is' : `These ${remaining.length} applicants are`} still waiting to
            hear. They'll get this message and see "Not progressing" on their status page:
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {remaining.map((a) => (
              <li key={a.id} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-sm">
                {candidateById(data, a.candidateId).name}
              </li>
            ))}
          </ul>
          <div className="rounded-lg bg-stone-50 p-3 text-sm">
            <p className="font-medium">{preview.subject}</p>
            <p className="mt-1 whitespace-pre-line text-stone-600">{preview.body}</p>
          </div>
        </>
      ) : (
        <p className="text-sm text-stone-700">Nobody else is waiting on this position.</p>
      )}
    </Modal>
  )
}

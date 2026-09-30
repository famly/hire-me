import { UserPlus } from 'lucide-react'
import { QUALIFICATION_SHORT } from '../domain/qualification'
import { formatDate } from '../domain/time'
import { roomLabel } from '../store/selectors'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { useActions } from './actionsContext'
import { useManagerData } from './useManagerData'

/** Famly's existing staff record: where a hire lands, prefilled. The one given fact in the brief. */
export function StaffPage() {
  const { data, nursery } = useManagerData()
  const { open } = useActions()
  const staff = data.staff.filter((s) => s.nurseryId === nursery.id).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">{nursery.name}</h2>
        <p className="text-sm text-stone-500">
          In Famly, this record carries the rota, qualification, room and app access. Hires from Recruitment arrive here
          already filled in. Only recent hires are shown in this prototype.
        </p>
      </div>
      <Card className="divide-y divide-stone-100">
        {staff.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
            <div className="min-w-0 flex-1 basis-48">
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-stone-500">
                {roomLabel(data, s.roomId) ?? 'No room yet'} · {QUALIFICATION_SHORT[s.qualification]} · starts{' '}
                {formatDate(s.startDate)}
              </p>
            </div>
            <p className="text-sm text-stone-500">{s.email}</p>
            {s.fromApplicationId && (
              <button type="button" onClick={() => open(s.fromApplicationId!)} title="Open the application this record came from">
                <Badge tone="brand">
                  <UserPlus size={12} aria-hidden /> Hired via Recruitment
                </Badge>
              </button>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

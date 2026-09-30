import { Clock, GraduationCap, MapPin, PoundSterling } from 'lucide-react'
import { QUALIFICATION_LABEL } from '../domain/qualification'
import type { Position } from '../domain/types'

export function PositionFacts({ position, room, compact }: { position: Position; room?: string; compact?: boolean }) {
  const rows = [
    room && { icon: MapPin, text: room },
    {
      icon: GraduationCap,
      text: position.requiredQualification === 'none' ? 'No qualification needed' : `${QUALIFICATION_LABEL[position.requiredQualification]} required`,
    },
    { icon: Clock, text: `${position.hoursPerWeek}h/week · ${position.contract}` },
    { icon: PoundSterling, text: position.payRange },
  ].filter(Boolean) as { icon: typeof MapPin; text: string }[]

  return (
    <ul className={compact ? 'mt-2 space-y-1 text-sm text-stone-600' : 'space-y-2 text-stone-700'}>
      {rows.map(({ icon: Icon, text }) => (
        <li key={text} className="flex items-center gap-2">
          <Icon size={compact ? 14 : 16} className="shrink-0 text-stone-400" aria-hidden />
          {text}
        </li>
      ))}
    </ul>
  )
}

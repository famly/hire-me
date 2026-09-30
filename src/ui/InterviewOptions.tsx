import { Hourglass, MapPin, Video } from 'lucide-react'
import { formatDateTime, formatDateTimeLong, relativeTime } from '../domain/time'
import type { InterviewSlots, Timestamp } from '../domain/types'

/**
 * An invite still waiting for the candidate to pick one of the offered times.
 * Compact on the pipeline card, full in the manager's panel.
 */
export function InterviewOptions({
  slots,
  sentAt,
  firstName,
  now,
  compact,
}: {
  slots: InterviewSlots
  sentAt: Timestamp
  firstName: string
  now: Timestamp
  compact?: boolean
}) {
  const open = slots.options.filter((at) => at > now).sort((a, b) => a - b)
  const icon = compact ? 13 : 16
  return (
    <div className={compact ? 'space-y-1 text-xs text-stone-600' : 'space-y-2 text-sm text-stone-700'}>
      <p className="flex items-start gap-1.5">
        <Hourglass size={icon} className="mt-px shrink-0 text-stone-400" aria-hidden />
        <span>
          {open.length === 0 ? (
            <>All the times offered have passed. Offer new ones or give {firstName} a call.</>
          ) : (
            <>
              Waiting for {firstName} to pick a time
              <span className="text-stone-500"> · {slots.options.length} offered {relativeTime(sentAt, now)}</span>
            </>
          )}
        </span>
      </p>
      {!compact && open.length > 0 && (
        <ul className="ml-6 list-disc space-y-0.5 text-stone-600">
          {open.map((at) => (
            <li key={at}>{formatDateTimeLong(at)}</li>
          ))}
        </ul>
      )}
      {compact && open.length > 0 && <p className="pl-5 text-stone-500">Earliest: {formatDateTime(open[0])}</p>}
      {!compact && (
        <p className="flex items-start gap-1.5">
          {slots.mode === 'online' ? (
            <Video size={icon} className="mt-px shrink-0 text-stone-400" aria-hidden />
          ) : (
            <MapPin size={icon} className="mt-px shrink-0 text-stone-400" aria-hidden />
          )}
          <span className="min-w-0">{slots.mode === 'online' ? 'Online' : `In person · ${slots.location}`}</span>
        </p>
      )}
    </div>
  )
}

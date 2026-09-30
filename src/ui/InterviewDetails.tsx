import { CalendarDays, MapPin, Video } from 'lucide-react'
import { formatDateTime, formatDateTimeLong, relativeTime } from '../domain/time'
import type { Interview, Timestamp } from '../domain/types'

/**
 * When and where an interview is. Compact on the pipeline card, full in the
 * manager's panel and on the candidate's status page.
 */
export function InterviewDetails({ interview, now, compact }: { interview: Interview; now: Timestamp; compact?: boolean }) {
  const past = interview.at <= now
  const online = interview.mode === 'online'
  const link = (
    <a
      href={interview.location}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="font-medium text-brand-700 hover:underline"
    >
      {compact ? 'Join link' : 'Join the online meeting'}
    </a>
  )

  return (
    <div className={compact ? 'space-y-1 text-xs text-stone-600' : 'space-y-2 text-sm text-stone-700'}>
      <p className="flex items-start gap-1.5">
        <CalendarDays size={compact ? 13 : 16} className="mt-px shrink-0 text-stone-400" aria-hidden />
        <span>
          {past ? 'Interviewed ' : ''}
          <span className={past ? '' : 'font-medium text-stone-900'}>{compact ? formatDateTime(interview.at) : formatDateTimeLong(interview.at)}</span>
          <span className="text-stone-500"> · {relativeTime(interview.at, now)}</span>
        </span>
      </p>
      {!(compact && past) && (
        <p className="flex items-start gap-1.5">
          {online ? (
            <Video size={compact ? 13 : 16} className="mt-px shrink-0 text-stone-400" aria-hidden />
          ) : (
            <MapPin size={compact ? 13 : 16} className="mt-px shrink-0 text-stone-400" aria-hidden />
          )}
          <span className="min-w-0">
            {online ? <>Online · {link}</> : <span className={compact ? 'line-clamp-2' : ''}>In person · {interview.location}</span>}
          </span>
        </p>
      )}
    </div>
  )
}

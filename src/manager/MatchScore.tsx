import { Sparkles } from 'lucide-react'
import { MATCH_BAND_LABEL, matchApplication } from '../domain/relevance'
import type { Application, Position, Timestamp } from '../domain/types'
import { Popover } from '../ui/Popover'

/**
 * The match score as a small brand-coloured chip (not red/amber/green: it's a hint, not
 * an alert). Hover or tap for the explanation and the points behind it.
 */
export function MatchScore({ app, position, now }: { app: Application; position: Position; now: Timestamp }) {
  const m = matchApplication(app, position, now)
  return (
    <Popover
      hover
      fixed
      label={`Match ${m.score} out of 100. Why?`}
      button={
        <>
          <Sparkles size={12} aria-hidden /> {m.score}
        </>
      }
      buttonClassName="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-100 ring-inset hover:bg-brand-100"
      panelClassName="w-[min(21rem,calc(100vw-2rem))] p-4"
    >
      {() => (
        <div className="space-y-3 text-left">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-semibold text-stone-900">{MATCH_BAND_LABEL[m.band]}</p>
            <p className="text-sm text-stone-500">
              <span className="text-lg font-semibold text-stone-900">{m.score}</span> / 100
            </p>
          </div>
          <div className="rounded-lg bg-brand-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <Sparkles size={12} aria-hidden /> AI explanation
            </p>
            <p className="mt-1 text-sm text-stone-700">{m.summary}</p>
          </div>
          <ul className="space-y-2">
            {m.factors.map((f) => (
              <li key={f.label} className="text-xs">
                <div className="flex justify-between gap-2 text-stone-700">
                  <span className="font-medium">{f.label}</span>
                  <span className="tabular-nums text-stone-500">
                    {f.points}/{f.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${(f.points / f.max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-stone-100 pt-3 text-xs text-stone-500">
            Scored only from the answers on the application. It's a hint for where to look first: it doesn't reorder the
            board or reject anyone. Prototype: the explanation is written from these factors, not by a live AI call.
          </p>
        </div>
      )}
    </Popover>
  )
}

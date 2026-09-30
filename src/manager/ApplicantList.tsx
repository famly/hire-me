import { isActive, lastActivityAt } from '../domain/application'
import { needsReply, sortQueue } from '../domain/queue'
import { relativeTime } from '../domain/time'
import type { Application } from '../domain/types'
import { candidateById, positionById } from '../store/selectors'
import { useNow, useStore } from '../store/store'
import { Card } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import { StatusPill } from '../ui/StatusPill'
import { QualificationBadge, RightToWorkBadge, WaitBadge } from './badges'

const SECTIONS = [
  { key: 'reply', title: 'Waiting for a first reply', test: needsReply },
  { key: 'active', title: 'In progress', test: (a: Application) => isActive(a) && !needsReply(a) },
  { key: 'closed', title: 'Closed', test: (a: Application) => !isActive(a) },
] as const

/** The queue: sorted by who has waited longest, grouped so "needs reply" is always on top. */
export function ApplicantList({ applications, showPosition }: { applications: Application[]; showPosition?: boolean }) {
  const sorted = sortQueue(applications)
  if (sorted.length === 0) return <EmptyState title="No applicants here">New applications appear here as they arrive.</EmptyState>

  return (
    <div className="space-y-6">
      {SECTIONS.map(({ key, title, test }) => {
        const apps = sorted.filter(test)
        if (apps.length === 0) return null
        return (
          <section key={key}>
            <h3 className="mb-2 text-xs font-semibold tracking-wide text-stone-500 uppercase">
              {title} · {apps.length}
            </h3>
            <Card className="divide-y divide-stone-100">
              {apps.map((a) => (
                <ApplicantRow key={a.id} app={a} showPosition={showPosition} />
              ))}
            </Card>
          </section>
        )
      })}
    </div>
  )
}

function ApplicantRow({ app, showPosition }: { app: Application; showPosition?: boolean }) {
  const data = useStore()
  const now = useNow()
  const candidate = candidateById(data, app.candidateId)
  const position = positionById(data, app.positionId)!

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      <div className="min-w-0 flex-1 basis-56">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{candidate.name}</p>
          <QualificationBadge has={app.answers.qualification} required={position.requiredQualification} />
          <RightToWorkBadge app={app} />
        </div>
        <p className="truncate text-sm text-stone-500">
          {showPosition && <>{position.title} · </>}applied {relativeTime(app.createdAt, now)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <WaitBadge app={app} now={now} />
        {!needsReply(app) && <span className="text-xs text-stone-500">updated {relativeTime(lastActivityAt(app), now)}</span>}
        <StatusPill state={app.state} />
      </div>
    </div>
  )
}

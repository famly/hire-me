import { ACTION_LABEL, managerActions, nextAction } from '../domain/application'
import type { Application } from '../domain/types'
import { useNow } from '../store/store'
import { Button } from '../ui/Button'
import { useActions } from './actionsContext'

/** Act on the row: the expected next step, plus reject. Everything else lives in the panel. */
export function RowActions({ app }: { app: Application }) {
  const { start } = useActions()
  const next = nextAction(app)
  if (!next) return null
  return (
    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
      <Button size="sm" onClick={() => start(app.id, next)}>
        {ACTION_LABEL[next]}
      </Button>
      <Button size="sm" variant="secondary" onClick={() => start(app.id, 'reject')}>
        Reject
      </Button>
    </div>
  )
}

/** Every action allowed right now, primary first. */
export function AllActions({ app }: { app: Application }) {
  const { start } = useActions()
  const now = useNow()
  const next = nextAction(app)
  const actions = managerActions(app, now).sort((a, b) => Number(b === next) - Number(a === next) || Number(a === 'reject') - Number(b === 'reject'))
  if (actions.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button
          key={a}
          size="sm"
          variant={a === next ? 'primary' : a === 'reject' ? 'danger' : 'secondary'}
          onClick={() => start(app.id, a)}
        >
          {ACTION_LABEL[a]}
        </Button>
      ))}
    </div>
  )
}

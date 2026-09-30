import { ACTION_LABEL, managerActions, nextAction } from '../domain/application'
import type { Application } from '../domain/types'
import { useNow } from '../store/store'
import { Button } from '../ui/Button'
import { useActions } from './actionsContext'

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

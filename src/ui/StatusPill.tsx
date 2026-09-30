import { STATE_LABEL } from '../domain/application'
import type { ApplicationState } from '../domain/types'
import { Badge } from './Badge'

/** Stage label. Neutral by design: colour is reserved for things that need attention (see manager/badges.tsx). */
export function StatusPill({ state }: { state: ApplicationState }) {
  return <Badge tone={state === 'hired' ? 'green' : 'neutral'}>{STATE_LABEL[state]}</Badge>
}

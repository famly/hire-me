import { STATE_LABEL } from '../domain/application'
import type { ApplicationState } from '../domain/types'
import { Badge, type Tone } from './Badge'

const TONE: Record<ApplicationState, Tone> = {
  new: 'brand',
  contacted: 'blue',
  interview: 'blue',
  offer: 'blue',
  hired: 'green',
  rejected: 'neutral',
  withdrawn: 'neutral',
  lapsed: 'neutral',
}

export function StatusPill({ state }: { state: ApplicationState }) {
  return <Badge tone={TONE[state]}>{STATE_LABEL[state]}</Badge>
}

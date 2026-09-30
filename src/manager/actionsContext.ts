import { createContext, useContext } from 'react'
import type { ApplicationAction } from '../domain/application'
import type { ID } from '../domain/types'

export interface Actions {
  /** Start an action on an application: opens the confirm dialog with a message preview. */
  start: (applicationId: ID, action: ApplicationAction) => void
  /** Open the application side panel. */
  open: (applicationId: ID) => void
}

export const ActionsContext = createContext<Actions | null>(null)

export function useActions(): Actions {
  const ctx = useContext(ActionsContext)
  if (!ctx) throw new Error('useActions must be used inside <ActionsProvider>')
  return ctx
}

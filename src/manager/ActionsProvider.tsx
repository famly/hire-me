import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import type { ApplicationAction } from '../domain/application'
import type { ID } from '../domain/types'
import { ActionDialog } from './ActionDialog'
import { ActionsContext } from './actionsContext'
import { ApplicationPanel } from './ApplicationPanel'

/**
 * Owns the manager's action flow: which dialog is open, and the side panel.
 * The panel lives in the URL (?app=…) so the queue keeps its place and Back closes it.
 */
export function ActionsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams()
  const [pending, setPending] = useState<{ applicationId: ID; action: ApplicationAction } | null>(null)
  const openId = params.get('app')

  const open = useCallback(
    (applicationId: ID) =>
      setParams((p) => {
        p.set('app', applicationId)
        return p
      }),
    [setParams],
  )
  const close = () =>
    setParams((p) => {
      p.delete('app')
      return p
    })

  const actions = useMemo(
    () => ({ start: (applicationId: ID, action: ApplicationAction) => setPending({ applicationId, action }), open }),
    [open],
  )

  return (
    <ActionsContext.Provider value={actions}>
      {children}
      {openId && <ApplicationPanel applicationId={openId} onClose={close} />}
      {pending && (
        <ActionDialog applicationId={pending.applicationId} action={pending.action} onClose={() => setPending(null)} />
      )}
    </ActionsContext.Provider>
  )
}

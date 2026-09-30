import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import type { ApplicationAction } from '../domain/application'
import { shouldSuggestFilled } from '../domain/position'
import type { ID } from '../domain/types'
import { useStore } from '../store/store'
import { ActionDialog } from './ActionDialog'
import { ActionsContext } from './actionsContext'
import { ApplicationPanel } from './ApplicationPanel'
import { ArchiveDialog } from './ArchiveDialog'
import { FillDialog } from './FillDialog'
import { HireDialog } from './HireDialog'
import { PositionFormModal } from './PositionFormModal'

/**
 * Owns the manager's action flow: which dialog is open, and the side panel.
 * The panel lives in the URL (?app=…) so the queue keeps its place and Back closes it.
 */
export function ActionsProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams()
  const [pending, setPending] = useState<{ applicationId: ID; action: ApplicationAction } | null>(null)
  const [fillId, setFillId] = useState<ID | null>(null)
  const [archiveId, setArchiveId] = useState<ID | null>(null)
  // undefined = closed, null = new position, id = edit
  const [editing, setEditing] = useState<ID | null | undefined>(undefined)
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
    () => ({
      start: (applicationId: ID, action: ApplicationAction) => setPending({ applicationId, action }),
      open,
      fill: (positionId: ID) => setFillId(positionId),
      editPosition: (positionId?: ID) => setEditing(positionId ?? null),
      archive: (positionId: ID) => setArchiveId(positionId),
    }),
    [open],
  )

  return (
    <ActionsContext.Provider value={actions}>
      {children}
      {openId && <ApplicationPanel applicationId={openId} onClose={close} />}
      {pending?.action === 'hire' && (
        <HireDialog
          applicationId={pending.applicationId}
          onClose={() => setPending(null)}
          onHired={() => {
            // Hires reached headcount → prompt straight away to fill and notify the rest.
            const state = useStore.getState()
            const app = state.applications.find((a) => a.id === pending.applicationId)!
            const position = state.positions.find((p) => p.id === app.positionId)!
            setPending(null)
            if (shouldSuggestFilled(position, state.applications)) setFillId(position.id)
          }}
        />
      )}
      {pending && pending.action !== 'hire' && (
        <ActionDialog applicationId={pending.applicationId} action={pending.action} onClose={() => setPending(null)} />
      )}
      {fillId && <FillDialog positionId={fillId} onClose={() => setFillId(null)} />}
      {archiveId && <ArchiveDialog positionId={archiveId} onClose={() => setArchiveId(null)} />}
      {editing !== undefined && <PositionFormModal positionId={editing ?? undefined} onClose={() => setEditing(undefined)} />}
    </ActionsContext.Provider>
  )
}

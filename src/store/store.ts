import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSeed, MANAGER_NURSERY_ID, type Data } from '../data/seed'
import { addNote, transitionApplication, type ApplicationAction } from '../domain/application'
import { existingApplication, findOrCreateCandidate } from '../domain/candidate'
import { messageFor, type MessageContext } from '../domain/messages'
import { fillPosition, transitionPosition, type PositionAction } from '../domain/position'
import { staffRecordFromApplication } from '../domain/staff'
import type { Application, ApplicationAnswers, ID, Interview, Message, Position, StaffRecord } from '../domain/types'
import { newId, newToken } from './ids'

// Store actions orchestrate, the domain decides (docs/ARCHITECTURE.md "Layering rules").

const STORAGE_KEY = 'famly-recruit-v2'

export interface ApplyInput {
  positionId: ID
  name: string
  email: string
  phone: string
  answers: ApplicationAnswers
}

export type PositionInput = Omit<Position, 'id' | 'state' | 'createdAt' | 'filledAt'>

interface State extends Data {
  /** Demo clock: real time + offset, so "+1 day" can show waits and stale flags moving. */
  clockOffset: number
  /** The faked session (Priya at Oak Tree). */
  managerNurseryId: ID

  reset: () => void
  fastForward: (ms: number) => void
  submitApplication: (input: ApplyInput) => { token: string; duplicate: boolean }
  applyAction: (applicationId: ID, action: ApplicationAction, message?: Message, extra?: { interview?: Interview }) => void
  addNote: (applicationId: ID, body: string) => void
  hire: (applicationId: ID, message: Message | undefined, staff: Pick<StaffRecord, 'startDate' | 'roomId'>) => void
  transitionPosition: (positionId: ID, action: PositionAction) => void
  fillPosition: (positionId: ID) => void
  createPosition: (input: PositionInput, publish: boolean) => ID
  updatePosition: (positionId: ID, input: PositionInput) => void
}

export function currentTime(clockOffset: number): number {
  return Date.now() + clockOffset
}

function freshState() {
  return { ...buildSeed(Date.now()), clockOffset: 0, managerNurseryId: MANAGER_NURSERY_ID }
}

/** Everything a message template needs, looked up from the application. */
export function messageContext(state: Data, app: Application): MessageContext {
  const position = state.positions.find((p) => p.id === app.positionId)!
  const nursery = state.nurseries.find((n) => n.id === position.nurseryId)!
  const candidate = state.candidates.find((c) => c.id === app.candidateId)!
  return {
    candidateName: candidate.name,
    positionTitle: position.title,
    nurseryName: nursery.name,
    managerName: nursery.managerName,
  }
}

const replace = <T extends { id: ID }>(list: T[], item: T) => list.map((x) => (x.id === item.id ? item : x))

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const now = () => currentTime(get().clockOffset)
      const app = (id: ID) => get().applications.find((a) => a.id === id)!
      const position = (id: ID) => get().positions.find((p) => p.id === id)!

      return {
        ...freshState(),

        reset: () => set(freshState()),

        fastForward: (ms) => set((s) => ({ clockOffset: s.clockOffset + ms })),

        submitApplication: (input) => {
          const state = get()
          const pos = position(input.positionId)
          const nursery = state.nurseries.find((n) => n.id === pos.nurseryId)!
          const { candidate, candidates } = findOrCreateCandidate(
            state.candidates,
            { groupId: nursery.groupId, email: input.email, name: input.name, phone: input.phone },
            newId('c'),
          )
          const existing = existingApplication(state.applications, candidate.id, pos.id)
          if (existing) return { token: existing.statusToken, duplicate: true }

          const at = now()
          const id = newId('a')
          const application: Application = {
            id,
            candidateId: candidate.id,
            positionId: pos.id,
            state: 'new',
            answers: input.answers,
            statusToken: newToken(),
            createdAt: at,
            timeline: [{ id: `${id}-e0`, at, by: 'candidate', kind: 'status', from: null, to: 'new' }],
          }
          application.timeline.push({
            id: `${id}-e1`,
            at,
            by: 'system',
            kind: 'message',
            ...messageFor('received', messageContext({ ...state, candidates }, application)),
          })
          set({ candidates, applications: [...state.applications, application] })
          return { token: application.statusToken, duplicate: false }
        },

        applyAction: (applicationId, action, message, extra = {}) =>
          set((s) => ({
            applications: replace(
              s.applications,
              transitionApplication(app(applicationId), action, now(), { message, interview: extra.interview }),
            ),
          })),

        addNote: (applicationId, body) =>
          set((s) => ({ applications: replace(s.applications, addNote(app(applicationId), body, now())) })),

        hire: (applicationId, message, staff) => {
          const s = get()
          const application = app(applicationId)
          const candidate = s.candidates.find((c) => c.id === application.candidateId)!
          const hired = transitionApplication(application, 'hire', now(), { message })
          const record = {
            ...staffRecordFromApplication(hired, candidate, position(application.positionId), newId('s'), now()),
            ...staff,
          }
          set({ applications: replace(s.applications, hired), staff: [...s.staff, record] })
        },

        transitionPosition: (positionId, action) =>
          set((s) => ({ positions: replace(s.positions, transitionPosition(position(positionId), action, now())) })),

        fillPosition: (positionId) => {
          const s = get()
          const result = fillPosition(position(positionId), s.applications, now(), (a) =>
            messageFor('position_filled', messageContext(s, a)),
          )
          set({ positions: replace(s.positions, result.position), applications: result.applications })
        },

        createPosition: (input, publish) => {
          const id = newId('p')
          const created: Position = { ...input, id, state: publish ? 'open' : 'draft', createdAt: now() }
          set((s) => ({ positions: [...s.positions, created] }))
          return id
        },

        updatePosition: (positionId, input) =>
          set((s) => ({ positions: replace(s.positions, { ...position(positionId), ...input }) })),
      }
    },
    {
      name: STORAGE_KEY,
      partialize: ({ groups, nurseries, rooms, positions, candidates, applications, staff, clockOffset, managerNurseryId }) => ({
        groups, nurseries, rooms, positions, candidates, applications, staff, clockOffset, managerNurseryId,
      }),
    },
  ),
)

// Persist the seed immediately on first load. Otherwise a second tab would build its own
// seed (with different status tokens) before anything had been written.
if (typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)) {
  useStore.setState({})
}

// Cross-tab sync: portal in one tab, manager in another, both live during the walkthrough.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) void useStore.persist.rehydrate()
  })
}

/** Demo-aware "now" that re-renders every minute and whenever the clock is fast-forwarded. */
export function useNow(): number {
  const clockOffset = useStore((s) => s.clockOffset)
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  return tick + clockOffset
}


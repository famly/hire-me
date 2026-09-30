import { levelOf } from './qualification'
import type { Application, Candidate, ID, Position, StaffRecord, Timestamp } from './types'

/** Hiring hands off to Famly's staff record, prefilled so nobody retypes it. */
export function staffRecordFromApplication(
  app: Application,
  candidate: Candidate,
  position: Position,
  id: ID,
  now: Timestamp,
): StaffRecord {
  return {
    id,
    nurseryId: position.nurseryId,
    roomId: position.roomId,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    qualification: levelOf(app.answers.qualifications),
    qualifications: app.answers.qualifications,
    startDate: app.answers.earliestStart,
    createdAt: now,
    fromApplicationId: app.id,
  }
}

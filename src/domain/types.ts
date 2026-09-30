// Domain model. See docs/SPEC.md §4. Timestamps are epoch ms so state serialises cleanly.

export type ID = string
export type Timestamp = number

export type Qualification = 'none' | 'working_towards' | 'L2' | 'L3'

export type PositionState = 'draft' | 'open' | 'paused' | 'filled' | 'closed'

export type ApplicationState =
  | 'new'
  | 'contacted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'lapsed'

/** Plain-language projection shown to the candidate. Internal states never leak. */
export type CandidateStatus =
  | 'received'
  | 'being_reviewed'
  | 'invited_to_interview'
  | 'offer'
  | 'hired'
  | 'not_progressing'
  | 'closed'

export type Availability = 'full_time' | 'part_time' | 'either'

export interface Group {
  id: ID
  name: string
}

export interface Nursery {
  id: ID
  groupId: ID
  slug: string
  name: string
  area: string
  about: string
  managerName: string
}

export interface Room {
  id: ID
  nurseryId: ID
  name: string
  ageRange: string
}

export interface Position {
  id: ID
  nurseryId: ID
  roomId?: ID
  title: string
  requiredQualification: Qualification
  hoursPerWeek: number
  contract: string
  payRange: string
  headcount: number
  description: string
  state: PositionState
  createdAt: Timestamp
  filledAt?: Timestamp
}

/** The job seeker in our system. Not a user account, not a staff record. Scoped to one group. */
export interface Candidate {
  id: ID
  groupId: ID
  email: string
  name: string
  phone: string
}

export interface ApplicationAnswers {
  qualification: Qualification
  earliestStart: string // ISO date (yyyy-mm-dd)
  availability: Availability
  rightToWork: boolean
  note?: string
}

export type RejectionReason = 'position_filled'

export interface Application {
  id: ID
  candidateId: ID
  positionId: ID
  state: ApplicationState
  answers: ApplicationAnswers
  statusToken: string
  createdAt: Timestamp
  firstRepliedAt?: Timestamp
  rejectionReason?: RejectionReason
  timeline: TimelineEvent[]
}

export type Actor = 'manager' | 'candidate' | 'system'

export type TimelineEvent =
  | { id: ID; at: Timestamp; by: Actor; kind: 'status'; from: ApplicationState | null; to: ApplicationState }
  | { id: ID; at: Timestamp; by: Actor; kind: 'message'; subject: string; body: string }
  | { id: ID; at: Timestamp; by: Actor; kind: 'note'; body: string }

export interface StaffRecord {
  id: ID
  nurseryId: ID
  roomId?: ID
  name: string
  email: string
  phone: string
  qualification: Qualification
  startDate: string // ISO date
  createdAt: Timestamp
  fromApplicationId?: ID
}

export interface Message {
  subject: string
  body: string
}

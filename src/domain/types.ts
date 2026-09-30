// Domain model. See docs/SPEC.md §4. Timestamps are epoch ms so state serialises cleanly.

export type ID = string
export type Timestamp = number

export type Qualification = 'none' | 'working_towards' | 'L2' | 'L3'

export type PositionState = 'draft' | 'open' | 'paused' | 'filled' | 'archived'

export type ApplicationState =
  | 'new'
  | 'contacted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'lapsed'
  /** They turned the offer down. Recorded by the manager, since the answer usually comes by phone. */
  | 'declined'

/** Plain-language projection shown to the candidate. Internal states never leak. */
export type CandidateStatus =
  | 'received'
  | 'being_reviewed'
  | 'invited_to_interview'
  | 'offer'
  | 'hired'
  | 'not_progressing'
  | 'offer_declined'
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
  address: string
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

/** What we keep about an uploaded CV. The prototype stores only this, not the file itself. */
export interface CvFile {
  name: string
  sizeBytes: number
  type: string
}

export interface ApplicationAnswers {
  /** Ids from QUALIFICATION_CATALOG; the level for matching comes from levelOf(). */
  qualifications: string[]
  earliestStart: string // ISO date (yyyy-mm-dd)
  availability: Availability
  rightToWork: boolean
  /** Optional: "Tell the nursery a bit about yourself". Empty string when skipped. */
  note: string
  cv: CvFile
  /** They confirmed the information is true when submitting. */
  confirmedTrue: true
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
  /** Set when invited to interview. */
  interview?: Interview
  timeline: TimelineEvent[]
}

export interface Interview {
  at: Timestamp
  mode: 'in_person' | 'online'
  /** Street address when in person, meeting link when online. */
  location: string
}

export type Actor = 'manager' | 'candidate' | 'system'

export type TimelineEvent =
  | { id: ID; at: Timestamp; by: Actor; kind: 'status'; from: ApplicationState | null; to: ApplicationState }
  | { id: ID; at: Timestamp; by: Actor; kind: 'message'; subject: string; body: string }
  /** Internal, never shown to the candidate. `about: 'interview'` = notes from the interview itself. */
  | { id: ID; at: Timestamp; by: Actor; kind: 'note'; body: string; about?: 'interview' }

export interface StaffRecord {
  id: ID
  nurseryId: ID
  roomId?: ID
  name: string
  email: string
  phone: string
  qualification: Qualification
  qualifications: string[]
  startDate: string // ISO date
  createdAt: Timestamp
  fromApplicationId?: ID
}

export interface Message {
  subject: string
  body: string
}

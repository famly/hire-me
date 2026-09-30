import type { Qualification } from './types'

const RANK: Record<Qualification, number> = { none: 0, working_towards: 1, L2: 2, L3: 3 }

export const QUALIFICATIONS: Qualification[] = ['none', 'working_towards', 'L2', 'L3']

export const QUALIFICATION_LABEL: Record<Qualification, string> = {
  none: 'No childcare qualification',
  working_towards: 'Working towards Level 2/3',
  L2: 'Level 2',
  L3: 'Level 3',
}

/** Short form for badges and requirement lines. */
export const QUALIFICATION_SHORT: Record<Qualification, string> = {
  none: 'None',
  working_towards: 'Working towards',
  L2: 'L2',
  L3: 'L3',
}

export function rankOf(q: Qualification): number {
  return RANK[q]
}

export function meetsRequirement(has: Qualification, required: Qualification): boolean {
  return RANK[has] >= RANK[required]
}

// ---- What applicants pick on the form: real qualifications, each mapped to a level ----

export interface QualificationOption {
  id: string
  label: string
  /** The level it counts as for a position's requirement. null = a certificate that adds no level. */
  level: Qualification | null
  hint: string
}

export const QUALIFICATION_CATALOG: QualificationOption[] = [
  { id: 'none', label: 'No childcare qualification yet', level: 'none', hint: "That's fine for many roles" },
  { id: 'wt-l2', label: 'Working towards Level 2', level: 'working_towards', hint: 'In training' },
  { id: 'wt-l3', label: 'Working towards Level 3', level: 'working_towards', hint: 'In training' },
  { id: 'l2-eyp', label: 'Level 2 Early Years Practitioner', level: 'L2', hint: 'Level 2' },
  { id: 'l2-cache', label: 'CACHE Level 2 Certificate in Childcare', level: 'L2', hint: 'Level 2' },
  { id: 'l3-eye', label: 'Level 3 Early Years Educator', level: 'L3', hint: 'Level 3' },
  { id: 'l3-cache', label: 'CACHE Level 3 Diploma in Childcare and Education', level: 'L3', hint: 'Level 3' },
  { id: 'l3-btec', label: "BTEC National in Children's Play, Learning and Development", level: 'L3', hint: 'Level 3' },
  { id: 'l3-nneb', label: 'NNEB Diploma in Nursery Nursing', level: 'L3', hint: 'Level 3 (older qualification)' },
  { id: 'l5-fd', label: 'Foundation Degree in Early Years', level: 'L3', hint: 'Level 5, counts as Level 3 or above' },
  { id: 'l6-eyts', label: 'Early Years Teacher Status (EYTS)', level: 'L3', hint: 'Level 6, counts as Level 3 or above' },
  { id: 'l6-qts', label: 'Qualified Teacher Status (QTS)', level: 'L3', hint: 'Level 6, counts as Level 3 or above' },
  { id: 'pfa', label: 'Paediatric First Aid (12-hour)', level: null, hint: 'Certificate' },
]

export function qualificationLabel(id: string): string {
  return QUALIFICATION_CATALOG.find((q) => q.id === id)?.label ?? id
}

/** The highest level across everything they picked. Nothing picked counts as "none". */
export function levelOf(ids: string[]): Qualification {
  return ids
    .map((id) => QUALIFICATION_CATALOG.find((q) => q.id === id)?.level ?? null)
    .filter((l): l is Qualification => l !== null)
    .reduce<Qualification>((best, l) => (RANK[l] > RANK[best] ? l : best), 'none')
}

/** "No qualification yet" can't sit alongside real qualifications: picking one removes the other. */
export function normaliseQualifications(previous: string[], next: string[]): string[] {
  const added = next.find((id) => !previous.includes(id))
  if (added === 'none') return ['none']
  return added ? next.filter((id) => id !== 'none') : next
}

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

export function meetsRequirement(has: Qualification, required: Qualification): boolean {
  return RANK[has] >= RANK[required]
}

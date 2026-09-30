import type { Application, Candidate, ID } from './types'

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * The single entry point for candidate identity. Same email within the same
 * group → same candidate. Never matches across groups.
 */
export function findOrCreateCandidate(
  candidates: Candidate[],
  input: { groupId: ID; email: string; name: string; phone: string },
  newId: ID,
): { candidate: Candidate; candidates: Candidate[]; created: boolean } {
  const email = normaliseEmail(input.email)
  const existing = candidates.find((c) => c.groupId === input.groupId && c.email === email)
  if (existing) {
    // Keep contact details current with the latest application.
    const candidate = { ...existing, name: input.name.trim(), phone: input.phone.trim() }
    return { candidate, candidates: candidates.map((c) => (c.id === existing.id ? candidate : c)), created: false }
  }
  const candidate: Candidate = {
    id: newId,
    groupId: input.groupId,
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
  }
  return { candidate, candidates: [...candidates, candidate], created: true }
}

/** The candidate's other applications. Candidates are group-scoped, so these never leave the group. */
export function otherApplications(app: Application, applications: Application[]): Application[] {
  return applications.filter((a) => a.candidateId === app.candidateId && a.id !== app.id)
}

export function existingApplication(
  applications: Application[],
  candidateId: ID,
  positionId: ID,
): Application | undefined {
  return applications.find((a) => a.candidateId === candidateId && a.positionId === positionId)
}

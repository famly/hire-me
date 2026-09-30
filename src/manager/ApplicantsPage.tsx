import { ApplicantList } from './ApplicantList'
import { useManagerData } from './useManagerData'

/** M5 — every applicant at the nursery, across positions, longest wait first. */
export function ApplicantsPage() {
  const { applications } = useManagerData()
  return <ApplicantList applications={applications} showPosition />
}

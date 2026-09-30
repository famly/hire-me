// Seed cast from docs/USER_JOURNEYS.md. Timestamps are relative to `now` so the
// wait badges and stale flags look right whenever the demo is opened.

import { transitionApplication, type ApplicationAction } from '../domain/application'
import { messageFor } from '../domain/messages'
import { DAY, HOUR, isoDate } from '../domain/time'
import type {
  Application,
  Interview,
  ApplicationAnswers,
  Candidate,
  Group,
  Nursery,
  Position,
  Room,
  StaffRecord,
  Timestamp,
} from '../domain/types'
import { newToken } from '../store/ids'

export interface Data {
  groups: Group[]
  nurseries: Nursery[]
  rooms: Room[]
  positions: Position[]
  candidates: Candidate[]
  applications: Application[]
  staff: StaffRecord[]
}

/** The faked session: Priya Shah, manager at Oak Tree Nursery. */
export const MANAGER_NURSERY_ID = 'n-oak'

export function buildSeed(now: Timestamp): Data {
  const ago = (ms: number) => now - ms
  /** A whole-hour slot `days` from today (negative = in the past). */
  const slot = (days: number, hour: number) => {
    const d = new Date(now + days * DAY)
    d.setHours(hour, 0, 0, 0)
    return d.getTime()
  }

  const groups: Group[] = [{ id: 'g-acorn', name: 'Acorn Family Nurseries' }]

  const nurseries: Nursery[] = [
    {
      id: 'n-oak',
      groupId: 'g-acorn',
      slug: 'oak-tree',
      name: 'Oak Tree Nursery',
      area: 'Redland, Bristol',
      address: 'Oak Tree Nursery, 14 Cotham Grove, Bristol BS6 6AL',
      about:
        'A converted Victorian house with a big garden, 62 children aged 0–5 across three rooms. We cook everything on site and spend part of every day outdoors.',
      managerName: 'Priya Shah',
    },
    {
      id: 'n-willow',
      groupId: 'g-acorn',
      slug: 'willow-house',
      name: 'Willow House',
      area: 'Clifton, Bristol',
      address: 'Willow House, 3 Canynge Square, Bristol BS8 3LA',
      about: 'A small, calm nursery for 38 children, five minutes from the Downs.',
      managerName: 'Tom Okafor',
    },
    {
      id: 'n-birch',
      groupId: 'g-acorn',
      slug: 'birch-lane',
      name: 'Birch Lane Nursery',
      area: 'Bishopston, Bristol',
      address: 'Birch Lane Nursery, 52 Berkeley Road, Bristol BS7 8HQ',
      about: 'A busy, friendly nursery for toddlers and pre-schoolers, with forest school every Friday.',
      managerName: 'Hannah Lewis',
    },
  ]

  const rooms: Room[] = [
    { id: 'r-oak-baby', nurseryId: 'n-oak', name: 'Baby room', ageRange: '0–2 years' },
    { id: 'r-oak-toddler', nurseryId: 'n-oak', name: 'Toddler room', ageRange: '2–3 years' },
    { id: 'r-oak-preschool', nurseryId: 'n-oak', name: 'Preschool', ageRange: '3–5 years' },
    { id: 'r-willow-baby', nurseryId: 'n-willow', name: 'Baby room', ageRange: '0–2 years' },
    { id: 'r-willow-preschool', nurseryId: 'n-willow', name: 'Preschool', ageRange: '3–5 years' },
    { id: 'r-birch-toddler', nurseryId: 'n-birch', name: 'Toddler room', ageRange: '2–3 years' },
    { id: 'r-birch-preschool', nurseryId: 'n-birch', name: 'Preschool', ageRange: '3–5 years' },
  ]

  const positions: Position[] = [
    {
      id: 'p1',
      nurseryId: 'n-oak',
      roomId: 'r-oak-toddler',
      title: 'Level 3 Practitioner',
      requiredQualification: 'L3',
      hoursPerWeek: 40,
      contract: 'Permanent',
      payRange: '£13.20–14.00/h',
      headcount: 1,
      description:
        'Join our Toddler room team of four, caring for 12 children aged 2–3. You will be a key person for a small group of children, plan play around their interests and keep parents in the loop through the Famly app.',
      state: 'open',
      createdAt: ago(14 * DAY),
    },
    {
      id: 'p2',
      nurseryId: 'n-oak',
      roomId: 'r-oak-baby',
      title: 'Nursery Assistant',
      requiredQualification: 'none',
      hoursPerWeek: 25,
      contract: 'Permanent, part-time',
      payRange: '£12.71–13.20/h',
      headcount: 2,
      description:
        'No qualification needed. We will support you to work towards Level 3. Help our Baby room team with feeds, naps, nappies and lots of play. Mornings, Monday to Friday.',
      state: 'open',
      createdAt: ago(12 * DAY),
    },
    {
      id: 'p3',
      nurseryId: 'n-oak',
      roomId: 'r-oak-preschool',
      title: 'Room Leader',
      requiredQualification: 'L3',
      hoursPerWeek: 40,
      contract: 'Permanent',
      payRange: '£14.50–16.00/h',
      headcount: 1,
      description: 'Lead our Preschool room of 24 children and a team of five, and get them ready for school.',
      state: 'paused',
      createdAt: ago(25 * DAY),
    },
    {
      id: 'p4',
      nurseryId: 'n-oak',
      roomId: 'r-oak-baby',
      title: 'Level 2 Practitioner',
      requiredQualification: 'L2',
      hoursPerWeek: 32,
      contract: 'Permanent',
      payRange: '£12.90–13.40/h',
      headcount: 1,
      description: 'Care for our youngest children in a warm, unhurried Baby room.',
      state: 'filled',
      createdAt: ago(25 * DAY),
      filledAt: ago(12 * DAY),
    },
    {
      id: 'p5',
      nurseryId: 'n-willow',
      roomId: 'r-willow-baby',
      title: 'Level 3 Practitioner',
      requiredQualification: 'L3',
      hoursPerWeek: 40,
      contract: 'Permanent',
      payRange: '£13.20–14.00/h',
      headcount: 1,
      description: 'Key person for four babies in our small Baby room.',
      state: 'open',
      createdAt: ago(10 * DAY),
    },
    {
      id: 'p6',
      nurseryId: 'n-birch',
      roomId: 'r-birch-toddler',
      title: 'Apprentice Practitioner',
      requiredQualification: 'working_towards',
      hoursPerWeek: 30,
      contract: 'Apprenticeship',
      payRange: '£8.00–9.50/h',
      headcount: 1,
      description: 'Earn while you train towards Level 3, with a mentor in our Toddler room.',
      state: 'open',
      createdAt: ago(5 * DAY),
    },
  ]

  const person = (id: string, name: string, phoneSuffix: string): Candidate => ({
    id: `c-${id}`,
    groupId: 'g-acorn',
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    name,
    phone: `07700 900${phoneSuffix}`,
  })
  const candidates: Candidate[] = [
    person('amira', 'Amira Khan', '101'),
    person('chloe', 'Chloe Evans', '102'),
    person('jordan', 'Jordan Reid', '103'),
    person('marcus', 'Marcus Bell', '104'),
    person('sophie', 'Sophie Turner', '105'),
    person('daniel', 'Daniel Hughes', '106'),
    person('grace', 'Grace Adeyemi', '107'),
    person('liam', 'Liam Walsh', '108'),
    person('ella', 'Ella Morgan', '109'),
    person('noah', 'Noah Patel', '110'),
    person('ruby', 'Ruby Clarke', '111'),
    person('ben', 'Ben Foster', '112'),
  ]

  const positionById = Object.fromEntries(positions.map((p) => [p.id, p]))
  const nurseryById = Object.fromEntries(nurseries.map((n) => [n.id, n]))
  const candidateById = Object.fromEntries(candidates.map((c) => [c.id, c]))

  /** Builds an application by replaying its history through the real domain transitions. */
  function seedApp(
    candidateId: string,
    positionId: string,
    createdAgo: number,
    answers: Partial<ApplicationAnswers>,
    steps: [ApplicationAction, number, Interview?][] = [],
    reason?: 'position_filled',
  ): Application {
    const position = positionById[positionId]
    const nursery = nurseryById[position.nurseryId]
    const candidate = candidateById[candidateId]
    const ctx = {
      candidateName: candidate.name,
      positionTitle: position.title,
      nurseryName: nursery.name,
      managerName: nursery.managerName,
    }
    const createdAt = ago(createdAgo)
    const id = `a-${candidateId.slice(2)}-${positionId}`
    let app: Application = {
      id,
      candidateId,
      positionId,
      state: 'new',
      answers: {
        qualifications: ['l3-eye', 'pfa'],
        earliestStart: isoDate(now + 14 * DAY),
        availability: 'full_time',
        rightToWork: true,
        note: 'Happy to come in for a trial shift whenever suits you.',
        cv: {
          name: `${candidate.name.toLowerCase().replace(' ', '-')}-cv.pdf`,
          sizeBytes: 90_000 + candidate.name.length * 7_000,
          type: 'application/pdf',
        },
        confirmedTrue: true,
        ...answers,
      },
      statusToken: newToken(),
      createdAt,
      timeline: [
        { id: `${id}-e0`, at: createdAt, by: 'candidate', kind: 'status', from: null, to: 'new' },
        { id: `${id}-e1`, at: createdAt, by: 'system', kind: 'message', ...messageFor('received', ctx) },
      ],
    }
    for (const [action, stepAgo, interview] of steps) {
      const message =
        action === 'withdraw'
          ? undefined
          : messageFor(action === 'reject' && reason ? 'position_filled' : action, ctx, { interview })
      app = transitionApplication(app, action, ago(stepAgo), { message, reason, interview })
    }
    return app
  }

  const applications: Application[] = [
    seedApp('c-amira', 'p1', 52 * HOUR, { note: 'I have 6 years in a toddler room and my Level 3 since 2021.' }),
    seedApp('c-amira', 'p5', 8 * DAY, {}, [['contact', 7 * DAY], ['invite', 2 * DAY, { at: slot(2, 10), mode: 'in_person', location: 'Willow House, 3 Canynge Square, Bristol BS8 3LA' }]]),
    seedApp('c-chloe', 'p1', 30 * HOUR, { qualifications: ['l2-eyp', 'wt-l3'], note: 'Currently studying for my Level 3, finishing in spring.' }),
    seedApp('c-jordan', 'p1', 4 * DAY, { availability: 'either' }, [['contact', 2 * DAY]]),
    seedApp('c-marcus', 'p1', 14 * DAY, {}, [['contact', 13 * DAY], ['invite', 9 * DAY, { at: slot(-7, 14), mode: 'online', location: 'https://meet.google.com/oak-tree-marcus' }]]),
    seedApp('c-sophie', 'p2', 4 * HOUR, { qualifications: ['wt-l2'], availability: 'part_time', note: 'Just started my Level 2 at City of Bristol College. Mornings suit me best.' }),
    seedApp('c-daniel', 'p2', 26 * HOUR, { qualifications: ['none'], availability: 'part_time', rightToWork: false, note: 'Career changer, 10 years in retail. Two kids of my own!' }),
    seedApp('c-grace', 'p2', 10 * DAY, { qualifications: ['l2-cache', 'pfa'], availability: 'part_time' }, [['contact', 9 * DAY], ['invite', 7 * DAY, { at: slot(-5, 10), mode: 'in_person', location: 'Oak Tree Nursery, 14 Cotham Grove, Bristol BS6 6AL' }], ['offer', 1 * DAY]]),
    seedApp('c-liam', 'p2', 9 * DAY, { qualifications: ['none'] }, [['reject', 8 * DAY]]),
    seedApp('c-ella', 'p3', 6 * DAY, {}, [['contact', 3 * DAY]]),
    seedApp('c-noah', 'p4', 20 * DAY, { qualifications: ['l2-eyp', 'pfa'], earliestStart: isoDate(now - 5 * DAY) }, [['contact', 19 * DAY], ['invite', 16 * DAY, { at: slot(-15, 11), mode: 'in_person', location: 'Oak Tree Nursery, 14 Cotham Grove, Bristol BS6 6AL' }], ['offer', 14 * DAY], ['hire', 12 * DAY]]),
    seedApp('c-ruby', 'p4', 18 * DAY, { qualifications: ['l2-eyp'] }, [['contact', 17 * DAY], ['reject', 12 * DAY]], 'position_filled'),
    seedApp('c-ben', 'p6', 10 * HOUR, { qualifications: ['wt-l3'] }),
  ]

  const noah = candidateById['c-noah']
  const staff: StaffRecord[] = [
    {
      id: 's-noah',
      nurseryId: 'n-oak',
      roomId: 'r-oak-baby',
      name: noah.name,
      email: noah.email,
      phone: noah.phone,
      qualification: 'L2',
      qualifications: ['l2-eyp', 'pfa'],
      startDate: isoDate(now - 5 * DAY),
      createdAt: ago(12 * DAY),
      fromApplicationId: 'a-noah-p4',
    },
  ]

  return { groups, nurseries, rooms, positions, candidates, applications, staff }
}

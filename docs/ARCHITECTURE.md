# Architecture

A frontend-only clickable prototype. It has to open from a link in any modern browser, demo well in about 10 minutes, and be buildable in ≤3h. Every choice below serves those three constraints. Product rules live in [SPEC.md](SPEC.md); this file covers how we build them.

## Stack

| Concern | Choice | Why | Rejected |
|---|---|---|---|
| Build | **Vite + React + TypeScript (strict)** | Fastest scaffold, most familiar to reviewers, types keep the domain model honest | Next.js (SSR/server not needed, more config); plain HTML (state gets messy by M6) |
| Routing | **React Router, `HashRouter`** | Static hosting with no rewrite rules; deep links like `/#/status/<token>` survive a refresh | `BrowserRouter` (404s on GitHub Pages refresh) |
| State | **Zustand** + `persist` middleware → `localStorage` | Tiny API, no boilerplate, state survives reloads for the demo | Redux (ceremony); React context only (re-render pain, no persistence) |
| Styling | **Tailwind CSS v4** | Fast, mobile-first by default, no design-system work | Component libraries (MUI/shadcn): setup time, generic look |
| Icons | **lucide-react** | Tree-shaken, consistent | — |
| Dates | Native `Intl` + small helpers in `domain/time.ts` | Only relative times and simple formatting needed | date-fns/dayjs (not worth a dependency) |
| Tests | **Vitest**, domain logic only | Lifecycles and projections are where bugs hide; UI is checked by clicking | Playwright/E2E (time box) |
| Hosting | **GitHub Pages** via GitHub Actions | Repo is already on GitHub, free, gives a shareable link | Vercel/Netlify (another account for reviewers to trust) |

Keep dependencies to this list. Adding one needs a row here with its reason.

**No backend** (SPEC §5 "Won't"). All data is seeded client-side and persisted per browser. We say so up front in the README, together with what the real system would need (API, auth, email delivery, multi-user sync).

## Folder layout

```
src/
  main.tsx, App.tsx          # router + layout shell
  domain/                    # PURE TypeScript. No React, no store, no Date.now()
    types.ts                 # Group, Nursery, Room, Position, Candidate, Application, StaffRecord, TimelineEvent
    position.ts              # position transitions + allowedPositionActions()
    application.ts           # application transitions, allowedActions(), isStale(), candidateStatus()
    candidate.ts             # findOrCreateCandidate(groupId, email) — group-scoped dedupe
    qualification.ts         # meetsRequirement(candidateQual, positionReq)
    queue.ts                 # waitingSince(), sortByLongestWait(), waitBadge()
    messages.ts              # templated candidate messages per transition
    metrics.ts               # timeToFirstReply, repliedWithin48h, timeToFill
    time.ts                  # relative time helpers; takes `now` as an argument
    *.test.ts
  data/
    seed.ts                  # seed cast from USER_JOURNEYS; timestamps RELATIVE to now
  store/
    store.ts                 # zustand store: state + actions that call domain functions
    selectors.ts             # derived views (queue, counts, cross-site matches)
  portal/                    # public, mobile-first
    NurseryPage, PositionPage, ApplyPage, AppliedPage, StatusPage
  manager/                   # inside-Famly, desktop-first (still usable on tablet)
    ManagerLayout, OverviewPage, PipelinePage, ApplicantsPage, ApplicationPanel, StaffPage
  demo/
    DemoBar.tsx              # switch side (portal/manager), reset demo, fast-forward clock
    DemoHome.tsx             # landing page: the J0 demo script as links
  ui/                        # shared dumb components: Badge, Button, StatusPill, Card, EmptyState
```

## Routes

| Route | Screen | Journey |
|---|---|---|
| `/` | Demo home: links into both sides | J0 |
| `/n/:nurserySlug` | Public nursery page, open positions | J1 |
| `/n/:nurserySlug/p/:positionId` | Position detail | J1 |
| `/n/:nurserySlug/p/:positionId/apply` | One-pass apply form | J1 |
| `/applied/:token` | Confirmation + status link | J1 |
| `/status/:token` | Candidate status page (no login) | J2 |
| `/manage` | Positions overview | J3 |
| `/manage/applicants` | All-applicants queue (manager's home) | J3 |
| `/manage/positions/:positionId` | Pipeline for one position | J4, J5 |
| `/manage/applications/:applicationId` | Application detail / timeline (side panel or page) | J4 |
| `/manage/positions/new`, `/manage/positions/:id/edit` | Create/edit position | J7 |
| `/manage/staff` | Staff records (where hires land) | J5 |

## Layering rules

1. **Domain is pure.** Functions take state plus `now: Date` and return new values. No `Date.now()`, no `localStorage`, no React. That makes them testable and lets the demo clock fast-forward.
2. **State machines are explicit.** Each lifecycle is a transition table in `domain/`. The UI never hard-codes which buttons appear: it renders `allowedActions(application)`. Illegal transitions throw in the domain.
3. **Store actions orchestrate, domain decides.** An action like `advance(applicationId, 'interview')` calls the domain transition, appends a `TimelineEvent`, generates the candidate message from `messages.ts`, and writes it all back in one `set()`.
4. **Candidates only ever see `candidateStatus()`.** The plain-language projection (SPEC §4) is the single path from internal state to anything shown on the portal. Internal states never leak to the public side.
5. **Group scoping lives in one place.** Candidate lookup always goes through `findOrCreateCandidate(groupId, email)`. Cross-site badges query within the group only.
6. **Derived, not stored.** Stale flag, wait time, qualification match, counts and metrics are computed in selectors or domain functions and never persisted. Only facts are stored: entities and timeline events.
7. **Messages are simulated.** A "sent" message is a `TimelineEvent` of kind `message` with the rendered template. The status page and manager timeline both read from it.

## Domain types (sketch — `domain/types.ts` is authoritative once written)

```ts
type Qualification = 'none' | 'working_towards' | 'L2' | 'L3';
type PositionState = 'draft' | 'open' | 'paused' | 'filled' | 'closed';
type ApplicationState =
  | 'new' | 'contacted' | 'interview' | 'offer' | 'hired'
  | 'rejected' | 'withdrawn' | 'lapsed';
type CandidateStatus = // public projection
  | 'received' | 'being_reviewed' | 'invited_to_interview' | 'offer'
  | 'hired' | 'not_progressing' | 'closed';

interface Position { id; nurseryId; roomId?; title; requiredQualification: Qualification;
  hours; payRange; headcount; description; state: PositionState; createdAt }
interface Candidate { id; groupId; email; name; phone }          // NOT a user, NOT staff
interface Application { id; candidateId; positionId; state: ApplicationState;
  answers: { qualification; earliestStart; availability; rightToWork; note? };
  statusToken; createdAt; firstRepliedAt?; timeline: TimelineEvent[] }
interface TimelineEvent { at; kind: 'status' | 'message' | 'note'; from?; to?; body?; by: 'manager' | 'candidate' | 'system' }
interface StaffRecord { id; nurseryId; roomId?; name; email; phone; qualification;
  startDate; fromApplicationId }
```

## Persistence and demo mechanics

- Zustand `persist` under one key (`famly-recruit-v1`). Bump the version suffix whenever the shape changes, so we don't have to write migrations.
- **Seed timestamps are relative to first load** (for example "applied 52h ago"), so wait badges look right on any day of the demo.
- **Reset demo** in the DemoBar reseeds. **Fast-forward +1 day** moves a `clockOffset` in the store; `now()` = real time + offset. That's how J8 (stale) is demoed.
- **Cross-tab sync:** listen for the `storage` event and rehydrate, so the portal in one tab and the manager in another update live during the walkthrough.
- Status tokens: 128-bit random from `crypto.getRandomValues`, base64url. In production they would be hashed server-side, with expiry (note in README).

## UI conventions

- Portal is designed at **375px first**: one column, large tap targets (≥44px), native inputs (`type="email"`, `tel`, `date`), no CV upload, one screen for the form.
- Manager screens are dense and scannable. The action for a row sits on the row (M6), and the side panel opens without losing queue position.
- Wait badge: neutral <24h, amber 24–48h, red >48h since arrival without a first reply.
- Qualification badge: "Meets L3" (green) / "Below requirement" (amber). Never block the application, only flag it.
- Copy is plain and warm on the portal and terse on the manager side. Use UK English and £.
- Accessibility basics: semantic elements, labels on every input, visible focus, and colour never the only signal (badges carry text).

## Testing scope

Vitest covers: transition tables (allowed/illegal), `candidateStatus()` for every state, `isStale()` boundaries, `sortByLongestWait()`, group-scoped candidate dedupe, "position filled → remaining applications rejected with message", and metrics maths. Nothing else is tested. We click through the rest using the journeys.

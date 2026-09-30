# Architecture

A frontend-only clickable prototype. It has to open from a link in any modern browser, demo well in about 10 minutes, and be buildable in ≤3h. Every choice below serves those three constraints. Product rules live in [SPEC.md](SPEC.md); this file covers how we build them.

## Stack

| Concern | Choice | Why | Rejected |
|---|---|---|---|
| Build | **Vite + React + TypeScript (strict)** | Fastest scaffold, most familiar to reviewers, types keep the domain model honest | Next.js (SSR/server not needed, more config); plain HTML (state gets messy by M6) |
| Routing | **React Router (v8), `HashRouter`** | Static hosting with no rewrite rules; deep links like `/#/status/<token>` survive a refresh | `BrowserRouter` (404s on GitHub Pages refresh) |
| State | **Zustand** + `persist` middleware → `localStorage` | Tiny API, no boilerplate, state survives reloads for the demo | Redux (ceremony); React context only (re-render pain, no persistence) |
| Styling | **Tailwind CSS v4** | Fast, mobile-first by default, no design-system work | Component libraries (MUI/shadcn): setup time, generic look |
| Icons | **lucide-react** | Tree-shaken, consistent | — |
| Dates | Native `Intl` + small helpers in `domain/time.ts` | Only relative times and simple formatting needed | date-fns/dayjs (not worth a dependency) |
| Lint | **oxlint** (ships with the Vite template) | Fast, zero config | ESLint (slower, more config for no gain here) |
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
    queue.ts                 # needsReply(), waitingFor(), isOverdue() — reply speed
    pipeline.ts              # LANES, laneOf(), actionForLane(), sortLane() — the board
    messages.ts              # templated candidate messages per transition
    metrics.ts               # timeToFirstReply, repliedWithin48h, timeToFill
    time.ts                  # relative time helpers; takes `now` as an argument
    staff.ts                 # staffRecordFromApplication() — the hiring handoff
    testing.ts               # test fixtures
    *.test.ts
  data/
    seed.ts                  # seed cast from USER_JOURNEYS; timestamps RELATIVE to now
  store/
    store.ts                 # zustand store: state + actions that call domain functions
    selectors.ts             # derived lookups (by slug/token, per nursery, per position)
  portal/                    # public, mobile-first
    NurseryPage, PositionPage, ApplyPage, AppliedPage, StatusPage
  manager/                   # inside-Famly, desktop-first (still usable on tablet)
    ManagerLayout, OverviewPage, PipelinePage (board), ApplicationPanel, StaffPage
    ActionsProvider          # owns dialogs: action, hire, fill, archive, position form (all modals)
    badges.tsx               # the whole badge system in one file (see "Badges" below)
  demo/
    DemoBar.tsx              # switch side (portal/manager), reset demo, fast-forward clock
    DemoHome.tsx             # landing page: the J0 demo script as links
  ui/                        # shared components, reused on both sides (never duplicate one)
    Badge, Button, Card, EmptyState, Field (Input/Select/Textarea), Modal, StatusPill
    Popover                  # floating panel; Menu (⋯ actions) and the board legend are built on it
    MultiCombobox            # multi-select typeahead, chips below with ✕, clear-all ✕ in the box
                             #   used by: pipeline position filter, apply-form qualifications
    Switch                   # on/off toggle (apply-form consent)
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
| `/manage/pipeline` | Hiring pipeline board, all positions | J3, J4 |
| `/manage/pipeline?position=:id,:id` | Board filtered to one or more positions (`&closed=0` hides the Closed lane, shown by default) | J4, J5 |
| `…?app=:applicationId` (on any manager page) | Application side panel: answers, actions, timeline. In the URL so the board keeps its place and Back closes it | J4 |
| `/manage/staff` | Staff (Famly sidebar item, where hires land) | J5 |
| `/manage/positions/:id`, `/manage/applicants` | Redirects from v1 URLs | — |

Create/edit position, hire, fill, archive and action confirmations are modals, not routes.

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
type PositionState = 'draft' | 'open' | 'paused' | 'filled' | 'archived';
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
- Manager screens are scannable at a glance. The next step sits on the card (M6), and the side panel opens without losing the board's place.
- Overview positions default to **Active** (draft, open, paused); filled and archived sit behind **All**.

### Badges (one colour, one meaning)

All in [src/manager/badges.tsx](../src/manager/badges.tsx). If a new badge doesn't fit one of these meanings, it shouldn't be a badge.

| Colour | Meaning | Used for |
|---|---|---|
| **Red** | Act now | No first reply after 48h (`isOverdue`). The only red in the product: "No reply for 52h" on the card, "N overdue" on the overview |
| **Amber** | Worth a check before moving them on | Below the required qualification · right to work not confirmed · gone quiet (stale) |
| **Grey** | Information | "Waiting 30h for a reply" (plain text, under 48h) · also applied at another site · outcome label in the Closed lane |
| **Green** | Live / done | Position open on the portal · Hired |

Rules: badges appear **only for exceptions** (no badge = nothing to worry about); on a card they always sit **under the name, in the order above**; the stage is the **lane**, never a pill on the card; the **Colours & flags** popover on the board explains every badge and says where each flag comes from. Never block on a flag.
- Copy is plain and warm on the portal and terse on the manager side. Use UK English and £.
- Accessibility basics: semantic elements, labels on every input, visible focus, and colour never the only signal (badges carry text).

## Testing scope

Vitest covers: transition tables (allowed/illegal), `candidateStatus()` for every state, `isStale()` boundaries, `isOverdue()`, lanes (`laneOf`, forward-only `actionForLane`, `sortLane`), group-scoped candidate dedupe, "position filled → remaining applications rejected with message", and metrics maths. Nothing else is tested. We click through the rest using the journeys.

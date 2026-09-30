# User journeys

This file keeps the prototype consistent across sessions. Each journey is what one person does from trigger to outcome, with the screens and state changes involved. Build screens to serve these steps, tick steps off once they work in the browser, and update the steps if building a journey changes the flow.

Feature IDs (M1–M8, S1–S5) refer to [SPEC.md §5](SPEC.md). Routes refer to [ARCHITECTURE.md](ARCHITECTURE.md#routes).

## Status

| ID | Journey | Actor | Features | Priority | Status |
|---|---|---|---|---|---|
| J0 | Reviewer walkthrough (the 10-min demo) | Reviewer | all Must | Must | ☑ |
| J1 | Find a job and apply from a phone | Job seeker | M1 M2 M3 | Must | ☑ |
| J2 | Check where my application stands | Job seeker | M3 | Must | ☑ |
| J3 | Morning triage: who's waiting? | Manager | M4 M5 M7 | Must | ☑ |
| J4 | Move an applicant forward | Manager | M6 | Must | ☑ |
| J5 | Hire → staff record → close the position | Manager | M8 S1 | Must/Should | ☑ |
| J6 | Same person, two sites | Manager | S2 | Should | ☑ |
| J7 | Open, edit or pause a position | Manager | S3 | Should | ☑ |
| J8 | Gone quiet → stale → lapsed | Manager | S4 | Should | ☑ |
| J9 | Are we replying fast enough? | Manager | S5 | Should | ☑ |

Legend: ☐ not started · ◐ partly working · ☑ works end-to-end in the browser

---

## Seed cast (canonical — use these names everywhere)

**Group:** Acorn Family Nurseries (3 sites, Bristol area)

| Nursery | Slug | Rooms | Manager |
|---|---|---|---|
| **Oak Tree Nursery** | `oak-tree` | Baby room (0–2), Toddler room (2–3), Preschool (3–5) | **Priya Shah** (the demo manager; the session is faked as her) |
| Willow House | `willow-house` | Baby room, Preschool | Tom Okafor |
| Birch Lane Nursery | `birch-lane` | Toddler room, Preschool | Hannah Lewis |

**Positions**

| ID | Nursery | Title | Room | Requires | Hours | Pay | HC | State |
|---|---|---|---|---|---|---|---|---|
| P1 | Oak Tree | Level 3 Practitioner | Toddler | L3 | 40h, permanent | £13.20–14.00/h | 1 | Open |
| P2 | Oak Tree | Nursery Assistant | Baby | none | 25h, permanent | £12.71–13.20/h | 2 | Open |
| P3 | Oak Tree | Room Leader | Preschool | L3 | 40h, permanent | £14.50–16.00/h | 1 | Paused |
| P4 | Oak Tree | Level 2 Practitioner | Baby | L2 | 32h, permanent | £12.90–13.40/h | 1 | Filled (history for metrics) |
| P5 | Willow House | Level 3 Practitioner | Baby | L3 | 40h, permanent | £13.20–14.00/h | 1 | Open |
| P6 | Birch Lane | Apprentice Practitioner | Toddler | working towards | 30h, apprenticeship | £8.00–9.50/h | 1 | Open |

**Applications** (times relative to first load)

| Candidate | Qual | Position | State | Timing | Demonstrates |
|---|---|---|---|---|---|
| **Amira Khan** | L3 | P1 | New | applied 52h ago, no reply | Red "No reply for 52h", top of the Candidates lane; cross-site (J6) |
| **Amira Khan** | L3 | P5 | Interview | — | "Also applied to Willow House (Interview)" |
| Chloe Evans | L2 | P1 | New | 30h ago | Waiting, not overdue (grey); amber "Needs L3" |
| Jordan Reid | L3 | P1 | Contacted | replied 2 days ago | Active pipeline |
| **Marcus Bell** | L3 | P1 | Interview | last activity 6 days ago | Stale flag (J8) |
| Sophie Turner | working towards | P2 | New | 4h ago | Waiting (grey), no badges |
| Daniel Hughes | none | P2 | New | 26h ago | Waiting (grey); amber "Right to work?" |
| Grace Adeyemi | L2 | P2 | Offer | — | Late pipeline |
| Liam Walsh | none | P2 | Rejected | — | Terminal state |
| Ella Morgan | L3 | P3 | Contacted | — | Applicants on a paused position (goes quiet at +3 days) |
| Noah Patel | L2 | P4 | Hired | 12 days ago | Existing staff record; time-to-fill metric |
| Ruby Clarke | L2 | P4 | Rejected ("position filled") | — | Bulk notify result |
| Ben Foster | working towards | P6 | New | — | Other site: **not** visible to Priya |

**Demo job seeker for J1:** Zara Ahmed, `zara.ahmed@example.com`, L3, available in 2 weeks, full-time.

---

## Candidate-facing status (the only thing the public side shows)

| Internal state | Public status | Status-page line |
|---|---|---|
| new | **Received** | Oak Tree Nursery has your application. You'll hear from them here and by email. |
| contacted | **Being reviewed** | The nursery is looking at your application. |
| interview | **Invited to interview** | The nursery would like to meet you. Check your email for details. |
| offer | **Offer** | You've been offered the role. The nursery will be in touch about next steps. |
| hired | **Hired** | Welcome to the team. |
| rejected | **Not progressing** | The nursery won't be taking your application further this time. {reason if "position filled"} |
| withdrawn | **Closed** | You withdrew this application. |
| lapsed | **Closed** | This application has been closed. |

The stale flag is never shown to the candidate. They keep seeing their last real status.

---

## J0 — Reviewer walkthrough

**Actor:** Famly reviewer, desktop, about 10 minutes, no instructions beyond the README link.
**Goal:** understand both sides and the model without being guided.

- [x] Open the link → **Demo home** (`/`) explains the two sides in two lines and links to "Job seeker" and "Manager".
- [x] DemoBar is always visible: switch side, **Reset demo**, **+1 day**.
- [x] Run J1 as Zara (the DemoBar hints to narrow the window or use device mode).
- [x] Switch to the manager's Hiring pipeline: Zara's card is in the Candidates lane with no flags (she meets L3).
- [x] Run J4 on Zara → her status link shows "Invited to interview" (second tab updates live).
- [x] Run J5 on Zara → staff record appears → P1 suggests Filled → notify remaining → Chloe's status shows "Not progressing".
- [x] Open Amira → see the cross-site badge (J6).
- [x] +1 day → Marcus is even more stale → mark Lapsed (J8).

**Done when:** every step above works from a fresh reset with no console errors.

---

## J1 — Find a job and apply from a phone

**Actor:** job seeker (Zara), 375px phone, on a break, no account, sceptical.
**Trigger:** a friend sends the Oak Tree link, or a card in the window has a short URL.

| # | Route | They do | System does | ✓ |
|---|---|---|---|---|
| 1 | `/n/oak-tree` | See nursery name, location, a short "about", and open positions (P1, P2). P3 paused and P4 filled are hidden | Only `open` positions render | ☑ |
| 2 | `/n/oak-tree/p/P1` | Read room/age group, qualification needed, hours, pay, description. Tap **Apply** | — | ☑ |
| 3 | `…/apply` | Fill one screen: name, email, phone, qualification (none / working towards / L2 / L3), earliest start, availability, right-to-work checkbox, optional note. Submit | Validate inline. `findOrCreateCandidate(group, email)`, create Application `new` with status token, timeline event `received` | ☑ |
| 4 | `/applied/:token` | See "Application sent to Oak Tree Nursery", what happens next, and the **private status link** (copy button) | Show the link as "we've also emailed this" (simulated) | ☑ |

**Done when:** a submission takes under 2 minutes on a phone, there's no login, and the new application appears on the manager side.
**Edge cases:** the same email applying again to the same position → show the existing status link instead of a duplicate; missing right-to-work → allowed, flagged to the manager rather than blocked (decision: don't gatekeep in the form).

---

## J2 — Check where my application stands

**Actor:** job seeker, days later, from the link in their email.

| # | Route | They do | System does | ✓ |
|---|---|---|---|---|
| 1 | `/status/:token` | See position, nursery, current **public status**, the status-page line, and a simple timeline of messages received | Render only via `candidateStatus()` and `message` events | ☑ |
| 2 | — | Unknown or garbage token | Friendly "we couldn't find that application, check the link in your email" (a bad token reveals no nursery, so no nursery link) | ☑ |

**Done when:** every internal state maps to the public table above and nothing internal leaks (no "stale", no "lapsed" wording, no manager notes).

---

## J3 — Morning triage: who's waiting?

**Actor:** Priya, desktop, between covering the baby room and lunch.
**Trigger:** opens Recruitment inside Famly.

| # | Route | They do | System does | ✓ |
|---|---|---|---|---|
| 1 | `/manage` | See Oak Tree's **active** positions (toggle to All) with state and counts: needs reply as a plain number plus a red "N overdue" only if someone waited >48h / in progress / hired of headcount | Counts derived, never stored | ☑ |
| 2 | `/manage/pipeline` | See the **Hiring pipeline** board: static lanes Candidates · Interview · Offer · Closed (shown by default). Candidates: unanswered first, longest wait on top, then contacted. Filter by typing position names; pick several, clear with ✕ | `laneOf()`, `sortLane()`; "Waiting 30h for a reply" grey, red "No reply for 52h" when `isOverdue()` | ☑ |
| 3 | — | Scan each card: name, position, wait in words, then **only exception flags**: amber (needs L3, right to work?, quiet), grey (also at another site). **Colours & flags** (popover) explains each one and where it comes from | `meetsRequirement()`, `isStale()`, `otherApplications()` | ☑ |

**Done when:** the Candidates lane reads Amira (red), Chloe (30h), Daniel (26h), Sophie (4h), then Ella and Jordan (contacted); Amira is the only red thing on screen; Ben Foster (Birch Lane) is not visible.

---

## J4 — Move an applicant forward

**Actor:** Priya.

| # | Route | They do | System does | ✓ |
|---|---|---|---|---|
| 1 | `/manage/pipeline` (optionally `?position=p1`) | On the card, click the next step (Contact · Invite to interview · Make offer · Hire), or **drag the card** forward to any later lane (the lanes that accept it get a dashed outline and "Drop to …") (drop on Closed = reject). Lanes that can't take the card dim while dragging. Reject and everything else are in the panel | `nextAction()`, `actionForLane()` (forward only), `managerActions()`; set `firstRepliedAt` on the first manager action | ☑ |
| 2 | — | See a prefilled message preview, optionally edit it (or untick "Email"), then confirm | Template from `messages.ts`; timeline `status` + `message` events | ☑ |
| 3 | `?app=:id` side panel | Click the card to open the detail: answers, contact, all actions, timeline, internal notes | Notes are `note` events, never public | ☑ |

**Done when:** the card moves to its new lane, drops out of "needs reply", and the candidate's status page reflects it.

---

## J5 — Hire → staff record → close the position

**Actor:** Priya.

| # | Route | They do | System does | ✓ |
|---|---|---|---|---|
| 1 | `/manage/pipeline?position=p1` | Click **Hire →** on an Offer card (earlier stages can hire from the panel, with a warning in the dialog). The card moves to Closed with a green Hired label | Application → `hired`; welcome message | ☑ |
| 2 | — | Confirm a **prefilled staff record**: name, contact, qualification, nursery, room, start date (from earliest start) | Create `StaffRecord` with `fromApplicationId` | ☑ |
| 3 | — | Prompt opens straight after the hire: "You've hired 1 of 1… these 4 applicants are still waiting" with the message preview. "Not yet" leaves a banner on the filtered board and "Ready to mark filled" on the overview row | Suggest `filled` when hires = headcount | ☑ |
| 4 | — | Confirm | Position → `filled` (off the portal); remaining active applications → `rejected` with the "position filled" message (S1) | ☑ |
| 5 | `/manage/staff` | See the new staff member next to Noah Patel, badged "Hired via Recruitment" (opens the application) | — | ☑ |

**Done when:** nobody on P1 is left in an active state, and every one of them has a message on their status page.

---

## J6 — Same person, two sites

**Actor:** Priya, looking at Amira.

- [x] Amira's card shows a grey "Also at **Willow House**"; the panel lists Willow House: Level 3 Practitioner · Interview.
- [x] Only within Acorn Family Nurseries. The badge never shows positions outside the group.
- [x] Panel names the other site's manager (Tom Okafor) and says to coordinate before both make offers.

**Done when:** the badge renders from the group-scoped candidate, not by matching names.

---

## J7 — Open, edit or pause a position

**Actor:** Priya.

- [x] **New position** on the overview opens a **modal** (no page change): title, room, required qualification, hours, contract, pay range, headcount, description. Save as draft or publish now.
- [x] Edit from the row's **⋯ menu** (or "Edit" on the filtered board), same modal.
- [x] ⋯ → Pause P1 → it disappears from `/n/oak-tree`; existing applications are untouched. Resume → it's back. ⋯ → Archive asks for confirmation; the position moves behind "All", and its applicants stay in the pipeline.

**Done when:** portal visibility follows state exactly (only `open` shows).

---

## J8 — Gone quiet → stale → lapsed

**Actor:** Priya.

- [x] Marcus (Interview, no activity for 6 days) shows an amber **Quiet 6d** badge. The threshold is 5 days with no timeline activity, after the first reply.
- [x] The card shows an amber **Quiet 6d**; open it and **Mark as lapsed** (offered only once stale) → confirm → `lapsed`, plus an optional closing message. The candidate sees "Closed".
- [x] **+1 day** in the DemoBar pushes other applications towards stale (at +3 days, Ella and Jordan go quiet too).

**Done when:** stale is derived (never stored), and only the manager's confirmation creates the `lapsed` state.

---

## J9 — Are we replying fast enough?

**Actor:** Priya (and us, validating the brief's hypothesis).

- [x] Metrics strip on `/manage`: median time to first reply, % replied within 48h (of those due a reply), open positions, median time to fill. Each tile says what it counts.
- [x] Numbers move when J4/J5 are performed (derived on every render, never stored).

**Done when:** the numbers come from `domain/metrics.ts`, are covered by tests, and are explained in the README (what they'd validate).

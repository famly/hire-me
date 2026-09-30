# Famly Recruitment Portal — Product Spec (v0)

## Context
Take-home for Famly (Director of Eng: Michael Brændgaard). Repo = fork (`famly-hire-me`). Brief in `docs/BRIEF.md`; README is our write-up.
Constraints from e-mail brief:
- **≤3h** build; list shortcuts + what we'd do with more time.
- **Clickable prototype, runs in any modern browser.**
- They judge **product sense > problem solving > tech**. "How you got there > where you got to. Rejected options are worth as much as kept ones."
- Diagrams welcome. AI expected; must be able to explain every choice.
- Followed by a walkthrough interview → prototype must demo well in ~10 min.

Scope of this doc: **product only** (goal, users, features, priorities, model). Implementation/stack decided next.

---

## 1. Main goal
Answer the two questions in the brief with a working prototype:
1. **Portal** — what does a job seeker (no account, no trust, on a phone) touch, and *what are they in our system*?
2. **Manager side** — what does the manager open, and what model carries a **position** open → filled and an **application** arrival → hired / rejected / gone quiet?

North star (from brief): **the manager replies fast and hires without retyping.** The one given fact, the Famly **staff record**, is where a hire ends up.

Hypothesis we inherit but don't trust blindly: *speed of first reply matters most.* We design for it (primary sort, visible wait time) and **instrument it** so it can be validated rather than assumed.

## 2. Deliverable
1. Clickable prototype with two sides in one app:
   - Public: nursery portal page → position → apply → confirmation → status page.
   - Manager: positions overview → hiring pipeline board → act on the card → hire → staff record.
   - Role switcher / demo nav so reviewers can jump between sides without login.
   - Seed data: 1 group, 3 nurseries, several positions, ~12 applications in varied states, incl. one person applying to 2 sites.
2. `README.md` (replacing brief, brief moved/linked): problem framing, users, decisions + **rejected options**, domain model + state diagrams (Mermaid), metrics, shortcuts, next steps, time spent, how AI was used.
3. Git history that tells the story: trunk-based, small atomic Conventional Commits (`docs:`, `feat:`, `chore:`…), spec committed first.

## 3. Users
| User | Context | Needs |
|---|---|---|
| **Job seeker** | Phone, on a break, no Famly account, sceptical | See what's open, apply in <2 min, know where it stands |
| **Nursery manager** | Also covering the baby room; hiring is job #4 | One list, who's waiting longest, act in one click, hire → staff record |
| Group manager (secondary) | Owns 3–300 sites | See candidates across sites, avoid 3 separate conversations |

## 4. Domain model (product level)
- **Group** 1—n **Nursery** 1—n **Room** (age group).
- **Position** — belongs to Nursery (+ optional Room). Title, qualification required (None / L2 / L3), hours/contract, pay range, headcount (default 1), description.
- **Candidate** — the job seeker in our system. **Not a user account, not a staff record.** Identified by email, **scoped to the Group** (so the same person at 3 sites of a group is one candidate, but never visible to other groups).
- **Application** — Candidate × Position. Holds answers (qualifications, availability, right to work, CV, a note, confirmation that it's true), status, timeline of events/messages, access token for status link.
- **Staff record** (given, pre-exists in Famly) — created *from* a Hired application, prefilled: name, contact, qualification, nursery, room, start date.

### Position lifecycle
`Draft → Open → Filled` · `Open ⇄ Paused` · `any → Archived` (withdrawn by the nursery)
- Only **Open** is visible on the portal.
- Auto-suggest **Filled** when hires = headcount; prompt manager to notify remaining applicants.

### Application lifecycle
`New → Contacted → Interview → Offer → Hired`
Terminal exits from any active state: **Rejected** (by nursery), **Withdrawn** (by candidate), **Lapsed** (gone quiet). From **Offer** only: **Offer declined** (they turned it down; the manager records it, because the answer usually comes by phone, and a kind reply goes out).
- "Gone quiet" is **derived, not a state the user sets upfront**: an active application with no activity for N days (prototype: N = 5) gets a *Stale* flag. Applies only after the first reply: an unreplied New application is the nursery's delay, surfaced by the overdue flag, not the candidate going quiet; manager confirms → Lapsed. (Rejected option: silent auto-close; it hides problems.)
- Position filled → open applications bulk-moved to Rejected with a "position filled" message. Nobody gets silence.
- **Interview**: scheduled when the manager invites, either **a set time** or **a choice of 2–4 times the candidate picks from** on their status page (the pick becomes the interview and is logged). In person (address) or online (meeting link). Shown on the Interview card, in the panel and on the candidate's status page. An upcoming interview is never "quiet"; a past one counts as activity. In the Interview lane each card is in one of three **derived phases**: *Needs a decision* (the time has passed; shown first, oldest first, with "Make offer →"), *Upcoming* (soonest first, no next-step link since there's nothing to decide yet) and *Waiting for a time* (offered times, nothing picked yet; shows how many were offered and the earliest). A card moves between them on its own when the interview time passes, and the candidate's line changes to "they'll let you know the outcome".
- Candidate-facing status is a **plain-language projection**: Received · Being reviewed · Invited to interview · Offer · Hired · Not progressing · Offer declined · Closed.
- **Match score** (0–100) per application, **derived** from the structured answers against the position: qualification vs requirement (40), right to work (20), hours fit (15), start date (15), paediatric first aid (10). Shown as a chip on the card and in the panel; hover for a written explanation and the points behind it. It is a hint: it never reorders the board and never rejects anyone.

## 5. Features & priority (fit to 3h)

### Must (the demo)
**Portal**
- M1 Public nursery page, one shareable URL per nursery: nursery info + Open positions (room/age group, qualification, hours, pay).
- M2 Position detail + **one-screen mobile apply form, every field required except the note**: name, email, phone, **qualifications** (typeahead multi-select from a catalogue of real UK childcare qualifications, each mapped to a level; chips with ✕; "No childcare qualification yet" is exclusive), earliest start, hours (full-time / part-time / either), right to work (yes / no; "no" is allowed and flagged), **CV upload** (PDF/Word ≤5 MB), an **optional** short note about themselves, and a **consent switch** confirming the information is true. No account.
- M3 Confirmation + **private status link** (tokenised URL, no login) showing plain-language status and the next step.

**Manager**
- M4 Overview: **what needs you now** on top, four tiles that each name the person to deal with first and open them in one click: *Waiting for your reply* (with the red "N overdue"), *Interviewed, needs a decision*, *Upcoming interviews* (next one named), *Offers waiting for an answer*. Then all positions across my nursery with state and counts (needs reply, with a red "N overdue" only when someone has waited >48h; in progress; hired of headcount). **Active / All** toggle (active = draft, open, paused). An **⋯ quick menu** per position: open pipeline, edit, publish / pause / resume, mark as filled, view listing, archive.
- M5 **Hiring pipeline**: a kanban board with four **static lanes**: **Candidates** (new + contacted) · **Interview** · **Offer** · **Closed** (every outcome: hired, rejected, withdrawn, lapsed, offer declined). Any lane **folds into a narrow vertical strip** and back (it still takes drops). **Filter by position**: a labelled typeahead multi-select. The Interview lane is split into labelled groups with counts: *Needs a decision*, *Upcoming*, *Waiting for a time*. Candidates lane: unanswered first, longest wait on top. The wait is written out ("Waiting 30h for a reply" in grey, a red "No reply for 52h" once overdue at >48h). A **Colours & flags** popover explains every badge. Badges follow one rule (see §6 "Badges").
- M6 **Act on the card**: the next step as a link on the card (on every Candidates card it's **Invite to interview**, the only CTA there; Contact lives in the panel), or drag the card forward to a later lane (drop on Closed = reject). Every move opens the templated message (editable, simulated send) and logs to the timeline. **Invite also schedules the interview** (a set time, or *Let them pick* from 2–4 offered times; in person / online; online **creates a meeting link automatically**, or a switch lets them paste their own). The email shows as a short preview with **Edit**, so the dialog stays short, and the confirm button says what happens in two words ("Send invite"). Everything else is in the side panel.
- M6a **Side panel**: contact and **CV** at the top with the match score; the candidate's **"Message from …"** labelled; a **timeline of plain steps** (Applied, Contacted, Invited to interview, Interviewed, Offer made…) on a rail, each with who and when, and the email sent with it folded under it. An upcoming interview sits on top as "Next". Once the interview has happened, **interview notes** can be written in the panel's Interview section; they show under the *Interviewed* step in the history (internal, never shown to the candidate).
- M7 Qualification match badge (meets / below requirement), replaces "reads CV and guesses". Plus the **match score** with its explanation (added after reviewer feedback: "a relevance score on the card, with an AI explanation on hover"). The CV is a chip on every card.
- M8 **Hire → Staff record** created, prefilled; position auto-suggests Filled.

### Should
- S1 Bulk reply: "notify all remaining applicants" when a position fills; bulk-reject selected.
- S2 Cross-site awareness: badge "also applied to Oak Tree Nursery (Interview)" within the group.
- S3 Create / edit a position **in a modal** (no page change); pause / resume / archive from the ⋯ menu.
- S4 Stale flag + "mark as Lapsed" action.
- S5 Reply speed, as one plain sentence under the overview tiles: median time to first reply, % replied within 48h, median time to fill.

### Could
- Group-level portal page (all nurseries of a group) and group-manager view.
- "Other openings in this group" on candidate confirmation.
- Rescheduling, candidate withdraw button on status page. (Picking from offered interview times moved into M6 after reviewer feedback.)

### Won't (documented as next steps)
Real auth/SSO, real email/SMS delivery, backend/multi-user sync, GDPR retention & deletion automation, job-board syndication (Indeed etc.), right-to-work/DBS check integrations, i18n, analytics pipeline.

## 6. Key decisions & rejected options (seed for README)
| Decision | Chosen | Rejected & why |
|---|---|---|
| Candidate identity | No account; email + tokenised status link | Password accounts (friction, no trust on a break); fully anonymous (can't reply or dedupe) |
| What a candidate *is* | Group-scoped Candidate, separate from staff | Draft staff record on apply (pollutes staff data, GDPR); global cross-group profile (privacy, competitors) |
| Qualification | Multi-select from a catalogue of real qualifications, each mapped to a level (highest wins) | **v1 single choice of level** (people hold several; managers recognise names like CACHE Level 3, not "L3"). CV parsing (unreliable, slow to build) |
| CV | Required upload (PDF/Word) alongside the structured answers | **v1 no CV** (reviewer call: managers expect one and want it before a call; phone file pickers reach Drive/Files). Structured answers still drive matching, so nobody has to read the CV to triage |
| Required fields | Everything required except the note about themselves, plus a consent switch ("information is true") | **v1 right-to-work checkbox**: an unticked box was ambiguous between "no" and "skipped", so it's a yes/no answer. **v2 required note (20+ characters)**: reviewer call, it's the one field that reads like a cover letter and puts people off on a phone; the structured answers already cover triage |
| Overview stats | Four "needs you now" counts (reply, decide, upcoming, offers), each naming who to open first; reply speed as one sentence below | **v1 metrics strip** (median time to first reply, % within 48h, open positions, time to fill): true but not actionable, and read as confusing at the top of the page. Plus a separate "N waiting" banner that duplicated the first tile |
| Interview notes | Notes tagged to the interview, writable once it has happened, shown under the *Interviewed* step | Free internal notes only (interview feedback gets lost among other notes); a scorecard form (too heavy for a nursery manager, next step) |
| Staff menu item | Switched off in the sidebar for now; the page is still reached from a hired application | Keeping it live (a half-built page competes with Recruitment in the walkthrough) |
| Hiring pipeline | Kanban with 4 static lanes (Candidates · Interview · Offer · Closed), across positions or filtered to several | **v1 wait-sorted list** (status spread across badges, hard to scan). **v2 five lanes** New · Contacted · Interview · Offer · Hired ("New" vs "Contacted" split was confusing; Hired is an outcome, so it sits in Closed) |
| Badges | One colour, one meaning: red = act now (no reply >48h, the only red), amber = worth a check, grey = information, green = live/done. Badges only for exceptions, always under the name. Stage is the lane, not a pill | **v1 per-status colours + 3-level wait colours**: two "2 waiting" badges in different colours read as noise and needed explaining |
| Candidates-lane CTA | **Invite to interview** is the only link on those cards (new and contacted); Contact stays in the panel | **v1 Contact → Invite as two card steps**: a "contact" email mostly says "let's talk", then a second round trip to book; the invite is the reply that moves things on |
| Interview time | Set a time, or offer 2–4 and let the candidate pick on their status page; unpicked invites sit in *Waiting for a time* | **Only a set time** (a phone ping-pong to find one). **Full self-booking against a live calendar** (needs calendar integration; next step) |
| Hiding a lane | Every lane folds into a narrow strip (`?collapsed=closed`) | **v2 "Show closed" checkbox** (only one lane, and a checkbox for a layout choice is odd). Hiding it completely (you lose the drop target and the count) |
| Offer turned down | Its own terminal state, **Offer declined**, recorded by the manager from Offer, with a reply | Reusing Withdrawn (hides the most useful signal for pay and speed: who said no at the last step); letting it sit in Offer until lapsed |
| Match score | 0–100 from the structured answers, five named factors, explanation on hover, brand colour | Sorting the board by it (fights "reply fast"; a low score would mean a longer wait). Red/amber/green score (would break the badge rule and read as a verdict). Auto-reject below a threshold (unfair, and the answers are self-reported). A live LLM call in the prototype (no backend, no keys; the explanation is written from the same factors, and says so) |
| Meeting link | Created automatically by default, switch to paste your own | Always pasting (a chore every time); always generated (some nurseries live in Teams or Zoom) |
| Action dialog | Short confirm labels, email as a preview with Edit | Full subject and message always open (made the invite dialog taller than the screen); "Invite to interview & send" (too long for a button) |
| Timeline | One step per status change with its email folded in, on a rail, plus the interview as a step | **v1 raw event log** ("moved to Interview", then a separate email line at the same second; read as noise) |
| Position create / edit | Modal over the overview | **v1 separate page** (disruptive, loses context) |
| Position quick actions | ⋯ menu on each row | Buttons on a position page (one extra click and page per action) |
| Gone quiet | Derived Stale flag → manager confirms Lapsed | Explicit state set manually (never gets set); silent auto-close |
| Stale scope | Only after first reply | Stale on unreplied New too (blames the candidate for our silence; duplicates the wait badge) |
| Position filled | Bulk notify remaining | Leave them open (the "does not reply to everybody" problem) |
| Hiring handoff | Hire creates prefilled staff record | Export/CSV; manual retype (today's pain) |
| Portal scope | Per-nursery page (+group later) | Group-only page (small sites lose identity); embed widget only (needs their website) |

## 7. Success metrics (how we'd know)
- Primary: **median time to first reply**; % applications replied within 48h.
- Apply funnel: portal view → apply start → submit (mobile completion rate).
- Time to fill a position; share of hires created into staff record without retyping.
- Proxy for business value: agency-cover days avoided (survey/manual at first).
- Validation of the hypothesis: compare time-to-first-reply vs. offer acceptance / hire rate.

## 8. Assumptions (flag in README)
- UK market (England ratios, £, Level 2/3).
- Manager is already signed into Famly → prototype fakes the session.
- Messages to candidates are e-mail, simulated in-app as a timeline.
- Single nursery manager per site for the demo.

## 9. Process & Git
- Trunk-based on `master`, small atomic Conventional Commits, push frequently.
- Commit order sketch: `docs: add product spec` → `chore: scaffold` → `feat(portal): …` → `feat(manager): …` → `docs: readme decisions/diagrams` → `docs: shortcuts & time log`.
- Keep a short time log (planning / build / docs) for the "how long did it take" answer.
- Move original brief to `docs/BRIEF.md`; this spec → `docs/SPEC.md`.

## 10. Next step
Implementation plan: stack, hosting (clickable link), persistence, folder layout, and a 3h time-box split across M1–M8 + README.

## Verification (product-level)
Walk the demo script end-to-end in the browser, desktop + mobile width:
1. Open nursery portal → pick L3 toddler-room position → apply from phone viewport → get status link.
2. Switch to manager → Hiring pipeline → new applicant is in the Candidates lane (Amira, "No reply for 52h" in red, stays on top).
3. Invite to interview (pick a time, online link) → the card shows the date and link; the status link shows "Invited to interview" plus the interview details.
4. Hire → staff record appears; position suggests Filled → notify remaining → their status shows "Not progressing".
5. Cross-site candidate shows "also applied to…" badge.

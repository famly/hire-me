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
Terminal exits from any active state: **Rejected** (by nursery), **Withdrawn** (by candidate), **Lapsed** (gone quiet).
- "Gone quiet" is **derived, not a state the user sets upfront**: an active application with no activity for N days (prototype: N = 5) gets a *Stale* flag. Applies only after the first reply: an unreplied New application is the nursery's delay, surfaced by the overdue flag, not the candidate going quiet; manager confirms → Lapsed. (Rejected option: silent auto-close; it hides problems.)
- Position filled → open applications bulk-moved to Rejected with a "position filled" message. Nobody gets silence.
- Candidate-facing status is a **plain-language projection**: Received · Being reviewed · Invited to interview · Offer · Hired · Not progressing · Closed.

## 5. Features & priority (fit to 3h)

### Must (the demo)
**Portal**
- M1 Public nursery page, one shareable URL per nursery: nursery info + Open positions (room/age group, qualification, hours, pay).
- M2 Position detail + **one-screen mobile apply form, every field required**: name, email, phone, **qualifications** (typeahead multi-select from a catalogue of real UK childcare qualifications, each mapped to a level; chips with ✕; "No childcare qualification yet" is exclusive), earliest start, hours (full-time / part-time / either), right to work (yes / no; "no" is allowed and flagged), **CV upload** (PDF/Word ≤5 MB), a short note about themselves, and a **consent switch** confirming the information is true. No account.
- M3 Confirmation + **private status link** (tokenised URL, no login) showing plain-language status and the next step.

**Manager**
- M4 Overview: all positions across my nursery with state and counts (needs reply, with a red "N overdue" only when someone has waited >48h; in progress; hired of headcount). **Active / All** toggle (active = draft, open, paused). An **⋯ quick menu** per position: open pipeline, edit, publish / pause / resume, mark as filled, view listing, archive.
- M5 **Hiring pipeline**: a kanban board with four **static lanes**: **Candidates** (new + contacted) · **Interview** · **Offer** · **Closed** (every outcome: hired, rejected, withdrawn, lapsed; shown by default, can be hidden). Filter to one or more positions with a typeahead multi-select. Candidates lane: unanswered first, longest wait on top. The wait is written out ("Waiting 30h for a reply" in grey, a red "No reply for 52h" once overdue at >48h). A **Colours & flags** popover explains every badge. Badges follow one rule (see §6 "Badges").
- M6 **Act on the card**: the next step as a link on the card, or drag the card forward to a later lane (drop on Closed = reject). Every move opens the templated message (editable, simulated send) and logs to the timeline. Everything else is in the side panel.
- M7 Qualification match badge (meets / below requirement), replaces "reads CV and guesses".
- M8 **Hire → Staff record** created, prefilled; position auto-suggests Filled.

### Should
- S1 Bulk reply: "notify all remaining applicants" when a position fills; bulk-reject selected.
- S2 Cross-site awareness: badge "also applied to Oak Tree Nursery (Interview)" within the group.
- S3 Create / edit a position **in a modal** (no page change); pause / resume / archive from the ⋯ menu.
- S4 Stale flag + "mark as Lapsed" action.
- S5 Tiny metrics strip: median time to first reply, % replied within 48h, open positions, time to fill.

### Could
- Group-level portal page (all nurseries of a group) and group-manager view.
- "Other openings in this group" on candidate confirmation.
- Interview slot picker for the candidate, candidate withdraw button on status page.

### Won't (documented as next steps)
Real auth/SSO, real email/SMS delivery, backend/multi-user sync, GDPR retention & deletion automation, job-board syndication (Indeed etc.), right-to-work/DBS check integrations, i18n, analytics pipeline.

## 6. Key decisions & rejected options (seed for README)
| Decision | Chosen | Rejected & why |
|---|---|---|
| Candidate identity | No account; email + tokenised status link | Password accounts (friction, no trust on a break); fully anonymous (can't reply or dedupe) |
| What a candidate *is* | Group-scoped Candidate, separate from staff | Draft staff record on apply (pollutes staff data, GDPR); global cross-group profile (privacy, competitors) |
| Qualification | Multi-select from a catalogue of real qualifications, each mapped to a level (highest wins) | **v1 single choice of level** (people hold several; managers recognise names like CACHE Level 3, not "L3"). CV parsing (unreliable, slow to build) |
| CV | Required upload (PDF/Word) alongside the structured answers | **v1 no CV** (reviewer call: managers expect one and want it before a call; phone file pickers reach Drive/Files). Structured answers still drive matching, so nobody has to read the CV to triage |
| Required fields | Everything required, plus a consent switch ("information is true") | Optional note and right-to-work checkbox (v1): an unticked box was ambiguous between "no" and "skipped", so right to work is now a yes/no answer |
| Hiring pipeline | Kanban with 4 static lanes (Candidates · Interview · Offer · Closed), across positions or filtered to several | **v1 wait-sorted list** (status spread across badges, hard to scan). **v2 five lanes** New · Contacted · Interview · Offer · Hired ("New" vs "Contacted" split was confusing; Hired is an outcome, so it sits in Closed) |
| Badges | One colour, one meaning: red = act now (no reply >48h, the only red), amber = worth a check, grey = information, green = live/done. Badges only for exceptions, always under the name. Stage is the lane, not a pill | **v1 per-status colours + 3-level wait colours**: two "2 waiting" badges in different colours read as noise and needed explaining |
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
3. Invite to interview → status link shows "Invited to interview".
4. Hire → staff record appears; position suggests Filled → notify remaining → their status shows "Not progressing".
5. Cross-site candidate shows "also applied to…" badge.

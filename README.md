# Recruitment portal: a Famly prototype

**Live prototype:** https://luishdosreis.github.io/famly-hire-me/ (no login; data lives in your browser, and "Reset" in the top bar restores it)
**The brief:** [docs/BRIEF.md](docs/BRIEF.md)

> One page to apply. One board to hire from. A hire becomes a staff record without retyping.

Every nursery gets a public page where a job seeker applies from their phone in a few minutes, with no account. The manager gets one hiring pipeline inside Famly: a board with a lane per stage, where the only thing in red is someone waiting too long for a reply. Every action sends a message, and hiring creates the Famly staff record already filled in.

---

## Contents

1. [Try it in 10 minutes](#try-it-in-10-minutes)
2. [How I framed the problem](#how-i-framed-the-problem)
3. [Question 1: the portal](#question-1-the-portal)
4. [Question 2: the manager's side and the model](#question-2-the-managers-side-and-the-model)
5. [Decisions and what I rejected](#decisions-and-what-i-rejected)
6. [How we'd know it worked](#how-wed-know-it-worked)
7. [Shortcuts](#shortcuts)
8. [What I'd do next](#what-id-do-next)
9. [Process, AI use and time](#process-ai-use-and-time)
10. [Running it locally](#running-it-locally)

---

## Try it in 10 minutes

The top bar switches between **Job seeker** and **Manager**, moves the clock forward (**+1 day**) and **Reset**s the data. It works best with the job seeker in one tab (narrow the window or use device mode) and the manager in another. The two tabs stay in sync live.

1. **Apply as a job seeker.** On Oak Tree Nursery's page, open *Level 3 Practitioner* and apply. Keep the status link open.
2. **Reply as the manager.** Open *Hiring pipeline*. Your card is at the bottom of the unanswered group in the **Candidates** lane, with no flags because you meet the requirement. Amira Khan is at the top, the only red thing on screen (*No reply for 52h*). *Colours & flags* explains every badge. Hover a card's purple **match score** to see why it scored what it did. Click **Invite to interview →** (the only link on Candidates cards; or drag the card to *Interview*): set a time and choose *Online*, and a meeting link is created for you (or switch that off and paste your own). The email shows as a short preview; **Edit** opens it. The card now shows the date and join link, and your status tab shows *Your interview* on its own. Try *Let them pick* on someone else: offer a few times, pick one from their status page, and watch the card move from *Waiting for a time* to *Upcoming* (Liam Walsh is already waiting).
3. **Hire.** Make an offer, then **Hire**. Confirm the prefilled staff record, and you're asked straight away to mark the position filled. Four people are still waiting; they each get a message, and their status pages say *Not progressing*.
4. **Same person, two sites.** Amira has also applied to Willow House in the same group. Her card says so in grey, and her panel names the other manager.
5. **Gone quiet.** Marcus Bell was interviewed 7 days ago, nothing has happened since, and he shows an amber *Quiet 7d*. His panel has the notes Priya wrote after the interview, under *Interviewed online*. Press **+1 day** a few times to watch waits turn red, Ella go quiet and Jordan's interview move from *Upcoming* to *Needs a decision*, then open Marcus and **Mark as lapsed**.
6. **Overview.** The top four tiles say what needs you now (who's waiting, who needs a decision, the next interview, the offer out); each opens that person. Below the tiles, use the positions list's **Active / All** toggle and each row's **⋯** menu (pause, archive, edit and more). **New position** opens a modal, so you never leave the page.

The seed data follows [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md): one group (Acorn Family Nurseries), three nurseries, six positions and fourteen applications, each chosen to show one behaviour.

---

## How I framed the problem

The brief gives one fact (Famly holds a **staff record**) and one hunch (**first-reply speed matters most**). Everything else follows from reading the "what happens today" table as a funnel that leaks at every step:

| Leak | Root cause | What the prototype does |
|---|---|---|
| Nobody can point a curious person anywhere | No stable address | One public URL per nursery, showing only what's open right now |
| Applying means an email address or a printed form | High friction, on a phone, on a break | One screen, a few minutes, no account; the CV comes from the phone's files |
| "Reads a CV and guesses" | Unstructured input | Qualifications are picked from a list of real ones, each mapped to a level and matched against the requirement. The CV is there, but triage doesn't depend on reading it |
| Eleven arrive at once; the strong ones take another job first | No sense of who has waited longest | The Candidates lane puts the unanswered first, longest wait on top; anyone past 48h turns red, and red means nothing else |
| Three sites, three conversations | Identity per inbox, not per person | One candidate per group, matched by email |
| "Does not reply to everybody" | Replying costs effort | Every action sends a templated message; filling a position notifies everyone left |
| The hire gets typed into Famly by hand | Two systems | Hiring creates the staff record, prefilled |

The **manager's time** is the scarce resource: hiring is their fourth job. So every screen answers one question: *who do I need to reply to, and what's the one click?*

**Users:**

- **The job seeker**: on a phone, no account, sceptical.
- **The nursery manager**: signed into Famly, time-poor.
- **The group manager**: secondary here. Their need (one person, several sites) is served through the candidate model rather than a separate view.

---

## Question 1: the portal

> *What do they touch, and what are they in your system?*

**What they touch:** four screens, all phone-first.

1. **Nursery page** (`/n/oak-tree`): who the nursery is and the open roles. Each role shows room and age group, qualification, hours and pay up front.
2. **Position page**: the role, plus *what happens when you apply*. That section is there to earn trust: no account, you get a private link, and the manager replies directly.
3. **Apply form**, one screen, every field required except the note:
   - name, email and mobile
   - **qualifications**: type to search a list of real UK childcare qualifications (CACHE, Early Years Educator, NNEB, EYTS, QTS, first aid…) and pick several; they appear as chips with an ✕
   - earliest start and hours
   - right to work: yes or no ("no" is allowed and flagged, never blocked)
   - **CV** (PDF or Word, up to 5 MB), and an optional short note about themselves
   - a **consent switch**: the information is true

   There's no password. Errors show inline and focus jumps to the first. If the same email applies to the same role again, it gets its existing link back.
4. **Confirmation and private status page**: the status link is their only "account". The page shows a plain-language status (*Received → Being reviewed → Invited to interview → Offer → Hired*, or *Not progressing* / *Closed*) every message the nursery sent and, once invited, their interview: when, and the address or the join link.

**What they are in our system:** a **Candidate**. That is not a user account and not a staff record. A Candidate is identified by email and **scoped to the group**:

- The same person applying to three Acorn sites is one candidate, so the managers can see it.
- They are never visible to a different group. Nursery groups compete for the same staff.

Each application gets its own unguessable status token. The candidate never sees internal states or notes: a single projection function is the only path from internal state to the public page, and it's covered by tests.

---

## Question 2: the manager's side and the model

> *What does the manager open, and what model carries a position from open to filled, and an application from arrival to hired, rejected or gone quiet?*

**What they open:** *Recruitment* in the Famly sidebar.

- **Overview**:
  - **what needs you now**: four tiles (*Waiting for your reply* with a red "N overdue", *Interviewed, needs a decision*, *Upcoming interviews*, *Offers waiting for an answer*), each naming the first person to deal with and opening them in one click, and one plain *Reply speed* sentence underneath;
  - the positions list, **Active** by default (All shows filled and archived), with *needs reply* (plus a red "N overdue" only when true), *in progress* and *hired of headcount*;
  - a **⋯ menu** on each row: open pipeline, edit, publish / pause / resume, mark as filled, view listing, archive;
  - **New position** and **Edit** open a modal over the page.
- **Hiring pipeline** (the working view): a kanban board with four **static lanes**: **Candidates** (new and contacted) · **Interview** · **Offer** · **Closed** (every outcome: hired, rejected, withdrawn, lapsed, **offer declined**). Any lane folds into a narrow strip and back, and still takes drops.
  - It covers all positions, or any mix picked from the **Filter by position** typeahead.
  - The Candidates lane puts the unanswered first, longest wait on top. The Interview lane splits into phases worked out from the interview: *Needs a decision* first (with "Make offer →"), then *Upcoming*, then *Waiting for a time* (offered times, not picked yet), each a labelled group with a count (no next step until it has happened). Cards move between them on their own.
  - A card shows the name and **match score**, the position, the wait in words ("Waiting 30h for a reply", or a red "No reply for 52h"), the interview date and place or link, **flags only for exceptions**, and the **CV**.
  - The **match score** (0–100) comes from the answers only: qualification against the requirement, right to work, hours, start date, paediatric first aid. Hover it for a written explanation and the points. It is a hint: it never reorders the lane (reply speed wins) and never rejects anyone, and it's purple, not a traffic light, so it doesn't read as a verdict.
  - Move a card with its next-step link (Invite → Offer → Hire; Contact is in the panel) or by dragging it forward: the lanes that accept it get a dashed outline. Every move opens the message to send, and inviting also schedules the interview: a set time, or a few for the candidate to pick from.
- **Application panel**: contact, CV and match score at the top; answers and the labelled *Message from …*; the interview; all allowed actions (including reject, lapse and **Offer declined**); internal notes; and a **timeline of plain steps** (Applied, Contacted, Invited, Interviewed, Offer made…), each with who and when and the email that went with it folded underneath. Once the interview has happened, **interview notes** go in the Interview section and show under the *Interviewed* step. It opens in place, so the board keeps its position.
- **Staff**: where hires land, badged *Hired via Recruitment*. Its sidebar item is switched off for now; a hired application's panel links to it.

**One colour, one meaning.** The first version used a colour per status plus three wait colours, and it needed explaining: two "2 waiting" badges, one amber and one red. Now the rules are:

- **Red** means act now: no reply after 48h. Nothing else in the product is red.
- **Amber** means worth a check: below the required qualification, answered "no" to right to work, or gone quiet.
- **Grey** is information (including how it ended in Closed, such as *Offer declined*). **Green** means live or done.
- **Purple** is the match score: a hint, not an alert.
- Badges only appear for exceptions, always under the name in the same order.
- The stage is the lane, never a pill on the card.
- A **Colours & flags** popover on the board explains each flag and where it comes from. Flags are derived from the application and its activity; nobody adds them by hand.

### Domain model

```mermaid
erDiagram
    GROUP ||--o{ NURSERY : owns
    NURSERY ||--o{ ROOM : has
    NURSERY ||--o{ POSITION : advertises
    ROOM |o--o{ POSITION : "optionally for"
    GROUP ||--o{ CANDIDATE : "scopes (email unique per group)"
    CANDIDATE ||--o{ APPLICATION : makes
    POSITION ||--o{ APPLICATION : receives
    APPLICATION ||--o{ TIMELINE_EVENT : "status / message / note"
    APPLICATION |o--o| STAFF_RECORD : "hire creates"
    NURSERY ||--o{ STAFF_RECORD : employs
```

We store only **facts**: entities and timeline events. Wait time, stale, qualification match, counts and metrics are all **derived** and never stored, so they can't drift.

### Position lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Open: publish
    Open --> Paused: pause
    Paused --> Open: resume
    Open --> Filled: fill (suggested when hires = headcount)
    Paused --> Filled: fill
    Draft --> Archived: archive
    Open --> Archived: archive
    Paused --> Archived: archive
    Filled --> [*]
    Archived --> [*]
```

Only **Open** appears on the portal. Filling is **suggested, never automatic**. When the manager confirms, every remaining active application is closed with a "position filled" message, so nobody gets silence.

### Application lifecycle

```mermaid
stateDiagram-v2
    [*] --> New: candidate applies
    New --> Contacted: contact
    New --> Interview: invite
    Contacted --> Interview: invite
    New --> Offer: offer
    Contacted --> Offer: offer
    Interview --> Offer: offer
    Offer --> Hired: hire → staff record
    state "Offer declined" as Declined
    Offer --> Declined: they turn it down
    state "Any active state" as active
    active --> Rejected: reject (by nursery, or position filled)
    active --> Withdrawn: withdraw (by candidate)
    active --> Lapsed: lapse (manager confirms, once stale)
    Hired --> [*]
    Rejected --> [*]
    Withdrawn --> [*]
    Lapsed --> [*]
    Declined --> [*]
```

- **States vs lanes.** The board groups states so it stays simple: *New* and *Contacted* share the Candidates lane, and every end state (*Hired*, *Rejected*, *Withdrawn*, *Lapsed*, *Offer declined*) sits in Closed with a label.
- **"Gone quiet" is a derived flag, not a state.** An active application with no activity for 5 days *after the first reply* is flagged (a past interview counts as activity; an upcoming one is never quiet), and the manager confirms **Lapsed**. An unreplied *New* application is our delay, not theirs, and the red overdue flag covers it.
- **Hire is allowed from any active state**, with a warning if there was no offer. A manager may want to hire on the spot after a good trial shift.
- Every transition lives in one explicit table in [src/domain/](src/domain/). The UI renders only the actions the table allows, and illegal moves throw.

---

## Decisions and what I rejected

| Decision | Chosen | Rejected, and why |
|---|---|---|
| Candidate identity | No account: email plus a tokenised status link | **Password accounts**: friction and no trust on a break. **Fully anonymous**: we couldn't reply or dedupe |
| What a candidate *is* | Group-scoped Candidate, separate from staff | **Draft staff record on apply**: pollutes staff data and raises GDPR problems. **Global cross-group profile**: privacy, and groups are competitors |
| Qualification | Multi-select from a list of real qualifications, each mapped to a level (the highest counts) | **v1: a single choice of level**: people hold several, and managers recognise "CACHE Level 3", not "L3". **CV parsing**: unreliable and slow to build |
| CV | Required upload, alongside structured answers | **v1: no CV**, reversed after review: managers expect one before calling. The structured answers still drive triage |
| Required fields | All required except the note, plus a consent switch | **v1: a right-to-work checkbox**: an unticked box couldn't tell "no" from "skipped". **v2: a required note**: the one field that reads like a cover letter, off-putting on a phone, and the structured answers already cover triage |
| Overview | Four "needs you now" counts, each naming who to open first; reply speed as one sentence | **v1: a metrics strip** (median reply time, % within 48h, open positions, time to fill): true, but not something to act on, and confusing as the first thing on the page |
| Interview notes | Tagged to the interview, writable once it has happened, shown under that step | **Only free notes**: interview feedback gets lost among the rest. **A scorecard**: too heavy for now |
| Qualification below requirement | Flag, never block | **Hard gate**: a manager may want an L2 who finishes their L3 in spring |
| Right to work | Yes/no answer; "no" is flagged | **Block in the form**: gatekeeping belongs to the employer's check, not a form field |
| Hiring pipeline | Kanban with four static lanes (Candidates · Interview · Offer · Closed) across positions, filterable to any mix | **v1: a wait-sorted list**: status was spread across badges, hard to scan. **v2: five lanes** New · Contacted · Interview · Offer · Hired: the New/Contacted split confused people, and Hired is an outcome |
| Interviews | Scheduled on invite: a set time or 2–4 for the candidate to pick from, in person or online with a link, shown on the card and to the candidate | **Just an "Interview" status**: the manager has to find the date in their email. **Full self-booking against a live calendar**: better, but needs calendar integration; next step |
| Candidates-lane CTA | *Invite to interview* is the only link on those cards | **v1: Contact, then Invite**: two emails and a round trip before anything is booked |
| Hiding a lane | Every lane folds into a narrow strip | **v2: a "Show closed" checkbox**: only one lane, and odd as a layout control |
| Offer turned down | Its own outcome, *Offer declined*, recorded from Offer with a kind reply | **Reusing Withdrawn**: hides who said no at the last step, the best signal on pay and speed |
| Match score | 0–100 from the answers, five named factors, explanation on hover, purple | **Sorting the board by it**: fights "reply fast". **Traffic-light colours**: reads as a verdict and breaks the badge rule. **Auto-reject below a score**: unfair on self-reported answers. **A live LLM call**: no backend in the prototype, so the explanation is written from the same factors, and says so |
| Action dialog | Two-word confirm ("Send invite"), email as a preview with Edit, meeting link created for you | **v2: full message always open and "Invite to interview & send"**: the dialog outgrew the screen |
| Timeline | One step per change, the email folded in, the interview as its own step | **v1: a raw event log**: "moved to Interview" and a separate email line at the same second |
| Badges | One colour, one meaning; badges only for exceptions; the stage is the lane | **v1: per-status colours plus three wait levels**, which needed explaining |
| Acting | Next step on the card, or drag forward (drop on Closed = reject), always with an editable message | **Status dropdown**: no message, so "does not reply" stays true. **Fixed messages**: managers want their own voice |
| Positions | Active/All toggle, ⋯ quick menu per row, create/edit in a modal | **v1: a separate position page** for actions and a page for the form, which was disruptive |
| Gone quiet | Derived flag after the first reply, manager confirms Lapsed | **Manually set state**: never gets set. **Silent auto-close**: hides problems. **Flag unreplied New too**: blames the candidate for our silence |
| Position filled | Suggested at headcount; confirm notifies everyone left | **Auto-fill**: surprising. **Leave the rest open**: that's the problem the brief describes |
| Hiring handoff | Hire creates a prefilled staff record | **Export/CSV**: moves the retyping instead of removing it. **Manual retype**: today's pain |
| Portal scope | One page per nursery | **Group-only page**: small sites lose their identity. **Embed widget only**: needs them to have a website |
| Cross-site | Badge and panel note within the group | **Merged pipeline across sites**: needs group-level roles and permissions; later |

**Technical choices**, detailed in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md):

- **Stack.** Vite, React, strict TypeScript, Tailwind, Zustand and React Router, with no backend. That was the fastest route to a link that opens anywhere.
- **Domain logic is plain TypeScript**: no React, no clock. It takes `now` as an argument, so the demo clock can fast-forward and the tests are trivial.
- **Seed data is replayed through the real transitions** with timestamps relative to load time, so the badges look right on any day. A test guards the demo script against seed changes.
- **HashRouter on GitHub Pages**: deep links survive a refresh with no server config.

---

## How we'd know it worked

The brief says *"we have not agreed how we would know this worked"*, and has a hunch that first-reply speed matters most. So the prototype **instruments the hunch instead of assuming it**. The top of the overview is for acting (who's waiting, who needs a decision); the measurement sits underneath as one *Reply speed* sentence:

| Metric | Why |
|---|---|
| **Median time to first reply** | The hypothesis itself |
| **% replied within 48h** (of applications already due a reply) | Shows how many people wait too long, which a median hides; the same 48h line as the red flag |
| **Median time to fill** | The outcome the manager actually feels (agency cover, turned-away families) |

With real data, I'd add:

- **The apply funnel**: portal view → form start → submit, split by mobile and desktop.
- **Share of hires created without retyping**: staff records that came from an application.
- **The hypothesis test**: bucket applications by time to first reply and compare interview-show, offer-acceptance and hire rates across the buckets. If fast replies don't convert better, sorting the Candidates lane by wait is wrong and we'd rank by fit instead.
- **Agency-cover days avoided**: a survey at first; the business case.

---

## Shortcuts

Taken to fit the time box. Each is deliberate and reversible.

- **No backend.** State lives in `localStorage` per browser and syncs across tabs. There are no real users, no multi-manager concurrency, and nothing persists across devices.
- **Faked session.** You're always Priya Shah at Oak Tree. There are no roles, and no group-manager view.
- **Emails are simulated.** A sent message is a timeline event that the status page reads. No delivery, no bounces, no replies from the candidate.
- **Status tokens are stored in plain text.** In production they'd be hashed server-side, expire, be rate-limited, and be re-sent by magic link on request.
- **GDPR is not handled.** There is a privacy notice and a "this is true" confirmation, but no data-processing consent record, retention period or deletion.
- **CVs aren't stored.** The form checks the type and size, and the prototype keeps only the file's name, size and type (browser storage is too small for files). The panel shows the name; opening the file needs a backend.
- **Interviews can't be rescheduled** from the UI yet, and there's no calendar invite (.ics). The "created" meeting link is random text in Google Meet's format; for real, it would come from the nursery's connected Google or Microsoft calendar.
- **The match explanation isn't a live AI call.** It's written from the same five factors the score uses, and the popover says so. The real version would have an LLM read the CV as well, grounded in those factors, with the same rules: a hint, never a gate.
- **Offer declined is recorded by the manager.** The candidate can't turn an offer down from their status page yet.
- **Archiving a position** (as opposed to filling it) doesn't notify applicants yet. They stay in the pipeline for the manager to reply to. That's a gap against "nobody gets silence".
- **Drag and drop is desktop only** (native HTML5). On touch, the next-step link and the panel do the same job.
- **Not built from the spec:**
  - bulk-reject a selection
  - candidate withdraw button (the domain supports it)
  - "other openings in this group" on the confirmation page
- **Tests cover the domain only**: transitions, projection, stale and interviews, overdue, lanes and their order, qualification levels, match score, timeline steps, dedupe, metrics and seed expectations. The UI was checked by scripted browser runs of each journey at phone and desktop widths; those scripts are not committed.
- **Free-text pay and contract**, a fixed 5-day stale threshold, and only one nursery's staff list.

## What I'd do next

In order:

1. **Real messaging.** Email and SMS delivery, candidates replying by email into the timeline (so "gone quiet" means the *candidate* went quiet), and self-booking against the nursery's live calendar (today the manager types the times to offer).
2. **Backend and auth.** Group, nursery and room permissions reusing Famly's roles, hashed tokens and an audit log.
3. **Group view.** A merged pipeline across sites for group managers, and moving a candidate between sites.
4. **Validate the hypothesis.** Ship the funnel and reply-speed instrumentation first, then revisit the sort order.
5. **Handoff depth.** Invite the new hire to the Famly app, put them on the rota from their start date, and feed qualifications into ratio planning.
6. **Compliance.** Retention and deletion schedules, right-to-work and DBS check tracking.
7. **Reach.** Job-board syndication (Indeed and others), an embeddable widget and QR codes for window cards.

---

## Process, AI use and time

**Process:**

1. **Spec before code.** [docs/SPEC.md](docs/SPEC.md) covers goal, users, the model, prioritised features (Must / Should / Could / Won't) and the decisions table.
2. **Supporting docs.** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (stack and layering rules), [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md) (step-by-step journeys with build status and a fixed seed cast) and [docs/GIT.md](docs/GIT.md) (commit conventions).
3. **Build in priority order.** All Musts, then Shoulds. Each commit is one vertical slice. The commit body explains the *why* and the rejected alternative, and `Refs:` link back to spec and journey IDs. `git log` reads as the story.

**AI:**

- I used **Claude Code** throughout: to pressure-test the spec, and to pair on the implementation.
- [CLAUDE.md](CLAUDE.md) ties the docs together so each session followed the same rules: work in priority order, no scope drift without a spec change, record decisions as they're made, keep the journeys current.
- Each journey was checked in a headless browser before its commit.
- AI-assisted commits carry a `Co-Authored-By` trailer.
- The product decisions and trade-offs above are mine, and I can walk through any line of the code.

**Time spent:**

| Phase | Time |
|---|---|
| Reading the brief, framing, spec and docs | _~X h (fill in)_ |
| Build: domain, portal, manager, deploy (AI-assisted) | ~25 min of wall-clock pairing, plus review |
| README and final review | _~X min (fill in)_ |

---

## Running it locally

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # domain tests (vitest)
npm run build   # typecheck + production build
```

Node 20.19+ or 22.12+ is required. Pushing to `master` deploys to GitHub Pages via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

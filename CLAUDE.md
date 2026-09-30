# CLAUDE.md

Famly take-home: a **recruitment portal** prototype. Public side: a job seeker applies from a phone with no account. Manager side: one queue, reply fast, hire straight into a Famly staff record.

Reviewers judge **product sense > problem solving > tech**, and "how you got there" as much as the result. Everything we build and write should make our reasoning visible.

## Doc map (read before working)

| File | What it holds | Read when |
|---|---|---|
| [README.md](README.md) | The original brief from Famly (later replaced by our write-up; brief moves to `docs/BRIEF.md`) | Once per session, for context |
| [docs/SPEC.md](docs/SPEC.md) | **Source of truth for product**: users, domain model, lifecycles, feature IDs (M1–M8, S1–S5), decisions & rejected options, metrics | Before any feature work |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, libraries, folder layout, routes, domain/store/UI rules | Before writing code |
| [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md) | Journeys J0–J9 step by step, seed cast, build status | Before building a screen; update after |
| [docs/GIT.md](docs/GIT.md) | Commit format, scopes, when to commit | Before every commit |

If two docs disagree: SPEC wins on product, ARCHITECTURE wins on code. Fix the loser in the same commit.

## Session start

1. `git log --oneline -15` to see where we are.
2. Check the status column in [docs/USER_JOURNEYS.md](docs/USER_JOURNEYS.md) to find the next unbuilt journey.
3. Work in priority order: all **Must** (M1–M8) before any **Should**, Should before Could.

## Working rules

- **Time box: ≤3h of build.** Prefer the simpler option and write down what we skipped. A shortcut is fine if it's recorded in README "Shortcuts".
- **No scope drift.** A feature not in SPEC §5 needs a SPEC update first (with the reason), then code.
- **Record decisions as they happen.** New product/tech choice → add a row to SPEC §6 (chosen + rejected + why). Rejected options are worth as much as kept ones.
- **Journeys stay current.** When a journey step works in the browser, tick it in USER_JOURNEYS. If building it changed the flow, update the steps.
- **Use the seed cast** from USER_JOURNEYS in seed data, copy and examples. Don't invent new nursery or candidate names.
- **Every choice must be explainable** in the walkthrough interview. Avoid clever code or libraries we can't justify in a sentence.

## Commands

```bash
npm run dev        # local dev server (http://localhost:5173)
npm run build      # typecheck + production build → dist/
npm run test       # vitest, domain logic (src/**/*.test.ts)
npm run typecheck  # tsc -b only
npm run lint       # oxlint
```

## Definition of done (per change)

- `npm run build` and `npm run test` pass.
- Checked in the browser at 375px (portal) and desktop (manager).
- USER_JOURNEYS status updated; SPEC/ARCHITECTURE updated if behaviour or structure changed.
- Committed per [docs/GIT.md](docs/GIT.md).

## Time log

Keep a running log in README under "Time spent" (planning / build / docs, rough minutes). Update at each milestone commit.

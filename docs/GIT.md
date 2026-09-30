# Git workflow

The git history is part of the deliverable. A reviewer should be able to read `git log --oneline` and follow how the product came together: spec first, then scaffold, then portal and manager slices, then the write-up.

## Branching

- **Trunk-based on `master`.** Solo and time-boxed, so no feature branches or PRs.
- Never force-push, rewrite or amend commits that are already pushed, or skip hooks (`--no-verify`).
- **Pushing:** at milestones (see below). Claude asks before pushing.

## Commit format — Conventional Commits

```
<type>(<scope>): <subject>

<body: why, and what we rejected (optional but encouraged)>

Refs: <feature IDs / journey IDs>
Co-Authored-By: <AI trailer when AI-assisted>
```

- **Subject:** imperative, lowercase, no trailing period, ≤72 chars. Say what changed for the product, not which file changed.
  - Good: `feat(portal): add one-pass apply form with structured qualification`
  - Bad: `update ApplyPage.tsx`
- **Body:** add one whenever there was a choice to make. One or two lines on *why*, plus the rejected alternative. These lines feed the README decisions table.
- **Refs:** SPEC feature IDs (`M2`, `S1`) and journey IDs (`J1`) so commits trace back to the spec.
- **AI trailer:** AI-assisted commits end with a `Co-Authored-By:` line. The brief expects AI use, and being open about it is part of the story.

### Types

| Type | Use for |
|---|---|
| `feat` | User-visible behaviour (a screen, an action, a state transition) |
| `fix` | Bug in something already committed |
| `refactor` | Structure change, no behaviour change |
| `test` | Tests only |
| `docs` | SPEC, ARCHITECTURE, JOURNEYS, README, diagrams |
| `chore` | Scaffold, config, deps, CI/deploy |
| `style` | Formatting only (rare, since tooling handles it) |

### Scopes

`portal` · `manager` · `domain` · `data` (seed) · `store` · `ui` (shared components) · `demo` (demo bar, reset) · `deploy` · `spec` · `readme` · `journeys` · `arch`

Leave the scope out only when a change genuinely spans everything.

## When to commit

Commit when **one logical change works**, and not later than that:

- A journey step or feature ID works end-to-end in the browser → `feat`.
- Domain logic plus its tests pass → `feat(domain)` or `test(domain)`.
- A doc changed because a decision was made → `docs`, straight away, while the reasoning is fresh.
- Before a risky refactor, so there's a clean point to go back to.

Rules:

- **Never commit a broken build.** `npm run build` and `npm run test` pass first.
- **One concern per commit.** Don't mix a refactor with a feature, or seed changes with UI.
- **Doc updates travel with the code that caused them.** If a feature changed a journey or the model, update USER_JOURNEYS/SPEC in the same commit.
- Never commit `dist/`, `node_modules/`, `.env*`, or editor files.

## Planned sequence (milestones marked ★ = push)

1. `docs: add product spec, architecture, git and journey guides` ★
2. `chore: scaffold vite react ts app with tailwind and router`
3. `feat(domain): model positions, applications and lifecycles` (+ tests)
4. `feat(data): seed group, nurseries, positions and applications`
5. `feat(portal): …` M1 → M2 → M3, one commit each ★
6. `feat(manager): …` M4 → M8, one commit each ★
7. `chore(deploy): publish to github pages` ★
8. `feat(...)`: Should items, in SPEC order, as time allows
9. `docs(readme): decisions, diagrams, metrics, shortcuts, time spent` ★
10. Tag `v1.0-submission` on the commit we send.

## Examples

```
feat(manager): sort applicant queue by longest wait for first reply

Kanban per position was rejected: it hides who has waited longest,
and managers look across positions, not within one.

Refs: M5, J3
```

```
feat(domain): derive stale flag instead of a manual "gone quiet" state

A state the manager has to set never gets set. Silent auto-close
hides problems. A derived flag plus manager confirmation sits between
the two.

Refs: S4, J8
```

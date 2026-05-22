# Highland Games Tracker — Lint Setup Spec Sketch (v1)

**Date:** 2026-05-21
**Skill level:** L1 — Supported
**Project risk:** Normal — low (tooling only; see Risk note)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage3b`
**Design source:** the 2026-05-21 planning conversation (this sketch records it)

---

## What this is

A small tooling task — not a v2 stage. Add **Biome** as the project's linter,
and make a lint check a verification step in the build process. It runs
**before Stage 4a**, so 4a — and every stage after — is built with the linter
live.

Until now the project has had no dev tooling: vanilla HTML/CSS/JS, no build
step, zero dependencies. This task adds the first — a linter. A linter reads the
code *without running it* and flags likely mistakes: unused variables, a
variable used before declaration, `==` where `===` was meant, accidental
globals, calls to things that do not exist. It is a different net from the test
suite — tests check *behaviour*, the linter checks the code's *shape* — so the
two are complementary, not a replacement.

## Why Biome (not ESLint)

Decided in the 2026-05-21 planning conversation. ESLint is the industry-standard
JS linter and the one to learn if the goal is professional development. This
project's goal is L1 *directing* competence, not authoring. The learning a
linter gives a director — reading and acting on lint output, knowing what it
catches — is **tool-agnostic**: the warnings read the same whichever tool
produced them. ESLint's *extra* surface over Biome is mostly configuration
machinery (flat config, the plugin ecosystem) — authoring overhead. Biome — one
fast tool, one config — gives the same transferable learning with far less setup
friction. Low-stakes and reversible: if the goal later shifts toward
professional dev, switching to ESLint is cheap.

## Scope — the buildable chunk

1. **Add Biome to the project.** Create `package.json` and add Biome as a dev
   dependency (`@biomejs/biome`); create a Biome config file (`biome.json`).
   This is the project's first `package.json` / `node_modules` — add or update
   `.gitignore` to exclude `node_modules/`. Commit `package.json` and the
   lockfile; do not commit `node_modules/`.

2. **Configure the linter — correctness on, style light.** Enable Biome's
   recommended / correctness rules: the real-bug catches. Keep style rules
   light — the goal is to surface genuine mistakes, not to drown the reader in
   nits. **Linter only** — Biome's *formatter* is not enabled or enforced in
   this task; reformatting the whole codebase is a separate concern for another
   day.

3. **Add a runnable lint command.** A `package.json` script — e.g.
   `npm run lint` — that runs Biome's linter over the project's JavaScript
   (`shared.js`, `app.js`, `session.js`, `gap.js`, `tests.js`). (Biome lints JS
   and JSON; it does not lint the `.html` files — that is expected, not a gap.)

4. **Bring the existing codebase to a clean pass.** Run the linter on the
   current code and get it to **green**: *fix* anything Biome flags as a genuine
   problem; for anything it flags that is a deliberate, pre-existing choice not
   worth changing, tune that rule rather than edit the code. The linter must
   start from a clean pass — so that from Stage 4a on, every lint finding is real
   signal, not noise layered on a pre-existing pile.

5. **The lint check becomes a verification step.** From here on, `npm run lint`
   is run as part of the build self-check, before the gpt review — cheap
   automated catches first, so gpt's one review pass spends its attention on
   what a linter cannot see.

## Acceptance criteria

- [ ] `package.json` and a Biome config exist; Biome is a dev dependency;
      `node_modules/` is gitignored; the lockfile is committed.
- [ ] `npm run lint` (or the chosen script name) runs Biome's linter over the
      project's `.js` files.
- [ ] Correctness rules are on; style rules are light; the formatter is not
      enforced.
- [ ] Running the lint command on the current codebase reports **no errors** —
      a clean pass.
- [ ] Green was reached by genuine fixes and reasonable rule tuning — **not** by
      blanket-disabling rules to silence real findings.
- [ ] Anything Biome flagged that looks like an actual bug is surfaced in the
      build report, not quietly silenced.
- [ ] The app still loads and works; no app behaviour changed; the test suite
      still passes.

## Explicitly NOT in this task

- Biome's **formatter** / any whole-codebase reformat — a separate concern.
- **ESLint.**
- Any change to app behaviour — this is tooling only.
- **Stage 4a** — a separate task, built after this with the linter live.
- A VS Code editor extension — that is Oak's local editor setup, not a repo
  change (see Open items).

## Tech notes (decided)

- Biome is added the npm way — `package.json` + `@biomejs/biome` dev dependency
  + a `package.json` lint script — so the lint step is a durable, named command,
  not an ad-hoc invocation.
- The project keeps its no-build-step nature: Biome is a dev-time check, not a
  build. The app still runs by opening the HTML files; nothing about how it is
  served or shipped changes.
- Atomic commits: the Biome install + config is one commit; the fix-to-green
  work is separate, one concern per commit — and if a genuine bug is found and
  fixed, that is its own `fix:` commit, called out as such.

## Risk note

Project risk **Normal**, and this task is **low** within that — tooling only, no
app behaviour change. The one thing to watch: getting to green must be honest.
Reaching a clean pass by blanket-disabling rules would make the linter
decorative from day one. Genuine issues get fixed; only deliberate, defensible
pre-existing choices get a tuned rule. If Biome flags something that looks like a
real bug, that is the linter earning its place immediately — surface it.

## Open items

- **The process note.** Linting is now a verification step for this project.
  Whether that gets a line in the project's build conventions (e.g. its
  `CLAUDE.md`) or in `higgins-method.md` is a small **cowork** follow-up — not
  part of this ccode task.
- **A Biome VS Code extension** would give Oak the squiggle-as-you-read
  experience in the editor. That is a local editor install, not a repo change —
  flagged for Oak to set up on his side if he wants it.

## Handoff prompt for the next ccode session

```
ccd, this is a small tooling task for the Highland Games Tracker v2
build — adding a linter. It is NOT a v2 stage, and it runs BEFORE
Stage 4a.

Read this file:
  - docs/specs/lint-setup-spec.md  (this spec)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage3b. The task: add Biome as the project's linter, with a
runnable lint command, and bring the existing code to a clean pass.
Biome's linter only — not its formatter. Do NOT touch app behaviour
and do NOT start Stage 4a; that is a separate task after this.

Note the Risk note: getting to a clean pass must be honest — fix real
findings, tune rules only for deliberate pre-existing choices, never
blanket-disable to fake green. If Biome flags anything that looks like
a genuine bug, surface it in your build report.

Skill level: L1 — Supported. Project risk: Normal, low for this task.
Reviewer: gpt.

Build to the acceptance criteria. Atomic commits, v1 style (small,
focused, feat:/fix:/chore:/refactor: prefixes, one concern each — the
Biome install + config is one commit; fix-to-green work is separate,
one concern per commit). Do not push — give me the push commands when
the local commits are ready.
```

## Review prompt for the gpt review pass

```
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is a small tooling task on the
Highland Games Tracker v2 project — adding Biome as the linter. Skill
level: L1 — Supported. Project risk: Normal, low for this task.

WHAT TO READ — all attached:
- lint-setup-spec.md — this spec. Its Acceptance criteria is the bar;
  its Risk note says where to concentrate.
- package.json, the Biome config, .gitignore — the new tooling files.
- shared.js, app.js, session.js, gap.js, tests.js — to check what the
  fix-to-green work changed.
- higgins-method.md — your Reviewer role, the L1 level, the one-
  review-pass rule.

CONCENTRATE HERE
- Was green reached honestly? Confirm the clean pass was achieved by
  genuine fixes and defensible rule tuning — NOT by blanket-disabling
  rules to silence real findings. A linter that is green because it
  checks nothing is worse than no linter.
- Did any fix-to-green edit change app behaviour? It should not — this
  is a tooling task. Confirm the edits are limited to what the linter
  legitimately required.
- Were the correctness rules actually enabled, and is the formatter
  left off as the spec requires?

ALSO CHECK
- The lint command runs and reports a clean pass.
- node_modules is gitignored; package.json and the lockfile are
  committed.
- Whether the build meets each Acceptance criterion.

HOW TO REPORT
- Classify findings: Critical / Major / Minor / Nit.
- Be specific: file, what is wrong, why it matters.
- Calibrate to a personal vanilla-JS app at L1 / Normal risk.

METHOD CONSTRAINT
This is the one review pass. A second round happens only on a Critical
finding. One complete review — findings by severity, then a one-line
verdict: ship as-is, ship after fixes, or fix-and-re-review.
```

Attach the listed files only — don't paste ccode's build report.

---

*End of sketch. Update only via cowork session.*

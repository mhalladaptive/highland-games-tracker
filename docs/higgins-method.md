# The Higgins Method (v0.5)
**Date:** May 18, 2026 · **v0.4 revision:** May 21, 2026 · **v0.5 revision:** May 22, 2026
**Status:** Decided draft. v0.5 adds a per-response grading scale to the cold-read gates. v0.4 re-sizes the L1 gate into three interleaved ~1-hour sub-gates — the single whole-project gate proved too large (pending across three shipped stages of highland-games-tracker). v0.3 revised the skill ladder gates and added the explicit collaboration-not-replacement principle. Supersedes `witan-redesign.md`. Does NOT replace CLAUDE.md until you decide it should.

## Why this exists

The original system (the old "Witan" method — four AI roles, five phases, full ceremony) was shaped like a **team process** but run by a **team of one**. Much of its ceremony transferred context between separate "people" who were all just you, copy-pasting between tabs. It also had **no skill-progression mechanism** — it would run the same choreography on project #10 as project #1.

The Higgins Method is built around three goals:
1. **Skill progression built in** — the system grows your competence at directing AI as you ship more projects.
2. **Momentum** — bias toward shipping; no stalling.
3. **More skill at directing AI**, not less reliance on it. You're building collaboration fluency, not coding independence.

## Core principle — collaboration, not replacement

The Higgins Method is a system for getting more capable at **directing** AI, not more capable at **replacing** AI. You don't need fluent typing or memorized syntax. You need to recognize structure, spot when something's off, and articulate it clearly enough for AI to fix.

This is the lens the ladder, the loop, and the ledger all operate through.

## Core idea: two dials, not one

- **Skill level** — trends *up* over time; *reduces* AI redundancy as you prove capability.
- **Project risk** — set per-project; can bump rigor *back up* regardless of skill level.

*Transferable design principle: match process to both how capable the operator is AND how costly a mistake would be.*

## Roles — three, plus you

| Callsign | Who | Job |
|---|---|---|
| **You** | The builder-in-training | Role grows every project. The point of the system. |
| **cowork** | Claude in Cowork | **Planner.** Turns an idea into a spec sketch. Early: does it with you. Later: you draft, it critiques. |
| **ccode** | Claude Code | **Builder.** Builds the spec. |
| **gpt** | ChatGPT | **Reviewer.** Reviews the build — a separate model from the builder, so the cross-check is real from project one. Also runs the optional spec stress-test when invoked. |

Separate-model review is the **one redundancy kept on purpose** — one model reviewing another's work is the highest-value cross-check. Confirmed in use from Level 1, to get the motions down from the start.

**Reviewer model — LOCKED: gpt (ChatGPT).** Validated by current (May 2026) practice — using GPT as a "tougher reviewer to catch edge cases" is a documented, common workflow. Gemini is **out of the lineup.** Gemini's one real advantage (much larger context window) only matters for reviewing large codebases in a single pass — irrelevant at current project size. **Revisit later:** reconsider Gemini as reviewer only if/when a project grows large enough that gpt struggles to see all of it at once (likely a Level 3 / ambitious-project concern, not before).

**Dropped:** the standing required spec stress-test. Now **optional** — you invoke gpt for it only when a spec genuinely feels risky.

## The skill ladder (centerpiece)

Three levels. The progression measures **collaboration competence**, not coding independence.

### Level 1 — Supported
- ccode builds; gpt reviews. You read what was built.
- Your job: follow what ccode is doing well enough to describe the project's *structure* — which files exist, what each is for, what data flows where.
- **Gate to advance — three sub-gates: L1.1, L1.2, L1.3.** Each is a single ~1-hour cowork session: cold-read one file you have not pre-studied and give a *functional* walkthrough — what the file is for, its main parts, how data moves through it. The three ramp in difficulty (a light file → a page file → the hardest file) and **interleave with the loop** — each cold-read sits at the start of a build, on a file that build will touch, so the gate adds no separate-track time. L1 clears when all three sub-gates are in.
  - **Functional depth, not mastery.** Enough to brief and sanity-check ccode on a change to that file — not enough to have written it yourself. The mastery bar is *learning from AI how to code*; this gate is *learning to direct it*. Cleared with only light prompting from cowork.
  - **Repeatable, never a marathon.** One file, one hour. A miss is not an ordeal — it is "run it again next session, another file." No sub-gate, and no walkthrough block, should run past ~2 hours; if it does, the gate is mis-sized, not you.
  - **Capped at three.** Three stripes, then the belt. More sub-gates than that rebuilds a ten-file marathon with decimal points.
  - **Graded per response.** Each response in the cold-read gets a letter grade, for clear per-piece signal — see *Gate grading scale* below.
- *Transferable principle: a gate certifies a floor you can stand on, not a ceiling you've mastered. A gate you cannot clear in about two hours is mis-sized.*

### Level 2 — Spot & Direct
- ccode builds; gpt reviews; **you also review.**
- Your job: look at what ccode produces and catch when it doesn't match what you wanted. Articulate the issue clearly enough that ccode can fix it.
- **Gate to advance:** your spot-checks find real issues that gpt's review also flags. Track this — three projects' worth of signal, not a one-off.

### Level 3 — Lead
- You set the spec; ccode implements; gpt second-passes risky areas.
- Your job: decide tradeoffs, choose where rigor is needed, direct the architecture. Implementation is still ccode.
- Optional spec stress-test available if you want it.
- **Gate to advance:** open — calibrate from real practice.

The ladder *is* your skill-progression tracker — progression is part of the process, not a hope.

### Gate grading scale

Added v0.5 (May 22, 2026). During a cold-read gate (the L1 sub-gates today), cowork grades **each response** the builder gives — a clear, per-piece signal of where that chunk of the file landed.

- **Letter grades on the standard ten-point scale.** A = 90–100, B = 80–89, C = 70–79, D = 60–69, F = below 60.
- **A passing grade (A, B, C, D) reports the letter only** — no percentage. The piece cleared; the letter is signal enough.
- **A failing grade (F) reports the letter and the number** — e.g. `F (54%)`. A miss gets the precise figure, so how far short it fell is unambiguous.
- **The grade rides with the feedback — it does not replace it.** Every graded response still gets the substantive read: what landed, what was off, why. The letter summarizes; the correction teaches. Grading stays constructive — the point is the next rep, not a verdict on the builder.

The per-response grades are **formative signal, not the gate's verdict.** Whether a sub-gate clears stays the holistic call defined above — a functional cold-read demonstrated with only light prompting. The grades show *where the work sits* across the file; the clear/not-clear judgment weighs the whole.

*Transferable principle: a grade is feedback on a rep, not a label on the learner.*

## The loop (replaces the old 5 phases)

```
Idea → Spec sketch → Build → Review (level-dependent) → Fix → Ship → Ledger entry
```

No phase numbering. No approval-gate vocabulary. Just the loop.

## The risk overlay (second dial)

- **Normal** — most projects. Run the loop at your current skill level.
- **Elevated** — project touches auth, real user data, money, or other people's information. Rigor bumps **back up** regardless of skill level:
  - gpt review always on.
  - Spec stress-test on.
  - You do not skip the review step even at Level 3.

## Momentum rules

- **v1 = smallest finishable thing.**
- **One review pass.** Review → fix → done. A second round *only* if the first found something Critical. No infinite loops.
- **Spec is a sketch, not a novel** — timebox it (a session or two, not a week).
- **Ship v1, then consider v1.5.** No gold-plating v1.

### Note on the v1 time bound — calibrate, don't guess
There is **no fixed fortnight rule yet.** Your real build pace is unknown — there's no finished project to measure against. The **Comeback Tracker v1 is the calibration run:** don't enforce a bound on it, just *time it honestly*, idea to ship. That number becomes your real v1 bound, and every project after is measured against observed data, not a guess. (Instrumentation principle: don't estimate the pace — observe it.)

## Ceremony — what stays, what goes

**Kept (light):**
- **Spec sketch** — good practice + a thinking tool.
- **Re-orientation note** — context loss across sessions is a real solo problem; keep a short one.
- **Fix List per project** — your *instrumentation*. Records where bugs actually got caught.

**Cut entirely:**
- Sign-off declarations
- Accepted-tradeoffs logs
- Artifact-invalidation rules
- Post-fix decision tree
- Formal phase numbering (1 / 1.5 / 2 / 3 / 4 / 5)

## Self-pruning

You can't A/B test the method on a complex-enough project — so don't. **Instrument it instead.** After each project, the Fix List shows *where bugs were caught*:
- A step that catches real bugs earns its place.
- A step that catches nothing across ~3 projects gets cut.

Let the method's own track record keep pruning it.

## The skills ledger

Apply the Comeback Tracker concept to your own learning. After every project, log:
- What was new this project.
- What you genuinely understood vs. copied.
- Where bugs got caught (feeds self-pruning).
- Whether you've hit the gate to level up.

Baseline = "today, total beginner." Progress = gates cleared + the redundancy you no longer need.

## Settled vs. still open

**Settled:** name (Higgins Method) · callsigns (cowork / ccode / gpt) · separate-model reviewer from Level 1 · reviewer model = gpt, Gemini out of the lineup (revisit only at large project size) · v0.4 ladder gates (L1 = three sub-gates L1.1–L1.3, functional cold-reads → spot-check signal across 3 projects → open).

**Still open:**
- v1 time bound — deliberately deferred until the Comeback Tracker calibration run produces a real number.
- L3 gate — deliberately open; calibrate from real practice once L2 is cleared.

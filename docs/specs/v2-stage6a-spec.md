# Highland Games Tracker — Stage 6a Spec Sketch (v1)

**Date:** 2026-05-24
**Skill level:** L1 — Supported (L1 sub-gates paused for the rest of v2)
**Project risk:** Normal — the low-to-moderate end (a presentation change to a shipped feature; the only new stored value is a small sound-preference flag)
**Repo:** `~/dev/highland-games-tracker` — on `main`, tagged `v2.0.0-stage5b`
**Design source:** `v2-plan.md` (Stage 6 · the celebration-card visual-design Open Item) · the 2026-05-24 card-lift planning conversation

---

## What this is

Stage 6 of the v2 build is the launch-polish basket — the celebration-card visual lift, a cross-device smoke test, Cloudflare Web Analytics, the `v2.0.0` tag, and the GitHub release. This sketch is **Stage 6a**: the first and largest piece of the card lift — the experiential lift of the **throws PR celebration card**.

Today the PR card is a plain white card. Stage 6a turns the throws PR card into a *moment*: a Highland Games field background, a cinematic cut-scene of the throw's implement, audio, and a measuring reveal. The card's content fields and 4:5 aspect ratio (settled in the Stage 4 design, confirmed correct in the Stage 5 wrap) do not change — this is the "visual feel" pass `v2-plan.md` deferred.

*(The "Stage 6a" name is a spec-level call — the card lift sub-divides, and this is the throws PR card piece. Rename at spec review if you'd rather.)*

## Why the card lift is sub-divided

The celebration-card lift is too big for one build, and the card types diverge (decided in the 2026-05-24 planning conversation):

- **Throws PR card** — the full cut-scene treatment. *(This sketch — Stage 6a.)*
- **Lift PR card** — its own separate treatment. Later.
- **Goal cards** — throws and lifts share one package; this is where the confetti goes. Later.
- **Awesome Day card** — its own treatment. Later.

6a is first because it establishes the **cut-scene mechanism** the later card pieces draw on, and the throws PR card is the one a brand-new athlete is most likely to hit and share.

## The cut scene — two motifs

The throws PR card opens with a cut-scene animation of the throw's implement. "Event-specific" resolves to **two motifs**, not eight bespoke animations:

**Distance motif** — Braemar Stone, Open Stone, Heavy Hammer, Light Hammer, Heavy Weight for Distance, Light Weight for Distance. Beats:

1. The implement arcs out across a Highland Games field.
2. It lands — the weight-clang sound.
3. A tape measure runs out along the ground and reveals the distance — the PR mark.

The implement is a swappable **skin**: a stone, a hammer, a weight.

**Height motif** — Weight over Bar, Sheaf Toss. These are scored by bar height, not ground distance, so the distance beats do not fit. Beats:

1. The implement arcs up toward a horizontal **bar**.
2. It clears the bar and lands beyond it — the landing sound.
3. **The bar is the ruler** — the bar sits at the cleared height with the height marked on it; that is the PR mark. No separate measuring tool is invented for the card.

The implement skin: a weight, a sheaf.

The two motifs are the same sequence — throw, measure, reveal the mark — one horizontal, one vertical. The mechanism is one parametrized thing: `(motif, implement skin)`.

## Stage 6a scope — the buildable chunk

1. **The Highland Games field background** (`session.js`, `styles.css`). Replace the throws PR card's white background with a treatment that reads as a Highland Games field. The app already ships `grass-field.jpg` (carried forward from v1's See the Gap). The card content — headline, event, mark, the was-line, the meta lines, the wordmark — must stay fully legible over it; contrast is the builder's to handle.

2. **The cut-scene mechanism** (`shared.js`, `session.js`). When the throws PR card fires, a short cut-scene animation of the throw's implement plays as the card resolves. The mechanism is one parametrized thing — `(motif, implementSkin)` — **architected for both motifs (distance and height) and swappable implement skins from the start**, so later skins and the height build slot in without rework.

3. **The distance motif + the stone skin — built in 6a** (`session.js`, `styles.css`). 6a builds the distance motif's rendering in full and ships **one** implement skin: the **stone** (covers Braemar Stone and Open Stone). The beats are the three under "Distance motif" above, ending with the tape-measure reveal.

4. **The height motif — specified, built later.** The height motif is fully designed in this spec (the "two motifs" section, Resolved decision 4) so the mechanism is architected to carry it. Its *rendering* — the bar, the over-the-bar arc, the bar-as-ruler reveal — is a fill-in build, **not 6a**.

5. **The audio plumbing** (`session.js`, `styles.css`). A sound layer on the throws PR card: a play trigger when the cut-scene fires; a **sound on/off toggle** on the celebration overlay; **sound off by default**; the preference persisted in a standalone `localStorage` flag (not part of the v2 data blob or `profile`). Built against placeholder/silent audio files at fixed known paths — the card is fully built and testable now; the real clips (a "Big throw!" shout, a weight-clang) drop into those paths once recorded. Playback is gesture-initiated (the card fires from Save Session, or the View Celebrations replay click), so it is within browser autoplay policy.

6. **Un-skinned-event fallback** (`session.js`). *(Spec-level call.)* Until the hammer and weight-for-distance skins exist, a PR for those events — and any height-event PR before the height build — still fires a card. It gets the new field background and the tape-measure reveal **but skips the implement cut-scene** (no wrong implement, no broken animation) until its skin lands. The card is never worse than today.

7. **Scope isolation** (`session.js`). Only the **throws PR card** takes the rich path. Lift PR cards, all Goal cards, and the Awesome Day card keep their current rendering, untouched. The build path branches cleanly on "this is a PR card and its event is a throw."

8. **Tests** (`shared.js`, `tests.js`). The animation, the field visual, and audio playback are verified by the cowork browser smoke test (build-and-react). The unit-testable logic: the motif/skin selection (a throw event → the right motif + implement skin; a height event → the height motif; an un-skinned event → the fallback); the sound on/off state and its persistence; and that the rich path is gated to the throws PR card only (a lift PR, a Goal, or an Awesome Day card does not take it). The selection logic is a pure `shared.js` helper, `session.js` a thin layer over it — the `detectMilestones` / 5a-5b-helper pattern.

## Acceptance criteria

Stage 6a is done when all of these are true:

- [ ] When a throws PR card fires, the card shows the Highland Games field background and plays the distance-motif cut-scene with the stone implement, ending in the tape-measure reveal of the mark.
- [ ] The cut-scene mechanism is parametrized by `(motif, implementSkin)` and architected to carry the height motif and additional skins without rework.
- [ ] A throw PR whose skin is not yet built shows the field-background card and the tape-measure reveal, with no implement cut-scene — never a wrong or broken animation.
- [ ] Sound is off by default; a toggle on the overlay turns it on; the preference persists across reloads in a standalone localStorage flag; the placeholder audio files do not error.
- [ ] The motif/skin selection lives in a pure `shared.js` helper with test coverage; `session.js` is the rendering layer.
- [ ] Lift PR cards, Goal cards, and the Awesome Day card render exactly as before — the rich path is gated to the throws PR card.
- [ ] `version` stays `2`; the milestone data, the `session.milestones[]` shape, and `showCelebrationQueue`'s contract are unchanged; no schema change beyond the standalone sound flag.
- [ ] Vanilla HTML/CSS/JS, no build step, no npm runtime dependency added.

## Explicitly NOT in Stage 6a

- The **hammer** and **weight-for-distance** implement skins — fill-in builds.
- The **height motif's rendering** — the weight-over-bar and sheaf-toss skins. The motif is *designed* here; it is built later.
- The **lift PR card**, the **Goal cards** (and their confetti), the **Awesome Day card** — separate later pieces.
- The **real audio files** — recorded and injected later; 6a ships silent placeholders.
- The rest of **Stage 6** — the cross-device smoke test, Cloudflare Web Analytics, the `v2.0.0` tag, the GitHub release.

## Known interim state (by design)

- After 6a only the **stone** animates. Hammer / weight-for-distance / height-event PRs get the field background and the tape-measure reveal but no implement cut-scene until their skins land (scope point 6) — expected, not a defect.
- Audio is **silent** — placeholder files until Oak's clips are recorded and injected. The plumbing, the toggle, and the off-by-default state are all real and testable now.
- A review should treat both as expected interim state.

## Resolved decisions

Settled in the 2026-05-24 card-lift planning conversation. Spec-level calls are marked.

1. **Full lift, not minimal polish.** The celebration cards are the app's share-virality surface — every shared card advertises the app — so the visual lift is worth real investment.

2. **Confetti is not on the PR card.** It moves to the Goal cards (a "you hit your target" gesture). The PR card opens with an implement cut-scene instead.

3. **The cut-scene is event-specific, in two motifs** — distance and height — with swappable implement skins. Not eight bespoke animations.

4. **The bar is the ruler** (height motif). Weight-over-bar and sheaf-toss are scored by bar height; the measure beat is the bar at the cleared height with the number on it — no separate measuring tool.

5. **Sound off by default**, with a toggle on the overlay. The audio plumbing is built now; the real clips are injected later.

6. **Phasing.** The cut-scene mechanism (architected for both motifs) + the distance motif + the stone skin ship first (6a). Other distance skins, and the height motif's rendering, fill in after.

7. **Scope: throws PR card only.** The lift PR card is a separate later treatment; the Goal cards are a single throws-and-lifts package (later, with the confetti); the Awesome Day card is later.

8. *(Spec-level.)* **Un-skinned throw events** fall back to the field card + tape measure with no implement cut-scene until their skin is built.

## Tech notes (decided)

- Vanilla HTML/CSS/JS, no build step — held. The cut-scene and tape-measure animations are hand-rolled SVG + CSS. No npm runtime dependency. (Confetti — a Goal-card concern, not 6a — is the only place a single vendored MIT file might later be weighed.)
- The celebration cards live in `session.js` — the `showCelebrationQueue` queue and the card builders — and `styles.css`. 6a branches the PR-card build path; it does not change `showCelebrationQueue`'s signature or the milestone data.
- **The motif/skin selection is a pure helper in `shared.js`** — DOM-free, unit-testable — the same pattern as `detectMilestones`, `recomputeDerivedState`, and the 5a/5b helpers. `session.js` renders over it.
- No schema change. The sound preference is a **standalone localStorage flag**, not part of the v2 data blob or `profile`. `version` stays `2`.
- Audio via the HTML5 `Audio` API; placeholder files at fixed paths so the real clips are a drop-in. The card fires from a user gesture, so playback is within browser autoplay policy.
- **The cut-scene must be short and ideally tap-to-skip.** It plays every time a throws PR card fires; it cannot become something the athlete waits through on every save. Keep it brief; a skip affordance is recommended.
- **Build-and-react.** The visual *feel* — the field treatment, the implement art style, the animation timing and easing — is iterated in code with cowork screenshots, not pixel-specified here. The spec fixes the *structure* (the beats, the two motifs, the scope, the plumbing); the feel comes together in the loop.

## Files Stage 6a touches

- `session.js` — the celebration-card build path branches for the throws PR card: the cut-scene mechanism, the field background, the audio trigger and the sound toggle, the un-skinned fallback.
- `shared.js` — the pure motif/skin selection helper.
- `styles.css` — the field background, the card restyle, the cut-scene and tape-measure animations, the sound toggle.
- `tests.js` — new coverage (scope point 8).
- **New asset files** — placeholder audio under `audio/`, and any SVG/image assets for the field and the stone implement. ccode adds whatever it creates.
- `index.html`, `progress.html`, `tests.html`, `app.js` — untouched.

## Risk note

Project risk is **Normal**, and 6a sits at the **low-to-moderate** end. It is a presentation change — it does not touch the milestone data or the schema, and the card still re-derives from `session.milestones[]`; the one new stored value is a standalone sound-preference flag, so there is no data-loss surface. What lifts it off "low": 6a is the first stage to modify a *shipped* feature's rendering (the Stage 4 celebration system), and animation plus audio carry browser-compat and performance surface.

The gpt review's focus:

- The rich path is **isolated to the throws PR card** — a lift PR card, a Goal card, and an Awesome Day card render exactly as before.
- The motif/skin selection is correct — each throw event maps to the right motif; a height event maps to the height motif; an un-skinned event maps to the graceful fallback (field card + tape measure, no cut-scene), never a broken or wrong-implement animation.
- Audio: sound is genuinely off by default; the toggle works and persists; nothing autoplays against browser policy; the placeholder files do not throw.
- The cut-scene cannot block or jank — short, ideally skippable; no performance cliff on save.
- No schema change; `version` stays `2`; the milestone data and `showCelebrationQueue`'s contract are untouched.
- The no-build / vanilla constraint held — no npm runtime dependency added.

## Open items

None blocking.

- The **visual feel** — the field treatment, the implement art style, the animation timing — is build-and-react, iterated with cowork screenshots. Not a spec item.
- The **un-skinned-event fallback** (scope point 6) is a spec-level call — override at review if you picture it differently.
- The **"Stage 6a" naming** is a spec-level call.
- The **sheaf landing audio** — a sheaf lands soft, not a metal clang; when the audio is recorded, the sheaf event wants a softer landing sound or leans on the shout alone. A height-motif fill-in concern, flagged here so it is not lost.
- Whether the cut-scene is **tap-to-skip** — recommended; builder/Oak call at review.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 6a of the Highland Games Tracker v2 build — the
first piece of Stage 6 (launch polish): the throws PR celebration
card lift.

Read these two files:
  - docs/specs/v2-stage6a-spec.md  (this spec — scope, acceptance
                                    criteria, resolved decisions, the
                                    two cut-scene motifs)
  - v2-plan.md  (repo root — Stage 6, and the celebration-card design)

The project is at ~/dev/highland-games-tracker, on main, tagged
v2.0.0-stage5b. Stage 6a lifts the THROWS PR celebration card from a
plain white card into a moment: a Highland Games field background, an
event-specific implement cut-scene, audio plumbing, and a tape-measure
reveal.

Build, in this order:
  1. The field background + the card restyle.
  2. The cut-scene MECHANISM — architected for both motifs (distance
     and height) and swappable implement skins — plus the DISTANCE
     motif rendering and the STONE skin (covers Braemar + Open Stone),
     ending in the tape-measure reveal.
  3. The audio plumbing — a sound on/off toggle on the overlay, sound
     OFF by default, the preference persisted in a standalone
     localStorage flag, built against placeholder/silent audio files
     at fixed paths. The real clips are injected later.

The HEIGHT motif (weight over bar, sheaf toss) is fully specified in
the spec — architect the mechanism to carry it — but do NOT build its
rendering or skins in 6a; that is a fill-in build. The hammer and
weight-for-distance skins are fill-in too. An un-skinned throw event
falls back to the field card + tape measure with no implement
cut-scene (spec scope point 6).

Only the THROWS PR card takes the rich path. Lift PR cards, Goal
cards, and the Awesome Day card render exactly as they do today —
leave them untouched.

Put the motif/skin selection in a pure shared.js helper (DOM-free,
unit-tested), the same pattern as detectMilestones and the 5a/5b
helpers; session.js (where showCelebrationQueue lives) is the
rendering layer.

Vanilla HTML/CSS/JS, no build step — hand-rolled SVG/CSS animation,
no npm runtime dependency. version stays 2; no schema change beyond
the standalone sound-preference flag.

Build to the spec's Acceptance criteria. Note the Resolved decisions —
do not relitigate them. This is build-and-react: cowork will
screenshot your pass and Oak will react on the visual feel, so an
honest first pass is what's wanted, not pixel-perfection.

Skill level: L1 — Supported. Reviewer: gpt.

Atomic commits, v1 style (feat:/fix:/chore:/refactor: prefixes, one
concern each — the background, the cut-scene mechanism + stone, the
audio plumbing, and the tests are natural separate commits). Do not
push — give me the push commands when the local commits are ready.
```

## Review prompt for the gpt review pass

```text
You are gpt — the Reviewer in the Higgins Method, a solo build system.
A build was done by ccode (Claude Code, a separate model); your job is
an independent cross-check. This is Stage 6a of the Highland Games
Tracker v2 project — the throws PR celebration card lift, the first
piece of Stage 6 (launch polish). Skill level: L1 — Supported. Project
risk: Normal — low-to-moderate (a presentation change to a shipped
feature; no schema change beyond a standalone sound-preference flag).

WHAT TO READ — attach these 7 files. The list is alphabetical to match
the file picker, and numbered so you know when all 7 are attached:

1. higgins-method.md — your Reviewer role, the L1 level, the
   one-review-pass rule.
2. session.js — the celebration cards: showCelebrationQueue, the card
   builders, the cut-scene mechanism, the audio toggle.
3. shared.js — the pure motif/skin selection helper.
4. styles.css — the field background, the card restyle, the cut-scene
   and tape-measure animations.
5. tests.js — the test suite.
6. v2-plan.md — Stage 6 and the celebration-card design.
7. v2-stage6a-spec.md — the Stage 6a spec. "Acceptance criteria" is
   the bar; "Resolved decisions" fix the design calls (do not
   relitigate them); "Risk note" says where to concentrate; "Known
   interim state" says what is expected rather than a bug.

If ccode created any new JS or CSS files for the cut-scene, attach
those too. The placeholder audio files do not need attaching.

Review the code itself — do not rely on ccode's build report. This
must be an independent read.

CONCENTRATE HERE
- The rich path is isolated to the throws PR card — a lift PR card, a
  Goal card, and an Awesome Day card render exactly as before.
- Motif/skin selection: each throw event maps to the right motif; a
  height event maps to the height motif; an un-skinned event maps to
  the graceful fallback (field card + tape measure, no cut-scene),
  never a broken or wrong-implement animation.
- Audio: sound is genuinely off by default; the toggle works and the
  preference persists; nothing autoplays against browser policy; the
  placeholder files do not throw.
- The cut-scene cannot block or jank — short, ideally skippable.
- No schema change; version stays 2; the milestone data and
  showCelebrationQueue's contract are untouched.

ALSO CHECK
- The motif/skin selection logic is a pure shared.js helper with test
  coverage; session.js is a thin rendering layer.
- The HEIGHT motif and the non-stone skins were NOT built (fill-in) —
  their absence is expected, not a defect.
- The no-build / vanilla constraint held — no npm runtime dependency.
- Whether the build meets each item in the spec's Acceptance criteria.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit.
  Critical = a wrong computation that breaks the card, an acceptance
  criterion unmet, or the rich path leaking into other card types.
- Be specific: file, function, what is wrong, why it matters.
- Separate real defects from style preferences. The visual feel is
  build-and-react and out of scope for the review — do not critique
  colors, spacing, or animation taste; review correctness.
- This is a personal/community vanilla-JS localStorage app at L1 /
  Normal risk — calibrate to that. Don't demand enterprise hardening.

METHOD CONSTRAINT
This is the one review pass. A second round happens only if this pass
finds something Critical. Give one complete review — findings by
severity, then a one-line verdict: ship as-is, ship after fixes, or
fix-and-re-review (Critical only).
```

Attach the listed files only — don't paste ccode's build report; gpt's review must be an independent read.

---

*End of sketch. Update only via cowork session.*

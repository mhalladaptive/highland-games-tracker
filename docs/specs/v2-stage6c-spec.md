# Stone & Standard — Stage 6c Spec Sketch (v2)

**Date:** 2026-05-27 evening, fully rewritten 2026-05-27 late after Oak's design pivot
**Skill level:** L1 — Supported (L1 sub-gates paused for the rest of v2)
**Project risk:** Normal — moderate (visual surface rework on the most-visible card; new image-on-image composition pattern; subjective acceptance criteria on visual outcome)
**Repo:** `~/dev/highland-games-tracker` — on `main`, past `v2.0.0-stage6b` and the prior 6c spec commits (`9aad66a`, `d27ed36`)
**Design source:** Oak's iPhone smoke test surfaced visual findings on the soft-grey throws PR card. An initial spec direction (relaxed silhouette + Saltire flag background + wave animation) was drafted and committed. Late 2026-05-27, Oak generated an ornate Highland Games-themed card design via GPT image gen, loved the result, and pivoted the entire 6c approach to a template-and-overlay model. This spec supersedes the prior direction.

---

## What this is

**Stage 6c replaces the throws PR celebration card's soft-grey presentation with an ornate Highland Games-themed template** — a richly composited piece of art (PR shield badge, parchment medallion, stone plaque, brass scroll banner, framed by thistles + laurel + misty mountains). The template is the visual container; the silhouette and all dynamic text overlay it as positioned HTML/CSS elements.

Scope is **throws PR cards only**, per the 6a scope-isolation rule. Goal cards, Awesome Day capstones, and lift PR cards keep their existing simpler presentations through v2.0 — they get the ornate treatment in v2.1 as part of the celebration-language extension. The Saltire flag + wave animation work from the prior 6c draft is **fully retired** and does not ship in v2.0; the committed `Images for Cards/saltire.png` becomes orphaned v2.x backlog material.

## Stage 6c scope

### Part A — Stage the template image

1. **Move `Images for Cards/pr-new-template.png` to `images/decorations/pr-card-template.png`.** Net-new directory; net-new asset filename. The template is Oak-generated via GPT image gen — a cleaned version with the silhouette and all text removed so HTML overlays place dynamically. Cowork-side mirror stays at `Images for Cards/pr-new-template.png` for reference.

### Part B — Move the refreshed WOB adaptive silhouette

2. **Move `Images for Cards/silhouette-weight-over-bar-adaptive.png` to `images/silhouettes/silhouette-weight-over-bar-adaptive.png`.** Replaces the shipped version with Oak's refreshed art (weight clearly above the bar). Use `git mv` if Git treats it as a rename; otherwise it's a delete + add of the same logical asset. The WOB able-bodied is unchanged — its composition was already correct.

### Part C — Rebuild the throws PR card DOM

3. **Restructure `buildThrowsPrCard` in `session.js`** to render the new template-based DOM:

   ```html
   <div class="celebration-card celebration-card--pr celebration-card--throw">
     <img class="card-template" src="images/decorations/pr-card-template.png" alt="" aria-hidden="true">
     <img class="throw-silhouette" src="images/silhouettes/silhouette-{implement}-{class}.png" alt="" aria-hidden="true">
     <div class="card-plaque">
       <p class="card-headline">PERSONAL RECORD</p>
       <p class="card-subhead">NEW PR ACHIEVED</p>
       <p class="card-event">{Event Name}</p>
       <p class="card-mark">{40'}</p>
       <p class="card-prev">was {previous mark}</p>
     </div>
     <div class="card-scroll">
       <span class="card-meta-line">{date}</span>
       <span class="card-meta-line">{games title — if competition}</span>
       <span class="card-meta-line">{location}</span>
     </div>
     <div class="card-wordmark">Stone &amp; Standard</div>
   </div>
   ```

   The audio toggle from 6a stays on the celebration overlay (not on the card itself), unchanged.

### Part D — CSS positioning the overlays inside the template regions

4. **Replace the entire 6a-era `.celebration-card--throw` ruleset in `styles.css`** with template-based positioning. The soft-grey card background (`#F4F4F4`), the bottom-right silhouette anchoring, the 74%/68% size constraints, the text flex layout — all of that is retired. New layout structure:

   ```css
   .celebration-card--throw {
     /* The card's aspect comes from the template image; no explicit
        background-color, no padding — the template fills the card and
        all content positions absolutely against its regions. */
     position: relative;
     background: none;
     padding: 0;
     overflow: hidden;
     /* Aspect handled visually by the template image; do not lock until
        we see how it reads. */
   }

   .card-template {
     position: absolute;
     inset: 0;
     width: 100%;
     height: 100%;
     object-fit: cover;
     z-index: 0;
     pointer-events: none;
   }

   .throw-silhouette {
     position: absolute;
     /* Position inside the medallion circle. Starting values; expect to
        nudge per template proportions once visible in the build. */
     left: 50%;
     top: 30%;        /* center of medallion is ~32-34% from top */
     transform: translate(-50%, -50%);
     width: 38%;      /* fits inside the circle without bumping edges */
     height: auto;
     max-height: 36%;
     object-fit: contain;
     z-index: 1;
     pointer-events: none;
   }

   .card-plaque {
     position: absolute;
     /* Over the stone plaque region — roughly the lower-middle band. */
     left: 50%;
     top: 64%;
     transform: translateX(-50%);
     width: 72%;
     z-index: 2;
     text-align: center;
     color: #3a2a14;   /* engraved-on-stone dark warm brown; adjust to taste */
     pointer-events: none;
   }

   .card-headline {
     font-size: 0.95rem;
     font-weight: 800;
     letter-spacing: 0.08em;
     margin: 0;
   }

   .card-subhead {
     font-size: 0.75rem;
     letter-spacing: 0.05em;
     margin: 0.1rem 0 0.3rem;
   }

   .card-event {
     font-size: 1.05rem;
     font-weight: 700;
     margin: 0;
   }

   .card-mark {
     font-size: 2.4rem;
     font-weight: 900;
     letter-spacing: -0.01em;
     margin: 0.15rem 0 0;
     line-height: 1;
   }

   .card-prev {
     font-size: 0.8rem;
     opacity: 0.75;
     margin: 0.15rem 0 0;
   }

   .card-scroll {
     position: absolute;
     /* Over the brass scroll banner at the bottom. */
     left: 50%;
     bottom: 4%;
     transform: translateX(-50%);
     width: 80%;
     z-index: 2;
     text-align: center;
     color: #3a2a14;
     font-size: 0.78rem;
     line-height: 1.35;
     display: flex;
     flex-direction: column;
     gap: 0.05rem;
     pointer-events: none;
   }

   .card-meta-line {
     /* Each metadata row on its own line in the scroll. */
   }

   .card-wordmark {
     position: absolute;
     left: 4%;
     bottom: 3%;
     z-index: 2;
     font-size: 0.7rem;
     font-weight: 700;
     letter-spacing: 0.06em;
     color: #c5a76b;   /* warm brass to match the scroll banner; adjust */
     pointer-events: none;
   }
   ```

   **All values are starting points, not locks.** The template's region proportions need to be matched visually; ccode is expected to nudge `top`, `width`, `height`, `font-size`, color values until each layer sits cleanly inside its region. Verify on every implement.

### Part E — Wordmark and future-icon placement

5. **Wordmark goes in the lower-left corner of the card**, outside the existing decorative elements (mountains, laurel, thistle frame). Plain-text rendering for now (CSS in Part D above). When a future Stone & Standard icon is designed, it sits next to or replaces the wordmark text in the same lower-left position — that's a v2.x extension, not 6C scope.

### Part F — Scope isolation: lift PR / Goal / Awesome Day cards unchanged

6. **No changes to the non-throws-PR card paths.** Lift PR cards still take the older simple `buildPrCard` path (no silhouette, no template). Goal cards (`buildGoalCard`) and Awesome Day capstones (`buildAwesomeDayCard`) keep their existing presentations. The ornate template extension to those card types is a v2.1 redesign concern, not 6C.

## Acceptance criteria

- [ ] `images/decorations/pr-card-template.png` exists and renders inside the throws PR card.
- [ ] On all 10 implement variants (5 pairs), the silhouette sits cleanly inside the medallion circle — centered, scaled to fit, no edge-bumping or weird crops. Per-implement nudges are acceptable if needed.
- [ ] The stone plaque region carries the dynamic text block in this order: `PERSONAL RECORD` headline, `NEW PR ACHIEVED` subheadline, event name, mark value (large), previous-mark line.
- [ ] The brass scroll banner at the bottom carries the date / games-title / location metadata, one per line. (Games title appears only for competition sessions.)
- [ ] Stone & Standard wordmark sits in the lower-left of the card, legible against the template's lower-left region.
- [ ] All text reads legibly against the template's background imagery; color choices need a contrast check against the parchment plaque and brass scroll specifically (those regions have varied tones).
- [ ] Refreshed WOB adaptive silhouette is at `images/silhouettes/silhouette-weight-over-bar-adaptive.png` and renders with weight clearly above the bar inside the medallion.
- [ ] No regression on lift PR, Goal, or Awesome Day cards (they keep their existing simpler presentations).
- [ ] The audio toggle from 6a still works on the celebration overlay (unchanged behaviour).
- [ ] `npm run lint` exits 0 and silent.
- [ ] `tests.html` runs green (no test changes expected — this is presentation-only).
- [ ] Mobile-emulated Playwright viewport screenshots (per implement, per class) show the card reading well.

## Explicitly NOT in Stage 6c

- **Goal card / Awesome Day / Lift PR card redesigns.** All three card types keep their existing simpler presentations through v2.0. The ornate template language extends to those types in v2.1.
- **Aspect ratio locks.** The template image's natural aspect carries the card; explicit aspect-ratio CSS is not part of 6C. Iteration possible post-build if mobile readability suffers, but that's a tuning step, not a 6C lock-in.
- **Animations.** No card-entry animation, no template-internal animation, no Saltire wave. 6C ships a static visually-rich card. Animation explorations are v2.1+.
- **The Saltire flag (`Images for Cards/saltire.png`).** Now orphaned for v2.0 — the template has its own background imagery. The file stays committed in `Images for Cards/` as v2.x backlog material; if a future stage finds a use (a settings page accent, a v2.x card variant, anything), it's available.
- **Stone & Standard icon.** The wordmark is text-only for now; an icon when designed lands in v2.x.
- **Per-card-image generation.** Each card is composited at runtime (template + silhouette + HTML text), not pre-generated per implement.
- **Profile page or Set page visual changes.** Still post-v2.0.

## Resolved decisions

1. **6c lands in v2.0** (decided 2026-05-27 evening). v2.0 launch waits until 6c ships.
2. **Template-and-overlay architecture** (decided 2026-05-27 late session). One static template image; silhouette and all text layer dynamically on top via positioned DOM. Lighter asset-side than per-card-image generation; cleaner code-side for dynamic values.
3. **Scope limited to throws PR cards** (decided 2026-05-27 late session). Goal / Awesome Day / Lift PR card redesigns are v2.1 polish, not v2.0 6c. The 6a scope-isolation rule carries forward.
4. **Scroll banner carries date / games title / location** (decided 2026-05-27 late session). Three metadata lines, one per row.
5. **Stone plaque carries PERSONAL RECORD + NEW PR ACHIEVED headers + event name + mark + previous-mark line** (decided 2026-05-27 late session).
6. **Wordmark + future icon go in the lower-left of the card** (decided 2026-05-27 late session). Outside the existing decorative elements.
7. **Silhouette placement: scale-to-fit, centered inside medallion** (decided 2026-05-27 late session). Per-implement nudge during build verification if any implement reads awkwardly.
8. **Saltire flag is orphaned for v2.0 but kept as v2.x backlog material** (decided 2026-05-27 late session). No use case in 6C; file stays in `Images for Cards/` as already committed.
9. **WOB able-bodied stays as-shipped** (decided 2026-05-27 late session, walked back from a brief "refresh both" position). Composition already correct at source resolution; only the adaptive refresh ships in 6c.
10. **Aspect ratio parked** (decided 2026-05-27 late session). Template's natural proportions drive layout; lock-in or mobile-specific variant is a post-6c consideration if needed.
11. **Media licensing carries forward.** Template asset is Oak-generated (his GPT image gen workflow) for the visual artwork; cowork-generated for utility assets like the now-orphaned Saltire. No stock or third-party imagery anywhere in the shipped path.

## Tech notes

- Vanilla HTML/CSS/JS, no build step. No new dependencies.
- No schema change, no migration, no storage touched, no test changes expected.
- The new `images/decorations/` directory is net-new; ensure it exists before the asset commit.
- The template image is a heavy asset (~3MB); not optimized in this stage. Compression / WebP conversion is a v2.x performance polish item, not 6c.
- Z-index layering, lowest to highest: template (0) → silhouette (1) → plaque text + scroll text + wordmark (2). Get this right and the rest follows.
- All overlay positions in Part D's CSS are starting points calibrated to the GPT-generated template's region proportions. They WILL need nudging once rendered. Plan on 1-2 design iterations.

## Files Stage 6c touches

**ccode-owned (in the 6c build commits):**

- `images/decorations/pr-card-template.png` — new asset (moved from `Images for Cards/pr-new-template.png`).
- `images/silhouettes/silhouette-weight-over-bar-adaptive.png` — replaced with refreshed art (moved from `Images for Cards/`).
- `session.js` — `buildThrowsPrCard` restructured for the new DOM (template img + silhouette img + plaque div + scroll div + wordmark div). The audio toggle plumbing is unchanged.
- `styles.css` — entire 6a-era `.celebration-card--throw` ruleset replaced with the template-based positioning rules in Part D.

**Cowork-owned (post-build `docs:` follow-up after 6c ships):**

- `v2-plan.md` — Status block updated to reflect 6c shipping with the new template direction; v2.1 backlog entries added for Goal card / Awesome Day / Lift PR card redesigns to extend the design language.
- `PICKUP.md` — Current state refreshed to post-6c.

## Risk note

Project risk is **Moderate**, with a few sources of uncertainty:

1. **Overlay position calibration.** The CSS starting values in Part D are educated guesses against the template's regions. They will not be perfect on first render. ccode should plan on iterating values to fit each region cleanly, and Oak's eyeball is the final arbiter.

2. **Per-implement silhouette fit inside the circle.** The existing silhouettes were composed for rectangular bottom-right anchoring. Some (wide hammer with its outstretched implement; tall WOB with vertical standards) may not fit a centered-in-circle layout as cleanly as others (stone, weight-for-distance). If any implement reads awkwardly, that's a per-implement CSS class nudge during build, not a scope expansion.

3. **Text legibility against the template imagery.** The plaque parchment, the brass scroll, the lower-left mountain background — these have varied tones. Text color (`#3a2a14` engraved-warm-brown is my starting point) needs a real contrast check against each region. If any region pushes WCAG AA below threshold, the text-color or background-tint of that region needs adjustment.

4. **Asset size.** The template PNG is ~3MB. Each celebration card render loads it. First-load cost is real; cached after that. Not a launch-blocker but worth a v2.x performance pass.

The codex review's focus:

- The template image renders inside the throws PR card and silhouette + all text overlay correctly inside their respective regions.
- All 10 silhouette variants fit inside the medallion without edge-bumping or crop awkwardness.
- The headline + subhead + event + mark + previous-mark text block sits cleanly inside the stone plaque region.
- The date / games-title / location metadata sits cleanly inside the scroll banner.
- The Stone & Standard wordmark is in the lower-left, legible against the template's lower-left region.
- Text contrast is adequate against the template's tones (WCAG AA where reasonable; mobile readability prioritized).
- 6a scope isolation preserved: lift PR / Goal / Awesome Day cards unchanged.
- The audio toggle on the celebration overlay still works.
- The defensive `--no-silhouette` fallback in `session.js` (lines ~945–960 in the 6a-shipped version) still handles missing-image cases — likely needs updating since the throws PR card now ALWAYS has a template, so the fallback logic should account for the new template structure, not just the silhouette.
- `npm run lint` exits 0; no test changes; `tests.html` still 371/371.

## Open items

- **Exact overlay positions** — left to ccode's first pass + Oak's eyeball iteration. The Part D values are first guesses against the template I have.
- **Text color tuning** — the engraved-stone brown (`#3a2a14`) and warm-brass wordmark (`#c5a76b`) are taste-locked starting points; Oak may want different.
- **Defensive fallback when the template image fails to load** — current 6a fallback handles missing silhouette by removing the img and adding `--no-silhouette`. The new card structure depends on the template being present; if it fails to load, the card collapses. Worth a defensive `card-template` `onerror` handler that adds a `--no-template` modifier and falls back to a simpler card style. Minor — not 6c-blocking, but ccode may add.
- **Future Stone & Standard icon** — placement reserved (lower-left, next to or replacing the wordmark text), specific design is v2.x.

## Handoff prompt for the next ccode session

```text
ccd, this is Stage 6c of the Stone & Standard v2 build — a full
visual rework of the throws PR celebration card. The soft-grey
card from 6a is fully retired. New direction: an ornate Highland
Games-themed template image with the silhouette and all dynamic
text layered on top as positioned overlays.

Read these files:
  - docs/specs/v2-stage6c-spec.md  (this spec — supersedes prior
                                    6c direction; scope, acceptance,
                                    starting CSS values)
  - docs/specs/v2-stage6a-spec.md  (the card-design contract 6c is
                                    iterating on; scope-isolation
                                    rule for lift PR / Goal /
                                    Awesome Day stays intact)
  - styles.css around line 1239     (the current 6a-era
                                     .celebration-card--throw rules
                                     to retire and replace)
  - session.js around line 941      (the current buildThrowsPrCard
                                     to restructure)

The project is at ~/dev/highland-games-tracker, on main, past
v2.0.0-stage6b and past the prior 6c spec commits (9aad66a,
d27ed36).

Build in this order — atomic commits, v1 style:

  1. Create images/decorations/ if it does not exist. Move
     Images for Cards/pr-new-template.png to
     images/decorations/pr-card-template.png.

  2. Move the refreshed WOB adaptive silhouette from
     Images for Cards/silhouette-weight-over-bar-adaptive.png to
     images/silhouettes/silhouette-weight-over-bar-adaptive.png,
     replacing the shipped version.

  3. Restructure session.js buildThrowsPrCard to render the new
     template-based DOM per spec Part C. The audio toggle plumbing
     from 6a stays unchanged on the celebration overlay.

  4. Replace the entire 6a-era .celebration-card--throw ruleset in
     styles.css with the template-based positioning rules in spec
     Part D. Starting values for overlay positions; nudge them as
     needed so each layer sits cleanly inside its template region.

  5. Verify each of the 10 silhouette variants renders well inside
     the medallion circle. If any implement reads awkwardly,
     per-implement CSS nudge.

  6. Verify text legibility against each template region —
     particularly stone plaque + brass scroll + lower-left wordmark
     position. Adjust text colors if any region falls below WCAG AA
     contrast.

Vanilla HTML/CSS/JS, no build step. No new dependencies. No schema
change. No test changes expected. npm run lint must exit 0 and
silent. tests.html should still pass 371/371.

Skill level: L1 — Supported. Reviewer: codex (per Higgins Method
v0.6 — codex inside VS Code in review-only mode).

Do not push — give me the push commands when the local commits are
ready.

If the spec's starting CSS values produce a result that reads
worse than what we ship today on any implement, stop and flag —
that's a sign the direction needs tuning before pushing.
```

## Review prompt for the codex review pass

```text
You are codex — the Reviewer in the Higgins Method. You are operating
in **review-only mode** for this pass. Read the listed files. Produce
findings classified by severity (Critical / Major / Minor / Nit). Do
NOT edit files, run write commands, commit changes, or otherwise
modify the repo. Your output is the review report only.

This is Stage 6c of the Stone & Standard v2 project — a full visual
rework of the throws PR celebration card from a soft-grey + silhouette
composition to an ornate Highland Games-themed template with
silhouette and text overlays. Skill level: L1 — Supported. Project
risk: Normal — moderate (subjective acceptance on visual outcome,
overlay-position calibration, text-contrast against varied template
regions).

WHAT TO READ — read these 5 files from the open VS Code workspace
(or, if running outside Codex, attach them in this order):

1. higgins-method.md — your Reviewer role, the L1 level, the
   one-review-pass rule, the v0.6 read-only guardrail.
2. styles.css — the new .celebration-card--throw / .card-template /
   .throw-silhouette / .card-plaque / .card-scroll / .card-wordmark
   rules. The 6a-era ruleset should be entirely replaced.
3. session.js around buildThrowsPrCard (line ~941) — the new card
   DOM structure: template img + silhouette img + plaque div +
   scroll div + wordmark div.
4. v2-stage6a-spec.md — for the design contract 6c is iterating on,
   especially the scope-isolation rule for non-throws-PR cards.
5. v2-stage6c-spec.md — this spec. Acceptance criteria is the bar.

Review the code itself — do not rely on ccode's build report.

CONCENTRATE HERE
- Template image (images/decorations/pr-card-template.png) renders
  as the card background; silhouette and all text overlay correctly
  inside their respective template regions.
- All 10 silhouette variants fit inside the medallion circle
  cleanly — no implement bumps the edges or crops awkwardly.
- The stone plaque region carries the headline + subhead + event +
  mark + previous-mark text block in the correct order, legible
  against the parchment.
- The brass scroll banner carries date / games-title / location
  metadata, one per line, legible against the scroll tones.
- The Stone & Standard wordmark is in the lower-left corner of the
  card, legible against the template's lower-left region.
- WCAG AA contrast on text against each template region (or close
  enough that mobile readability is preserved).
- 6a scope isolation preserved: lift PR cards still take the
  simple non-silhouette path; Goal cards and Awesome Day capstones
  unchanged. Confirm by checking those paths haven't been touched.
- The audio toggle on the celebration overlay still works.
- Defensive fallback handles missing template image (added
  `--no-template` modifier or equivalent so a failed template load
  does not produce a broken card).
- npm run lint exits 0; no test changes; tests.html still 371/371.

HOW TO REPORT
- Classify every finding: Critical / Major / Minor / Nit.
- Be specific: file, function, what is wrong, why it matters.
- 6c has subjective acceptance criteria — describe what you see in
  the rendered card visuals (open the page, inspect each card type)
  and let Oak judge the visual outcome. Do not block on "looks
  could be better" unless something is structurally wrong.

METHOD CONSTRAINT
This is the one review pass. A second round only on Critical. Give
one complete review — findings by severity, then a one-line verdict:
ship as-is, ship after fixes, or fix-and-re-review.
```

---

## Revision history

- **2026-05-27 evening** — first draft, post Oak's iPhone smoke test surfacing the silhouette-too-small + WOB-weight-position findings, with a soft-grey + Saltire flag background + relaxed silhouette + wave animation direction.
- **2026-05-27 late session** — three pre-handoff updates locking the open items: Saltire flag waves 5s then freezes via CSS keyframes; both WOB silhouettes refresh inside 6c; spec lands as a `docs:` commit before ccode picks up.
- **2026-05-27 late session (asset sourcing flip)** — Saltire asset shifted from Oak-generated to cowork-generated (programmatically via PIL polygon-fill) for license-risk reasons; filename simplified from `saltire-waving.png` to `saltire.png`.
- **2026-05-27 late session (WOB able-bodied scope walk-back)** — refresh-both decision walked back to refresh-adaptive-only after side-by-side eyeball confirmed shipped able-bodied composition was already correct.
- **2026-05-27 late session (full rewrite — template approach)** — Oak generated an ornate Highland Games-themed card design via GPT image gen, loved the result, and pivoted the entire 6c approach. The soft-grey + Saltire + wave-animation direction is fully retired. New direction: ornate template image (PR shield + medallion + stone plaque + brass scroll + thistle-and-laurel framing + misty mountain backdrop) with silhouette and all dynamic text layered on top via positioned HTML/CSS overlays. Scope tightened to throws PR cards only — Goal / Awesome Day / Lift PR card redesigns explicitly deferred to v2.1 polish phase per the existing v2.1 backlog thread. The committed Saltire becomes orphaned v2.x backlog material; the WOB adaptive refresh carries forward as the silhouette that drops into the medallion.

*End of sketch. Update only via cowork session.*

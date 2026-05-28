# Stage 6c follow-up — center the throws PR card wordmark

Small visual polish to the Stage 6c ornate throws PR card, surfaced
during Oak's v2.0 cross-device smoke test on 2026-05-28. Scope is one
CSS rule.

## What changes

The Stone & Standard wordmark on the throws PR ornate card currently
sits in the **lower-left**, in the dark mountain shadow below the
brass scroll banner. Oak wants it **bottom-center** instead — visually
balanced under the centered scroll banner rather than tucked into the
left corner.

## Scope (explicit)

- **In scope:** the wordmark on the throws PR ornate card
  (`.celebration-card--throw .card-wordmark` in `styles.css`).
- **Out of scope:** the legacy wordmark on lift PR / Goal / Awesome Day
  cards (`.celebration-card-wordmark` in the older rule block).
  Those keep their existing presentation per the Stage 6a scope
  isolation. Stage 6c ornate-template extension to those card types is
  still v2.1 polish, not this patch.
- No DOM changes. No JS changes. CSS only.

## The change

`styles.css`, line **1388–1401**.

**Before:**

```css
.celebration-card--throw .card-wordmark {
  position: absolute;
  left: 4%;
  bottom: 3%;
  z-index: 2;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #c5a76b;
  border-top: none;
  padding-top: 0;
  margin-top: 0;
  pointer-events: none;
}
```

**After:**

```css
.celebration-card--throw .card-wordmark {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 3%;
  z-index: 2;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #c5a76b;
  border-top: none;
  padding-top: 0;
  margin-top: 0;
  pointer-events: none;
  text-align: center;
}
```

The three relevant deltas:

1. `left: 4%` → `left: 50%` (centerline anchor instead of left-margin
   anchor).
2. New `transform: translateX(-50%)` to pull the element back by half
   its own width — the standard absolute-position-centering pattern.
3. New `text-align: center` — defensive, in case the element ever wraps
   to two lines (the wordmark is short enough today that it won't, but
   the rule costs nothing and keeps the alignment honest).

`bottom: 3%`, `z-index`, font and color rules all unchanged — the
wordmark stays the same warm brass colour and stays the same
vertical distance from the bottom of the card.

## Update the leading comment

The comment block immediately above the rule (lines **1383–1387**)
currently reads:

```
/* Lower-left wordmark in the dark mountain shadow below the scroll.
   Warm brass to echo the scroll banner. Reset the legacy wordmark's
   border-top + top padding — those decorate the 6a in-flow wordmark,
   but here it's a positioned overlay. Reserves space for a future
   Stone & Standard icon (v2.x) — icon slots in next to or replaces
   this text. */
```

Replace the opening descriptor:

```
/* Bottom-center wordmark in the dark mountain shadow below the scroll.
   Warm brass to echo the scroll banner. Reset the legacy wordmark's
   border-top + top padding — those decorate the 6a in-flow wordmark,
   but here it's a positioned overlay. The translateX(-50%) is the
   standard absolute-position-centering recipe — anchor by centerline
   then pull back half the element's own width. A future Stone & Standard
   icon (v2.x) sits to the side of or replaces this text. */
```

## Acceptance criteria

1. The Stone & Standard wordmark on a fresh throws PR card renders
   horizontally centered in the dark mountain region below the brass
   scroll banner.
2. The vertical position (distance from card bottom) is unchanged from
   shipped 6c — `bottom: 3%`.
3. Colour, font size, weight, and letter-spacing unchanged.
4. The wordmark on lift PR / Goal / Awesome Day cards is unaffected
   (those use the older `.celebration-card-wordmark` rule, not the
   `.celebration-card--throw .card-wordmark` rule).
5. Lint clean — `npm run lint` passes.
6. Test suite still green — `tests.html` shows 371/371 (no test
   changes; this is CSS-only).
7. Visual check on a real card — log a throw that beats PR for any
   throws event, watch the celebration fire, wordmark sits bottom-center.

## Files touched

- `styles.css` (one rule + the comment above it)

## ccode prompt

```
You are ccode — the Builder in the Higgins Method. Read
docs/specs/v2-stage6c-wordmark-spec.md and implement it.

Single CSS rule change to styles.css at lines 1388-1401, plus a small
update to the comment block at 1383-1387. CSS-only patch; no DOM, no
JS, no tests changed.

Atomic commit, v1 style. Suggested message:

  style(card): center throws PR card wordmark below scroll banner

  6c shipped the wordmark in lower-left (left: 4%, bottom: 3%) in the
  dark mountain region below the brass scroll. Oak's v2.0 smoke test
  flagged it for visual balance — the scroll banner is centered, the
  wordmark should sit under it, not tucked into the corner.

  Three delta to .celebration-card--throw .card-wordmark:
   - left: 4% → left: 50% (centerline anchor)
   - + transform: translateX(-50%) (absolute-centering recipe)
   - + text-align: center (defensive, in case wraps)

  All other properties unchanged. Lift PR / Goal / Awesome Day cards
  use the legacy .celebration-card-wordmark rule and are untouched.

  Spec: docs/specs/v2-stage6c-wordmark-spec.md
```

## codex review prompt

```
You are codex — the Reviewer in the Higgins Method. You are operating
in review-only mode for this pass. Read the listed files. Produce
findings classified by severity (Critical / Major / Minor / Nit). Do
NOT edit files, run write commands, commit changes, or otherwise
modify the repo. Your output is the review report only.

Files to read:
 - docs/specs/v2-stage6c-wordmark-spec.md (the spec sketch)
 - styles.css lines 1383–1401 (the changed CSS rule and the comment
   block above it)
 - tests.html (confirm no test changes are needed — this is a
   CSS-only patch; the existing 371 tests should still pass)

Check the patch matches the spec exactly: left and transform values,
new text-align rule, unchanged bottom / colour / font properties,
the comment block reflects the new position. Confirm the change is
scoped only to .celebration-card--throw .card-wordmark and does NOT
touch .celebration-card-wordmark (the legacy rule used by lift PR /
Goal / Awesome Day cards, which must remain unaffected per the Stage
6a scope isolation extending into 6c).
```

## Commit chain at end of patch

Two commits, atomic:

1. `style(card): center throws PR card wordmark below scroll banner`
   (the CSS + comment update — ccode)
2. `docs: Stage 6c wordmark center spec` (this file — cowork, landed
   alongside the build per the existing per-stage spec-with-stage
   pattern)

Order them spec-first if you're committing them in the same session,
build-second. Tag this patch within `v2.0.0-stage6c-patch1` or leave
it untagged and roll straight into the `v2.0.0` launch tag — your
call.

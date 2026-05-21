# Code Review Stage Two Highland Games Tracker

**Project:** Highland Games Tracker v2  
**Stage:** Stage 2 — Profile and Data Model  
**Reviewer:** GPT / Reviewer in the Higgins Method  
**Builder:** ccode / Claude Code  
**Skill level:** L1 — Supported  
**Project risk:** Normal  
**Review type:** One-pass independent cross-check  
**Date:** 2026-05-19

---

## Executive Verdict

**Ship as-is.**

After reviewing the initially attached Stage 2 files and then the later-attached `gap.js`, I found **no Critical or Major defects** against the Stage 2 acceptance criteria.

The original review had one blocking verification gap: `gap.js` was not attached, so the See the Gap consumer rename could not be confirmed. After `gap.js` was provided, that gap was resolved. `gap.js` correctly reads `data.prs` and `data.prMeta`, not `data.baselines` or `data.baselineMeta`.

---

## Files Reviewed

Primary specification and method files:

- `v2-stage2-spec.md`
- `v2-plan.md`
- `higgins-method.md`

Implementation files:

- `shared.js`
- `app.js`
- `gap.js`
- `index.html`
- `session.js`
- `styles.css`
- `tests.js`
- `gap.html`

---

## Review Focus

Per the Stage 2 handoff, the highest-risk surface was the v1 → v2 data migration, because a bug there could cost an athlete their saved training history.

Special attention was given to:

- `shared.js` schema migration from v1 to v2
- `baselines` → `prs` rename
- `baselineMeta` → `prMeta` rename
- Creation of `profile`, `goals`, `goalMeta`, and `userLifts`
- Migration idempotency
- Persistence after migration
- `userLifts` construction from v1 hard-coded lift baselines
- Backup validation for both legacy and new app names
- v1 backup import migration before saving
- Correct migration order in `loadData()`
- Full removal of runtime reads from `data.baselines` / `data.baselineMeta`
- First-launch profile modal behavior
- Adaptive class and tier taxonomy alignment with `v2-plan.md`
- Confirmation that `session.js` remained unaffected

---

# Findings by Severity

## Critical Findings

None found.

The migration path appears to meet the core safety requirements:

- v1 payloads are migrated to v2 shape.
- `baselines` are moved to `prs`.
- `baselineMeta` is moved to `prMeta`.
- `goals`, `goalMeta`, `profile`, and `userLifts` are added.
- v1 lift IDs are preserved in `userLifts`.
- Throws are excluded from `userLifts`.
- Baseline-less lifts are excluded from `userLifts`.
- Already-v2 data is not re-migrated.
- Migration persists when it runs.
- Imported v1 backups are migrated before save.

No data-loss, corruption, or acceptance-criterion-breaking defect was found.

---

## Major Findings

None remaining.

### Resolved Major Verification Gap: `gap.js` initially missing

**Status:** Resolved after `gap.js` was provided.

**Original issue:**  
The Stage 2 spec explicitly required the See the Gap consumer rename from `data.baselines` / `data.baselineMeta` to `data.prs` / `data.prMeta`. The first review package included `gap.html`, but not `gap.js`, so the See the Gap acceptance item could not be verified.

**Resolution:**  
After `gap.js` was attached, review confirmed that it reads from:

```js
const baselineRaw = data.prs ? data.prs[item.id] : null;
const baselineMeta = data.prMeta ? data.prMeta[item.id] : null;
```

This satisfies the Stage 2 consumer rename requirement for See the Gap.

---

## Minor Findings

### 1. Profile `weightSchedule` does not implement the plan's Male/Female default behavior

**File / function:** `shared.js` → `buildProfileFromFormValues`

**Issue:**  
The v2 plan says `weightSchedule` drives BCAA weight tables and that Male/Female athletes default to matching schedules, while Non-binary / Prefer not to say athletes pick explicitly.

The current implementation stores:

```js
weightSchedule: v.weightSchedule || '',
```

That means a user can select `male` or `female`, leave Weight Schedule as “Pick later,” and persist an empty schedule.

**Why it matters:**  
This is not a Stage 2 data-loss risk, and Stage 2 does not yet use the profile for downstream calculations. However, it is a small mismatch with the v2 plan and could leave incomplete profile data for later stages.

**Suggested fix direction:**  
Default empty `weightSchedule` to:

- `mens` when gender is `male`
- `womens` when gender is `female`
- empty for `nonbinary` or `unspecified`

This can be fixed now or deferred to the stage where profile data begins driving behavior.

---

## Nit Findings

### 1. Import confirmation still says “baselines”

**File / function:** `app.js` → `importData`

**Issue:**  
The confirmation text still says the import will replace current “baselines and sessions.”

**Why it matters:**  
This is acceptable for Stage 2 because the spec explicitly says not to rename user-facing Set Baseline strings yet. The underlying schema has moved to `prs`, but the visible UI language remains “baseline” until Stage 3 replaces the page.

**Recommendation:**  
No Stage 2 fix required. Revisit during Stage 3 when the Set Baseline page becomes Set PRs & Goals.

---

# Acceptance Criteria Check

## 1. v1 localStorage payload loads as v2

**Result:** Pass.

A v1 payload with `version: 1`, `baselines`, and `baselineMeta` is migrated to v2 shape:

- `baselines` → `prs`
- `baselineMeta` → `prMeta`
- `goals` present
- `goalMeta` present
- `userLifts` present
- `profile` present
- `version: 2`

---

## 2. Migration persists

**Result:** Pass.

The migration persists when it runs. A second `loadData()` reads already-v2 data. The legacy `baselines` key is removed from storage after migration.

---

## 3. Migration is idempotent

**Result:** Pass.

Already-v2 data is returned without being schema-migrated again. This satisfies the “running it on v2 data changes nothing” requirement.

---

## 4. v1 hard-coded lifts with baseline values become `userLifts`

**Result:** Pass.

The migration builds `userLifts` only from v1 lift items that have finite baseline values.

Confirmed behavior:

- Lift IDs are preserved.
- Names come from `ITEMS`.
- Protocols come from `ITEMS`.
- Unit is `lb`.
- `active` is `true`.
- Lifts without baselines are excluded.
- Throws are excluded.

---

## 5. Fresh install starts in v2 shape

**Result:** Pass.

Empty localStorage returns a fresh v2 shape.

---

## 6. Set Baseline still renders and saves correctly

**Result:** Pass.

`app.js` has moved to the new internal fields:

- Reads from `data.prs`
- Reads from `data.prMeta`
- Saves collected form data into `prs`
- Saves metadata into `prMeta`

The user-facing wording still says “baseline,” which is allowed by the Stage 2 spec.

---

## 7. See the Gap still renders correctly

**Result:** Pass after `gap.js` addendum review.

`gap.js` correctly reads:

```js
const baselineRaw = data.prs ? data.prs[item.id] : null;
const baselineMeta = data.prMeta ? data.prMeta[item.id] : null;
```

No remaining `data.baselines` / `data.baselineMeta` dependency was found in the reviewed `gap.js` file.

---

## 8. Log Session still works / remains unaffected

**Result:** Pass within reviewed scope.

`session.js` does not rely on the renamed baseline fields. No Stage 2 regression was found there.

---

## 9. Backup validation accepts legacy and new app names, v1 and v2 envelopes

**Result:** Pass.

`validateBackup()` accepts both:

- `comeback-tracker`
- `highland-games-tracker`

And both:

- `version: 1`
- `version: 2`

This satisfies the four-combination import requirement.

---

## 10. Imported v1 payload is schema-migrated before saving

**Result:** Pass.

`app.js` import flow migrates imported v1 payloads before saving, so localStorage lands in v2 shape.

---

## 11. Profile modal first-launch gating

**Result:** Pass.

The profile modal appears when `profile.setupCompletedAt` is absent. Once completed, the profile includes `setupCompletedAt`, so the modal does not reappear.

The modal is located on `index.html`, matching the Stage 2 decision that it fires only from the home page.

---

## 12. Tier dropdown show/hide and repopulation

**Result:** Pass.

The class/tier structure supports classes with no tiers and tiered classes for Masters and Adaptive divisions. The modal behavior repopulates tiers based on the selected class and hides the tier field when no tiers apply.

---

## 13. Adaptive class and tier taxonomy

**Result:** Pass.

The implementation includes the adaptive classes and tiers required by the v2 plan:

Adaptive classes:

- Para-Seated
- Para Standing Upper Limb Loss
- Para Standing Lower Limb Loss
- Para Standing Neuro/Muscular

Adaptive tiers:

- Open
- Masters 40+
- Senior Master 50+

This matches the Stage 2 taxonomy expectation.

---

# Tests Review

The included `tests.js` file contains direct coverage for the migration and schema behavior, including:

- Fresh v2 shape
- Corrupt JSON fallback
- v1 missing fields fallback
- v1 `baselines` moved to `prs`
- Missing `stoneWeights` filled
- Missing `sessions` filled
- Legacy games/location migration
- Migration idempotency
- v2 round-trip preservation
- Unknown future field preservation
- `ITEMS` sanity
- Stage 2 profile/class/tier coverage
- Backup validation combinations
- Import/migration path behavior

The tests align well with the Stage 2 risk surface. No missing test rose to the level of a required Stage 2 blocker.

---

# Reviewer Notes

This review was calibrated to the stated context:

- Personal/community vanilla-JS localStorage app
- L1 — Supported
- Normal project risk
- Stage 2 data-model slice
- One independent review pass under the Higgins Method

I intentionally did not require enterprise-grade hardening, broader architectural redesign, or Stage 3/4 behavior that is outside the Stage 2 slice.

---

# Final Verdict

**Ship as-is.**

No Critical or Major defects were found after the complete file set, including `gap.js`, was reviewed.

The only substantive follow-up is a Minor plan-alignment note around defaulting `weightSchedule` from Male/Female gender selection. That can be fixed opportunistically, but it does not block Stage 2 shipping.

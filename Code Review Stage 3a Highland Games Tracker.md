# Stage 3a Review — Highland Games Tracker v2

**Reviewer:** gpt / Mimir  
**Method:** Higgins Method, L1 Supported, one review pass. The Higgins rule is “Review → fix → done,” with a second round only if this pass finds something Critical.  
**Verdict:** **Ship as-is.**

I found **no Critical, Major, or Minor defects** against the Stage 3a spec. I found **one Nit**.

---

## Findings by severity

### Critical

**None found.**

No data-loss, data-corruption, or acceptance-blocking defect found in the reviewed files.

### Major

**None found.**

### Minor

**None found.**

### Nit

**Nit — `index.html` data-copy still says “baselines.”**

File: `index.html`  
Area: Data backup helper copy

The rewritten page is now “Set PRs & Goals,” but the backup text still says:

> Save a JSON file of all your baselines and sessions…

Why it matters: this is stale wording from v1/Stage 2 terminology. It does not affect behavior or data safety.

Suggested wording:

> Save a JSON file of all your PRs, goals, lifts, and sessions…

---

## Risk-surface review

### Unit-lock rule

**Pass.**

The spec requires a lift’s unit to lock once that lift has a PR, Goal, or session mark.

`liftHasMarks(data, liftId)` checks:

- `data.prs[liftId]`
- `data.goals[liftId]`
- every `session.marks[liftId]` array for at least one finite mark

That matches the Stage 3a risk requirement.

`buildLiftCard` uses that helper and disables the unit dropdown for saved lifts with marks. The title also correctly explains that conversion comes later in Stage 3b.

### Soft-delete

**Pass.**

The spec requires the card X to remove the card from the page, set `active:false`, and retain the `userLifts` entry plus historical marks.

The UI removes the card from the DOM. Then `applyFormSnapshotsToData` treats an active saved lift missing from the submitted snapshots as soft-deleted by setting `active = false`; it does not delete PRs, Goals, or sessions.

The tests cover this and explicitly verify PR and Goal preservation.

### New-lift ID assignment

**Pass.**

The spec requires temporary `new-N` ids to become stable unique ids on save.

`handleAddLift` creates temporary `new-N` ids only for unsaved cards. On save, `applyFormSnapshotsToData` replaces `status: 'new'` cards with an id from `crypto.randomUUID()` when available, with a random fallback. PR and Goal values are then written under the generated id, not the temp id.

Tests cover generated ids and active state.

### `applyFormSnapshotsToData` purity / mutation

**Pass.**

The function copies `prs`, `prMeta`, `goals`, and maps `userLifts` into new object copies before applying changes. It returns updated slices rather than mutating localStorage or the DOM.

It handles:

- throw PR write/delete
- throw Goal write/delete
- throw `prMeta` write/delete
- lift name/protocol trimming
- new-lift id assignment
- soft-delete by absence
- PR/Goal write/delete for lifts

This matches the requested pure data-rules role.

### 3a / 3b boundary

**Pass.**

The spec explicitly excludes the conversion engine from Stage 3a; Stage 3a should only lock units once marks exist.

I found no same-category conversion, no cross-category conversion blocking, and no historical mark rewriting. The shared unit data carries `direction`, but the code comments correctly say conversion rules live in Stage 3b.

---

## Acceptance criteria check

| Acceptance criterion | Result |
|---|---|
| Set Baseline page replaced by Set PRs & Goals | **Pass for `index.html`**. Page title/nav/form are now Set PRs & Goals. |
| Nav label reads Set PRs & Goals on all four pages | **Partially verifiable only.** `index.html` passes. The uploaded files did not include `session.html`, `gap.html`, or `tests.html`, so I cannot honestly verify those headers. |
| Eight throws show PR and Goal fields | **Pass.** `renderForm` iterates throw items only, and `buildThrowRow` builds PR and Goal slots for each throw. |
| Throw PR writes `prs` and date/location to `prMeta`; Goal writes `goals` | **Pass.** `applyFormSnapshotsToData` writes/deletes PR, Goal, and `prMeta` from throw snapshots. |
| Stage 2 / migrated v1 PR and Goal values load/display | **Pass.** `loadData` migrates v1 baselines to `prs`, fills v2 shape, builds migrated `userLifts`, and `renderForm` reads from `prs`, `goals`, and `prMeta`. |
| S&C section renders one card per active `userLift` | **Pass.** `renderForm` filters `data.userLifts` to `active` and builds cards. |
| `+ Add lift` creates a card; save creates stable id and `active:true` | **Pass.** Temporary ids are used only before save; generated ids are assigned in the data function. |
| X soft-deletes and preserves stored data | **Pass.** DOM removal plus snapshot absence becomes `active:false`; stored PR/Goal/session data is not removed. |
| Unit dropdown lists all 10 units in 4 optgroups | **Pass.** `UNIT_CATEGORIES` has weight/distance/time/count and `UNITS` has lb, kg, mi, K, m, yd, time, reps, rounds, cal. |
| Unit locks once PR / Goal / session mark exists | **Pass.** `liftHasMarks` checks all three sources; `buildLiftCard` disables the select. |
| Lift PR/Goal inputs accept number or time format | **Pass.** Lift inputs switch placeholder/input mode for time; `readLiftCardValue` parses time with `parseTimeToSeconds`, otherwise parses plain non-negative numbers. |
| Saving persists `prs`, `prMeta`, `goals`, `userLifts`; reload shows state | **Pass.** Submit loads current data, applies collected snapshots, saves merged result, and rerenders from saved shape. |
| Profile modal still behaves as Stage 2 | **Pass by inspection of retained profile flow.** The profile modal markup remains in `index.html`, and profile construction/defaulting remains in `shared.js`. |
| Log Session, See the Gap, Tests pages still load/work | **Partially verifiable.** `session.js` still uses the old hard-coded `ITEMS`-based session form, which matches the known interim state. I could not inspect `gap.html`, `tests.html`, or the actual page load in browser from the provided attachments. |
| Tests cover create / soft-delete / id assignment / unit-lock / throw PR+Goal / time formatting | **Pass.** The test suite includes coverage for those named areas. |

---

## Expected interim behavior, not defects

The Set page now uses `userLifts`, while Log Session still uses the v1 hard-coded lift list. The spec explicitly marks that as expected until Stage 4.

So these are **not bugs** in this review:

- A new Stage 3a lift cannot yet be logged in a session.
- A soft-deleted Stage 3a lift may still appear on Log Session until Stage 4.
- No PR auto-update, milestone firing, celebration cards, achieved-goal callouts, or unit conversion exists yet.

---

## One-line verdict

**Ship as-is.**

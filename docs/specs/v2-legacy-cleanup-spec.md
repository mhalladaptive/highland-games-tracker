# Stage 6a follow-up — retire the legacy `highland-games-tracker-v1`
# storage key

A small but **data-touching** patch surfaced during Oak's v2.0 launch-
prep run on 2026-05-28. Closes Finding 1 from the cross-device smoke
test.

## What's wrong today

Stage 6a renamed the app's storage namespace from
`highland-games-tracker-v1` → `stone-and-standard-v1`. The migration
in `shared.js:383-392` is conservative — it **copies** legacy → new
when the new key is empty, but **never removes the legacy key**. The
in-code comment is explicit:

> "It only ever *copies* — the old key is never removed — so the
> migration is non-destructive and safe to re-run."

That conservatism made sense pre-launch as a safety net. But now,
twelve days post-rename, every user who came across the Stage 6a
boundary is carrying two copies of their data:

- `stone-and-standard-v1` — current, kept fresh by every save
- `highland-games-tracker-v1` — frozen at the snapshot taken at first
  Stage 6a load

Two real symptoms:

1. **Test pollution (the failing tests on 2026-05-28).** Tests that
   call `removeItem(STORAGE_KEY)` then `loadData()` expecting fresh
   shape DON'T see fresh shape — `migrateStorageNamespace()` sees the
   now-empty current key and copies the legacy key forward into it.
   Two tests currently failing:
   - `loadData: empty storage => v2 fresh shape`
   - `fresh install profile: empty object with no setupCompletedAt
     triggers first-launch`

2. **User-data clutter.** Every Stage 6a-graduated user has dead
   storage they can't see and will never sync. Backup export only
   captures the current key, so the legacy key is silent dead weight
   that grows monotonically as the schema evolves.

## What changes

One new function in `shared.js`, one new test helper in `tests.js`,
two failing tests' setup lines updated, one new positive test for the
cleanup behavior. CSS untouched. DOM untouched. The migration's
existing copy-forward logic is untouched.

## Scope and risk note

This patch deletes real user-data. The risk is data loss if the
cleanup runs against an unverified or partial-shape current key. The
design choices below are all motivated by that risk:

- Cleanup only fires when the current key parses as **valid v2 data**
  (verifiable via the `parsed.prs && typeof parsed.prs === 'object'`
  check already used in `loadData`).
- Cleanup runs from inside `loadData()` AFTER successful parse and
  shape validation — never speculatively.
- Cleanup is wrapped in `try / catch` like `migrateStorageNamespace`
  is, so a private-mode / storage-disabled environment is silently
  tolerated.
- Cleanup is idempotent — if the legacy key is already absent, it's a
  no-op.

These guards mean the cleanup is mathematically safe: it can only
delete the legacy key when the new key is verified to hold a valid
v2 payload, i.e. when the legacy key is genuinely redundant.

## The change — `shared.js`

### Add the cleanup function

Insert immediately after `migrateStorageNamespace()` (around line 392,
before the existing `loadData` at line 394):

```js
// Stage 6a follow-up — retire the legacy highland-games-tracker-v1 key
// once the current key holds verified v2 data. Splits the cleanup off
// from migrateStorageNamespace() so the original copy step stays
// untouched, and so this function can run as a separate idempotent
// pass that retroactively cleans up users whose Stage 6a migration
// already ran (the original migrateStorageNamespace short-circuits
// when STORAGE_KEY is populated, so it never reaches a delete step
// for them).
//
// Caller contract: only invoke AFTER loadData has successfully
// parsed and validated parsed.prs as a v2-shape object. That's the
// signal the current key is genuinely good and the legacy copy is
// genuinely redundant.
function cleanupLegacyStorageKeys() {
  try {
    if (localStorage.getItem(STORAGE_KEY) === null) return;
    if (localStorage.getItem(LEGACY_STORAGE_KEY) === null) return;
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // storage disabled (private mode) — nothing to clean up
  }
}
```

### Wire it into `loadData`

`loadData()` at `shared.js:394-419` returns a verified-v2 `parsed`
object on the success path. Add one line at the end of that path,
just before `return parsed`:

```js
    if (migrateLegacyGamesLocation(parsed)) mutated = true;
    if (mutated) saveData(parsed);
+   cleanupLegacyStorageKeys();
    return parsed;
  } catch {
```

Why there: by the time control reaches that point, `parsed` has been
shape-validated AND `saveData(parsed)` has been called if any
migration mutated it. The current key holds verified v2 data; the
caller contract is satisfied; cleanup is safe.

Do NOT call `cleanupLegacyStorageKeys()` from the early-return paths
(`raw` falsy, parse error, non-v1/v2 shape). Those paths return
`freshData()` without guaranteeing the current key is populated.

## The change — `tests.js`

### Add a test helper near the top

Insert a small helper alongside the existing test scaffolding (top of
file, near where `STORAGE_KEY` is referenced):

```js
function clearAllStorageNamespaces() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}
```

### Update the two failing tests' setup

Change line **187** (test "loadData: empty storage => v2 fresh shape"):

```diff
- localStorage.removeItem(STORAGE_KEY);
+ clearAllStorageNamespaces();
```

Change the "fresh install profile" test's setup (locate via grep for
`fresh install profile` — same single-line swap from
`localStorage.removeItem(STORAGE_KEY)` to `clearAllStorageNamespaces()`).

Do NOT touch the other ~40 `removeItem(STORAGE_KEY)` calls — they're
each immediately followed by `setItem(STORAGE_KEY, ...)`, which means
the migration's short-circuit kicks in (current key non-null) and the
test fixture wins. Those tests are unaffected.

### Add a positive test for the cleanup behavior

Add immediately after the "loadData: empty storage" test (line 189),
in the same `loadData` group:

```js
test('cleanupLegacyStorageKeys: removes legacy key when current key is populated', () => {
  clearAllStorageNamespaces();
  // Seed: both keys present, current key holds verified v2 shape.
  const v2Shape = freshV2Shape();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v2Shape));
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({
    version: 2, baselines: { 'braemar-stone': 36 }
  }));
  // Act: loadData triggers the cleanup as a side-effect.
  loadData();
  // Assert: legacy key gone, current key intact.
  assertEqual(localStorage.getItem(LEGACY_STORAGE_KEY), null);
  assertTrue(localStorage.getItem(STORAGE_KEY) !== null);
});

test('cleanupLegacyStorageKeys: idempotent when legacy key is already absent', () => {
  clearAllStorageNamespaces();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(freshV2Shape()));
  // Act: legacy absent at start.
  loadData();
  // Assert: still absent, no errors.
  assertEqual(localStorage.getItem(LEGACY_STORAGE_KEY), null);
});
```

That brings the suite total to **373/373** (371 existing + 2 new).

## Acceptance criteria

1. `npm run lint` passes clean.
2. `tests.html` shows **373/373** green (was 371 + 2 new).
3. The two previously failing tests pass (`loadData: empty storage =>
   v2 fresh shape` and the `fresh install profile` one).
4. The new cleanup test passes — running `loadData()` with both keys
   present removes the legacy key and leaves the current key intact.
5. The new idempotence test passes — running `loadData()` with only
   the current key present is a no-op on the legacy key (stays
   absent).
6. Manual check on Oak's running app — load `index.html?v=<new>` in
   his Chrome. The legacy `highland-games-tracker-v1` key should be
   absent from `localStorage` after the load. (His current key stays
   intact — his real data.)
7. No DOM, no CSS, no celebration code touched. Strict adherence to
   the data-layer-only scope.

## Files touched

- `shared.js` — one new function + one new line inside `loadData`
- `tests.js` — one new helper + two existing test setup lines updated
  + two new tests

## ccode prompt

```
You are ccode — the Builder in the Higgins Method. Read
docs/specs/v2-legacy-cleanup-spec.md and implement it.

This is a data-touching patch (deletes a localStorage key under
explicit guards). Follow the spec exactly. Do NOT generalise the
cleanup, do NOT delete the legacy key from any path other than the
post-parse-success path inside loadData, do NOT touch the existing
migrateStorageNamespace copy logic. The conservatism is the point.

Atomic commit, v1 style. Suggested message:

  feat(storage): retire legacy highland-games-tracker-v1 key after v2 load

  Stage 6a's namespace migration copies highland-games-tracker-v1 →
  stone-and-standard-v1 but never removes the legacy key. Twelve days
  post-rename, every Stage-6a-graduated user is carrying a frozen
  duplicate of their data. Symptoms: (1) two tests.html tests fail
  because removeItem(STORAGE_KEY) then loadData() copies legacy data
  back into the current key, (2) user localStorage grows monotonically
  with dead data.

  Adds cleanupLegacyStorageKeys() in shared.js, called from the end of
  loadData's success path AFTER parsed.prs has been shape-validated
  and any schema-mutation save has run. Conservative guards: only
  fires when both keys are present AND current key parses as valid v2.
  Wrapped in try/catch like migrateStorageNamespace for private-mode
  tolerance. Idempotent; safe to run on every loadData call.

  Test infra: adds clearAllStorageNamespaces() helper. Updates the
  two "fresh storage" test setups to use it (the other 40+
  removeItem(STORAGE_KEY) call sites are followed by
  setItem(STORAGE_KEY, ...) and so are unaffected — left alone).
  Adds a positive test for the cleanup and an idempotence test.

  Suite: 371 → 373 passing.

  Spec: docs/specs/v2-legacy-cleanup-spec.md
```

## codex review prompt

```
You are codex — the Reviewer in the Higgins Method. You are operating
in review-only mode for this pass. Read the listed files. Produce
findings classified by severity (Critical / Major / Minor / Nit). Do
NOT edit files, run write commands, commit changes, or otherwise
modify the repo. Your output is the review report only.

Files to read:
 - docs/specs/v2-legacy-cleanup-spec.md (the spec sketch)
 - shared.js, focus on:
     - the new cleanupLegacyStorageKeys() function and where it was
       inserted relative to migrateStorageNamespace() and loadData()
     - the one-line addition inside loadData (just before
       return parsed on the success path)
     - confirm migrateStorageNamespace itself is UNCHANGED (the
       conservative copy logic still has its non-destructive
       guarantee; the new function adds cleanup as a separate pass)
 - tests.js, focus on:
     - the new clearAllStorageNamespaces() helper
     - the two updated test setup lines (loadData empty storage,
       fresh install profile)
     - the two new tests for cleanup behavior + idempotence
     - confirm the other ~40 removeItem(STORAGE_KEY) call sites are
       UNTOUCHED (those are followed by setItem and unaffected by
       the migration's copy-forward)

Look hard at the cleanup safety guards. This patch deletes user data.
The patch is conservative by design: the cleanup only fires when both
keys are present AND the current key holds verified v2 data. Confirm
there's no code path that could trigger the delete with the current
key in a partial / corrupt / fresh-data state. Confirm the try/catch
matches migrateStorageNamespace's pattern for private-mode tolerance.

Flag if:
 - Cleanup could fire before parsed.prs has been shape-validated.
 - Cleanup is called from any path other than the loadData success
   exit.
 - migrateStorageNamespace's copy behavior changed in any way (it
   should not have).
 - Tests don't cover the new behavior adequately.
 - The new tests could pass with the cleanup function not actually
   being called (would indicate the wiring into loadData is missing
   or stubbed).
```

## Risk overlay

Marking this patch **Elevated** per the Higgins Method risk dial:
real user-data touch (deletes a localStorage key). All design choices
above (guard order, post-parse insertion point, try/catch, idempotence)
follow from that. codex review is non-negotiable for this one even
if everything looks clean to ccode.

## Commit chain at end of patch

Two commits if Oak hasn't already committed the spec file alongside;
otherwise one:

1. `docs: legacy namespace cleanup spec` (cowork — the spec file, if
   not yet committed)
2. `feat(storage): retire legacy highland-games-tracker-v1 key after
   v2 load` (ccode — the shared.js + tests.js changes)

Codex reviews #2 against #1. Once clean, fold straight into the
`v2.0.0` launch tag pass alongside the wordmark patch already shipped
at 9018164.

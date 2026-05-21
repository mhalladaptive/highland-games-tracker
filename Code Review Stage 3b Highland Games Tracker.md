# Stage 3b Code Review Summary — Highland Games Tracker v2

## Verdict

**Ship after fixes.**

No Critical defects were found. The risky historical-data rewrite path appears correctly guarded and scoped: session marks are converted only for the changed lift, only when the unit actually changes, and other lifts/throws are left alone.

---

## Main Finding

### Major — saved-but-unmarked lift unit change can clear unsaved PR/Goal values

In `app.js`, the live conversion handler runs for any saved Weight/Distance lift:

```js
const liveConvert = !isNew && canConvertCategory;
```

But the spec says live conversion should apply only to **saved marked lifts**. For a saved lift with no PR, Goal, or session mark yet, the dropdown correctly remains fully editable. However, if the athlete types a new PR/Goal and changes the unit before saving, the handler recomputes from saved `null` values and clears the typed input.

**Recommended fix:**

```js
const liveConvert = !isNew && hasMarks && canConvertCategory;
```

Add one test confirming a saved-but-unmarked lift keeps typed PR/Goal values when the unit changes.

---

## What Passed

### `convertValue` looks correct

- Uses the exact requested factors.
- Rounds to one decimal.
- Rejects cross-category conversions.
- Rejects Time/Count conversions.
- Does not silently produce wrong numbers.

### Save-time conversion looks correct

- Converts every mark for the changed lift across all sessions.
- Converts each mark exactly once.
- Leaves other lifts untouched.
- Leaves throw marks untouched.
- Runs only when the lift’s unit changes.
- Stores converted values rounded to one decimal.

### UI checks passed

- No marks → full 10-unit dropdown enabled.
- Marked Weight/Distance → enabled and filtered to category.
- Marked Time/Count → disabled.
- Heading reads **“Strength and Conditioning Milestones.”**

### Tests are mostly strong

- Good coverage for `convertValue`.
- Good coverage for dropdown states.
- Good coverage for Save-time conversion negative cases.
- Missing only the saved-but-unmarked live-conversion edge case.

---

## Final Summary

**Stage 3b is structurally sound, including the historical rewrite path, but should not ship until the saved-but-unmarked live-conversion bug is fixed and tested.**

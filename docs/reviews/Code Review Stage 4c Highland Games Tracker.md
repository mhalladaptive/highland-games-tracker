# Stage 4c Code Review — Highland Games Tracker v2

## Findings by severity

### Critical

None found.

### Major

None found.

### Minor

None found.

### Nit

None found.

## Acceptance check

The build appears to meet Stage 4c’s acceptance criteria.

The recompute helper is present in `shared.js` and follows the spec’s core model: rebuild `prs`, `prMeta`, and `goalMeta` from session history; use max for higher-is-better events and min for `time`; clear entries when no remaining session supports them; and leave active `goals[event]` untouched. The tests cover higher-direction PRs, time-direction PRs, tie-breaking, PR-holder deletion, last-session deletion, goalMeta clearing, chronological first-goal achievement, and non-mutation of active goals.

Delete handling is implemented in `handleDelete`: after removing the session, it calls `recomputeDerivedState`, replaces `data.prs`, `data.prMeta`, and `data.goalMeta`, then saves. That matches the Stage 4c delete requirement.

Edit handling is implemented in `handleSubmit`: the edited session is replaced, its old milestones are captured, its new `milestones[]` are re-derived with `redetectMilestonesForEditedSession`, created milestones are diffed, global derived state is recomputed, and only created milestones trigger the card queue. Other sessions’ `milestones[]` are not rewritten.

The edited-session milestone baseline is built from chronologically prior sessions only, then passed through the 4b detection rule. That matches the spec’s “baseline as of immediately before that session” requirement.

The chain prompt is implemented after Goal cards when `chainPrompts` is enabled. It has the prompt text, a unit-aware input path, “Save goal,” and “Not now.” Saving writes `goals[event]`, recomputes derived state, saves, and refreshes the session list.

The Set-page achieved-goal callout is implemented inline at Goal fields. The condition is exactly `goalMeta[event].value === goals[event]`, and both throw rows and lift cards append the callout at the Goal input area.

The 4b new-session path remains the same core flow: `applyCelebrationUpdates` still handles new-session PR/goal/milestone persistence, and 4c layers chain prompts onto the queue by passing `{ chainPrompts: true }`.

Tests cover the requested 4c surfaces: recompute on edit/delete, delete fallback and clearing, goalMeta clearing, active-goal preservation, edited-session milestone re-detection, created-milestone behavior, chain prompt save/skip, and Set-page callout conditions.

## Verdict

**Ship as-is.**

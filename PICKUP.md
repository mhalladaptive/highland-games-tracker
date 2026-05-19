# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```
Picking up v2 work on Highland Games Tracker (~/dev/highland-games-tracker).
Context I want you to load before we start:

1. Read v2-plan.md from root to bottom — this is the full v2 design we
   landed in the 2026-05-19 design session. Most of it is non-negotiable
   product decisions; flag anything that reads as my recommendation vs.
   a locked-in decision before assuming.

2. Read SESSION_NOTES.md and skim at least the most recent entry. That's
   the journal of how we got here and the reasoning behind the design
   calls in v2-plan.md.

3. Current state: Stage 1 (Fork + Rebrand) is shipped and tagged at
   v2.0.0-rebrand on origin/main. Stages 2 through 5 are designed but
   not implemented. Latest commit on main should be one of the docs
   commits from the design session.

4. Open thread that didn't get locked: the shareable celebration card
   visual design (colors, typography, exact layout) — deferred to a
   build-and-react prototype when we hit Stage 4 implementation.

Where I want to start today: [LET CLAUDE KNOW what you want to do — Stage 2
implementation, more design conversation on something specific, a different
direction entirely, etc.]

Reminders about how I want to work, from the v1.x and v2-design sessions:

- Slow down on multiple-choice questions. Walk through your thinking,
  ask open questions, let me reach the right answer rather than picking
  from your menu.
- Atomic commits matching the v1 style (small, focused, descriptive
  commit messages). One concern per commit when possible.
- Teach mode — I'm learning vibe-coding and appreciate teachable
  moments noted naturally as we go.
- If you write code, also run the syntax check and confirm before
  committing.
- Don't push to GitHub on my behalf; hand me the push commands when
  the local commits are ready.
```

---

## Why a pickup prompt exists

Long design sessions load a lot of context. The decisions sit in the
conversation transcript, which evaporates when the session ends. The
plan and notes files persist that context in the repo so future-you (and
future Claude) can reconstruct it from artifacts, not memory.

When you start a new conversation tomorrow:

1. Paste the prompt block above into Claude.
2. Tell Claude what you want to work on today.
3. Claude reads v2-plan.md and SESSION_NOTES.md.
4. You're back where you left off without rebuilding context turn by
   turn.

Edit this prompt freely as the project evolves. The shape should stay
the same — load context → state today's goal → set the working norms.

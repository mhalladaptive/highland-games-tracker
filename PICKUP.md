# Pickup prompt

Paste-able prompt for restoring context in a fresh Claude conversation.
Copy the block below into a new session when you want to resume v2 work.

---

```text
Picking up v2 work on Highland Games Tracker (~/dev/highland-games-tracker).

YOUR ROLE — read this first. This is a Cowork session. Under the Higgins
Method, cowork is the PLANNER: cowork turns ideas into spec sketches and
hands them to ccode (Claude Code), who builds; gpt (ChatGPT) reviews.
Cowork does NOT write or edit the app's code.

Context to load before we start:

1. Read v2-plan.md root to bottom — the full v2 design from the
   2026-05-19 design session, mostly locked product decisions. Stages
   1 through 5 are shipped; Stage 6 (launch polish) is the only stage
   left — read that section, and the Status block at the top, closely.

2. Read SESSION_NOTES.md, newest entry first — the journal of how we
   got here.

3. Skim the spec sketches as the model for a cowork spec sketch — they
   live in docs/specs/. All are shipped — v2-stage2-spec.md through
   v2-stage4c-spec.md, plus v2-stage5a-spec.md and v2-stage5b-spec.md.
   (Stage 5a's spec carries Resolved decisions 6 and 7, added after the
   build from the cap and clamp fixes.)

4. Skim the highland-games-tracker entries in the skills ledger:
   ~/Documents/Obsidian Vault/Reference/Higgins Method/skills-ledger.md

Current state:

- The v2 feature build is COMPLETE. Stages 1 through 5 are shipped and
  tagged — v2.0.0-rebrand, v2.0.0-stage2, v2.0.0-stage3a / 3b,
  v2.0.0-stage4a / 4b / 4c, v2.0.0-stage5a, v2.0.0-stage5b. Stage 5 —
  the Progress page — shipped in two halves: 5a (the throws windowed
  vs-PR view, replacing v1's "See the Gap") and 5b (the S&C lifts view
  plus the Throws/Lifts toggle, with Snapshot and Best 3 modes).
- Stage 6 — v2.0 launch polish — is the ONLY remaining v2 work, and it
  is not yet planned in detail. v2-plan.md scopes it as: the
  celebration-card visual pass (deferred since the Stage 4 design), a
  cross-device smoke test (5a/5b were desktop-verified, mobile checked
  via CSS only), the v2.0.0 tag, the GitHub release, and Cloudflare
  Web Analytics. Cowork's likely next job: planning Stage 6.
- Tooling: the Biome linter is in the loop — `npm run lint` is a
  verification step. The test suite runs in-browser via tests.html
  (348 tests as of Stage 5b).
- L1 gate: PAUSED for the rest of the v2 build, per Oak's 2026-05-23
  decision — to resume after the project ships. Don't plan, surface,
  or push L1 sub-gate work until then. (Background: the gate is three
  ~1-hour sub-gates, L1.1 / L1.2 / L1.3, none cleared — see
  higgins-method.md and the skills ledger.)
- Repo state at the 2026-05-24 wrap: clean, on main, fully synced with
  origin — everything through Stage 5b shipped and tagged.

Where I want to start today: [STATE YOUR GOAL. Stage 5 is shipped —
the v2 feature build is complete. The only stage left is Stage 6,
launch polish, and it still needs planning: the celebration-card
visual pass, a cross-device smoke test, the v2.0.0 tag, the GitHub
release, and analytics. Cowork's likely next job is planning Stage 6
with you. State what you want.]

How I want to work:

- Keep the roles clean: cowork plans, ccode builds, gpt reviews.
- Slow down on multiple-choice questions. Walk through your thinking,
  ask open questions, let me reach the answer rather than picking from
  a menu.
- Atomic commits, v1 style (small, focused, descriptive). One concern
  per commit. (Guidance for ccode, carried in the spec.)
- Don't push to GitHub on my behalf; hand me the push and tag commands.
- Teach mode — I'm learning vibe-coding and appreciate teachable
  moments noted naturally as we go.
- Smoke-test hygiene: when the app is served locally for a smoke test,
  the browser can serve stale cached files — hard-reload (Cmd+Shift+R)
  each page before testing it.
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

# Stone & Standard

A no-account, no-database web app for tracking Highland Games training
sessions, competition marks, and the milestones that come out of them.
Plain HTML, CSS, and vanilla JavaScript. Open it in a browser and it
just works.

The name pairs the two shapes of the sport: the **stone** you throw for
distance and the **standard** — the vertical posts of the bar — you
clear for height.

## What it does

Four pages, each focused on one job.

- **Set PRs & Goals** — two reference marks per event: your **PR**
  (personal record, your best ever) and your **Goal** (what you're
  chasing). Both optional and independent. Throws are a fixed list;
  Strength & Conditioning Milestones are user-defined.
- **Log Session** — log what you threw or lifted on a given day,
  flagged training or competition. Competition sessions capture the
  Highland Games title (e.g. *Grandfather Mountain*) and per-section
  notes. Saving a session that breaks a PR or hits a Goal fires a
  celebration card.
- **Progress** — compare your best mark in a time window (last session,
  past 3 sessions, or year to date) against your PR, as a percentage.
- **Tests** — runs the built-in test suite against the data layer.

All data lives in your browser via `localStorage`. Download a JSON
backup to keep a copy or move to another device.

## Features

### PRs and Goals per event

Each event carries two reference marks:

- **PR** — personal record, your best ever for that event
- **Goal** — what you're chasing

Both are optional and independent. A new athlete might set Goals and
leave PRs blank. A masters athlete coming back from injury might have
PRs from their peak years and Goals that are their recovery targets.

### Strength and Conditioning Milestones

The S&C section is for the moments worth recording: a 1RM test, a
max-effort day, a planned PR attempt. You don't need to log every gym
day.

Lifts are **user-defined**, not a hardcoded list. You name your own
lifts ("Front Squat," "Trap Bar Deadlift," whatever your training
calls them) and pick how to measure them — pounds, kilograms, miles,
kilometers, meters, yards, time, reps, rounds, or calories. Every unit
covers a different training modality, so the section fits CrossFit
work, running, kettlebell, sled work, and traditional barbell training
equally well.

S&C sessions can log up to 10 attempts per lift to accommodate a full
1RM workup. Throws stay at 3 attempts (matches the format of
competition).

### Progress page

Lands on a **vs-PR comparison** by default — how close your current
marks are to your best. Three time-window filters at the top, matching
the competition/training/all pattern:

- Last session logged
- Past 3 sessions
- Year to date

For each event the page calculates the best mark within the selected
window and shows it as a percentage of PR.

### Celebration cards

When you save a session that breaks a PR or hits a Goal, the app
celebrates the moment. **PR cards** and **Goal cards** appear with the
mark, the event, the date, the Highland Games title (if it's a
competition session), and a wordmark — designed for screenshot and
share. A throws PR card carries an implement-specific athlete
silhouette as its hero. If a single session triggers more than one
milestone, an **Awesome Day** capstone card appears after the
individual cards as the trophy for great competition days.

Cards are persisted on the session record, so you can pull them up
later from Past Sessions — useful if you tapped through too fast at
the field and want to share them properly later.

After a Goal is hit, the app prompts you to set a new goal for that
event. Goals stop being static aspirational marks and become a moving
target you keep repointing forward — every achievement triggers the
next chase.

### Athlete profile

A one-time setup on first launch captures your name, gender, weight
schedule (which BCAA weight table you compete from — separable from
gender), class, and tier. All fields optional. The profile drives card
personalization and lets your competitive class get stamped onto each
PR record at the time it's set, so your record list tells the story of
your career arc as you move up through the classes.

The class dropdown carries the full Open list (Pro, Amateur A/B/C,
Novice, Lightweight, Junior), Masters and Lightweight Masters (with
M40 through M65+ tiers), and the full Adaptive class set from the
**Broken Caber Adaptive Athletics v3 framework** (May 2026): Para-Seated,
Para Standing Upper Limb Loss, Para Standing Lower Limb Loss, and Para
Standing Neuro/Muscular, with BCAA's Masters 40+ / Senior Master 50+
tier modifiers.

### Backup import

If you used the original *Comeback Tracker* fork or any prior version
of this app, your backup imports cleanly. The app accepts v1 and v2
backup files under any of its historical names, migrates the schema
forward, and maps your hardcoded lifts (Overhead Press, Deadlift, Hang
Clean, etc.) into user-defined entries with their names, protocols,
and IDs preserved.

## Who it's for

Highland Games athletes at any stage:

- Veterans tracking how their current marks compare to career peaks
- Athletes coming back from injury, working toward old PRs
- New athletes setting goal marks and chasing them
- Masters athletes navigating skill-tier and age-tier transitions
- Adaptive athletes competing in any of the four BCAA classes
- Anyone who wants a lightweight session log without a database or
  account

## Installation

The app is a static site. Two ways to use it:

1. **Open locally.** Clone the repo and open `index.html` in your
   browser. Everything works offline; your data lives in that browser's
   `localStorage`.
2. **Deploy as a static site.** GitHub Pages, Netlify, and Cloudflare
   Pages all serve this repo as-is. For GitHub Pages: enable Pages in
   repo Settings, point at `main` / root.

## Data and privacy

Everything is local to your browser. No telemetry, no server, no
account. The JSON backup and restore lets you move between devices
manually.

## Fork history

Forked from [`comeback-tracker`](https://github.com/mhalladaptive/comeback-tracker)
at the v1.4 commit (tagged in this repo as `v1.4-fork`). The original
lives on as the author's personal app; this repo is the
community-facing version, branded **Stone & Standard** at the v2.0
launch.

## Contributing

Issues and pull requests welcome. Keep changes small and focused — the
codebase deliberately avoids frameworks and build steps so any
throwing athlete who knows a little HTML can read and tweak it.

# Highland Games Tracker

A simple, no-account web app for logging Highland Games training sessions
and competition marks, then watching your progress over time. Plain HTML,
CSS, and vanilla JavaScript — no database, no backend, no signup.

## What it does

Four pages, each focused on one job:

- **Set Baseline** — record reference marks for each event (throws and lifts).
  Treat these as your personal records, your goal marks, or whatever number
  you want to measure your sessions against.
- **Log Session** — record what you actually threw or lifted on a given day,
  flagged as either training or competition. Competition sessions can
  include the Highland Games title (e.g. *Grandfather Mountain*) and
  notes for throws and lifts.
- **See the Gap** — for each event, compare your best mark since you started
  logging against your baseline. Filter by competition, training, or all.
- **Tests** — runs the built-in test suite against the data layer.

All data lives in your browser via `localStorage`. Download a JSON backup
to keep a copy or move to another device; restore the backup on the new
device to bring your sessions and baselines with you.

## Who it's for

Highland Games athletes at any stage of the journey:

- Veterans tracking how their current marks compare against career peaks
- Athletes coming back from injury, working toward old PRs
- New athletes setting goal marks and chasing them
- Anyone who wants a lightweight session log without a database or account

## Installation

The app is a static site. Two ways to use it:

1. **Open locally.** Clone the repo and open `index.html` in your browser.
   Everything works offline; your data lives in that browser's
   `localStorage`.
2. **Deploy as a static site.** GitHub Pages, Netlify, and Cloudflare Pages
   all serve this repo as-is. For GitHub Pages: enable Pages in repo
   Settings, point at `main` / root.

## Data and privacy

Everything is local to your browser. No telemetry, no server, no account.
The JSON backup and restore lets you move between devices manually.

A v1 backup file (from the *Comeback Tracker* fork ancestor) is currently
rejected by import — different `appName`. Cross-version import is on the
v2.x list.

## Roadmap

See [`v2-plan.md`](./v2-plan.md) for the full v2 plan. Headline items
coming after the strip-and-rebrand phase:

- **PRs and Goals per event.** Split the single baseline into two
  reference marks: a personal record and a goal. Each is independent and
  optional.
- **Progress** page (replaces See the Gap). Shows current best vs. PR and
  current best vs. Goal in one view, so an athlete can see both where
  they've been and where they're aiming.

## Fork history

Forked from
[`comeback-tracker`](https://github.com/mhalladaptive/comeback-tracker) at
the v1.4 commit (tagged in this repo as `v1.4-fork`). The original lives
on as the author's personal app; this repo is the community-facing
version.

## Contributing

Issues and pull requests welcome. Keep changes small and focused; the
codebase deliberately avoids frameworks and build steps so any throwing
athlete who knows a little HTML can read and tweak it.

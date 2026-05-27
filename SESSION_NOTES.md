# Session notes

Chronological dev journal. Most recent entry at the top. The formal v2 plan
lives in `v2-plan.md` — these notes are the working scratchpad and a record
of what got decided when.

---

## 2026-05-27 — Stage 6a shipped; v2.0.0-stage6a tagged; brand rename live

*Written by cowork at the session wrap. ccode shipped the build, cowork
ran the smoke test in its own sandbox, gpt reviewed, fixes landed,
v2.0.0-stage6a is tagged and pushed. Verify against `git log` and the
tag before trusting.*

The 6a build session — the last feature stage before v2.0 launch. Came
out of the 2026-05-26 design wrap with the 6a spec handoff-ready;
ended today with `v2.0.0-stage6a` tagged on `main` and pushed to
`origin/main`. The app surface, storage namespace, and backup envelope
now read as **Stone & Standard** for any new user; the
celebration card displays an implement-specific athlete silhouette on
a soft-grey card.

### The ccode build — nine atomic commits on a feature branch

ccode worked on a new branch `stage-6a-stone-and-standard` (the first
time the Higgins loop has used a feature branch — a quiet method
improvement worth banking). Nine atomic commits in the order the spec
prescribed:

1. `cb3eead chore: stage v2.0 card silhouettes in images/silhouettes/`
2. `472710a feat(celebration): soft-grey throws PR card with athlete silhouette hero`
3. `1892801 feat(brand): rename app surface to Stone & Standard`
4. `04fa1cc feat(brand): migrate storage namespace to stone-and-standard-v1`
5. `674a778 feat(brand): accept the stone-and-standard backup envelope`
6. `8dbec4b chore: rename package + rewrite README for Stone & Standard`
7. `203e161 test: cover the storage namespace migration`
8. `337aca9 feat(celebration): add the Weight Over Bar silhouette`
9. `8b5f830 docs: record the mid-build Stage 6a spec revision (WOB silhouette)`

The 8th and 9th commits are notable: a **WOB silhouette pair landed
mid-build**. Oak generated the Weight Over Bar silhouettes via gpt
during the ccode build window; cowork processed them, edited the spec
body to add WOB to the paired-implements set, and ccode picked up
those mid-build edits and committed them. The "Will WOB be 6a or 6b?"
question that cowork briefly created (cowork wrote a 6b spec for WOB
before learning ccode had absorbed it) resolved cleanly: WOB is in 6a.
ccode then renamed `silhouette-hammer.png` to `silhouette-hammer.png`
(single-variant carried) and the new `silhouette-weight-over-bar-
{class}.png` pair joined the `SILHOUETTE_PAIRED_IMPLEMENTS` set.

ccode also did one thoughtful UX rename not in the spec: the event
display name `Weight Over Bar` became **"Weight for Height"** — the
event id stays stable so saved data still resolves. Cleaner copy
("height" describes what's measured better than "bar" does); accepted.

ccode's self-verification was thorough: lint exit 0 and silent, the
storage migration verified in Node across all four idempotence/safety
cases, validateBackup verified across three legacy `appName` values
plus a rejection path. The only thing ccode couldn't run was the full
browser test suite (no headless runner wired up); ccode flagged that
explicitly and asked cowork to confirm via `tests.html`.

### The cowork smoke test — sandbox-driven, 45-item checklist

This was the first cowork smoke test run programmatically rather than
narrated. Cowork ran headless Playwright Chromium against the branch
state checked out in its sandbox (via `file://` URLs, no server
needed — confirmed by `grep` that no `fetch()` calls exist). The
checklist was derived from the spec's acceptance criteria, organised
into 12 sections (A–L) covering pre-flight, the test suite, brand
surface, profile setup, card visual lift, per-implement silhouette
selection, adaptive vs able-bodied switching, audio toggle, scope
isolation, storage migration, backup import backward-compat, and
branch state.

Results: **clean pass, no defects.**

- `tests.html`: **371/371** green (up from 348 at 5b ship — 23 new
  tests for selection, sound, migration, backup).
- Brand surface: all four pages display "Stone & Standard" in title
  + h1; zero residual "Highland Games Tracker" strings in user-facing
  body text.
- Silhouette selection matrix: **16 (event × class) combinations
  exhaustively verified.** Every one resolves to the exact expected
  `silhouette-*.png` filename — including WOB's classed pair.
- Card foundation: bg `rgb(244, 244, 244) = #F4F4F4` ✓, aspect ratio
  `4 / 5` ✓, wordmark and headline correct.
- Audio toggle: off by default, persists to `stone-and-standard-sound`
  localStorage, survives reloads, no console errors.
- Scope isolation: lift PR cards, goal cards, awesome-day capstone
  all render without the throw silhouette path.
- Storage migration: idempotent, copy-not-move, old key preserved.
- Backup backward-compat: accepts `stone-and-standard`,
  `highland-games-tracker`, `comeback-tracker`; rejects unknown.

One observation that's *not* a 6a defect but worth recording for a
future cleanup ticket: the page-level `grass-field.jpg` background
still loads on `session.html` (when `kind="competition"`) and
`progress.html`. The 6a celebration card correctly drops the
card-level field background per the silhouette pivot, but the
*page-level* background carries over from v1's "See the Gap" styling.
Mildly inconsistent with the "no track look" decision, deferred to
post-v2.0.

### The gpt review — a Critical that turned out to be a docs miss

Independent gpt review with the 7-file spec-prompt manifest. Three
findings: one Critical, one Minor, one Nit.

The **Critical** was the most interesting of the three. gpt flagged
that the code resolves Weight Over Bar to a classed silhouette, but
the review prompt's CONCENTRATE HERE bullet said "Weight Over Bar
maps to the un-skinned fallback (no image)." Code ≠ review prompt.
Under gpt's reading: Critical.

Under actual fact: docs miss on cowork's side. When cowork made the
mid-build spec edits to add WOB to the paired set, cowork updated the
spec body (selection-key bullet, scope point 5, acceptance criterion,
files-touched, revision history) but **missed updating the review
prompt at the bottom of the same spec.** The spec body and the code
agreed (WOB → classed silhouette); only the review prompt was stale.
gpt was reading the stale prompt as the criterion bar.

The fix was a 5-line spec edit: the review prompt's bullet was
rewritten to match the body. Code unchanged — it was always correct
vs. the spec body's acceptance criterion. The re-review note went to
gpt with the explanation; gpt confirmed the docs reconciliation
closes the Critical and revised verdict to **ship as-is**.

The **Minor**: README still had two residual "Highland Games Tracker"
phrasings (one in Backup import context, one in Fork history). Oak's
call: remove entirely. Both phrases rewritten — Backup import now
says "any prior version of this app"; Fork history says "branded
Stone & Standard at the v2.0 launch." No other user-facing surface
has any HGT mentions; the remaining mentions in `PICKUP.md`,
`v2-plan.md`, and `lint-setup-spec.md` are all internal docs with
necessary historical context (the rename is a fact those docs
describe).

The **Nit**: a duplicated `inChainPrompt = false;` assignment in
`showCelebrationQueue.renderCard()`. Pure cleanup; ccode handled it as
a 1-line `chore:` commit in a quick follow-up session.

**Lessons banked** (banking these in the dev journal because they're
recurring traps):

- **Mid-build spec edits are dangerous.** Cowork edits during a ccode
  build window can either land in the build (as the WOB additions
  did) or get missed entirely. Either is confusing. Better discipline:
  spec changes should land BEFORE ccode starts, or hold until after
  the build ships. The mid-build path can work but it requires both
  the spec body AND the review prompt to be updated, and a status
  check with ccode before the build commits. Cowork broke this rule
  this session.
- **The spec is two slabs of text.** The body and the
  review-prompt block at the bottom are separate documents within one
  file. Edits to one without the other create the kind of
  contradiction gpt flagged as Critical here. Treat them as paired
  surfaces — a spec change touches both.

### The ccode-on-main goof and the tag-forward recovery

ccode's nit-cleanup session opened with stale info: it thought the
current branch was `stage-6a-stone-and-standard`, but the working
copy was actually on `main` (Oak had already ff-merged the branch
into main and tagged `v2.0.0-stage6a` at the merge point). ccode
committed the nit fix directly to `main`, then fast-forwarded the
stage branch to match — leaving both pointers at the same commit,
just past the tag.

ccode's classifier correctly blocked it from autonomously rewinding
`main` and handed the recovery back to Oak. ccode framed the
recovery as "reset main back to before the nit, then ff-merge after
review" — but that was a misread of the topology. The cleaner fix
was the **opposite direction**: move the tag forward from `3feca04`
to `6c7b541` (the nit commit) so `v2.0.0-stage6a` includes the nit,
which is what gpt's "ship as-is if both fixes included" verdict
called for. Since the tag was local-only, moving it was free.

Recovery sequence:

1. `git tag -d v2.0.0-stage6a` (delete local tag at 3feca04)
2. `git tag v2.0.0-stage6a 6c7b541` (re-create at the nit commit)
3. `git push origin main --tags` (ff origin/main from 928a7bd → 6c7b541, push tag)
4. `git push origin stage-6a-stone-and-standard` (ff branch)

After that, both `main` and the stage branch pointed at `6c7b541`,
the tag was on `6c7b541`, `origin/main` was synced, and the v2.0
launch was structurally complete except for the housekeeping items.

The classifier doing its job here is worth a note: moving `main`
non-fast-forward is dangerous in general (could orphan unreachable
commits). Even though THIS specific move was safe (the orphan would
have been reachable via the stage branch), automated tooling can't
cheaply verify reachability across branches AND know intent. The
conservative default — "block, hand back" — is the right one. Cowork
diagnosed the topology and proposed the tag-forward fix because that
was the cleaner shape; ccode's framing was technically correct but
worked the wrong direction.

### What shipped in v2.0.0-stage6a

- The throws PR celebration card visual lift: soft-grey card
  (`#F4F4F4`), implement-specific athlete silhouette as hero, no
  animated cut-scene. Sound on/off toggle, off by default, preference
  in a standalone `localStorage` flag. Eight silhouettes staged at
  `images/silhouettes/` covering all eight throws events; stone, WFD,
  and WOB are paired adaptive/able-bodied, hammer and sheaf are
  single-variant (adaptive variants to fill iteratively post-launch).
- The app rename from Highland Games Tracker to **Stone & Standard**
  across surface (page titles, h1s, wordmarks, profile welcome, test
  banner), storage (`STORAGE_KEY` is `stone-and-standard-v1` with an
  idempotent copy-only migration from the old key), backup envelope
  (`validateBackup` accepts three legacy `appName` values, `exportData`
  writes the new one), and tooling (`package.json` name, README).
- Selection logic is a pure helper in `shared.js` —
  `selectThrowSilhouette(eventId, profileClassId)` — same pattern as
  `detectMilestones` and the 5a/5b helpers. `session.js` is a thin
  render layer; `buildThrowsPrCard` branches the celebration card on
  "this is a throw + has a silhouette descriptor."
- 371/371 tests pass; lint clean.
- One cosmetic UX win not in the spec: event display name "Weight
  Over Bar" → "Weight for Height."

### Where it stands

v2.0.0-stage6a is **shipped to `origin/main`**. The first feature
branch in the Higgins loop worked smoothly. The branch
`stage-6a-stone-and-standard` is preserved locally and on origin —
can be deleted whenever Oak wants (`git branch -d
stage-6a-stone-and-standard && git push origin --delete
stage-6a-stone-and-standard`), or left around as a reference until 6b
ships.

**Stage 6b is queued and ccode-handoff-ready.** Its spec
(`docs/specs/v2-stage6b-spec.md`) was rewritten this session to cover
the hammer + sheaf adaptive-pair completion (the WOB pair landed in
6a, making the original 6b-for-WOB scope obsolete). 6b adds `hammer`
and `sheaf` to the `SILHOUETTE_PAIRED_IMPLEMENTS` set, renames the
existing single-variant files to `-able-bodied`, adds the new
adaptive variants (already staged in `Images for Cards/`), updates
tests, and updates the cowork mockup. Low-risk presentation-only
stage.

After 6b: the Stage 6 housekeeping (cross-device smoke test,
`v2.0.0` release tag, GitHub release, Cloudflare Web Analytics).

### Housekeeping

- This SESSION_NOTES entry, the PICKUP refresh for the post-6a state,
  and the v2-plan.md Status update are one `docs:` commit. Run before
  bed or first thing tomorrow.
- The `stage-6a-stone-and-standard` branch deletion is optional
  cleanup; not blocking.
- L1 gate remains paused for the rest of v2.0 (per 2026-05-23
  decision); to resume after the project ships.
- The "athlete adds own photo to the celebration card before sharing"
  feature was discussed this session and parked for **v2.1**, alongside
  the existing v2.1 backlog items (Save-image button via Canvas API,
  native share sheet via `navigator.share()`). v2.1 becomes a coherent
  "share story" release.

---

## 2026-05-26 — Stage 6a spec'd handoff-ready; app renamed to Stone & Standard

*Written by cowork at the session wrap. A design + asset session — no
build, no ship — so this is a record of asset production, lessons, and
six locked decisions including a brand rename. Verify before trusting.*

A long session that began as "process the new stone silhouette pair onto
the soft-grey card" and ended with the 6a spec going from
blocked-on-an-open-question to ccode-handoff-ready, plus an app rename
to **Stone & Standard** added to 6a scope and rolling into v2.0.

### The adaptive silhouette tail-chase

The 2026-05-25 wrap left the stone-throw silhouette pair half-done: the
weight-for-distance pair existed (from earlier sessions, generated by
gpt as flat black silhouettes), and Oak had two rim-lit-photo source
images for the stone pair that he wanted processed into the same flat
silhouette format. Cowork wrote a gpt prompt to produce a "perfect"
adaptive source from those — locked the pose (mid-release apex), the
yellow blade as the only colour spot, the rim-lit treatment, and an
explicit "this image will be processed into a flat silhouette on a
light card" reveal at the end to bias gpt toward edge-clarity over
pictorial detail. Oak generated the new adaptive; it came out clearly
stronger than the prior round.

Then the extraction loop began. Cowork wrote five versions of an
extraction script before Oak ended the loop directly.

- **v1/v2 (luminance threshold + morphological closing).** Caught the
  rim-lit body and the kilt pleats but merged the legs into a single
  blob (the wide horizontal closing kernel bridged the inter-leg gap
  along with the kilt pleat gaps), and `binary_fill_holes` filled the
  leg-gap as an enclosed region. Result: kilt-down rendered as one
  giant black blob.
- **v3 (narrow closing, no fill_holes).** Legs separated. But the body
  interior had transparent patches where rim light didn't reach, and
  the trailing-arm hand was truncated because dim hand pixels fell
  below threshold.
- **v4 (size-filtered fill).** Filled small interior holes, left the
  leg-gap alone (size > 800 px). Body solidified. Hand still missing.
- **v5 (hysteresis thresholding + size-filtered fill).** Recovered the
  hand: high threshold (22) finds clearly-lit pixels, low threshold (8)
  defines maximum reach, and a connected-component check keeps only
  weak pixels tethered to strong-mask regions. Disconnected noise
  drops; the dim hand attached to a clearly-lit arm rides along. Oak
  confirmed the visual.
- **v6 (rim-glow extraction).** Oak then regenerated the sources with a
  rim-glow halo around the figure on solid black. Different art form
  → different extraction. Fill-holes inside the bright glow + erode to
  shrink past the glow ring. The result had a visible grey halo around
  the figure on the card, and the trailing-arm hand was filled grey
  instead of solid black.
- **v7 (RGB quantisation).** Stronger erosion (24 iters) + forced every
  in-mask pixel to either pure black or pure white via a brightness
  threshold. Halo gone. But the threshold was too high (180), so most
  mid-brightness tartan lines on the kilt got quantised to black. The
  kilt collapsed into a solid blob.

That was the moment. Oak said: *"now we're just chasing our tail."* He
had a point — the source format kept changing under cowork's extraction
script, and each fix in the script bred a new defect. Oak ended the
tail-chase by directly generating a clean RGBA transparent PNG for the
adaptive silhouette in ChatGPT. No extraction needed.

**Lesson banked.** When the source is improving faster than the
extraction can adapt, the right move is to switch source format, not
keep tuning the extraction. Cowork's role in asset production is to
take what gpt outputs and trim/recolour it; if Oak can have gpt emit
a fully app-ready transparent PNG directly, cowork's processing step
becomes unnecessary. Worth remembering for any future implement
silhouette generation: ask gpt for transparent-PNG output first.
Several technical patterns from the extraction loop are still worth
knowing — hysteresis thresholding for dim-edge recovery, size-filtered
fill_holes for keeping large negative space, and "quantise the colour
BEFORE feathering the alpha" to avoid grey halos — but those are
generic image-processing tools, not specific to this project.

### The throw-form catch — Oak's coaching eye

Between the rim-lit-photo round and the final transparent-PNG round,
Oak rejected the first adaptive silhouette mid-loop with: *"it's not a
very good form for a throw."* The pose was a release-apex with the
stone fully extended overhead, which looks dramatic but isn't how
stones are actually thrown in Highland Games — they're loaded against
the neck, body coiled, then released with a shorter arc. The new
sources (both adaptive and able-bodied) came back in the wind-up / load
pose: stone at the chin, body coiled, front leg with blade or shoe
stepping forward, trailing arm out for balance. The new pose is
biomechanically credible in a way the first pose wasn't.

The catch is worth noting in its own right because gpt image generation
cannot make it. A generic "athlete mid-throw, dramatic pose" prompt
produces a photogenic-but-wrong throw. Oak's 30 years of coaching
caught the gap. The general lesson: when generating
domain-specific assets, the domain expert in the loop catches what
the AI cannot reach. Don't fully outsource verification to gpt for
biomechanics, technique, or any other expert-eyed concern.

### The implement set comes together

While the stone tail-chase was running, Oak generated two additional
implements: hammer (RGB on white background, mid-spin pose, no kilt
tartan accents) and sheaf toss (RGBA transparent, throwing the sheaf
up toward a bar with vertical standards — the bar embodied as part of
the silhouette, which visually realises the spec's earlier
"bar-is-the-ruler" height-motif decision).

Cowork removed the hammer's white background (simple non-white-mask
extraction — much easier than the rim-glow case), saved it as a
matching RGBA transparent PNG. Sheaf was already app-ready.

The available silhouette set at the wrap:
- `silhouette-stone-adaptive.png` (new, Oak-generated transparent PNG)
- `silhouette-stone-able-bodied.png` (new, Oak-generated transparent PNG)
- `silhouette-weight-distance-adaptive.png` (existing, prior session)
- `silhouette-weight-distance-able-bodied.png` (existing, prior session)
- `silhouette-hammer.png` (cowork-processed from white-bg source)
- `silhouette-sheaf.png` (the working `silhouette sheaf.png`, app-ready)

Two known gaps that will fill in iteratively after v2.0: adaptive
variants for hammer and sheaf, and any silhouette at all for Weight
Over Bar (the eighth event). The 6a spec carries an un-skinned fallback
for WOB.

### A visual-language fork surfaced

Side-by-side on the cards, the implement set showed two distinct
visual languages: stone and weight-for-distance carry *detailed
silhouettes with white kilt tartan accents*; hammer and sheaf are
*pure black graphic silhouettes* with no internal detail. Different
gpt prompts, different generation paths, the result is a mixed set.

Cowork surfaced it as a design fork (harmonise toward one style vs.
accept the mix). Oak's call: accept the mix for v2.0. *"You're very
rarely going to see the adaptive versus the able [side by side], so
it's not a big deal."* The same call landed on adaptive pair coverage
(stone + WFD complete; hammer + sheaf single-only — gaps fill
iteratively after v2.0).

### The version test — soft-grey cards with full content

Cowork built an HTML version test mockup (`Images for Cards/card-
version-test/`) showing the throws PR celebration card at the actual
visual surface: 4:5 aspect, soft-grey background, implement-specific
silhouette anchored as the hero, full card content (headline, event,
mark, was-line, meta, wordmark). Three sections:

1. The new stone pair on the soft-grey card with sample data
   (Open Stone, 42'8").
2. Grey shade comparison — adaptive stone on `#F4F4F4`, `#ECECEC`,
   and the app's existing `#f5f5f7` bg token, side by side.
3. All four implements as PR cards with implement-appropriate sample
   data, plus a small style-consistency strip showing all six
   silhouettes at the same scale.

Build-and-react was the right pattern here — Oak reacting to actual
card surface, not floating silhouettes in isolation, is what made the
remaining decisions easy. The mockup is in the repo for future
reference.

### Six structural decisions, all locked

In two waves, Oak resolved every open question on the 6a spec:

1. **Silhouette replaces the cut-scene.** The animated implement
   cut-scene is dropped from 6a entirely. The silhouette is the card
   hero. Cut-scenes survive as a possible v2.1+ upgrade path that
   could later swap an `<img>` for a render layer — a clean
   architectural escape hatch. *Significant scope reduction:* the
   cut-scene mechanism (architected for both motifs, swappable
   implement skins, tape-measure reveal, height-motif rendering) — all
   removed from 6a.
2. **Grey shade: `#F4F4F4`.** Not `#ECECEC`, not the app's existing
   `#f5f5f7` bg token. Reads distinct from page bg, still feels like a
   card.
3. **Each implement at its own moment.** No cross-event throw-beat
   harmonisation. Stone wind-up, weight-distance release, hammer
   mid-spin, sheaf apex — each at its implement's authentic moment.
4. **Visual-language mix accepted.** Not regenerating either set to
   match. Athletes rarely see two PR cards from different events back
   to back; cross-implement style consistency isn't critical.
5. **Adaptive pair coverage ships as-is.** Stone + WFD complete;
   hammer + sheaf single-only. Adaptive variants for hammer/sheaf
   fill iteratively after v2.0.
6. **App renamed to Stone & Standard.** The biggest decision of the
   session — the app is renamed for v2.0 launch. "Stone" names the
   distance events (stone is the iconic implement); "Standard" names
   the vertical posts that hold the bar in height events (and carries
   the heraldic flag/banner echo). Distance and height in two words;
   unique, evocative, brand-able. Rename added to 6a scope to ship
   with v2.0.

### 6a spec, rewritten

With all decisions locked, cowork did a comprehensive rewrite of
`docs/specs/v2-stage6a-spec.md`. The cut-scene mechanism (whole
sections of the prior body) was removed. The Revision history at the
top now carries three entries (2026-05-24 original, 2026-05-25
silhouette pivot, 2026-05-26 this revision). The scope is now seven
buildable chunks: soft-grey card foundation, silhouette as hero (with
selection logic), audio plumbing, **app rename split into five atomic
sub-commits (4a–4e: surface, storage namespace, backup envelope,
tooling/metadata, README)**, un-skinned WOB fallback, scope isolation,
tests. The acceptance criteria, files-touched list, risk note, ccode
handoff prompt, and gpt review prompt all rewritten to match. The
spec is now ccode-handoff-ready.

The risk note is reframed: the rename adds *moderate* risk at the
storage-migration and backup-backward-compat surfaces. Data-loss is
the real defect class to watch; the visual lift is presentation-only.
Mitigations: the storage migration is idempotent (only runs if new key
is empty AND old key has data) and never deletes the old key;
`validateBackup` accepts the legacy `'highland-games-tracker'` and
`'comeback-tracker'` appNames alongside the new `'stone-and-standard'`.

### Where it stands

Stage 6a is **spec'd and handoff-ready.** The natural next session is
the ccode build — paste the handoff prompt at the bottom of the 6a
spec into a Claude Code terminal, let ccode build atomically per the
seven-step order, gpt review, fix, ship as `v2.0.0-stage6a`. After
that, the rest of Stage 6 (cross-device smoke test, `v2.0.0` tag,
GitHub release, Cloudflare Web Analytics) closes out v2.0.

The repo directory `~/dev/highland-games-tracker` keeps its old name
for now — the rename is at the brand layer, not the filesystem. A repo
rename can happen after v2.0 ships if Oak wants it.

### Housekeeping

- This session's cowork doc output landed as three atomic `docs:` /
  `chore:` commits: the 6a spec revision, the v2-plan + PICKUP refresh,
  and the version-test mockup's wordmark update. Oak also cleaned up
  a separate pile of `Images for Cards/` git state (deletions and
  working-folder organisation) in the same wrap.
- The silhouette PNGs in `Images for Cards/` root are still
  working-folder material; their final placement under
  `images/silhouettes/` is part of the ccode build per the spec.
- L1 sub-gates remain paused for the rest of v2 (2026-05-23 decision,
  unchanged).
- This SESSION_NOTES entry is the wrap-of-wraps for the design phase
  of Stage 6a. The next entry will be the ccode build session.

---

## 2026-05-25 — Stage 6a card design: the silhouette pivot

*Written by cowork at the session wrap. A design session — no build, no
ship — so this is a record of decisions and dead ends, not of shipped
code. Verify before trusting.*

A long design session on one piece of Stage 6a: the throws PR celebration
card's hero visual. It started from the 2026-05-24 6a spec — a Highland
Games field-photo background with an implement cut-scene — and ended
somewhere different.

The field background was the first casualty. Across earlier
build-and-react rounds Oak had rejected the photo and illustrated
backdrops ("looks like a track"); this session confirmed it dead. The
card's hero became an **athlete silhouette** instead.

cowork spent the bulk of the session trying to *build* that silhouette in
code — seven passes across four techniques: geometric reconstruction from
primitives (twice — "clip-art mascot"), GrabCut segmentation of Oak's
photo (defeated by green-shirt-on-green-grass), a MediaPipe-segmentation
hybrid (real proportions, amorphous blob), and a manual point-by-point
trace (improved, but still cartoon — the "fixed" cap turned the head into
a duck's bill). The honest conclusion: a badass silhouette is a
skilled-illustration job, not something to hand-code. That conclusion
cost real session time — flagged here so the lesson sticks: when a task
is craft, route it to the craft tool early.

Oak then solved it directly — generated silhouettes with **ChatGPT image
generation** from real throw photos. That route works. cowork's job
became asset prep and direction, not art.

What got decided and locked:

- The throws PR card's hero is a **bold black silhouette of an athlete
  mid-throw**, on a **soft-grey card** (pure white read too stark; exact
  shade `#F4F4F4` / `#ECECEC` still to confirm).
- Silhouettes are **implement-specific** — weight-for-distance, stone,
  hammer etc. each get their own.
- **Two per implement — adaptive and able-bodied.** Selection follows the
  athlete's profile **class**; default able-bodied.
- The scratchy **ground shadow** the gpt silhouettes carry — kept; Oak
  likes it.
- Asset naming: `silhouette-[implement]-[class].png`.

Built and saved into `Images for Cards/`: the weight-for-distance pair
(`silhouette-weight-distance-adaptive.png`,
`silhouette-weight-distance-able-bodied.png`) — gpt-generated by Oak,
trimmed and recoloured by cowork. The stone-throw pair is Oak's next job,
same method.

The 6a spec was revised — it now carries a "Revision — the silhouette
pivot" section, and the field background (scope point 1) is dropped.
**The spec is not yet ccode-handoff-ready:** one structural question is
open — does the implement cut-scene still play over the silhouette card,
or does the silhouette replace it? That is the first thing to settle next
session.

---

## 2026-05-24 — Stage 5 built and shipped (5a + 5b); the Progress page complete

*Written by cowork at the session wrap. Cowork ran the smoke tests,
the review hand-offs, and the spec amendments first-hand this session,
so this is close to a live record — but verify before trusting it.*

One long session — the last feature stage of the v2 build. It opened
by committing the 2026-05-23 doc sweep that had been left uncommitted
(`2f0d5f3` — the SESSION_NOTES entry, the v2-plan Status catch-up, the
PICKUP refresh), then ran Stage 5a and Stage 5b each through the full
loop: ccode build → cowork browser smoke test → gpt review → fix →
ship. Stage 5 is complete; both halves of the Progress page are live.

### Stage 5a — the throws Progress page

ccode built it in four atomic commits (`a30622d`…`ab6baf1`): the pure
window / best-in-window / percentage helpers in `shared.js`, their
tests, the new `progress.html` / `progress.js` (retiring `gap.html` /
`gap.js`), and the nav relink across every page. The cowork browser
smoke test came back clean — the three window filters, the per-throw
percentages, the empty states, and the nav all verified on injected
data; the full suite 324/324.

Two corrections followed, both on the percentage helper:

- **The cap (Resolved decision 6).** ccode's own build report flagged
  a tension: `round(best / pr × 100)` shows 100% from 99.5% upward,
  contradicting the spec's "100% means the PR-setting session." Oak's
  call — cap the displayed percentage at 99% whenever the mark is
  below the PR. cowork amended the 5a spec (`b9d5afb`); ccode applied
  it (`92554c4`).
- **The clamp (Resolved decision 7).** The gpt review then found a
  Critical: `percentOfPr` capped the below-PR case but never clamped
  `best > pr`, so the helper could return over 100% — e.g.
  `percentOfPr(500, 400)` returned 125. The spec had assumed
  `best ≤ pr` always; true for natively-grown v2 data, but not for
  migrated v1 data — `migrateSchemaV1toV2` renames `baselines → prs`
  with no reconciliation against session marks, and v1 baselines were
  manual references a logged throw could exceed. Reachable for any
  v1-import user. Oak's call — clamp: `best ≥ pr → 100`, below it
  `round` capped at 99. cowork amended the spec (decision 7, committed
  `2cd5e71`); ccode applied the clamp (`8316eba`); the gpt re-review
  returned "Critical resolved, ship." Deliberately not fixed:
  reconciling a stale migrated `prs` — a single-user path Oak does not
  expect to take (see decision 7).

Shipped, tagged `v2.0.0-stage5a`.

### Stage 5b — the S&C lifts view

ccode built it in five atomic commits (`5714829`…`591a4b7`): the
direction-aware percentage and lift-selection helpers, the Snapshot
view, the Best 3 view, the Throws / Lifts toggle with its per-side
secondary control, and tests. The cowork smoke test was thorough — the
toggle (opens on Throws, swaps the view, the secondary control, and
the intro text together), Snapshot (most-recent mark, direction-aware
— the `time` lift's ratio flips correctly), Best 3 (top three
session-bests, the rolling 365-day window, the fewer-than-three case,
the direction sort), active-lift filtering, and both empty states all
verified on injected data; the full suite 346/346.

The gpt review found one Major, no Critical: `topSessionBestsInWindow`
bounded the 365-day window only at the bottom — it skipped sessions
older than the cutoff but never excluded sessions dated after today,
so a future-dated session (a Log Session date typo, or odd imported
data) could slip into Best 3 and displace real recent marks. Unlike
the 5a fixes this needed no spec amendment — the spec already said
"within 365 days of today," correctly bounded; the code had simply
fallen short of it. ccode added the upper date bound and two
regression tests (`61fc5d2`). A Major triggers no re-review under the
method; cowork confirmed the fix with a full browser run — 348/348.
Shipped, tagged `v2.0.0-stage5b`.

### Where bugs got caught — the self-pruning signal

The Stage 4 entry left an open question: three straight stages with
zero review findings — solid pipeline, or a review not probing hard
enough? Stage 5 answers it. The gpt review caught a **Critical** (5a's
over-100% / migration path) and a **Major** (5b's future-date
window) — both real correctness defects, both reachable. ccode's own
build report caught a third (the rounding edge behind the cap). The
cowork browser smoke test caught **nothing** in either stage — though
it verified a wide surface of behavior empirically and confirmed both
fixes. The unit suites passed throughout: the buggy code passed
because the tests covered the normal-data paths, not the corrupt /
migrated / future-dated ones a static read of every branch catches.
Honest read: the static gpt review earned its place emphatically this
stage; the dynamic smoke test verified but did not catch — worth
weighing at the next self-pruning pass.

### Where it stands

Stage 5 is complete — the Progress page covers throws and S&C lifts.
The v2 feature build is done. The only work left is **Stage 6 —
launch polish**: the celebration-card visual pass (deferred since the
Stage 4 design), a cross-device smoke test (5a and 5b were
desktop-verified, mobile checked via CSS only), the `v2.0.0` tag, the
GitHub release, and the Cloudflare Web Analytics.

### Housekeeping

- The 5a and 5b gpt reviews are saved in `docs/reviews/`.
  `higgins-method.md` was de-duplicated to a single repo-root copy
  (`d67f95b`) for easier review uploading.
- The L1 sub-gates remain paused for the rest of v2, per the
  2026-05-23 decision — untouched this session.
- This session-wrap doc sweep — this entry, the `v2-plan.md` Status
  update, the `PICKUP.md` refresh, and the saved 5b review — is one
  `docs:` commit. The skills-ledger Stage 5 entry lives in the Higgins
  Method vault folder, separate from this repo.

---

## 2026-05-23 — Stage 5b planned and spec'd; L1 gate paused

A short planning session after the Stage 4 ship: Stage 5b designed and
spec'd, plus one method decision — the L1 learning gate paused for the
rest of the v2 build.

### Stage 5b — the lifts view, spec'd

Stage 5 had been split 5a / 5b at the tail of the Stage 4 session; this
session planned the 5b half — the S&C lifts view on the Progress page,
and the Throws / Lifts toggle that reaches it. Six decisions were
resolved (full text in `docs/specs/v2-stage5b-spec.md`): the percentage
is direction-aware, so a `time` lift flips the ratio to `pr / bestMark`
and every row still reads as a ≤ 100% "fraction of the way to your PR";
Best 3 mode shows the top three *session-bests*, not the three best
attempts pooled, so one strong day can't fill all three slots; the
Throws / Lifts toggle is top-level and the secondary control swaps with
it (the window filter on the throws side, a Snapshot / Best 3 selector
on the lifts side); the lifts view shows active lifts only; the default
lift mode is Snapshot; and Best 3's 365-day window is rolling and
fixed. The spec was written handoff-ready — ccode and gpt prompts built
in — and committed (`41d1e0b`). 5b can't build until 5a ships, so the
ccode handoff waits on the `v2.0.0-stage5a` tag.

### The L1 gate — paused for the rest of v2

Learning Gates paused for the remainder of this project and to be
revisited after this project is concluded. The gates were too high and
too broad. The Stage 4 ledger entry had recommended the opposite —
clearing an L1.1 sub-gate before 5b builds; this session went the other
way and parked L1 entirely.

### Housekeeping

- `PICKUP.md` was refreshed this session — 5b now spec'd, L1 paused —
  but the edit was left uncommitted.
- This entry and the `v2-plan.md` Status / Stage 5 catch-up are this
  session's doc sweep, completed late, in the 2026-05-24 cleanup pass.
  One `docs:` commit closes all three doc edits.

---

## 2026-05-22 → 23 — Stage 4 built and shipped (4a + 4b + 4c); Stage 5 split, 5a spec'd

*Reconstructed by cowork from the git log and the review docs — this
session was not journaled live. Oak: verify the narrative and fill the
flagged gaps before this entry is trusted as the record.*

One long session, the evening of 2026-05-22 into the early hours of the
23rd — roughly seven hours, 18:25 to 01:29. Stage 4, the big behavioral
stage, went from spec'd to shipped across all three sub-stages, and
Stage 5 was planned with 5a spec'd.

### Stage 4a — Log Session catches up

The 4a spec's last open items were closed first (`78e8c84`, 18:25 — the
milestone-framing intro copy finalized, the `gap.js` interim-state
confirmed). ccode built it in six atomic commits (19:15–19:24): the
`formatLiftMark` helper, the "Strength and Conditioning Milestones"
rename, S&C rendering from `userLifts` with unit-aware inputs,
removed-lift rows in the edit flow, the empty-state, and tests. gpt
review: **ship as-is, zero findings** — the data-loss risk surface the
spec flagged (editing a session with marks for a soft-deleted lift) was
covered. Shipped, tagged `v2.0.0-stage4a` (~20:27).

### Stage 4b — the celebration system

Spec written (`4dd94e0`, 20:55), then built in four commits
(21:02–21:10): the `detectMilestones` pure helper, milestone
persistence + `prs`/`prMeta`/`goalMeta` auto-update at save, the
celebration card queue, and the Past Sessions badge + "View
Celebrations" replay. gpt review: **ship as-is, zero findings** —
direction handling (`time` = lower-is-better), the silent first-mark
case, and the Awesome Day threshold all checked out. Shipped, tagged
`v2.0.0-stage4b` (21:10). This is where `goalMeta` and the unit
`direction` field — both dormant since earlier stages — finally got
consumed.

### Stage 4c — recompute-on-edit + the chain prompt

The highest-risk stage of the v2 build: the only one that rewrites
historical derived data. Spec written (`21930fa`, 23:17), built in six
commits (23:33–23:51): `recomputeDerivedState`, recompute on
edit/delete, re-derivation of the edited session's own `milestones[]`,
the chain prompt, the Set-page achieved-goal callout, and tests. gpt
review: **ship as-is, zero findings**. Shipped, tagged
`v2.0.0-stage4c` (~00:58 on the 23rd).

**Flag for Oak — one fix commit this reconstruction can't explain.**
`367e7bd fix(app): Set-page save re-evaluates goalMeta against the new
goals` was committed 00:49, *between* the 4c build commits and the 4c
review-doc commit. The review doc records zero findings, so either the
fix wasn't review fallout, or it was and the doc reflects the post-fix
state. What caught it — a smoke test, a self-check, a first review
round — belongs in the record. Please fill it in.

### Stage 5 — split 5a / 5b, 5a spec'd

After 4c shipped, Stage 5 was planned. `v2-plan.md` scoped Stage 5 as
one page; planning split it two ways, the same move as Stages 3 and 4:
throws and S&C lifts have different logging cadences (every session vs.
notable-only), so the Progress page needs a Throws/Lifts toggle and two
distinct views. 5a — the throws Progress page, a windowed vs-PR
comparison replacing See the Gap — was spec'd in full (`3ea7167`,
01:29; `docs/specs/v2-stage5a-spec.md`, handoff-ready with the ccode
and gpt prompts). 5b — the lifts view and the toggle — is not yet
spec'd.

### Flags for the record

- **The L1 sub-gates did not happen.** The plan coming out of the Biome
  session was an L1.1 cold-read of `gap.js` at the front of the 4a
  build. Three stages shipped; no sub-gate was attempted. The
  directing-competence reps are being deferred stage to stage — worth a
  deliberate look before Stage 5b builds.
- **Smoke tests** — the 3a/3b entries record cowork-driven browser
  smoke tests as a step. Whether 4a/4b/4c were smoke-tested isn't
  visible in the repo. Oak: confirm and record.
- **Three consecutive stages, zero review findings.** Either the
  spec→build pipeline is genuinely solid, or the gpt review isn't
  probing hard enough — the skills-ledger's self-pruning question.
  Worth watching.

### Housekeeping

- This SESSION_NOTES entry, the PICKUP.md refresh, and the
  skills-ledger Stage 4 entry were written by cowork on 2026-05-23.
  They are uncommitted doc edits — one `docs:` commit closes them.
  `v2-plan.md` also has an uncommitted edit (the v2.1 backlog item
  reworded to the "Throws / S&C toggle" framing), and its near-top
  Status section is stale (still reads "Stages 2–5 … not started").
  The 5a spec commit `3ea7167` was still local-only (unpushed) at the
  time of writing.

---

## 2026-05-21 → 22 — gate re-walk & redesign, Stage 4 planning, Biome lint setup

A second session on the 21st. It began as the L1 gate re-walk the Stage
3b notes recommended before Stage 4 — shared.js first. It turned into
something bigger: a redesign of the L1 gate itself.

### The re-walk

~2.5 hours, cowork-led, Oak describing each piece of shared.js in his own
words. Covered the data layer in real depth — the constant-vs-data
distinction (the recurring gap from Stages 2–3b, and it finally landed),
reading conditions, `=` vs `===`, the ternary, object vs array, the
loadData guard pattern, and `migrateSchemaV1toV2` through the userLifts
reconstruction. Real movement on the mechanism-layer edge the ledger
keeps naming — but slow: 2.5 hours bought roughly two-thirds of one file.

### The gate redesign — Higgins Method v0.3 → v0.4

The slowness was the signal. The old L1 gate ("walk the whole project,
describe every file") had been "pending / not cleared" across three
shipped stages — a gate that can't be cleared isn't gating, it's a red
mark that just travels forward. Oak's call: the gate was mis-sized — too
much in one block, and drifting toward a mastery bar, "learning from AI
how to code" rather than "learning to direct it."

Replaced it. L1 is now three interleaved ~1-hour sub-gates — L1.1 / L1.2
/ L1.3 — functional-depth cold-reads of one file each, ramping easy to
hard, sitting at the front of a build so they cost no separate time.
Three stripes, then the belt. The model is Oak's 30 years of wrestling
coaching: drill briefly, then live-wrestle; mastery accretes from the
reps, not from a checkpoint that blocks the match. `higgins-method.md`
is now v0.4; the cheat sheet and START-HERE updated to match; the skills
ledger has a 2026-05-21 entry for the session.

### Stage 4 — split A/B/C, 4a spec'd

After the gate work Oak chose to start Stage 4 rather than close the
session. Stage 4 as written in `v2-plan.md` bundles ~8 pieces — the Log
Session page rework plus the whole celebration system — bigger than
Stage 3 was when it got split. Decided to split it three ways:

- 4a — Log Session catches up: render S&C from `userLifts`, the 3→10
  attempt cap, the section rename + intro. No celebration logic.
- 4b — the celebration system: milestone detection at save, the cards,
  the queue, the badge-and-replay.
- 4c — recompute-on-edit plus the chain prompt: the risk-bearing
  derived-data work, isolated for a focused review the way 3b was.

Planned 4a in full. Three gaps `v2-plan.md` left open were resolved: a
removed lift in an edited session renders with a "removed" tag and stays
editable (so an edit can't silently drop its marks); an empty S&C
section shows a linked pointer to the Set page; the milestone-framing
intro copy was drafted. Cowork wrote the 4a spec sketch —
`docs/specs/v2-stage4a-spec.md` — handoff-ready, with the ccode and gpt
prompts built in.

### Linting — Biome added to the process

After the 4a spec, a conversation about linting: what a linter is — it
reads the code without running it and flags likely mistakes, a static
net distinct from the behavioural net of the test suite — and where it
fits the Higgins loop (a verification step at Build / self-check, ahead
of the gpt review). Oak decided to add one.

Tool: **Biome**, not ESLint. ESLint is the industry standard and the one
to learn for professional dev — but the learning a linter gives a
*director* (reading and acting on lint output) is tool-agnostic;
ESLint's extra surface over Biome is configuration machinery, which is
authoring-competence overhead. Biome — one tool, one config — gives the
same transferable learning with far less setup friction.

Cowork wrote `docs/specs/lint-setup-spec.md`: correctness rules on,
style light, linter only (not the formatter), bring the existing code to
a clean green pass. Run before Stage 4a so 4a is built with the linter
live.

ccode built it — Biome 2.4.15, `package.json` / `biome.json` / lockfile,
an `npm run lint` script; one setup commit plus five atomic to-green
commits (two narrow rule tunes — `noUnusedVariables` scoped off
`shared.js`, `useOptionalChain` off — and three syntactic code edits).

gpt review: "Ship after fixes," no Critical, one Major — but the Major
was "I can't verify the lockfile or a clean lint run from the files I
was given," a review-*bundle* gap, not a build defect. The bundle was
missing `package-lock.json`; that traced partly to the spec's review
prompt not listing the lockfile to attach. Cowork verified the part gpt
structurally cannot: the lockfile *is* committed, and `npm run lint`,
installed and run in the sandbox, exits 0. Static gpt review + dynamic
cowork run = the complete picture — the same pairing as code-review +
smoke-test in 3a/3b, and again the dynamic step caught what the static
one could not: `npm run lint` exits 0 but isn't *silent* — 6
`useTemplate` style infos rode along, the residual baseline-noise the
spec's "start-clean" goal was meant to avoid. ccode cleared the 6; tests
confirmed green.

Lint setup shipped — Biome is now a verification step in the loop, and
the project has its first dev tooling.

### Where it stands

Biome lint setup is shipped. Stage 4a is spec'd and handoff-ready
(`docs/specs/v2-stage4a-spec.md`) — the next build is a ccode session
from that spec, built with the linter live, then gpt review. 4b and 4c
get their own planning once 4a ships.

The L1 gate is clearable under v0.4 — Oak is roughly one ~1-hour session
from the L1.1 sub-gate (a cold-read of gap.js, the natural light file),
interleaved with a build rather than blocking on it. Today's shared.js
depth is banked as the drill for the eventual L1.3 stripe.

### Housekeeping

- The session wrap (this `SESSION_NOTES` entry, the `PICKUP.md` refresh,
  the lint-setup ledger entry) leaves uncommitted doc edits — one final
  `docs:` commit closes them.
- An editor-side markdown linter has been adding language tags to fenced
  code blocks across the `.md` files this session — harmless cosmetic
  changes that ride along in the docs commits.

---

## 2026-05-21 — Stage 3a shipped; Stage 3b planned, built, shipped

Long session, the evening of 2026-05-20 into the 21st. Ran the Higgins
loop twice more — Stage 3a from review to ship, and Stage 3b end to end
(plan → spec → build → review → fix → ship). Stage 3 is now complete.

### Stage 3a — reviewed, smoke-tested, fixed, shipped

- Picked up the Stage 3a build from the prior session. First catch: the
  four Stage 3a build commits had already been pushed to `origin/main`
  before review — a step out of Higgins order (Ship follows Review).
  Low-stakes here; flagged.
- gpt review: clean — one Nit only (stale "baselines" wording in
  `index.html`'s backup copy). Fixed by hand, commit `314331c`.
- Browser smoke test (cowork-driven, app served locally over
  `http://localhost:8000`): found one Major a code review structurally
  could not — at desktop widths (≥600px) each throw row laid PR and Goal
  side by side, overflowing the fixed 560px card and clipping the Goal
  field's inches input. Mobile was fine.
- Fix (Option A): stack PR and Goal vertically at all widths, matching
  mobile. ccode built it, commit `7c98211`; re-smoke confirmed; 166/166
  tests green.
- Shipped — pushed, tagged `v2.0.0-stage3a`. Stage 3a ledger entry
  written.

### Stage 3b — planned, built, shipped

- Planning conversation resolved the four questions `v2-plan.md` left
  open on the conversion engine: Count and Time lifts with marks stay
  fully locked (only Weight and Distance convert); conversions round the
  stored values; conversion shows live on unit change; no confirmation
  dialog. Cowork wrote `v2-stage3b-spec.md`.
- ccode built it: six commits (`e4e4418`…`4e7dc5e`) — the `convertValue`
  helper and `toBase` factors, the unlocked category-filtered dropdown,
  live conversion, the Save-time session-mark sweep, the "Strength and
  Conditioning Milestones" heading rename, and tests.
- gpt review: one Major — the `liveConvert` gate omitted the `hasMarks`
  check, so a saved unmarked lift's unit change blanked
  typed-but-unsaved PR/Goal. One Minor, one Nit. Verdict: ship after
  fixes.
- Browser smoke test: the conversion engine verified end to end on
  injected test data — live conversion, the session-mark sweep, other
  lifts and throw marks untouched. The Major was reproduced.
- Near-miss worth recording: the smoke test first appeared to show the
  conversion engine completely dead (`convertValue` undefined), nearly
  reported as a Critical. False alarm — the browser was serving a stale,
  cached pre-3b `shared.js`. Caught by checking the file on disk.
  `python3 -m http.server` sends no cache headers; stale cache bit the
  smoke test three times — hard reload each. See the Stage 3b ledger
  entry.
- ccode fixed the Major, commit `4f5c177` (`liveConvert` gate now
  includes `hasMarks`) plus a regression test. Re-smoke confirmed; full
  suite 195/195.
- Shipped — pushed, tagged `v2.0.0-stage3b`. Stage 3b ledger entry
  written.

### Where it stands

Stage 3 is complete — 3a and 3b both shipped and tagged. Next is
**Stage 4** — the celebration system and the Log Session changes, the
big behavioral stage, and where `goalMeta` and the unit `direction`
field finally get consumed. The L1 gate (code walkthrough) is still
pending from 2026-05-19; the Stage 3b ledger recommends clearing it
before Stage 4.

### Housekeeping

- This session's docs sweep: this `SESSION_NOTES` entry, `PICKUP.md`
  refreshed for Stage 4, and the new files (`v2-stage3b-spec.md`, the
  gpt review docs) — one `docs:` commit.
- The leftover `stage-2-walkthrough-study-sheet.pdf` in the repo is safe
  to `rm` (the real copy is in the Higgins Method folder).

---

## 2026-05-20 — Stage 2 shipped, L1 gate walkthrough, Stage 3a built

Long session, the evening of the 19th into the 20th. Ran the Higgins
loop twice — Stage 2 end to end, and Stage 3 up through the 3a build.

### Method correction — the important one

Early on, cowork overstepped: it took the v2 plan and started writing
Stage 2 code directly. That is ccode's job. Oak caught it and pointed
cowork back at the Higgins Method. Recalibrated for the rest of the
session and going forward: **cowork plans (writes the spec sketch),
ccode builds, gpt reviews.** Recovery was cheap — nothing had been
committed. The lesson, logged in the skills ledger: the spec→build
handoff is where the L1 learning lives; cowork must not cross it.

### Stage 2 — shipped

- Cowork wrote `v2-stage2-spec.md` and handed it to ccode.
- ccode built it: storage schema bump v1→v2 (`baselines`→`prs`,
  `baselineMeta`→`prMeta`, added `goals` / `goalMeta` / `userLifts` /
  `profile`), the v1→v2 migration, the first-launch profile modal.
- gpt review: no Critical or Major; one Minor — `weightSchedule` did
  not default to match gender. Fixed (commit `c5d6f49`).
- Browser smoke test: clean.
- Shipped: pushed to `origin/main`, tagged `v2.0.0-stage2`. Commits
  `ff4a380`, `edcd127`, `dcea47b`, `c5d6f49`.

### L1 gate walkthrough — not cleared this pass

- Walked all ten code files with cowork, Oak describing each in his
  own words.
- Result: the file→role map is solid; the mechanism layer — how
  `shared.js`'s data layer and migration work, how a page's JS builds
  the DOM — is the gap.
- Honest verdict: **L1 gate not cleared this pass.** Re-attempt is
  close: re-read the files (shared.js first), then re-walk.
- First real skills-ledger entry filled in (`skills-ledger.md`, Higgins
  Method folder).
- A printable study sheet was built — `stage-2-walkthrough-study-sheet.pdf`,
  Higgins Method folder — to study before the re-walk.

### Stage 3 — split into 3a + 3b, and 3a built

- **Split decision.** Stage 3 as written bundled too much. Split it:
  **3a** = the Set PRs & Goals page (page rewrite, throws with
  PR+Goal, user-defined lift cards, the unit dropdown, soft-delete).
  **3b** = the unit conversion engine (rewrites stored data — built
  and reviewed on its own).
- **The seam.** In 3a a lift's unit locks once it has any mark; 3b is
  what unlocks it, with conversion.
- **Decision:** the v1 stone-weight input is dropped from the Set page
  — a stone's weight is neither a PR nor a Goal; it stays per-session
  on Log Session.
- Cowork wrote `v2-stage3a-spec.md` and handed it to ccode.
- ccode built Stage 3a: 4 commits (`0df048c`, `ed6999a`, `9767bdb`,
  `bee8cea`), 166/166 tests pass (cowork confirmed headless). The
  3a/3b split held — no conversion engine, Log Session untouched.

### Where it stopped — for tomorrow

Stage 3a is built locally: **4 commits ahead of `origin/main`, not
reviewed, not smoke-tested, not pushed.** Tomorrow:

1. gpt review of Stage 3a — the review prompt is ready at the bottom
   of `v2-stage3a-spec.md`.
2. Browser smoke test — a checklist is derivable from the spec's
   acceptance criteria.
3. Fix anything found → ship (push + tag `v2.0.0-stage3a`) → the
   Stage 3a ledger entry.
4. Then plan Stage 3b.

### Housekeeping / environment

- Antigravity (the IDE) broke via a Google update mid-session; ccode
  now runs in a standalone terminal with VS Code alongside.
- Cowork's sandbox can create files but cannot delete them in the repo
  or `.git` — so git commits, reverts, tag pushes, and file removals
  are run by Oak on the real machine.
- Untracked / uncommitted in the repo: the gpt review doc (`Code
  Review Stage 2 Highland Games Tracker.md`), a leftover copy of the
  study-sheet PDF (safe to `rm`), uncommitted edits to
  `v2-stage2-spec.md`, and a small uncommitted edit to
  `v2-stage3a-spec.md` (the gpt review prompt appended this session).
  One `docs:` commit sweeps the lot.

---

## 2026-05-19 — v2 design session + Stage 1 ship

Big session. Two distinct phases: shipping Stage 1 (the rebrand) and
designing all of Stages 2–5.

### Stage 1 shipped

The fork-and-rebrand strip phase that was planned during the v1.4 wrap-up
landed today. Commits in order:

1. `docs: add v2 planning notes carried from fork pre-work` — brought the
   placeholder `v2-plan.md` over from `comeback-tracker` into
   `highland-games-tracker`.
2. `chore: rename app surface to Highland Games Tracker` — page titles,
   h1 wordmarks, img alt text, test-runner intro banner. Surface-only.
3. `chore: separate v2 storage namespace from v1` — `STORAGE_KEY` moved
   from `comeback-tracker-v1` to `highland-games-tracker-v1`,
   `validateBackup` and `exportData` updated to `highland-games-tracker`,
   test fixtures and assertions updated.
4. `chore: remove personal branding assets` — Adaptive Oak logo and
   adaptive-throw photo deleted from git, `<img>` references stripped
   from every page, `.brand-logo` CSS rule removed,
   See-the-Gap background swapped to generic `grass-field.jpg`.
5. `docs: add README describing the app, audience, install, and roadmap`
   — community-facing README.

Tagged `v2.0.0-rebrand` at HEAD. Pushed to `origin/main`. The v2 repo now
reads as a neutral community Highland Games tool with no traces of the
personal v1.

### v2 design conversation

The bulk of the day was design work for Stages 2–5. Major decisions, in
the order they came up:

**Audience and positioning.** v2 is for the Highland Games community at
large — competitors, masters, comebackers, new athletes — not Matt
personally. Strip out the "comeback" framing.

**v1 frozen.** `comeback-tracker` stays at v1.4 as Matt's personal app.
v2 evolves independently in this repo.

**Lifts → user-defined.** The v1 hard-coded lift list (Overhead Press,
Deadlift, etc., with fixed protocols) was Matt's training program.
Community athletes need to define their own lifts. Each entry has free-text
`name`, free-text `protocol`, and a `unit` from a fixed dropdown.

**Unit system: 10 options across 4 categories.** Weight (`lb`, `kg`),
Distance (`mi`, `K`, `m`, `yd`), Time (`time` — mm:ss format), Count
(`reps`, `rounds`, `cal`). Each unit has a `direction` property — time is
lower-is-better, everything else is higher-is-better. Same-category unit
changes auto-convert; cross-category changes are blocked. Native HTML
`<select>` with `<optgroup>` headers.

**Strength and Conditioning Milestones.** The section formerly called
"Lifts" renames to "Strength and Conditioning Milestones." The rename is
also a product positioning shift: the section is for logging notable
workouts (1RM tests, max efforts, PR attempts) rather than every gym day.
S&C notes textarea label stays as "S&C notes" for compactness.

**10-attempt cap on S&C.** A 1RM workup has 5–7 sets with several singles;
10 is a generous cap. Throws stay at 3 (matches Highland Games competition
format). Gap-detection rule from v1.4 still applies — attempts must be
contiguous.

**PRs and Goals replacing single baseline.** Each event has two reference
marks: a Personal Record (historical) and a Goal (forward-looking aspiration).
Each is optional and independent.

**Goals don't appear as a percentage on Progress.** Long-term goals don't
move enough to be motivating as a tracked percentage. Their functional
home becomes the celebration system instead — Goals are "latent moments
waiting to fire," not "static targets to crawl toward."

**Progress page: vs-PR with session-window filter.** Three filter options
matching the v1 pattern of competition/training/all but with time
dimension:

- Last session logged
- Past 3 sessions
- Year to date (Jan 1 of current year forward)

**Celebration system.** PR card and Goal card fire when a session's marks
break the relevant reference. Cards queue in order: individual PR cards,
individual Goal cards, then an Awesome Day capstone if 2+ milestones.
Same-event PR + Goal hits show as two separate cards, not combined.
Awesome Day threshold is 2+ total milestones in a session.

**Cards persist on the session.** "I always accidentally dismiss things"
problem: cards are stored on the session record under
`session.milestones[]`. Past Sessions list flags milestone-bearing rows,
expanded view replays the queue. The cards look identical later as they
did at save.

**Chain prompt after Goal celebration.** After a Goal card is dismissed,
the athlete is prompted to set a new goal for that event. If they skip,
the Set page shows a soft callout for the event until they set one.

**Edits recompute milestones.** PR is max-across-sessions and is
recomputed on any edit or delete. `goalMeta` (the achievement record) is
recomputed too. Active `goals[event]` value is never auto-changed — the
user owns that field. Edits that create new milestones fire celebration
cards (same flow as save); edits that remove milestones are silent.

**Auto-update on save.** PR field auto-updates when broken; `goalMeta`
auto-writes when achieved. No confirm step — the celebration card is the
implicit confirmation. Typos that create false milestones are handled
through the edit flow.

**Profile capture on first launch.** Modal collects name, gender, weight
schedule, class, tier. All fields optional. Cards pull from it for
personalization.

**Gender separable from weight schedule.** Gender is identity (Male /
Female / Non-binary / Prefer not to say). Weight schedule is the BCAA
weight table the athlete competes from (Men's / Women's). M/F athletes
get a default-match suggestion; non-binary and unspecified athletes pick
explicitly. The app's posture is "this tracker is for them, not to make
assumptions or judgments."

**Class taxonomy.**

- Open: Pro, Amateur A, Amateur B, Amateur C, Amateur (unspecified),
  Novice, Lightweight, Junior
- Masters: Masters, Lightweight Masters (skill tiers like A/B/C drop
  once the athlete crosses 40)
- Adaptive (BCAA framework v3, May 2026): Para-Seated, Para Standing
  Upper Limb Loss, Para Standing Lower Limb Loss, Para Standing
  Neuro/Muscular
- Other: Not specified / training only

**Tier dropdown** appears only when the class supports tiers:

- Masters and Lightweight Masters: M40 / M45 / M50 / M55 / M60 / M65+
  (5-year breakdowns standard in the broader masters athletics community)
- Adaptive: Open / Masters 40+ / Senior Master 50+ per BCAA §7

**Progression-tracking through PRs.** Class at the time of a PR gets
captured on the milestone record, not recomputed from current profile.
An athlete's PR history shows their career arc: Novice → Amateur C →
Amateur B → Amateur A → Masters M40 → Masters M45 across years.

**v1 backup import.** `validateBackup` accepts both `comeback-tracker`
and `highland-games-tracker` envelopes. v1 payloads run through the
schema migration before saving — `baselines` → `prs`, `baselineMeta` →
`prMeta`, hard-coded lifts → `userLifts` entries with their IDs
preserved so session marks still resolve.

**Shareable card visual design — open.** Card content is locked
(centerpiece mark, headline, event, previous value, date, games title,
location, wordmark, square or 4:5 aspect ratio). Visual treatment —
colors, type, exact layout — deferred to a build-and-react prototype
during Stage 4 implementation. Save-image button (Canvas API → PNG) is
v2.1; native share sheet is v2.x.

### What's loaded for tomorrow

- `v2-plan.md` is the full design rendered in detail
- Stage 1 is shipped and tagged
- Stages 2–5 are designed but not implemented
- The natural next move is starting Stage 2 (data model + profile setup)
- One open visual-design item floats; deferred to prototype during Stage 4

See `PICKUP.md` for a paste-able prompt to restore context tomorrow.

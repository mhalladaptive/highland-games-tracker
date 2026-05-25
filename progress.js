function buildProgressStat(label, value) {
  const wrap = document.createElement('span');
  wrap.className = 'gap-stat';
  const labelEl = document.createElement('span');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;
  wrap.appendChild(labelEl);
  wrap.appendChild(document.createTextNode(` ${value}`));
  return wrap;
}

function buildProgressRow(item, pr, windowSessions) {
  const row = document.createElement('div');
  row.className = 'gap-row';
  row.dataset.itemId = item.id;

  const header = document.createElement('div');
  header.className = 'gap-row-header';
  const labelGroup = document.createElement('div');
  labelGroup.className = 'gap-item-label';
  const name = document.createElement('span');
  name.className = 'gap-item-name';
  name.textContent = item.name;
  labelGroup.appendChild(name);
  if (item.implement) {
    const meta = document.createElement('span');
    meta.className = 'gap-item-meta';
    meta.textContent = item.implement;
    labelGroup.appendChild(meta);
  }
  header.appendChild(labelGroup);

  const best = bestMarkInSessions(windowSessions, item.id);
  const pct = best ? percentOfPr(best.value, pr) : null;

  if (best === null || pct === null) {
    row.classList.add('gap-row--empty');
    row.appendChild(header);
    const empty = document.createElement('p');
    empty.className = 'gap-empty';
    empty.textContent = 'no marks logged';
    row.appendChild(empty);
    return row;
  }

  const atPr = pct >= 100;
  const percent = document.createElement('span');
  percent.className = `gap-percent${atPr ? ' at-or-past' : ''}`;
  percent.textContent = `${pct}%`;
  header.appendChild(percent);
  row.appendChild(header);

  const bar = document.createElement('div');
  bar.className = 'gap-bar';
  const fill = document.createElement('div');
  fill.className = `gap-bar-fill${atPr ? ' at-or-past' : ''}`;
  fill.style.width = `${Math.min(100, pct)}%`;
  bar.appendChild(fill);
  row.appendChild(bar);

  const stats = document.createElement('div');
  stats.className = 'gap-stats';
  stats.appendChild(buildProgressStat('best', formatMeasurement(best.value, item.measurementType)));
  if (best.date) {
    stats.appendChild(document.createTextNode(' · '));
    const dateSpan = document.createElement('span');
    dateSpan.className = 'gap-stat';
    dateSpan.textContent = formatSessionDate(best.date);
    stats.appendChild(dateSpan);
  }
  stats.appendChild(document.createTextNode(' · '));
  stats.appendChild(buildProgressStat('PR', formatMeasurement(pr, item.measurementType)));
  row.appendChild(stats);

  return row;
}

// The section-level empty state when the athlete has defined no active lifts.
// Mirrors the Log Session S&C empty state (Stage 4a) — same wording and link.
function buildNoLiftsEmpty() {
  const empty = document.createElement('p');
  empty.className = 'empty-state lifts-empty';
  empty.appendChild(document.createTextNode('No S&C lifts yet — add them on the '));
  const link = document.createElement('a');
  link.href = 'index.html';
  link.textContent = 'Set PRs & Goals page';
  empty.appendChild(link);
  empty.appendChild(document.createTextNode('.'));
  return empty;
}

// Snapshot mode — one row per active lift: the most-recent mark vs PR. Mirrors
// buildProgressRow but formats marks with formatLiftMark and is direction-aware
// (a time lift's best is the fastest). No window — "most recent" is the latest
// dated mark, however old, which is why its date is shown inline.
function buildSnapshotRow(lift, pr, direction, sessions) {
  const row = document.createElement('div');
  row.className = 'gap-row';
  row.dataset.itemId = lift.id;

  const header = document.createElement('div');
  header.className = 'gap-row-header';
  const labelGroup = document.createElement('div');
  labelGroup.className = 'gap-item-label';
  const name = document.createElement('span');
  name.className = 'gap-item-name';
  name.textContent = lift.name;
  labelGroup.appendChild(name);
  header.appendChild(labelGroup);

  const best = mostRecentLiftMark(sessions, lift.id, direction);
  const pct = best ? percentOfPr(best.value, pr, direction) : null;

  if (best === null || pct === null) {
    row.classList.add('gap-row--empty');
    row.appendChild(header);
    const empty = document.createElement('p');
    empty.className = 'gap-empty';
    empty.textContent = 'no marks logged';
    row.appendChild(empty);
    return row;
  }

  const atPr = pct >= 100;
  const percent = document.createElement('span');
  percent.className = `gap-percent${atPr ? ' at-or-past' : ''}`;
  percent.textContent = `${pct}%`;
  header.appendChild(percent);
  row.appendChild(header);

  const bar = document.createElement('div');
  bar.className = 'gap-bar';
  const fill = document.createElement('div');
  fill.className = `gap-bar-fill${atPr ? ' at-or-past' : ''}`;
  fill.style.width = `${Math.min(100, pct)}%`;
  bar.appendChild(fill);
  row.appendChild(bar);

  const stats = document.createElement('div');
  stats.className = 'gap-stats';
  stats.appendChild(buildProgressStat('best', formatLiftMark(best.value, lift.unit)));
  if (best.date) {
    stats.appendChild(document.createTextNode(' · '));
    const dateSpan = document.createElement('span');
    dateSpan.className = 'gap-stat';
    dateSpan.textContent = formatSessionDate(best.date);
    stats.appendChild(dateSpan);
  }
  stats.appendChild(document.createTextNode(' · '));
  stats.appendChild(buildProgressStat('PR', formatLiftMark(pr, lift.unit)));
  row.appendChild(stats);

  return row;
}

// Render the active lifts into #lifts-list. Snapshot is the only mode for now;
// Best 3 is added alongside it. Soft-deleted lifts (active: false) never show.
function renderLifts(data) {
  const list = document.getElementById('lifts-list');
  list.innerHTML = '';
  const activeLifts = (Array.isArray(data.userLifts) ? data.userLifts : []).filter((l) => l && l.active);
  if (activeLifts.length === 0) {
    list.appendChild(buildNoLiftsEmpty());
    return;
  }
  const prs = data.prs || {};
  for (const lift of activeLifts) {
    const prRaw = prs[lift.id];
    const pr = Number.isFinite(prRaw) ? prRaw : null;
    const direction = eventDirection(lift.id, data);
    list.appendChild(buildSnapshotRow(lift, pr, direction, data.sessions));
  }
}

let currentWindow = 'past3';

function renderProgress(data) {
  const list = document.getElementById('throws-list');
  list.innerHTML = '';
  const year = new Date().getFullYear();
  const windowSessions = sessionsInWindow(data.sessions, currentWindow, year);
  const prs = data.prs || {};
  for (const item of ITEMS) {
    if (item.category !== 'throw') continue;
    const prRaw = prs[item.id];
    const pr = Number.isFinite(prRaw) ? prRaw : null;
    list.appendChild(buildProgressRow(item, pr, windowSessions));
  }
}

function setWindow(windowId) {
  currentWindow = windowId === 'last' ? 'last' : windowId === 'ytd' ? 'ytd' : 'past3';
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    const isActive = btn.dataset.window === currentWindow;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });
  renderProgress(loadData());
}

function init() {
  renderProgress(loadData());
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setWindow(btn.dataset.window));
  });
}

document.addEventListener('DOMContentLoaded', init);

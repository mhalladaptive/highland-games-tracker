function buildStatSpan(label, value) {
  const wrap = document.createElement('span');
  wrap.className = 'gap-stat';
  const labelEl = document.createElement('span');
  labelEl.className = 'stat-label';
  labelEl.textContent = label;
  wrap.appendChild(labelEl);
  wrap.appendChild(document.createTextNode(' ' + value));
  return wrap;
}

function buildGapRow(item, baseline, best) {
  const row = document.createElement('div');
  row.className = 'gap-row';
  row.dataset.itemId = item.id;

  const header = document.createElement('div');
  header.className = 'gap-row-header';
  const name = document.createElement('span');
  name.className = 'gap-item-name';
  name.textContent = item.name;
  const meta = document.createElement('span');
  meta.className = 'gap-item-meta';
  meta.textContent = metaLabel(item);
  header.appendChild(name);
  header.appendChild(meta);
  row.appendChild(header);

  if (!Number.isFinite(baseline)) {
    row.classList.add('gap-row--empty');
    const placeholder = document.createElement('p');
    placeholder.className = 'gap-empty';
    placeholder.textContent = 'Set a baseline to see progress.';
    row.appendChild(placeholder);
    return row;
  }

  const baselineText = formatMeasurement(baseline, item.measurementType);

  if (!Number.isFinite(best)) {
    row.classList.add('gap-row--no-sessions');
    const placeholder = document.createElement('p');
    placeholder.className = 'gap-empty';
    placeholder.textContent = `Baseline ${baselineText} · No marks logged since return yet.`;
    row.appendChild(placeholder);
    return row;
  }

  const pct = percentOfBaseline(best, baseline);
  const gap = baseline - best;
  const atOrPast = pct >= 100;

  const pctEl = document.createElement('div');
  pctEl.className = 'gap-percent' + (atOrPast ? ' at-or-past' : '');
  pctEl.textContent = `${Math.round(pct)}%`;
  row.appendChild(pctEl);

  const bar = document.createElement('div');
  bar.className = 'gap-bar';
  const fill = document.createElement('div');
  fill.className = 'gap-bar-fill' + (atOrPast ? ' at-or-past' : '');
  fill.style.width = `${Math.min(100, pct)}%`;
  bar.appendChild(fill);
  row.appendChild(bar);

  const stats = document.createElement('div');
  stats.className = 'gap-stats';
  stats.appendChild(buildStatSpan('baseline', baselineText));
  stats.appendChild(document.createTextNode(' · '));
  stats.appendChild(buildStatSpan('best', formatMeasurement(best, item.measurementType)));
  stats.appendChild(document.createTextNode(' · '));
  if (gap > 0) {
    stats.appendChild(buildStatSpan('gap', formatMeasurement(gap, item.measurementType)));
  } else if (gap === 0) {
    const matchSpan = document.createElement('span');
    matchSpan.className = 'gap-stat match';
    matchSpan.textContent = 'matched baseline';
    stats.appendChild(matchSpan);
  } else {
    const pastSpan = document.createElement('span');
    pastSpan.className = 'gap-stat past';
    pastSpan.textContent = `+${formatMeasurement(-gap, item.measurementType)} past baseline`;
    stats.appendChild(pastSpan);
  }
  row.appendChild(stats);

  return row;
}

function renderGap(data) {
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  for (const item of ITEMS) {
    const baselineRaw = data.baselines ? data.baselines[item.id] : null;
    const baseline = Number.isFinite(baselineRaw) ? baselineRaw : null;
    const best = bestSinceReturn(data, item.id);
    const row = buildGapRow(item, baseline, best);
    if (item.category === 'throw') {
      throwsList.appendChild(row);
    } else {
      liftsList.appendChild(row);
    }
  }
}

function init() {
  const data = loadData();
  renderGap(data);
}

document.addEventListener('DOMContentLoaded', init);

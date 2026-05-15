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

function buildDetailLine(label, mark, date, location) {
  const line = document.createElement('div');
  line.className = 'gap-detail-line';

  const labelEl = document.createElement('strong');
  labelEl.textContent = `${label}: `;
  line.appendChild(labelEl);

  const markEl = document.createElement('span');
  markEl.className = 'detail-mark';
  markEl.textContent = mark;
  line.appendChild(markEl);

  const dateText = date ? formatSessionDate(date) : '(no date recorded)';
  const locText = location && location.trim() ? location : '(no location recorded)';

  const provenance = document.createElement('span');
  provenance.className = 'detail-provenance';
  provenance.textContent = ` — ${dateText}, ${locText}`;
  line.appendChild(provenance);

  return line;
}

function buildGapRow(item, baseline, baselineMeta, bestDetails) {
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

  if (!bestDetails) {
    row.classList.add('gap-row--no-sessions');
    const placeholder = document.createElement('p');
    placeholder.className = 'gap-empty';
    placeholder.textContent = `Baseline ${baselineText} · No marks logged since return yet.`;
    row.appendChild(placeholder);
    return row;
  }

  const best = bestDetails.value;
  const pct = percentOfBaseline(best, baseline);
  const gap = baseline - best;
  const atOrPast = pct >= 100;
  const detailsId = `gap-details-${item.id}`;

  const pctBtn = document.createElement('button');
  pctBtn.type = 'button';
  pctBtn.className = 'gap-percent' + (atOrPast ? ' at-or-past' : '');
  pctBtn.textContent = `${Math.round(pct)}%`;
  pctBtn.setAttribute('aria-expanded', 'false');
  pctBtn.setAttribute('aria-controls', detailsId);
  pctBtn.addEventListener('click', () => {
    const expanded = row.classList.toggle('expanded');
    pctBtn.setAttribute('aria-expanded', String(expanded));
  });
  row.appendChild(pctBtn);

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

  const details = document.createElement('div');
  details.id = detailsId;
  details.className = 'gap-details';

  const baselineMetaDate = baselineMeta && baselineMeta.date ? baselineMeta.date : null;
  const baselineMetaLoc = baselineMeta && baselineMeta.location ? baselineMeta.location : null;
  details.appendChild(buildDetailLine('Baseline', baselineText, baselineMetaDate, baselineMetaLoc));
  details.appendChild(buildDetailLine(
    'Best',
    formatMeasurement(best, item.measurementType),
    bestDetails.sessionDate,
    bestDetails.sessionLocation
  ));

  row.appendChild(details);

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
    const baselineMeta = data.baselineMeta ? data.baselineMeta[item.id] : null;
    const bestDetails = bestSinceReturnDetails(data, item.id);
    const row = buildGapRow(item, baseline, baselineMeta, bestDetails);
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

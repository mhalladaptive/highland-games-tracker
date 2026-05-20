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

function buildDetailLine(label, mark, date, location, fallback) {
  const line = document.createElement('div');
  line.className = 'gap-detail-line';

  const labelEl = document.createElement('strong');
  labelEl.textContent = `${label}: `;
  line.appendChild(labelEl);

  const markEl = document.createElement('span');
  markEl.className = 'detail-mark';
  markEl.textContent = mark;
  line.appendChild(markEl);

  const hasDate = !!date;
  const hasLocation = !!(location && location.trim());

  let provenanceText = '';
  if (hasDate && hasLocation) {
    provenanceText = ` — ${formatSessionDate(date)}, ${location}`;
  } else if (hasDate) {
    provenanceText = ` — ${formatSessionDate(date)}`;
  } else if (hasLocation) {
    provenanceText = ` — ${location}`;
  } else if (fallback) {
    provenanceText = ` — ${fallback}`;
  }

  if (provenanceText) {
    const provenance = document.createElement('span');
    provenance.className = 'detail-provenance';
    provenance.textContent = provenanceText;
    line.appendChild(provenance);
  }

  return line;
}

function buildGapRow(item, baseline, baselineMeta, bestDetails) {
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

  const metaText = item.implement || item.protocol || '';
  if (metaText) {
    const metaSpan = document.createElement('span');
    metaSpan.className = 'gap-item-meta';
    metaSpan.textContent = metaText;
    labelGroup.appendChild(metaSpan);
  }
  header.appendChild(labelGroup);

  if (!Number.isFinite(baseline)) {
    row.appendChild(header);

    row.classList.add('gap-row--empty');
    const placeholder = document.createElement('p');
    placeholder.className = 'gap-empty';
    placeholder.textContent = 'Set a baseline to see progress.';
    row.appendChild(placeholder);
    return row;
  }

  const baselineText = formatMeasurement(baseline, item.measurementType);

  if (!bestDetails) {
    row.appendChild(header);

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

  const headline = document.createElement('span');
  headline.className = 'gap-headline-stat';
  if (gap > 0) {
    const label = document.createElement('span');
    label.className = 'stat-label';
    label.textContent = 'gap';
    headline.appendChild(label);
    headline.appendChild(document.createTextNode(formatMeasurement(gap, item.measurementType)));
  } else if (gap === 0) {
    headline.classList.add('match');
    headline.textContent = 'matched baseline';
  } else {
    headline.classList.add('past');
    headline.textContent = `+${formatMeasurement(-gap, item.measurementType)} past baseline`;
  }
  header.appendChild(headline);
  row.appendChild(header);

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
  row.appendChild(stats);

  const details = document.createElement('div');
  details.id = detailsId;
  details.className = 'gap-details';

  const baselineMetaDate = baselineMeta && baselineMeta.date ? baselineMeta.date : null;
  const baselineMetaLoc = baselineMeta && baselineMeta.location ? baselineMeta.location : null;
  details.appendChild(buildDetailLine('Baseline', baselineText, baselineMetaDate, baselineMetaLoc, null));
  details.appendChild(buildDetailLine(
    'Best',
    formatMeasurement(best, item.measurementType),
    bestDetails.sessionDate,
    bestDetails.sessionLocation,
    null
  ));

  row.appendChild(details);

  return row;
}

let currentFilter = 'competition';

function renderGap(data) {
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  const itemsWithInfo = ITEMS.map((item) => {
    const baselineRaw = data.prs ? data.prs[item.id] : null;
    const baseline = Number.isFinite(baselineRaw) ? baselineRaw : null;
    const baselineMeta = data.prMeta ? data.prMeta[item.id] : null;
    const bestDetails = bestSinceReturnDetails(data, item.id, currentFilter);
    const pct = (baseline !== null && bestDetails && Number.isFinite(bestDetails.value))
      ? percentOfBaseline(bestDetails.value, baseline)
      : null;
    return { item, baseline, baselineMeta, bestDetails, pct };
  });

  itemsWithInfo.sort((a, b) => {
    if (a.pct === null && b.pct === null) return 0;
    if (a.pct === null) return 1;
    if (b.pct === null) return -1;
    return a.pct - b.pct;
  });

  for (const info of itemsWithInfo) {
    const row = buildGapRow(info.item, info.baseline, info.baselineMeta, info.bestDetails);
    if (info.item.category === 'throw') {
      throwsList.appendChild(row);
    } else {
      liftsList.appendChild(row);
    }
  }
}

function setFilter(filter) {
  const next = filter === 'training' ? 'training' : filter === 'all' ? 'all' : 'competition';
  currentFilter = next;
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach((btn) => {
    const isActive = btn.dataset.filter === next;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });
  renderGap(loadData());
}

function init() {
  const data = loadData();
  renderGap(data);

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
}

document.addEventListener('DOMContentLoaded', init);

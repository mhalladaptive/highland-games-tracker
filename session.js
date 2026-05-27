let editingSessionId = null;

function buildAttemptSlot(item, slotIndex, value) {
  const slot = document.createElement('div');
  slot.className = 'attempt';
  slot.dataset.slot = slotIndex;

  const slotLabel = document.createElement('span');
  slotLabel.className = 'attempt-label';
  slotLabel.textContent = `Attempt ${slotIndex}`;
  slot.appendChild(slotLabel);

  const inputsWrap = document.createElement('div');
  inputsWrap.className = 'attempt-inputs';

  const { feet, inches } = inchesToFeetInches(Number.isFinite(value) ? value : null);

  const feetWrap = document.createElement('div');
  feetWrap.className = 'input-wrap';
  const feetInput = document.createElement('input');
  feetInput.type = 'number';
  feetInput.inputMode = 'decimal';
  feetInput.min = '0';
  feetInput.step = 'any';
  feetInput.className = 'field';
  feetInput.dataset.field = 'feet';
  feetInput.dataset.slot = slotIndex;
  feetInput.setAttribute('aria-label', `${item.name} attempt ${slotIndex} feet`);
  if (feet !== '') feetInput.value = feet;
  feetWrap.appendChild(feetInput);
  const feetUnit = document.createElement('span');
  feetUnit.className = 'unit';
  feetUnit.textContent = 'ft';
  feetWrap.appendChild(feetUnit);

  const inchesWrap = document.createElement('div');
  inchesWrap.className = 'input-wrap';
  const inchesInput = document.createElement('input');
  inchesInput.type = 'number';
  inchesInput.inputMode = 'decimal';
  inchesInput.min = '0';
  inchesInput.step = 'any';
  inchesInput.className = 'field';
  inchesInput.dataset.field = 'inches';
  inchesInput.dataset.slot = slotIndex;
  inchesInput.setAttribute('aria-label', `${item.name} attempt ${slotIndex} inches`);
  if (inches !== '') inchesInput.value = inches;
  inchesWrap.appendChild(inchesInput);
  const inchesUnit = document.createElement('span');
  inchesUnit.className = 'unit';
  inchesUnit.textContent = 'in';
  inchesWrap.appendChild(inchesUnit);

  inputsWrap.appendChild(feetWrap);
  inputsWrap.appendChild(inchesWrap);

  slot.appendChild(inputsWrap);
  return slot;
}

const LIFT_ATTEMPT_CAP = 10;
const THROW_ATTEMPT_CAP = 3;

function buildLiftAttemptSlot(unitObj, slotIndex, value, liftName) {
  const slot = document.createElement('div');
  slot.className = 'attempt';
  slot.dataset.slot = slotIndex;

  const slotLabel = document.createElement('span');
  slotLabel.className = 'attempt-label';
  slotLabel.textContent = `Attempt ${slotIndex}`;
  slot.appendChild(slotLabel);

  const inputsWrap = document.createElement('div');
  inputsWrap.className = 'attempt-inputs';

  const wrap = document.createElement('div');
  wrap.className = 'input-wrap';
  const input = document.createElement('input');
  const isTime = unitObj && unitObj.category === 'time';
  input.type = 'text';
  input.inputMode = isTime ? 'numeric' : 'decimal';
  input.className = 'field';
  input.dataset.field = 'liftValue';
  input.dataset.slot = slotIndex;
  input.placeholder = isTime ? 'mm:ss' : '0';
  const unitLabel = unitObj ? unitObj.label : 'value';
  input.setAttribute('aria-label', `${liftName} attempt ${slotIndex} ${unitLabel}`);
  if (Number.isFinite(value)) {
    input.value = isTime ? formatSecondsAsTime(value) : String(value);
  }
  wrap.appendChild(input);
  const unitSpan = document.createElement('span');
  unitSpan.className = 'unit';
  unitSpan.textContent = unitObj ? unitObj.label : '';
  wrap.appendChild(unitSpan);
  inputsWrap.appendChild(wrap);

  slot.appendChild(inputsWrap);
  return slot;
}

function buildSessionRow(item, attempts, stoneWeightValue) {
  const row = document.createElement('div');
  row.className = 'item-row item-row--session';
  row.dataset.itemId = item.id;
  row.dataset.category = 'throw';
  row.dataset.measurementType = item.measurementType;
  row.dataset.attempts = String(Math.max(1, attempts.length));

  const label = document.createElement('div');
  label.className = 'item-label';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'item-name';
  nameSpan.textContent = item.name;
  const metaSpan = document.createElement('span');
  metaSpan.className = 'item-meta';
  metaSpan.textContent = item.implement || item.protocol || '';
  label.appendChild(nameSpan);
  label.appendChild(metaSpan);
  row.appendChild(label);

  const attemptsContainer = document.createElement('div');
  attemptsContainer.className = 'attempts';

  for (let i = 1; i <= THROW_ATTEMPT_CAP; i++) {
    const value = attempts[i - 1];
    attemptsContainer.appendChild(buildAttemptSlot(item, i, value));
  }

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-attempt';
  addBtn.textContent = '+ Add attempt';
  addBtn.addEventListener('click', () => {
    const current = parseInt(row.dataset.attempts, 10);
    if (current < THROW_ATTEMPT_CAP) {
      const next = current + 1;
      row.dataset.attempts = String(next);
      const newSlot = row.querySelector(`.attempt[data-slot="${next}"]`);
      const firstInput = newSlot && newSlot.querySelector('input');
      if (firstInput) firstInput.focus();
    }
  });
  attemptsContainer.appendChild(addBtn);

  row.appendChild(attemptsContainer);

  if (item.capturesStoneWeight) {
    const extra = document.createElement('div');
    extra.className = 'item-extra';

    const extraLabel = document.createElement('span');
    extraLabel.className = 'extra-label';
    extraLabel.textContent = 'Stone thrown';
    extra.appendChild(extraLabel);

    const wrap = document.createElement('div');
    wrap.className = 'input-wrap';
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'decimal';
    input.min = '0';
    input.step = 'any';
    input.className = 'field';
    input.dataset.field = 'stoneWeight';
    input.placeholder = 'optional';
    input.setAttribute('aria-label', `${item.name} actual stone weight in pounds`);
    if (Number.isFinite(stoneWeightValue)) input.value = stoneWeightValue;
    wrap.appendChild(input);
    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = 'lb';
    wrap.appendChild(unit);
    extra.appendChild(wrap);

    row.appendChild(extra);
  }

  return row;
}

function buildLiftRow(lift, attempts, isRemoved) {
  const row = document.createElement('div');
  row.className = 'item-row item-row--session item-row--lift';
  if (isRemoved) row.classList.add('item-row--removed');
  row.dataset.itemId = lift.id;
  row.dataset.category = 'lift';
  row.dataset.unit = lift.unit || '';
  const unitObj = getUnit(lift.unit);
  const liftName = lift.name || '';

  const label = document.createElement('div');
  label.className = 'item-label';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'item-name';
  nameSpan.textContent = liftName;
  if (isRemoved) {
    nameSpan.appendChild(document.createTextNode(' '));
    const tag = document.createElement('span');
    tag.className = 'removed-tag';
    tag.textContent = 'removed';
    nameSpan.appendChild(tag);
  }
  const metaSpan = document.createElement('span');
  metaSpan.className = 'item-meta';
  metaSpan.textContent = lift.protocol || '';
  label.appendChild(nameSpan);
  label.appendChild(metaSpan);
  row.appendChild(label);

  const attemptsContainer = document.createElement('div');
  attemptsContainer.className = 'attempts';

  const visibleCount = Math.min(LIFT_ATTEMPT_CAP, Math.max(1, attempts.length));
  for (let i = 1; i <= visibleCount; i++) {
    attemptsContainer.appendChild(buildLiftAttemptSlot(unitObj, i, attempts[i - 1], liftName));
  }

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-attempt';
  addBtn.textContent = '+ Add attempt';
  addBtn.addEventListener('click', () => {
    const current = attemptsContainer.querySelectorAll('.attempt').length;
    if (current < LIFT_ATTEMPT_CAP) {
      const next = current + 1;
      const newSlot = buildLiftAttemptSlot(unitObj, next, null, liftName);
      attemptsContainer.insertBefore(newSlot, addBtn);
      if (next >= LIFT_ATTEMPT_CAP) addBtn.hidden = true;
      const input = newSlot.querySelector('input');
      if (input) input.focus();
    }
  });
  attemptsContainer.appendChild(addBtn);
  if (visibleCount >= LIFT_ATTEMPT_CAP) addBtn.hidden = true;

  row.appendChild(attemptsContainer);
  return row;
}

function renderForm(prefillMarks, prefillStoneWeights, options) {
  const marks = prefillMarks || {};
  const stoneWeights = prefillStoneWeights || {};
  const opts = options || {};
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  for (const item of ITEMS) {
    if (item.category !== 'throw') continue;
    const attempts = Array.isArray(marks[item.id]) ? marks[item.id] : [];
    const stoneWeight = stoneWeights[item.id];
    const stoneWeightValue = Number.isFinite(stoneWeight) ? stoneWeight : null;
    throwsList.appendChild(buildSessionRow(item, attempts, stoneWeightValue));
  }

  const data = loadData();
  const userLifts = Array.isArray(data.userLifts) ? data.userLifts : [];
  let liftRowsRendered = 0;
  for (const lift of userLifts) {
    if (!lift.active) continue;
    const attempts = Array.isArray(marks[lift.id]) ? marks[lift.id] : [];
    liftsList.appendChild(buildLiftRow(lift, attempts, false));
    liftRowsRendered++;
  }

  // When editing a past session, also render a row for any inactive lift the
  // session has marks for — otherwise collectFormData would not see those
  // marks (no row = no input to read) and "Update Session" would silently
  // drop them. The row is tagged 'removed' but stays fully editable so a
  // genuine typo in old data is still fixable.
  if (opts.includeInactiveLiftsFromMarks) {
    for (const lift of userLifts) {
      if (lift.active) continue;
      const attempts = Array.isArray(marks[lift.id]) ? marks[lift.id] : [];
      if (attempts.length === 0) continue;
      liftsList.appendChild(buildLiftRow(lift, attempts, true));
      liftRowsRendered++;
    }
  }

  if (liftRowsRendered === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state lifts-empty';
    empty.appendChild(document.createTextNode('No S&C lifts yet — add them on the '));
    const link = document.createElement('a');
    link.href = 'index.html';
    link.textContent = 'Set PRs & Goals page';
    empty.appendChild(link);
    empty.appendChild(document.createTextNode('.'));
    liftsList.appendChild(empty);
  }
}

function getSelectedKind() {
  const activeBtn = document.querySelector('.kind-btn.active');
  return activeBtn && activeBtn.dataset.kind === 'training' ? 'training' : 'competition';
}

function setSelectedKind(kind) {
  const next = kind === 'training' ? 'training' : 'competition';
  const buttons = document.querySelectorAll('.kind-btn');
  buttons.forEach((btn) => {
    const isActive = btn.dataset.kind === next;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });
  document.body.classList.remove('kind-competition', 'kind-training');
  document.body.classList.add(`kind-${next}`);
}

function autoGrowTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = 'auto';
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function collectFormData() {
  const date = document.getElementById('session-date').value;
  const locationInput = document.getElementById('session-location');
  const location = locationInput && locationInput.value ? locationInput.value.trim() : '';
  const gamesInput = document.getElementById('session-games');
  const games = gamesInput && gamesInput.value ? gamesInput.value.trim() : '';
  const throwsNotesInput = document.getElementById('throws-notes');
  const throwsNotes = throwsNotesInput && throwsNotesInput.value ? throwsNotesInput.value.trim() : '';
  const liftsNotesInput = document.getElementById('lifts-notes');
  const liftsNotes = liftsNotesInput && liftsNotesInput.value ? liftsNotesInput.value.trim() : '';
  const kind = getSelectedKind();
  const marks = {};
  const stoneWeights = {};

  document.querySelectorAll('.item-row[data-category="throw"]').forEach((row) => {
    const id = row.dataset.itemId;
    const slotsShown = parseInt(row.dataset.attempts, 10) || 1;

    const attempts = [];
    for (let i = 1; i <= slotsShown; i++) {
      const f = readNumber(row.querySelector(`[data-field="feet"][data-slot="${i}"]`));
      const inch = readNumber(row.querySelector(`[data-field="inches"][data-slot="${i}"]`));
      if (f !== null || inch !== null) {
        attempts.push(feetInchesToInches(f ?? 0, inch ?? 0));
      }
    }
    if (attempts.length > 0) marks[id] = attempts;

    const stoneInput = row.querySelector('[data-field="stoneWeight"]');
    if (stoneInput) {
      const sw = readNumber(stoneInput);
      if (sw !== null) stoneWeights[id] = sw;
    }
  });

  document.querySelectorAll('.item-row[data-category="lift"]').forEach((row) => {
    const id = row.dataset.itemId;
    const unitObj = getUnit(row.dataset.unit || '');
    const isTime = unitObj && unitObj.category === 'time';
    const attempts = [];
    row.querySelectorAll('.attempt [data-field="liftValue"]').forEach((input) => {
      const raw = (input.value || '').trim();
      if (!raw) return;
      const n = isTime ? parseTimeToSeconds(raw) : Number(raw);
      if (Number.isFinite(n) && n >= 0) attempts.push(n);
    });
    if (attempts.length > 0) marks[id] = attempts;
  });

  return { date, location, games, throwsNotes, liftsNotes, kind, marks, stoneWeights };
}

function findAttemptGaps() {
  const gaps = [];

  document.querySelectorAll('.item-row[data-category="throw"]').forEach((row) => {
    const id = row.dataset.itemId;
    const slotsShown = parseInt(row.dataset.attempts, 10) || 1;

    const slotHasValue = [];
    for (let i = 1; i <= slotsShown; i++) {
      const f = readNumber(row.querySelector(`[data-field="feet"][data-slot="${i}"]`));
      const inch = readNumber(row.querySelector(`[data-field="inches"][data-slot="${i}"]`));
      slotHasValue.push(f !== null || inch !== null);
    }

    const firstEmptyIdx = slotHasValue.indexOf(false);
    const lastFilledIdx = slotHasValue.reduce((acc, has, i) => (has ? i : acc), -1);

    if (firstEmptyIdx !== -1 && firstEmptyIdx < lastFilledIdx) {
      const item = ITEMS.find((it) => it.id === id);
      gaps.push({ itemName: item ? item.name : id, emptySlot: firstEmptyIdx + 1 });
    }
  });

  const data = loadData();
  const userLifts = Array.isArray(data.userLifts) ? data.userLifts : [];
  document.querySelectorAll('.item-row[data-category="lift"]').forEach((row) => {
    const id = row.dataset.itemId;
    const unitObj = getUnit(row.dataset.unit || '');
    const isTime = unitObj && unitObj.category === 'time';
    const slotHasValue = [];
    row.querySelectorAll('.attempt [data-field="liftValue"]').forEach((input) => {
      const raw = (input.value || '').trim();
      if (!raw) {
        slotHasValue.push(false);
        return;
      }
      const n = isTime ? parseTimeToSeconds(raw) : Number(raw);
      slotHasValue.push(Number.isFinite(n) && n >= 0);
    });

    const firstEmptyIdx = slotHasValue.indexOf(false);
    const lastFilledIdx = slotHasValue.reduce((acc, has, i) => (has ? i : acc), -1);

    if (firstEmptyIdx !== -1 && firstEmptyIdx < lastFilledIdx) {
      const lift = userLifts.find((l) => l.id === id);
      const name = (lift && lift.name) || row.querySelector('.item-name')?.textContent || id;
      gaps.push({ itemName: name, emptySlot: firstEmptyIdx + 1 });
    }
  });

  return gaps;
}

function totalAttempts(session) {
  return Object.values(session.marks).reduce((sum, arr) => sum + arr.length, 0);
}

function itemCount(session) {
  return Object.keys(session.marks).length;
}

function buildSessionEventLine(item, session) {
  const marks = session.marks ? session.marks[item.id] : null;
  if (!Array.isArray(marks) || marks.length === 0) return null;

  const line = document.createElement('div');
  line.className = 'session-event-line';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'session-event-name';
  nameSpan.textContent = item.name;
  line.appendChild(nameSpan);

  if (
    item.capturesStoneWeight &&
    session.stoneWeights &&
    Number.isFinite(session.stoneWeights[item.id])
  ) {
    const stoneSpan = document.createElement('span');
    stoneSpan.className = 'session-event-stone';
    stoneSpan.textContent = ` (${session.stoneWeights[item.id]} lb)`;
    line.appendChild(stoneSpan);
  }

  line.appendChild(document.createTextNode(' — '));

  const marksText = marks
    .map((m) => formatMeasurement(m, item.measurementType))
    .join(', ');
  const marksSpan = document.createElement('span');
  marksSpan.className = 'session-event-marks';
  marksSpan.textContent = marksText;
  line.appendChild(marksSpan);

  return line;
}

function buildNotesBlock(label, text) {
  if (!text) return null;
  const wrap = document.createElement('div');
  wrap.className = 'session-notes-block';

  const labelEl = document.createElement('div');
  labelEl.className = 'session-notes-label';
  labelEl.textContent = label;
  wrap.appendChild(labelEl);

  const body = document.createElement('div');
  body.className = 'session-notes-body';
  body.textContent = text;
  wrap.appendChild(body);

  return wrap;
}

function buildSessionLiftLine(lift, marks) {
  const line = document.createElement('div');
  line.className = 'session-event-line';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'session-event-name';
  nameSpan.textContent = lift.name || '';
  line.appendChild(nameSpan);

  line.appendChild(document.createTextNode(' — '));

  const marksText = marks
    .map((m) => formatLiftMark(m, lift.unit))
    .filter((s) => s !== '')
    .join(', ');
  const marksSpan = document.createElement('span');
  marksSpan.className = 'session-event-marks';
  marksSpan.textContent = marksText;
  line.appendChild(marksSpan);

  return line;
}

function buildSessionDetailsPanel(session, detailsId, userLifts) {
  const details = document.createElement('div');
  details.id = detailsId;
  details.className = 'session-details';

  let anyLines = false;
  const throwItems = ITEMS.filter((it) => it.category === 'throw');

  for (const item of throwItems) {
    const line = buildSessionEventLine(item, session);
    if (line) {
      anyLines = true;
      details.appendChild(line);
    }
  }

  const throwsNotesBlock = buildNotesBlock('Throws notes', session.throwsNotes);
  if (throwsNotesBlock) details.appendChild(throwsNotesBlock);

  const lifts = Array.isArray(userLifts) ? userLifts : [];
  for (const lift of lifts) {
    const marks = session.marks ? session.marks[lift.id] : null;
    if (!Array.isArray(marks) || marks.length === 0) continue;
    anyLines = true;
    details.appendChild(buildSessionLiftLine(lift, marks));
  }

  const liftsNotesBlock = buildNotesBlock('S&C notes', session.liftsNotes);
  if (liftsNotesBlock) details.appendChild(liftsNotesBlock);

  if (!anyLines && !throwsNotesBlock && !liftsNotesBlock) {
    const placeholder = document.createElement('p');
    placeholder.className = 'session-details-empty';
    placeholder.textContent = 'No marks recorded.';
    details.appendChild(placeholder);
  }

  const sessionMilestones = Array.isArray(session.milestones) ? session.milestones : [];
  if (sessionMilestones.length > 0) {
    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'ghost-btn view-celebrations-btn';
    replayBtn.textContent = 'View Celebrations';
    replayBtn.addEventListener('click', () => {
      const freshData = loadData();
      showCelebrationQueue(session, freshData);
    });
    details.appendChild(replayBtn);
  }

  return details;
}

function renderSessionsList(sessions, userLifts) {
  const listEl = document.getElementById('sessions-list');
  const emptyEl = document.getElementById('sessions-empty');
  listEl.innerHTML = '';

  if (!sessions || sessions.length === 0) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;

  const sorted = [...sessions].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.id - a.id;
  });

  for (const s of sorted) {
    const li = document.createElement('li');
    const kind = sessionKind(s);
    li.className = `session-row kind-${kind}`;
    li.dataset.sessionId = String(s.id);

    const info = document.createElement('div');
    info.className = 'session-info';

    const dateLine = document.createElement('div');
    dateLine.className = 'session-date';
    dateLine.appendChild(document.createTextNode(formatSessionDate(s.date)));
    const badge = document.createElement('span');
    badge.className = `session-kind-badge ${kind}`;
    badge.textContent = kind === 'training' ? 'TRAIN' : 'COMP';
    dateLine.appendChild(badge);
    const sessionMilestones = Array.isArray(s.milestones) ? s.milestones : [];
    const cardCount = sessionMilestones.filter((m) => m && m.type !== 'awesomeDay').length;
    if (cardCount > 0) {
      const mBadge = document.createElement('span');
      mBadge.className = 'milestone-badge';
      mBadge.textContent = cardCount === 1 ? '1 MILESTONE' : `${cardCount} MILESTONES`;
      dateLine.appendChild(mBadge);
    }
    info.appendChild(dateLine);

    if (kind === 'competition' && s.games) {
      const gamesLine = document.createElement('div');
      gamesLine.className = 'session-games-line';
      gamesLine.textContent = s.games;
      info.appendChild(gamesLine);
    }

    if (s.location) {
      const locLine = document.createElement('div');
      locLine.className = 'session-location-line';
      locLine.textContent = s.location;
      info.appendChild(locLine);
    }

    const summary = document.createElement('div');
    summary.className = 'session-summary';
    const items = itemCount(s);
    const attempts = totalAttempts(s);
    summary.textContent = `${items} item${items === 1 ? '' : 's'} · ${attempts} attempt${attempts === 1 ? '' : 's'}`;
    info.appendChild(summary);

    li.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'session-actions';
    const detailsId = `session-details-${s.id}`;

    const viewBtn = document.createElement('button');
    viewBtn.type = 'button';
    viewBtn.className = 'ghost-btn';
    viewBtn.textContent = 'View';
    viewBtn.setAttribute('aria-expanded', 'false');
    viewBtn.setAttribute('aria-controls', detailsId);
    viewBtn.addEventListener('click', () => {
      const expanded = li.classList.toggle('expanded');
      viewBtn.setAttribute('aria-expanded', String(expanded));
    });
    actions.appendChild(viewBtn);

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'ghost-btn';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => handleEdit(s.id));
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'ghost-btn danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => handleDelete(s.id));
    actions.appendChild(deleteBtn);

    li.appendChild(actions);
    li.appendChild(buildSessionDetailsPanel(s, detailsId, userLifts));
    listEl.appendChild(li);
  }
}

function resetForm() {
  editingSessionId = null;
  document.getElementById('session-date').value = todayISO();
  const locInput = document.getElementById('session-location');
  if (locInput) locInput.value = '';
  const gamesInput = document.getElementById('session-games');
  if (gamesInput) gamesInput.value = '';
  const throwsNotesInput = document.getElementById('throws-notes');
  if (throwsNotesInput) {
    throwsNotesInput.value = '';
    autoGrowTextarea(throwsNotesInput);
  }
  const liftsNotesInput = document.getElementById('lifts-notes');
  if (liftsNotesInput) {
    liftsNotesInput.value = '';
    autoGrowTextarea(liftsNotesInput);
  }
  setSelectedKind('competition');
  renderForm({}, {});
  document.getElementById('save-btn').textContent = 'Save Session';
  document.getElementById('edit-banner').hidden = true;
}

function handleEdit(sessionId) {
  const data = loadData();
  const session = data.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  editingSessionId = sessionId;
  document.getElementById('session-date').value = session.date;
  const locInput = document.getElementById('session-location');
  if (locInput) locInput.value = session.location || '';
  const gamesInput = document.getElementById('session-games');
  if (gamesInput) gamesInput.value = session.games || '';
  const throwsNotesInput = document.getElementById('throws-notes');
  if (throwsNotesInput) {
    throwsNotesInput.value = session.throwsNotes || '';
    autoGrowTextarea(throwsNotesInput);
  }
  const liftsNotesInput = document.getElementById('lifts-notes');
  if (liftsNotesInput) {
    liftsNotesInput.value = session.liftsNotes || '';
    autoGrowTextarea(liftsNotesInput);
  }
  setSelectedKind(session.kind || 'competition');
  renderForm(session.marks, session.stoneWeights || {}, { includeInactiveLiftsFromMarks: true });
  document.getElementById('save-btn').textContent = 'Update Session';
  document.getElementById('edit-banner-date').textContent = formatSessionDate(session.date);
  document.getElementById('edit-banner').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleDelete(sessionId) {
  const data = loadData();
  const session = data.sessions.find((s) => s.id === sessionId);
  if (!session) return;

  const ok = window.confirm(`Delete session from ${formatSessionDate(session.date)}? This cannot be undone.`);
  if (!ok) return;

  data.sessions = data.sessions.filter((s) => s.id !== sessionId);
  // Stage 4c: rebuild prs / prMeta / goalMeta from the remaining sessions so
  // deleting the PR-holder drops prs to the next-best (and clears the event
  // entirely when no session has marks for it anymore), and goalMeta clears
  // when no remaining session meets the goal.
  const recomputed = recomputeDerivedState(data);
  data.prs = recomputed.prs;
  data.prMeta = recomputed.prMeta;
  data.goalMeta = recomputed.goalMeta;
  saveData(data);

  if (editingSessionId === sessionId) {
    resetForm();
  }

  renderSessionsList(data.sessions, data.userLifts);
  showStatus('Session deleted.');
}

function handleCancelEdit() {
  resetForm();
}

function showStatus(message, type) {
  const el = document.getElementById('status');
  el.textContent = message;
  el.classList.toggle('error', type === 'error');
  el.classList.add('visible');
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => {
    el.classList.remove('visible');
  }, 2200);
}

// Celebration card builders. Each takes the milestone, the saved session,
// and the current data (for event-name / unit lookups including inactive
// lifts), and returns a DOM card. Pure-ish: reads ITEMS/userLifts via the
// shared helpers; no localStorage.

function buildCelebrationMeta(session) {
  const wrap = document.createElement('div');
  wrap.className = 'celebration-card-meta';
  const dateLine = document.createElement('span');
  dateLine.className = 'celebration-card-meta-line';
  dateLine.textContent = formatSessionDate(session.date);
  wrap.appendChild(dateLine);
  if (session.games) {
    const games = document.createElement('span');
    games.className = 'celebration-card-meta-line';
    games.textContent = session.games;
    wrap.appendChild(games);
  }
  if (session.location) {
    const loc = document.createElement('span');
    loc.className = 'celebration-card-meta-line';
    loc.textContent = session.location;
    wrap.appendChild(loc);
  }
  return wrap;
}

function buildCelebrationWordmark() {
  const wm = document.createElement('div');
  wm.className = 'celebration-card-wordmark';
  wm.textContent = 'Stone & Standard';
  return wm;
}

function buildPrCard(milestone, session, data) {
  const card = document.createElement('div');
  card.className = 'celebration-card celebration-card--pr';

  const headline = document.createElement('p');
  headline.className = 'celebration-card-headline';
  headline.textContent = 'New Personal Record';
  card.appendChild(headline);

  const eventName = document.createElement('p');
  eventName.className = 'celebration-card-event';
  eventName.textContent = eventDisplayName(milestone.event, data) || milestone.event;
  card.appendChild(eventName);

  const mark = document.createElement('p');
  mark.className = 'celebration-card-mark';
  mark.textContent = formatEventValue(milestone.event, milestone.value, data);
  card.appendChild(mark);

  if (Number.isFinite(milestone.previousValue)) {
    const prev = document.createElement('p');
    prev.className = 'celebration-card-prev';
    prev.textContent = `was ${formatEventValue(milestone.event, milestone.previousValue, data)}`;
    card.appendChild(prev);
  }

  card.appendChild(buildCelebrationMeta(session));
  card.appendChild(buildCelebrationWordmark());
  return card;
}

function buildGoalCard(milestone, session, data) {
  const card = document.createElement('div');
  card.className = 'celebration-card celebration-card--goal';

  const headline = document.createElement('p');
  headline.className = 'celebration-card-headline';
  headline.textContent = 'Goal Achieved';
  card.appendChild(headline);

  const eventName = document.createElement('p');
  eventName.className = 'celebration-card-event';
  eventName.textContent = eventDisplayName(milestone.event, data) || milestone.event;
  card.appendChild(eventName);

  const mark = document.createElement('p');
  mark.className = 'celebration-card-mark';
  mark.textContent = formatEventValue(milestone.event, milestone.value, data);
  card.appendChild(mark);

  if (Number.isFinite(milestone.goalValue)) {
    const goal = document.createElement('p');
    goal.className = 'celebration-card-prev';
    const goalText = formatEventValue(milestone.event, milestone.goalValue, data);
    const hitText = formatEventValue(milestone.event, milestone.value, data);
    goal.textContent = `you set ${goalText}, you hit ${hitText}`;
    card.appendChild(goal);
  }

  card.appendChild(buildCelebrationMeta(session));
  card.appendChild(buildCelebrationWordmark());
  return card;
}

function buildAwesomeDayCard(session, milestones, data) {
  const card = document.createElement('div');
  card.className = 'celebration-card celebration-card--awesomeDay';

  const top = document.createElement('p');
  top.className = 'celebration-card-event';
  top.textContent = session.games
    ? `${formatSessionDate(session.date)} · ${session.games}`
    : formatSessionDate(session.date);
  card.appendChild(top);

  const headline = document.createElement('p');
  headline.className = 'celebration-card-headline';
  headline.textContent = 'Awesome Day';
  card.appendChild(headline);

  const list = document.createElement('ul');
  list.className = 'milestone-list';
  for (const m of milestones) {
    if (m.type === 'awesomeDay') continue;
    const li = document.createElement('li');
    const name = eventDisplayName(m.event, data) || m.event;
    const value = formatEventValue(m.event, m.value, data);
    const label = m.type === 'pr' ? 'PR' : 'Goal';
    li.textContent = `${label} · ${name}: ${value}`;
    list.appendChild(li);
  }
  card.appendChild(list);

  card.appendChild(buildCelebrationWordmark());
  return card;
}

// Stage 6a — celebration sound. The preference is a standalone localStorage
// flag (not part of the v2 data blob or profile, so no schema change): absent
// or anything other than 'on' means off, which is the default. The clips are
// placeholders at fixed paths today; the real "Big throw!" shout and weight-
// clang drop in at the same paths once recorded.
const SOUND_PREF_KEY = 'stone-and-standard-sound';
const CELEBRATION_AUDIO = {
  shout: 'audio/big-throw.wav',
  land: 'audio/weight-clang.wav',
};

function isSoundOn() {
  try {
    return localStorage.getItem(SOUND_PREF_KEY) === 'on';
  } catch {
    return false;
  }
}

function setSoundOn(on) {
  try {
    localStorage.setItem(SOUND_PREF_KEY, on ? 'on' : 'off');
  } catch {
    // storage disabled (private mode) — sound simply stays off
  }
}

// Play a celebration clip if sound is on. Resilient by design: a missing or
// undecodable file, or a blocked autoplay, is swallowed so audio can never
// break the cut-scene.
function playCelebrationSound(src) {
  if (!isSoundOn()) return;
  try {
    const audio = new Audio(src);
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // never let audio throw into the celebration
  }
}

// Stage 6a — the throws PR card: a soft-grey card carrying an implement-specific
// athlete silhouette as its hero, anchored bottom-right so the text reads in the
// upper-left negative space. selectThrowSilhouette (shared.js, pure) picks the
// asset; this is the rendering layer. All eight throws events have a silhouette;
// if one is ever missing (no src, or the image fails to load) the card falls
// back to the un-skinned layout — the .celebration-card--no-silhouette modifier
// re-centres the text for that case.
//
// A celebration sound fires when the card renders (a no-op while sound is off,
// which is the default). Playback is gesture-initiated — the card fires from
// Save Session or a View Celebrations click — so it stays within autoplay policy.
function buildThrowsPrCard(milestone, session, data, sil) {
  const card = document.createElement('div');
  card.className = 'celebration-card celebration-card--pr celebration-card--throw';

  if (sil && sil.src) {
    const img = document.createElement('img');
    img.className = 'throw-silhouette';
    img.src = sil.src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    // A missing or undecodable asset must never break the card: drop the image
    // and fall back to the un-skinned layout.
    img.addEventListener('error', () => {
      img.remove();
      card.classList.add('celebration-card--no-silhouette');
    });
    card.appendChild(img);
  } else {
    card.classList.add('celebration-card--no-silhouette');
  }

  const headline = document.createElement('p');
  headline.className = 'celebration-card-headline';
  headline.textContent = 'New Personal Record';
  card.appendChild(headline);

  const eventName = document.createElement('p');
  eventName.className = 'celebration-card-event';
  eventName.textContent = eventDisplayName(milestone.event, data) || milestone.event;
  card.appendChild(eventName);

  const mark = document.createElement('p');
  mark.className = 'celebration-card-mark';
  mark.textContent = formatEventValue(milestone.event, milestone.value, data);
  card.appendChild(mark);

  if (Number.isFinite(milestone.previousValue)) {
    const prev = document.createElement('p');
    prev.className = 'celebration-card-prev';
    prev.textContent = `was ${formatEventValue(milestone.event, milestone.previousValue, data)}`;
    card.appendChild(prev);
  }

  card.appendChild(buildCelebrationMeta(session));
  card.appendChild(buildCelebrationWordmark());

  playCelebrationSound(CELEBRATION_AUDIO.shout);
  return card;
}

function buildCelebrationCard(milestone, session, data, allMilestones) {
  if (!milestone || !milestone.type) return null;
  if (milestone.type === 'pr') {
    const profileClass = data && data.profile ? data.profile.class : undefined;
    const sil = selectThrowSilhouette(milestone.event, profileClass);
    if (sil) return buildThrowsPrCard(milestone, session, data, sil);
    return buildPrCard(milestone, session, data);
  }
  if (milestone.type === 'goal') return buildGoalCard(milestone, session, data);
  if (milestone.type === 'awesomeDay') return buildAwesomeDayCard(session, allMilestones, data);
  return null;
}

// Stage 4c chain prompt — built inline after each Goal card in the
// celebration queue so the loop ("achieved a goal → set a new one") closes
// with zero navigation. Carries the Stage 3a unit-aware goal input
// (feet/inches for throws, a single value input for lifts, mm:ss for time
// units) and a "Not now" skip.
function buildChainPromptValueInput(eventId, data) {
  const wrap = document.createElement('div');
  wrap.className = 'chain-prompt-value';

  const throwItem = ITEMS.find((it) => it.id === eventId && it.category === 'throw');
  if (throwItem) {
    wrap.dataset.kind = 'throw';
    const feetWrap = document.createElement('div');
    feetWrap.className = 'input-wrap';
    const feetInput = document.createElement('input');
    feetInput.type = 'number';
    feetInput.inputMode = 'decimal';
    feetInput.min = '0';
    feetInput.step = 'any';
    feetInput.className = 'field';
    feetInput.dataset.field = 'chainFeet';
    feetInput.placeholder = '0';
    feetInput.setAttribute('aria-label', 'New goal feet');
    feetWrap.appendChild(feetInput);
    const feetUnit = document.createElement('span');
    feetUnit.className = 'unit';
    feetUnit.textContent = 'ft';
    feetWrap.appendChild(feetUnit);

    const inchesWrap = document.createElement('div');
    inchesWrap.className = 'input-wrap';
    const inchesInput = document.createElement('input');
    inchesInput.type = 'number';
    inchesInput.inputMode = 'decimal';
    inchesInput.min = '0';
    inchesInput.step = 'any';
    inchesInput.className = 'field';
    inchesInput.dataset.field = 'chainInches';
    inchesInput.placeholder = '0';
    inchesInput.setAttribute('aria-label', 'New goal inches');
    inchesWrap.appendChild(inchesInput);
    const inchesUnit = document.createElement('span');
    inchesUnit.className = 'unit';
    inchesUnit.textContent = 'in';
    inchesWrap.appendChild(inchesUnit);

    wrap.appendChild(feetWrap);
    wrap.appendChild(inchesWrap);
    return wrap;
  }

  const lifts = (data && Array.isArray(data.userLifts)) ? data.userLifts : [];
  const lift = lifts.find((l) => l && l.id === eventId);
  const unitObj = lift ? getUnit(lift.unit) : null;
  const isTime = unitObj && unitObj.category === 'time';
  wrap.dataset.kind = 'lift';
  wrap.dataset.unit = (lift && lift.unit) || '';

  const single = document.createElement('div');
  single.className = 'input-wrap';
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = isTime ? 'numeric' : 'decimal';
  input.className = 'field';
  input.dataset.field = 'chainValue';
  input.placeholder = isTime ? 'mm:ss' : '0';
  input.setAttribute('aria-label', 'New goal value');
  single.appendChild(input);
  const unitSpan = document.createElement('span');
  unitSpan.className = 'unit';
  unitSpan.textContent = unitObj ? unitObj.label : '';
  single.appendChild(unitSpan);
  wrap.appendChild(single);
  return wrap;
}

function readChainPromptValue(wrap) {
  if (!wrap) return null;
  if (wrap.dataset.kind === 'throw') {
    const f = readNumber(wrap.querySelector('[data-field="chainFeet"]'));
    const i = readNumber(wrap.querySelector('[data-field="chainInches"]'));
    if (f === null && i === null) return null;
    return feetInchesToInches(f == null ? 0 : f, i == null ? 0 : i);
  }
  const input = wrap.querySelector('[data-field="chainValue"]');
  if (!input) return null;
  const raw = (input.value || '').trim();
  if (!raw) return null;
  const unitObj = getUnit(wrap.dataset.unit);
  const isTime = unitObj && unitObj.category === 'time';
  if (isTime) return parseTimeToSeconds(raw);
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function buildChainPrompt(milestone, data, onSave, onSkip) {
  const panel = document.createElement('div');
  panel.className = 'celebration-card chain-prompt';
  panel.addEventListener('click', (e) => { e.stopPropagation(); });

  const title = document.createElement('p');
  title.className = 'chain-prompt-title';
  const name = eventDisplayName(milestone.event, data) || milestone.event;
  title.textContent = `Want to set a new goal for ${name}?`;
  panel.appendChild(title);

  const valueWrap = buildChainPromptValueInput(milestone.event, data);
  panel.appendChild(valueWrap);

  const actions = document.createElement('div');
  actions.className = 'chain-prompt-actions';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'save-btn chain-prompt-save';
  saveBtn.textContent = 'Save goal';
  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const value = readChainPromptValue(valueWrap);
    if (!Number.isFinite(value) || value < 0) return;
    onSave(value);
  });
  actions.appendChild(saveBtn);

  const skipBtn = document.createElement('button');
  skipBtn.type = 'button';
  skipBtn.className = 'ghost-btn chain-prompt-skip';
  skipBtn.textContent = 'Not now';
  skipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onSkip();
  });
  actions.appendChild(skipBtn);

  panel.appendChild(actions);
  return panel;
}

// Show the modal queue: one card per screen, tap (or Enter/Space/Right) to
// advance, forward-only; closing past the last card removes the overlay.
// A × button in the corner ends the queue early.
//
// options.subset — array of milestones to display, defaulting to the
// session's full milestones[]. The awesomeDay card still lists the session's
// full milestones[] regardless, so a partial-queue (edit-created subset)
// summary stays truthful.
//
// options.chainPrompts — when true, a chain prompt appears right after each
// Goal card and before the queue advances; "Save goal" updates goals[event]
// and recomputes goalMeta, "Not now" skips. Default false (replay does not
// re-prompt for goals already in the past).
function showCelebrationQueue(session, data, options) {
  const opts = options || {};
  const fullList = Array.isArray(session && session.milestones) ? session.milestones : [];
  const queue = Array.isArray(opts.subset) ? opts.subset : fullList;
  if (queue.length === 0) return;

  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Session celebrations');

  const slot = document.createElement('div');
  slot.className = 'celebration-card-slot';
  overlay.appendChild(slot);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'celebration-close';
  closeBtn.setAttribute('aria-label', 'Close celebrations');
  closeBtn.textContent = '×';
  overlay.appendChild(closeBtn);

  // Sound on/off toggle. Sound is off by default; the preference persists in a
  // standalone localStorage flag (see isSoundOn / setSoundOn). The toggle is a
  // user gesture, so turning sound on keeps later playback within autoplay
  // policy.
  const soundBtn = document.createElement('button');
  soundBtn.type = 'button';
  soundBtn.className = 'celebration-sound';
  function syncSoundBtn() {
    const on = isSoundOn();
    soundBtn.textContent = on ? '🔊' : '🔇';
    soundBtn.setAttribute('aria-label', on ? 'Sound on — tap to mute' : 'Sound off — tap to unmute');
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }
  syncSoundBtn();
  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setSoundOn(!isSoundOn());
    syncSoundBtn();
  });
  overlay.appendChild(soundBtn);

  let index = 0;
  let inChainPrompt = false;

  function renderCard() {
    slot.innerHTML = '';
    const card = buildCelebrationCard(queue[index], session, data, fullList);
    if (card) slot.appendChild(card);
  }
  function renderChainPromptFor(milestone) {
    slot.innerHTML = '';
    inChainPrompt = true;
    const panel = buildChainPrompt(milestone, data, (value) => {
      const fresh = loadData();
      if (!fresh.goals || typeof fresh.goals !== 'object') fresh.goals = {};
      fresh.goals[milestone.event] = value;
      const recomputed = recomputeDerivedState(fresh);
      fresh.prs = recomputed.prs;
      fresh.prMeta = recomputed.prMeta;
      fresh.goalMeta = recomputed.goalMeta;
      saveData(fresh);
      if (document.getElementById('sessions-list')) {
        renderSessionsList(fresh.sessions, fresh.userLifts);
      }
      advanceAfterPrompt();
    }, () => {
      advanceAfterPrompt();
    });
    slot.appendChild(panel);
  }
  function close() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }
  function advanceAfterPrompt() {
    inChainPrompt = false;
    index += 1;
    if (index >= queue.length) close();
    else renderCard();
  }
  function advance() {
    const current = queue[index];
    if (opts.chainPrompts && current && current.type === 'goal' && !inChainPrompt) {
      renderChainPromptFor(current);
      return;
    }
    index += 1;
    if (index >= queue.length) close();
    else renderCard();
  }
  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (!inChainPrompt && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
      e.preventDefault();
      advance();
    }
  }

  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); close(); });
  overlay.addEventListener('click', () => {
    if (inChainPrompt) return;
    advance();
  });
  document.addEventListener('keydown', onKey);

  renderCard();
  document.body.appendChild(overlay);
}

// Apply the celebration system at save time for a NEW session: run detection
// against the pre-update data, then mutate prs / prMeta / goalMeta and stamp
// session.milestones[]. Stage 4b does not recompute on edit (see 4c) — this
// only runs on the new-session save path.
function applyCelebrationUpdates(newSession, data) {
  const prUpdates = sessionPrUpdates(newSession, data);
  const milestones = detectMilestones(newSession, data);

  for (const eventId of Object.keys(prUpdates)) {
    data.prs[eventId] = prUpdates[eventId];
    data.prMeta[eventId] = buildPrMetaFromSession(newSession);
  }
  const achievedAt = new Date().toISOString();
  for (const m of milestones) {
    if (m.type === 'goal') {
      data.goalMeta[m.event] = {
        value: m.goalValue,
        achievedAt,
        achievedInSessionId: newSession.id,
      };
    }
  }
  newSession.milestones = milestones;
  return milestones;
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = collectFormData();

  if (!formData.date) {
    showStatus('Pick a date first.', 'error');
    return;
  }

  const gaps = findAttemptGaps();
  if (gaps.length > 0) {
    const g = gaps[0];
    showStatus(`${g.itemName}: attempt ${g.emptySlot} is empty. Fill it before saving.`, 'error');
    return;
  }

  if (Object.keys(formData.marks).length === 0) {
    showStatus('Add at least one mark before saving.', 'error');
    return;
  }

  const data = loadData();

  const games = formData.kind === 'competition' ? (formData.games || '') : '';
  const throwsNotes = formData.throwsNotes || '';
  const liftsNotes = formData.liftsNotes || '';

  if (editingSessionId !== null) {
    let created = [];
    let updatedSession = null;
    const idx = data.sessions.findIndex((s) => s.id === editingSessionId);
    if (idx >= 0) {
      const existing = data.sessions[idx];
      const oldMilestones = Array.isArray(existing && existing.milestones) ? existing.milestones : [];
      updatedSession = {
        id: editingSessionId,
        date: formData.date,
        location: formData.location || '',
        games,
        kind: formData.kind,
        marks: formData.marks,
        stoneWeights: formData.stoneWeights,
        throwsNotes,
        liftsNotes,
      };
      data.sessions[idx] = updatedSession;
      // Stage 4c: re-derive the edited session's milestones against a baseline
      // built from chronologically-prior sessions only. Newly created
      // milestones (present now but not before) fire a celebration card;
      // removed milestones are silent. Every other session's milestones[]
      // is left frozen.
      const newMilestones = redetectMilestonesForEditedSession(updatedSession, data);
      updatedSession.milestones = newMilestones;
      created = diffCreatedMilestones(oldMilestones, newMilestones);
    }
    // Stage 4c: rebuild prs / prMeta / goalMeta across all sessions so the
    // live derived data stays honest after the edit.
    const recomputed = recomputeDerivedState(data);
    data.prs = recomputed.prs;
    data.prMeta = recomputed.prMeta;
    data.goalMeta = recomputed.goalMeta;
    saveData(data);
    renderSessionsList(data.sessions, data.userLifts);
    resetForm();
    showStatus('Session updated.');
    if (updatedSession && created.length > 0) {
      showCelebrationQueue(updatedSession, data, { subset: created, chainPrompts: true });
    }
  } else {
    const newSession = {
      id: Date.now(),
      date: formData.date,
      location: formData.location || '',
      games,
      kind: formData.kind,
      marks: formData.marks,
      stoneWeights: formData.stoneWeights,
      throwsNotes,
      liftsNotes,
    };
    applyCelebrationUpdates(newSession, data);
    data.sessions.push(newSession);
    saveData(data);
    renderSessionsList(data.sessions, data.userLifts);
    resetForm();
    showStatus(`Session logged for ${formatSessionDate(formData.date)}.`);
    showCelebrationQueue(newSession, data, { chainPrompts: true });
  }
}

function init() {
  const data = loadData();
  document.getElementById('session-date').value = todayISO();
  setSelectedKind('competition');
  renderForm({}, {});
  renderSessionsList(data.sessions, data.userLifts);

  document.querySelectorAll('.kind-btn').forEach((btn) => {
    btn.addEventListener('click', () => setSelectedKind(btn.dataset.kind));
  });

  document.querySelectorAll('.notes-field').forEach((textarea) => {
    textarea.addEventListener('input', () => autoGrowTextarea(textarea));
    autoGrowTextarea(textarea);
  });

  document.getElementById('session-form').addEventListener('submit', handleSubmit);
  document.getElementById('cancel-edit-btn').addEventListener('click', handleCancelEdit);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('session-form')) init();
});

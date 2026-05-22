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

  if (item.measurementType === 'weight') {
    const wrap = document.createElement('div');
    wrap.className = 'input-wrap';
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'decimal';
    input.min = '0';
    input.step = 'any';
    input.className = 'field';
    input.dataset.field = 'weight';
    input.dataset.slot = slotIndex;
    input.setAttribute('aria-label', `${item.name} attempt ${slotIndex} weight in pounds`);
    if (Number.isFinite(value)) input.value = value;
    wrap.appendChild(input);
    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = 'lb';
    wrap.appendChild(unit);
    inputsWrap.appendChild(wrap);
  } else {
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
  }

  slot.appendChild(inputsWrap);
  return slot;
}

function buildSessionRow(item, attempts, stoneWeightValue) {
  const row = document.createElement('div');
  row.className = 'item-row item-row--session';
  row.dataset.itemId = item.id;
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

  for (let i = 1; i <= 3; i++) {
    const value = attempts[i - 1];
    attemptsContainer.appendChild(buildAttemptSlot(item, i, value));
  }

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'add-attempt';
  addBtn.textContent = '+ Add attempt';
  addBtn.addEventListener('click', () => {
    const current = parseInt(row.dataset.attempts, 10);
    if (current < 3) {
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

function renderForm(prefillMarks, prefillStoneWeights) {
  const marks = prefillMarks || {};
  const stoneWeights = prefillStoneWeights || {};
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  for (const item of ITEMS) {
    const attempts = Array.isArray(marks[item.id]) ? marks[item.id] : [];
    const stoneWeight = stoneWeights[item.id];
    const stoneWeightValue = Number.isFinite(stoneWeight) ? stoneWeight : null;
    const row = buildSessionRow(item, attempts, stoneWeightValue);
    if (item.category === 'throw') {
      throwsList.appendChild(row);
    } else {
      liftsList.appendChild(row);
    }
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

  const rows = document.querySelectorAll('.item-row');
  rows.forEach((row) => {
    const id = row.dataset.itemId;
    const type = row.dataset.measurementType;
    const slotsShown = parseInt(row.dataset.attempts, 10) || 1;

    const attempts = [];
    for (let i = 1; i <= slotsShown; i++) {
      if (type === 'weight') {
        const w = readNumber(row.querySelector(`[data-field="weight"][data-slot="${i}"]`));
        if (w !== null) attempts.push(w);
      } else {
        const f = readNumber(row.querySelector(`[data-field="feet"][data-slot="${i}"]`));
        const inch = readNumber(row.querySelector(`[data-field="inches"][data-slot="${i}"]`));
        if (f !== null || inch !== null) {
          attempts.push(feetInchesToInches(f ?? 0, inch ?? 0));
        }
      }
    }
    if (attempts.length > 0) marks[id] = attempts;

    const stoneInput = row.querySelector('[data-field="stoneWeight"]');
    if (stoneInput) {
      const sw = readNumber(stoneInput);
      if (sw !== null) stoneWeights[id] = sw;
    }
  });

  return { date, location, games, throwsNotes, liftsNotes, kind, marks, stoneWeights };
}

function findAttemptGaps() {
  const gaps = [];
  const rows = document.querySelectorAll('.item-row');
  rows.forEach((row) => {
    const id = row.dataset.itemId;
    const type = row.dataset.measurementType;
    const slotsShown = parseInt(row.dataset.attempts, 10) || 1;

    const slotHasValue = [];
    for (let i = 1; i <= slotsShown; i++) {
      if (type === 'weight') {
        const w = readNumber(row.querySelector(`[data-field="weight"][data-slot="${i}"]`));
        slotHasValue.push(w !== null);
      } else {
        const f = readNumber(row.querySelector(`[data-field="feet"][data-slot="${i}"]`));
        const inch = readNumber(row.querySelector(`[data-field="inches"][data-slot="${i}"]`));
        slotHasValue.push(f !== null || inch !== null);
      }
    }

    const firstEmptyIdx = slotHasValue.indexOf(false);
    const lastFilledIdx = slotHasValue.reduce((acc, has, i) => (has ? i : acc), -1);

    if (firstEmptyIdx !== -1 && firstEmptyIdx < lastFilledIdx) {
      const item = ITEMS.find((it) => it.id === id);
      gaps.push({
        itemName: item ? item.name : id,
        emptySlot: firstEmptyIdx + 1,
      });
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

function buildSessionDetailsPanel(session, detailsId) {
  const details = document.createElement('div');
  details.id = detailsId;
  details.className = 'session-details';

  let anyLines = false;
  const throwItems = ITEMS.filter((it) => it.category === 'throw');
  const liftItems = ITEMS.filter((it) => it.category === 'lift');

  for (const item of throwItems) {
    const line = buildSessionEventLine(item, session);
    if (line) {
      anyLines = true;
      details.appendChild(line);
    }
  }

  const throwsNotesBlock = buildNotesBlock('Throws notes', session.throwsNotes);
  if (throwsNotesBlock) details.appendChild(throwsNotesBlock);

  for (const item of liftItems) {
    const line = buildSessionEventLine(item, session);
    if (line) {
      anyLines = true;
      details.appendChild(line);
    }
  }

  const liftsNotesBlock = buildNotesBlock('S&C notes', session.liftsNotes);
  if (liftsNotesBlock) details.appendChild(liftsNotesBlock);

  if (!anyLines && !throwsNotesBlock && !liftsNotesBlock) {
    const placeholder = document.createElement('p');
    placeholder.className = 'session-details-empty';
    placeholder.textContent = 'No marks recorded.';
    details.appendChild(placeholder);
  }

  return details;
}

function renderSessionsList(sessions) {
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
    li.appendChild(buildSessionDetailsPanel(s, detailsId));
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
  renderForm(session.marks, session.stoneWeights || {});
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
  saveData(data);

  if (editingSessionId === sessionId) {
    resetForm();
  }

  renderSessionsList(data.sessions);
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
    const idx = data.sessions.findIndex((s) => s.id === editingSessionId);
    if (idx >= 0) {
      data.sessions[idx] = {
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
    }
    saveData(data);
    renderSessionsList(data.sessions);
    resetForm();
    showStatus('Session updated.');
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
    data.sessions.push(newSession);
    saveData(data);
    renderSessionsList(data.sessions);
    resetForm();
    showStatus(`Session logged for ${formatSessionDate(formData.date)}.`);
  }
}

function init() {
  const data = loadData();
  document.getElementById('session-date').value = todayISO();
  setSelectedKind('competition');
  renderForm({}, {});
  renderSessionsList(data.sessions);

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

document.addEventListener('DOMContentLoaded', init);

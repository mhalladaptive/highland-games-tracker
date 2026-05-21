function buildThrowValueInputs(slot, item, value) {
  const wrap = document.createElement('div');
  wrap.className = 'value-inputs';
  wrap.dataset.slot = slot;

  if (item.measurementType === 'weight') {
    const w = document.createElement('div');
    w.className = 'input-wrap';
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'decimal';
    input.min = '0';
    input.step = 'any';
    input.className = 'field';
    input.dataset.field = 'weight';
    input.placeholder = '0';
    input.setAttribute('aria-label', `${item.name} ${slot} weight in pounds`);
    if (Number.isFinite(value)) input.value = value;
    w.appendChild(input);
    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = 'lb';
    w.appendChild(unit);
    wrap.appendChild(w);
    return wrap;
  }

  const { feet, inches } = inchesToFeetInches(value);
  const feetWrap = document.createElement('div');
  feetWrap.className = 'input-wrap';
  const feetInput = document.createElement('input');
  feetInput.type = 'number';
  feetInput.inputMode = 'decimal';
  feetInput.min = '0';
  feetInput.step = 'any';
  feetInput.className = 'field';
  feetInput.dataset.field = 'feet';
  feetInput.placeholder = '0';
  feetInput.setAttribute('aria-label', `${item.name} ${slot} feet`);
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
  inchesInput.placeholder = '0';
  inchesInput.setAttribute('aria-label', `${item.name} ${slot} inches`);
  if (inches !== '') inchesInput.value = inches;
  inchesWrap.appendChild(inchesInput);
  const inchesUnit = document.createElement('span');
  inchesUnit.className = 'unit';
  inchesUnit.textContent = 'in';
  inchesWrap.appendChild(inchesUnit);

  wrap.appendChild(feetWrap);
  wrap.appendChild(inchesWrap);
  return wrap;
}

function buildThrowRow(item, prValue, goalValue, prMetaEntry) {
  const row = document.createElement('div');
  row.className = 'item-row throw-row';
  row.dataset.itemId = item.id;
  row.dataset.measurementType = item.measurementType;

  const label = document.createElement('div');
  label.className = 'item-label';
  const nameSpan = document.createElement('span');
  nameSpan.className = 'item-name';
  nameSpan.textContent = item.name;
  const metaSpan = document.createElement('span');
  metaSpan.className = 'item-meta';
  metaSpan.textContent = metaLabel(item);
  label.appendChild(nameSpan);
  label.appendChild(metaSpan);
  row.appendChild(label);

  const prGoal = document.createElement('div');
  prGoal.className = 'pr-goal-fields';

  for (const slot of ['pr', 'goal']) {
    const slotWrap = document.createElement('div');
    slotWrap.className = `slot slot-${slot}`;
    const slotLabel = document.createElement('span');
    slotLabel.className = 'slot-label';
    slotLabel.textContent = slot === 'pr' ? 'PR' : 'Goal';
    slotWrap.appendChild(slotLabel);
    const value = slot === 'pr' ? prValue : goalValue;
    slotWrap.appendChild(buildThrowValueInputs(slot, item, value));
    prGoal.appendChild(slotWrap);
  }
  row.appendChild(prGoal);

  const meta = document.createElement('div');
  meta.className = 'item-meta-fields';

  const dateGroup = document.createElement('div');
  dateGroup.className = 'meta-group';
  const dateLabel = document.createElement('span');
  dateLabel.className = 'meta-label';
  dateLabel.textContent = 'Set on';
  dateGroup.appendChild(dateLabel);
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'field meta-date';
  dateInput.dataset.field = 'metaDate';
  dateInput.setAttribute('aria-label', `${item.name} PR date`);
  if (prMetaEntry && prMetaEntry.date) dateInput.value = prMetaEntry.date;
  dateGroup.appendChild(dateInput);
  meta.appendChild(dateGroup);

  const locGroup = document.createElement('div');
  locGroup.className = 'meta-group';
  const locLabel = document.createElement('span');
  locLabel.className = 'meta-label';
  locLabel.textContent = 'At';
  locGroup.appendChild(locLabel);
  const locInput = document.createElement('input');
  locInput.type = 'text';
  locInput.className = 'field meta-location';
  locInput.dataset.field = 'metaLocation';
  locInput.placeholder = 'optional';
  locInput.setAttribute('aria-label', `${item.name} PR location`);
  if (prMetaEntry && prMetaEntry.location) locInput.value = prMetaEntry.location;
  locGroup.appendChild(locInput);
  meta.appendChild(locGroup);

  row.appendChild(meta);
  return row;
}

function buildUnitDropdown(selectedUnitId, categoryFilter) {
  const select = document.createElement('select');
  select.className = 'field unit-select';
  for (const cat of UNIT_CATEGORIES) {
    if (categoryFilter && cat !== categoryFilter) continue;
    const og = document.createElement('optgroup');
    og.label = UNIT_CATEGORY_LABELS[cat];
    for (const u of UNITS) {
      if (u.category !== cat) continue;
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.textContent = u.label;
      if (u.id === selectedUnitId) opt.selected = true;
      og.appendChild(opt);
    }
    select.appendChild(og);
  }
  return select;
}

function buildLiftValueInput(dataField, value, isTime, ariaLabel) {
  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = isTime ? 'numeric' : 'decimal';
  input.className = 'field';
  input.dataset.field = dataField;
  input.placeholder = isTime ? 'mm:ss' : '0';
  input.setAttribute('aria-label', ariaLabel);
  if (Number.isFinite(value)) {
    input.value = isTime ? formatSecondsAsTime(value) : String(value);
  }
  return input;
}

function swapLiftValueInputType(card, dataField, isTime) {
  const input = card.querySelector(`[data-field="${dataField}"]`);
  if (!input) return;
  input.inputMode = isTime ? 'numeric' : 'decimal';
  input.placeholder = isTime ? 'mm:ss' : '0';
}

function buildLiftCard(lift, data, isNew) {
  const card = document.createElement('div');
  card.className = 'lift-card';
  card.dataset.liftId = lift.id;
  card.dataset.liftStatus = isNew ? 'new' : 'saved';

  const header = document.createElement('div');
  header.className = 'lift-card-header';
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'field lift-name-field';
  nameInput.dataset.field = 'liftName';
  nameInput.placeholder = 'Lift name';
  nameInput.setAttribute('aria-label', 'Lift name');
  nameInput.value = lift.name || '';
  header.appendChild(nameInput);
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'lift-delete-btn';
  deleteBtn.dataset.action = 'delete-lift';
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('aria-label', `Remove ${lift.name || 'lift'}`);
  deleteBtn.addEventListener('click', () => card.remove());
  header.appendChild(deleteBtn);
  card.appendChild(header);

  const protoField = document.createElement('label');
  protoField.className = 'lift-field';
  const protoLabel = document.createElement('span');
  protoLabel.className = 'lift-field-label';
  protoLabel.textContent = 'Protocol';
  protoField.appendChild(protoLabel);
  const protoInput = document.createElement('input');
  protoInput.type = 'text';
  protoInput.className = 'field';
  protoInput.dataset.field = 'liftProtocol';
  protoInput.placeholder = '1RM, AMRAP, 3x5...';
  protoInput.setAttribute('aria-label', 'Lift protocol');
  protoInput.value = lift.protocol || '';
  protoField.appendChild(protoInput);
  card.appendChild(protoField);

  const unitField = document.createElement('label');
  unitField.className = 'lift-field';
  const unitLabel = document.createElement('span');
  unitLabel.className = 'lift-field-label';
  unitLabel.textContent = 'Unit';
  unitField.appendChild(unitLabel);
  const savedUnit = lift.unit || 'lb';
  const savedCategory = (getUnit(savedUnit) || {}).category;
  const hasMarks = !isNew && liftHasMarks(data, lift.id);
  const canConvertCategory = savedCategory === 'weight' || savedCategory === 'distance';
  let unitSelect;
  if (hasMarks && canConvertCategory) {
    unitSelect = buildUnitDropdown(savedUnit, savedCategory);
  } else {
    unitSelect = buildUnitDropdown(savedUnit);
    if (hasMarks) {
      unitSelect.disabled = true;
      unitSelect.title = 'Unit is locked: Time and Count units do not convert between each other.';
      unitField.classList.add('lift-field--locked');
    }
  }
  unitSelect.dataset.field = 'liftUnit';
  unitSelect.setAttribute('aria-label', 'Lift unit');
  unitField.appendChild(unitSelect);
  card.appendChild(unitField);

  const unitObj = getUnit(lift.unit || 'lb');
  const isTime = unitObj && unitObj.category === 'time';
  const prValue = data.prs ? data.prs[lift.id] : null;
  const goalValue = data.goals ? data.goals[lift.id] : null;

  const prField = document.createElement('label');
  prField.className = 'lift-field';
  const prLabel = document.createElement('span');
  prLabel.className = 'lift-field-label';
  prLabel.textContent = 'PR';
  prField.appendChild(prLabel);
  prField.appendChild(buildLiftValueInput('liftPr', prValue, isTime, 'Lift PR'));
  card.appendChild(prField);

  const goalField = document.createElement('label');
  goalField.className = 'lift-field';
  const goalLabel = document.createElement('span');
  goalLabel.className = 'lift-field-label';
  goalLabel.textContent = 'Goal';
  goalField.appendChild(goalLabel);
  goalField.appendChild(buildLiftValueInput('liftGoal', goalValue, isTime, 'Lift Goal'));
  card.appendChild(goalField);

  unitSelect.addEventListener('change', () => {
    const next = getUnit(unitSelect.value);
    const nextIsTime = next && next.category === 'time';
    swapLiftValueInputType(card, 'liftPr', nextIsTime);
    swapLiftValueInputType(card, 'liftGoal', nextIsTime);
  });

  return card;
}

function renderForm(data) {
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  for (const item of ITEMS) {
    if (item.category !== 'throw') continue;
    const pr = data.prs ? data.prs[item.id] : null;
    const prValue = Number.isFinite(pr) ? pr : null;
    const goal = data.goals ? data.goals[item.id] : null;
    const goalValue = Number.isFinite(goal) ? goal : null;
    const prMetaEntry = data.prMeta ? data.prMeta[item.id] : null;
    throwsList.appendChild(buildThrowRow(item, prValue, goalValue, prMetaEntry));
  }

  const lifts = (data.userLifts || []).filter((l) => l.active);
  for (const lift of lifts) {
    liftsList.appendChild(buildLiftCard(lift, data, false));
  }
}

function readThrowSlotValue(row, slot, type) {
  const wrap = row.querySelector(`.value-inputs[data-slot="${slot}"]`);
  if (!wrap) return null;
  if (type === 'weight') {
    return readNumber(wrap.querySelector('[data-field="weight"]'));
  }
  const f = readNumber(wrap.querySelector('[data-field="feet"]'));
  const i = readNumber(wrap.querySelector('[data-field="inches"]'));
  if (f === null && i === null) return null;
  return feetInchesToInches(f ?? 0, i ?? 0);
}

function readLiftCardValue(card, dataField, isTime) {
  const input = card.querySelector(`[data-field="${dataField}"]`);
  if (!input) return null;
  const raw = (input.value || '').trim();
  if (!raw) return null;
  if (isTime) return parseTimeToSeconds(raw);
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function collectFormData(currentData) {
  const throwSnapshots = [];
  document.querySelectorAll('.throw-row').forEach((row) => {
    const id = row.dataset.itemId;
    const type = row.dataset.measurementType;
    const prValue = readThrowSlotValue(row, 'pr', type);
    const goalValue = readThrowSlotValue(row, 'goal', type);
    const dateInput = row.querySelector('[data-field="metaDate"]');
    const locInput = row.querySelector('[data-field="metaLocation"]');
    throwSnapshots.push({
      id,
      prValue: Number.isFinite(prValue) ? prValue : null,
      goalValue: Number.isFinite(goalValue) ? goalValue : null,
      prDate: dateInput && dateInput.value ? dateInput.value : '',
      prLocation: locInput && locInput.value ? locInput.value : '',
    });
  });

  const liftCardSnapshots = [];
  document.querySelectorAll('.lift-card').forEach((card) => {
    const id = card.dataset.liftId;
    const status = card.dataset.liftStatus === 'new' ? 'new' : 'saved';
    const unit = card.querySelector('[data-field="liftUnit"]').value || 'lb';
    const unitObj = getUnit(unit);
    const isTime = unitObj && unitObj.category === 'time';
    liftCardSnapshots.push({
      id,
      status,
      name: card.querySelector('[data-field="liftName"]').value || '',
      protocol: card.querySelector('[data-field="liftProtocol"]').value || '',
      unit,
      prValue: readLiftCardValue(card, 'liftPr', isTime),
      goalValue: readLiftCardValue(card, 'liftGoal', isTime),
    });
  });

  return applyFormSnapshotsToData(currentData, throwSnapshots, liftCardSnapshots);
}

let newLiftCounter = 0;
function handleAddLift() {
  newLiftCounter++;
  const tmpId = `new-${newLiftCounter}`;
  const card = buildLiftCard(
    { id: tmpId, name: '', protocol: '', unit: 'lb', active: true },
    loadData(),
    true
  );
  document.getElementById('lifts-list').appendChild(card);
  const nameInput = card.querySelector('[data-field="liftName"]');
  if (nameInput) nameInput.focus();
}

function showStatus(message) {
  const el = document.getElementById('status');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(showStatus._t);
  showStatus._t = setTimeout(() => {
    el.classList.remove('visible');
  }, 2200);
}

function showDataStatus(message, isError) {
  const el = document.getElementById('data-status');
  el.textContent = message;
  el.classList.add('visible');
  if (isError) {
    el.classList.add('error');
  } else {
    el.classList.remove('error');
  }
  clearTimeout(showDataStatus._t);
  showDataStatus._t = setTimeout(() => {
    el.classList.remove('visible');
    el.classList.remove('error');
  }, isError ? 5000 : 2500);
}

function exportData() {
  const data = loadData();
  const envelope = {
    appName: 'highland-games-tracker',
    exportedAt: new Date().toISOString(),
    data,
  };
  const json = JSON.stringify(envelope, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `highland-games-tracker-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showDataStatus('Backup downloaded.');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    let parsed;
    try {
      parsed = JSON.parse(event.target.result);
    } catch (err) {
      showDataStatus('Could not parse the file as JSON.', true);
      return;
    }
    const error = validateBackup(parsed);
    if (error) {
      showDataStatus(error, true);
      return;
    }
    // v1 imports get migrated into v2 shape before saving so localStorage
    // always lands at the current schema version.
    migrateSchemaV1toV2(parsed.data);
    const current = loadData();
    const hasExistingData =
      Object.keys(current.prs || {}).length > 0 ||
      (Array.isArray(current.sessions) && current.sessions.length > 0);
    if (hasExistingData) {
      const ok = window.confirm(
        'This will replace your saved data with the imported data. Continue?'
      );
      if (!ok) {
        showDataStatus('Restore cancelled.');
        return;
      }
    }
    saveData(parsed.data);
    showDataStatus('Backup restored. Reloading...');
    setTimeout(() => location.reload(), 700);
  };
  reader.onerror = () => {
    showDataStatus('Could not read file.', true);
  };
  reader.readAsText(file);
}

function populateProfileClassOptions() {
  const select = document.getElementById('profile-class');
  if (!select) return;
  // Keep the "Pick later" first option; remove any previously-built groups.
  Array.from(select.querySelectorAll('optgroup')).forEach((og) => og.remove());
  for (const groupName of PROFILE_CLASS_GROUPS) {
    const og = document.createElement('optgroup');
    og.label = groupName;
    for (const cls of PROFILE_CLASSES) {
      if (cls.group !== groupName) continue;
      const opt = document.createElement('option');
      opt.value = cls.id;
      opt.textContent = cls.label;
      og.appendChild(opt);
    }
    select.appendChild(og);
  }
}

function syncProfileTierField() {
  const classSelect = document.getElementById('profile-class');
  const tierField = document.getElementById('profile-tier-field');
  const tierSelect = document.getElementById('profile-tier');
  if (!classSelect || !tierField || !tierSelect) return;
  const cls = getProfileClass(classSelect.value);
  const tiers = cls && cls.tiers ? cls.tiers : [];
  tierSelect.innerHTML = '';
  if (tiers.length === 0) {
    tierField.hidden = true;
    return;
  }
  tierField.hidden = false;
  for (const tier of tiers) {
    const opt = document.createElement('option');
    opt.value = tier.id;
    opt.textContent = tier.label;
    tierSelect.appendChild(opt);
  }
}

// Mirror the buildProfileFromFormValues default into the UI: when the user
// picks a Male/Female gender and hasn't chosen a weight schedule yet, fill
// the dropdown so they see what will be saved. An explicit pick (anything
// non-empty in the dropdown) is never overwritten.
function syncProfileWeightScheduleField() {
  const genderSelect = document.getElementById('profile-gender');
  const scheduleSelect = document.getElementById('profile-weight-schedule');
  if (!genderSelect || !scheduleSelect) return;
  if (scheduleSelect.value) return;
  const matched = defaultWeightScheduleForGender(genderSelect.value);
  if (matched) scheduleSelect.value = matched;
}

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (!modal) return;
  populateProfileClassOptions();
  const classSelect = document.getElementById('profile-class');
  classSelect.addEventListener('change', syncProfileTierField);
  syncProfileTierField();
  const genderSelect = document.getElementById('profile-gender');
  genderSelect.addEventListener('change', syncProfileWeightScheduleField);
  syncProfileWeightScheduleField();
  const form = document.getElementById('profile-form');
  form.addEventListener('submit', () => {
    const profile = buildProfileFromFormValues({
      name: document.getElementById('profile-name').value,
      gender: document.getElementById('profile-gender').value,
      weightSchedule: document.getElementById('profile-weight-schedule').value,
      class: classSelect.value,
      tier: document.getElementById('profile-tier').value,
    });
    const current = loadData();
    current.profile = profile;
    saveData(current);
  }, { once: true });
  if (typeof modal.showModal === 'function') {
    modal.showModal();
  } else {
    modal.setAttribute('open', '');
  }
}

function init() {
  const data = loadData();
  renderForm(data);
  if (!data.profile || !data.profile.setupCompletedAt) {
    openProfileModal();
  }

  const form = document.getElementById('pr-goal-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const current = loadData();
    const updates = collectFormData(current);
    const next = { ...current, ...updates };
    saveData(next);
    renderForm(next);
    showStatus('PRs & Goals saved.');
  });

  const addLiftBtn = document.getElementById('add-lift-btn');
  if (addLiftBtn) addLiftBtn.addEventListener('click', handleAddLift);

  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) exportBtn.addEventListener('click', exportData);

  const importBtn = document.getElementById('import-btn');
  const importFile = document.getElementById('import-file');
  if (importBtn && importFile) {
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (file) importData(file);
      event.target.value = '';
    });
  }
}

document.addEventListener('DOMContentLoaded', init);

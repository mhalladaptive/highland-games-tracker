function buildRow(item, baselineValue, stoneWeightValue, baselineMeta) {
  const row = document.createElement('div');
  row.className = 'item-row';
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

  const inputs = document.createElement('div');
  inputs.className = 'item-inputs';

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
    input.placeholder = '0';
    input.setAttribute('aria-label', `${item.name} weight in pounds`);
    if (Number.isFinite(baselineValue)) input.value = baselineValue;
    wrap.appendChild(input);
    const unit = document.createElement('span');
    unit.className = 'unit';
    unit.textContent = 'lb';
    wrap.appendChild(unit);
    inputs.appendChild(wrap);
  } else {
    const { feet, inches } = inchesToFeetInches(baselineValue);

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
    feetInput.setAttribute('aria-label', `${item.name} feet`);
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
    inchesInput.setAttribute('aria-label', `${item.name} inches`);
    if (inches !== '') inchesInput.value = inches;
    inchesWrap.appendChild(inchesInput);
    const inchesUnit = document.createElement('span');
    inchesUnit.className = 'unit';
    inchesUnit.textContent = 'in';
    inchesWrap.appendChild(inchesUnit);

    inputs.appendChild(feetWrap);
    inputs.appendChild(inchesWrap);
  }

  row.appendChild(label);
  row.appendChild(inputs);

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
  dateInput.setAttribute('aria-label', `${item.name} baseline date`);
  if (baselineMeta && baselineMeta.date) dateInput.value = baselineMeta.date;
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
  locInput.setAttribute('aria-label', `${item.name} baseline location`);
  if (baselineMeta && baselineMeta.location) locInput.value = baselineMeta.location;
  locGroup.appendChild(locInput);
  meta.appendChild(locGroup);

  row.appendChild(meta);

  return row;
}

function renderForm(data) {
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  for (const item of ITEMS) {
    const baseline = data.prs ? data.prs[item.id] : null;
    const baselineValue = Number.isFinite(baseline) ? baseline : null;
    const stoneWeight = data.stoneWeights ? data.stoneWeights[item.id] : null;
    const stoneWeightValue = Number.isFinite(stoneWeight) ? stoneWeight : null;
    const baselineMeta = data.prMeta ? data.prMeta[item.id] : null;
    const row = buildRow(item, baselineValue, stoneWeightValue, baselineMeta);
    if (item.category === 'throw') {
      throwsList.appendChild(row);
    } else {
      liftsList.appendChild(row);
    }
  }
}

function collectFormData() {
  const prs = {};
  const stoneWeights = {};
  const prMeta = {};
  const rows = document.querySelectorAll('.item-row');
  rows.forEach((row) => {
    const id = row.dataset.itemId;
    const type = row.dataset.measurementType;
    if (type === 'weight') {
      const w = readNumber(row.querySelector('[data-field="weight"]'));
      if (w !== null) prs[id] = w;
    } else {
      const f = readNumber(row.querySelector('[data-field="feet"]'));
      const i = readNumber(row.querySelector('[data-field="inches"]'));
      if (f !== null || i !== null) {
        prs[id] = feetInchesToInches(f ?? 0, i ?? 0);
      }
    }
    const stoneInput = row.querySelector('[data-field="stoneWeight"]');
    if (stoneInput) {
      const sw = readNumber(stoneInput);
      if (sw !== null) stoneWeights[id] = sw;
    }
    const dateInput = row.querySelector('[data-field="metaDate"]');
    const locInput = row.querySelector('[data-field="metaLocation"]');
    const date = dateInput && dateInput.value ? dateInput.value.trim() : '';
    const location = locInput && locInput.value ? locInput.value.trim() : '';
    if (date || location) {
      const meta = {};
      if (date) meta.date = date;
      if (location) meta.location = location;
      prMeta[id] = meta;
    }
  });
  return { prs, stoneWeights, prMeta };
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
        'This will replace your current baselines and sessions with the imported data. Continue?'
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

  const form = document.getElementById('baseline-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const current = loadData();
    const updates = collectFormData();
    const next = { ...current, ...updates };
    saveData(next);
    renderForm(next);
    showStatus('Baseline saved.');
  });

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

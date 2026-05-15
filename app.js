const ITEMS = [
  { id: 'braemar-stone',         name: 'Braemar Stone',              category: 'throw', measurementType: 'distance', implement: '20–26 lb', capturesStoneWeight: true },
  { id: 'open-stone',            name: 'Open Stone',                 category: 'throw', measurementType: 'distance', implement: '16–22 lb', capturesStoneWeight: true },
  { id: 'heavy-hammer',          name: 'Heavy Hammer',               category: 'throw', measurementType: 'distance', implement: '16 lb' },
  { id: 'light-hammer',          name: 'Light Hammer',               category: 'throw', measurementType: 'distance', implement: '12 lb' },
  { id: 'heavy-weight-distance', name: 'Heavy Weight for Distance',  category: 'throw', measurementType: 'distance', implement: '42 lb' },
  { id: 'light-weight-distance', name: 'Light Weight for Distance',  category: 'throw', measurementType: 'distance', implement: '28 lb' },
  // Display name changed from "Weight Over Bar" to "Weight for Height".
  // The id is intentionally kept stable so any already-saved baseline stays linked.
  { id: 'weight-over-bar',       name: 'Weight for Height',          category: 'throw', measurementType: 'height',   implement: '42 lb' },
  { id: 'sheaf-toss',            name: 'Sheaf Toss',                 category: 'throw', measurementType: 'height',   implement: '12 lb' },

  { id: 'overhead-press', name: 'Overhead Press',              category: 'lift', measurementType: 'weight', protocol: '1RM' },
  { id: 'deadlift',       name: 'Deadlift',                    category: 'lift', measurementType: 'weight', protocol: '10RM (40 sec)' },
  { id: 'hang-clean',     name: 'Hang Clean',                  category: 'lift', measurementType: 'weight', protocol: '1RM' },
  { id: 'power-clean',    name: 'Power Clean',                 category: 'lift', measurementType: 'weight', protocol: '1RM' },
  { id: 'hang-snatch',    name: 'Hang Snatch',                 category: 'lift', measurementType: 'weight', protocol: '1RM' },
  { id: 'one-hand-snatch',name: 'One-Handed Barbell Snatch',   category: 'lift', measurementType: 'weight', protocol: '1RM' },
  { id: 'box-squat',      name: 'Box Squat',                   category: 'lift', measurementType: 'weight', protocol: '7RM' },
  { id: 'good-mornings',  name: 'Good Mornings',               category: 'lift', measurementType: 'weight', protocol: '7RM' },
];

const STORAGE_KEY = 'comeback-tracker-v1';

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { version: 1, baselines: {}, stoneWeights: {} };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.baselines) {
      return { version: 1, baselines: {}, stoneWeights: {} };
    }
    if (!parsed.stoneWeights || typeof parsed.stoneWeights !== 'object') {
      parsed.stoneWeights = {};
    }
    return parsed;
  } catch {
    return { version: 1, baselines: {}, stoneWeights: {} };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function feetInchesToInches(feet, inches) {
  const f = Number.isFinite(feet) ? feet : 0;
  const i = Number.isFinite(inches) ? inches : 0;
  return f * 12 + i;
}

function inchesToFeetInches(totalInches) {
  if (!Number.isFinite(totalInches)) return { feet: '', inches: '' };
  const feet = Math.floor(totalInches / 12);
  const inches = +(totalInches - feet * 12).toFixed(2);
  return { feet, inches };
}

function metaLabel(item) {
  if (item.measurementType === 'distance') {
    return item.implement ? `Distance · ${item.implement}` : 'Distance';
  }
  if (item.measurementType === 'height') {
    return item.implement ? `Height · ${item.implement}` : 'Height';
  }
  if (item.measurementType === 'weight') {
    return item.protocol ? `Weight · ${item.protocol}` : 'Weight';
  }
  return '';
}

function buildRow(item, baselineValue, stoneWeightValue) {
  const row = document.createElement('div');
  row.className = 'item-row';
  row.dataset.itemId = item.id;
  row.dataset.measurementType = item.measurementType;

  const label = document.createElement('div');
  label.className = 'item-label';
  label.innerHTML = `
    <span class="item-name"></span>
    <span class="item-meta"></span>
  `;
  label.querySelector('.item-name').textContent = item.name;
  label.querySelector('.item-meta').textContent = metaLabel(item);

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

  return row;
}

function renderForm(data) {
  const throwsList = document.getElementById('throws-list');
  const liftsList = document.getElementById('lifts-list');
  throwsList.innerHTML = '';
  liftsList.innerHTML = '';

  for (const item of ITEMS) {
    const baseline = data.baselines[item.id];
    const baselineValue = Number.isFinite(baseline) ? baseline : null;
    const stoneWeight = data.stoneWeights ? data.stoneWeights[item.id] : null;
    const stoneWeightValue = Number.isFinite(stoneWeight) ? stoneWeight : null;
    const row = buildRow(item, baselineValue, stoneWeightValue);
    if (item.category === 'throw') {
      throwsList.appendChild(row);
    } else {
      liftsList.appendChild(row);
    }
  }
}

function readNumber(input) {
  if (!input || input.value === '' || input.value == null) return null;
  const n = Number(input.value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function collectFormData() {
  const baselines = {};
  const stoneWeights = {};
  const rows = document.querySelectorAll('.item-row');
  rows.forEach((row) => {
    const id = row.dataset.itemId;
    const type = row.dataset.measurementType;
    if (type === 'weight') {
      const w = readNumber(row.querySelector('[data-field="weight"]'));
      if (w !== null) baselines[id] = w;
    } else {
      const f = readNumber(row.querySelector('[data-field="feet"]'));
      const i = readNumber(row.querySelector('[data-field="inches"]'));
      if (f !== null || i !== null) {
        baselines[id] = feetInchesToInches(f ?? 0, i ?? 0);
      }
    }
    const stoneInput = row.querySelector('[data-field="stoneWeight"]');
    if (stoneInput) {
      const sw = readNumber(stoneInput);
      if (sw !== null) stoneWeights[id] = sw;
    }
  });
  return { version: 1, baselines, stoneWeights };
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

function init() {
  const data = loadData();
  renderForm(data);

  const form = document.getElementById('baseline-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = collectFormData();
    saveData(next);
    renderForm(next);
    showStatus('Baseline saved.');
  });
}

document.addEventListener('DOMContentLoaded', init);

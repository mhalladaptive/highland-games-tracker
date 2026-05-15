const ITEMS = [
  { id: 'braemar-stone',         name: 'Braemar Stone',              category: 'throw', measurementType: 'distance' },
  { id: 'open-stone',            name: 'Open Stone',                 category: 'throw', measurementType: 'distance' },
  { id: 'heavy-hammer',          name: 'Heavy Hammer',               category: 'throw', measurementType: 'distance' },
  { id: 'light-hammer',          name: 'Light Hammer',               category: 'throw', measurementType: 'distance' },
  { id: 'heavy-weight-distance', name: 'Heavy Weight for Distance',  category: 'throw', measurementType: 'distance' },
  { id: 'light-weight-distance', name: 'Light Weight for Distance',  category: 'throw', measurementType: 'distance' },
  { id: 'weight-over-bar',       name: 'Weight Over Bar',            category: 'throw', measurementType: 'height' },
  { id: 'sheaf-toss',            name: 'Sheaf Toss',                 category: 'throw', measurementType: 'height' },

  { id: 'overhead-press', name: 'Overhead Press',              category: 'lift', measurementType: 'weight', protocol: 'top single (TBC)' },
  { id: 'deadlift',       name: 'Deadlift',                    category: 'lift', measurementType: 'weight', protocol: '10RM (40 sec)' },
  { id: 'hang-clean',     name: 'Hang Clean',                  category: 'lift', measurementType: 'weight', protocol: 'top single (TBC)' },
  { id: 'power-clean',    name: 'Power Clean',                 category: 'lift', measurementType: 'weight', protocol: 'top single (TBC)' },
  { id: 'hang-snatch',    name: 'Hang Snatch',                 category: 'lift', measurementType: 'weight', protocol: 'top single (TBC)' },
  { id: 'one-hand-snatch',name: 'One-Handed Barbell Snatch',   category: 'lift', measurementType: 'weight', protocol: 'top single (TBC)' },
  { id: 'box-squat',      name: 'Box Squat',                   category: 'lift', measurementType: 'weight', protocol: '7RM' },
  { id: 'good-mornings',  name: 'Good Mornings',               category: 'lift', measurementType: 'weight', protocol: '7RM' },
];

const STORAGE_KEY = 'comeback-tracker-v1';

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { version: 1, baselines: {} };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.baselines) {
      return { version: 1, baselines: {} };
    }
    return parsed;
  } catch {
    return { version: 1, baselines: {} };
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
  if (item.measurementType === 'distance') return 'Distance';
  if (item.measurementType === 'height') return 'Height';
  if (item.measurementType === 'weight') {
    return item.protocol ? `Weight · ${item.protocol}` : 'Weight';
  }
  return '';
}

function buildRow(item, baselineValue) {
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
    const row = buildRow(item, baselineValue);
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
      if (f === null && i === null) return;
      baselines[id] = feetInchesToInches(f ?? 0, i ?? 0);
    }
  });
  return { version: 1, baselines };
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

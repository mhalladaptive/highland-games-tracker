const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      `${message || 'assertEqual'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertDeepEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message || 'assertDeepEqual'}: expected ${e}, got ${a}`);
  }
}

function assertTrue(value, message) {
  if (!value) {
    throw new Error(`${message || 'assertTrue'}: expected truthy, got ${JSON.stringify(value)}`);
  }
}

function assertMatch(str, regex, message) {
  if (typeof str !== 'string' || !regex.test(str)) {
    throw new Error(
      `${message || 'assertMatch'}: expected match for ${regex}, got ${JSON.stringify(str)}`
    );
  }
}

function makeInput(value) {
  const input = document.createElement('input');
  input.value = value;
  return input;
}

// --- feetInchesToInches ---

test('feetInchesToInches: 5 ft 6 in => 66', () => {
  assertEqual(feetInchesToInches(5, 6), 66);
});

test('feetInchesToInches: 0 ft 0 in => 0', () => {
  assertEqual(feetInchesToInches(0, 0), 0);
});

test('feetInchesToInches: handles decimals (5 ft 6.5 in => 66.5)', () => {
  assertEqual(feetInchesToInches(5, 6.5), 66.5);
});

test('feetInchesToInches: NaN feet treated as 0', () => {
  assertEqual(feetInchesToInches(NaN, 6), 6);
});

test('feetInchesToInches: null feet treated as 0', () => {
  assertEqual(feetInchesToInches(null, 6), 6);
});

test('feetInchesToInches: undefined inches treated as 0', () => {
  assertEqual(feetInchesToInches(5, undefined), 60);
});

// --- inchesToFeetInches ---

test('inchesToFeetInches: 66 => { feet: 5, inches: 6 }', () => {
  assertDeepEqual(inchesToFeetInches(66), { feet: 5, inches: 6 });
});

test('inchesToFeetInches: 0 => { feet: 0, inches: 0 }', () => {
  assertDeepEqual(inchesToFeetInches(0), { feet: 0, inches: 0 });
});

test('inchesToFeetInches: 66.5 => { feet: 5, inches: 6.5 }', () => {
  assertDeepEqual(inchesToFeetInches(66.5), { feet: 5, inches: 6.5 });
});

test('inchesToFeetInches: null => empty strings', () => {
  assertDeepEqual(inchesToFeetInches(null), { feet: '', inches: '' });
});

test('inchesToFeetInches: NaN => empty strings', () => {
  assertDeepEqual(inchesToFeetInches(NaN), { feet: '', inches: '' });
});

test('round-trip: 5 ft 6 in => 66 => 5 ft 6 in', () => {
  const total = feetInchesToInches(5, 6);
  assertDeepEqual(inchesToFeetInches(total), { feet: 5, inches: 6 });
});

// --- readNumber ---

test('readNumber: empty string => null', () => {
  assertEqual(readNumber(makeInput('')), null);
});

test('readNumber: "42" => 42', () => {
  assertEqual(readNumber(makeInput('42')), 42);
});

test('readNumber: "3.5" => 3.5', () => {
  assertEqual(readNumber(makeInput('3.5')), 3.5);
});

test('readNumber: "-5" => null (negatives rejected)', () => {
  assertEqual(readNumber(makeInput('-5')), null);
});

test('readNumber: "abc" => null (non-numeric rejected)', () => {
  assertEqual(readNumber(makeInput('abc')), null);
});

test('readNumber: null input => null', () => {
  assertEqual(readNumber(null), null);
});

// --- metaLabel ---

test('metaLabel: distance with implement', () => {
  assertEqual(metaLabel({ measurementType: 'distance', implement: '16 lb' }), 'Distance · 16 lb');
});

test('metaLabel: distance without implement', () => {
  assertEqual(metaLabel({ measurementType: 'distance' }), 'Distance');
});

test('metaLabel: height with implement', () => {
  assertEqual(metaLabel({ measurementType: 'height', implement: '42 lb' }), 'Height · 42 lb');
});

test('metaLabel: weight with protocol', () => {
  assertEqual(metaLabel({ measurementType: 'weight', protocol: '1RM' }), 'Weight · 1RM');
});

test('metaLabel: weight without protocol', () => {
  assertEqual(metaLabel({ measurementType: 'weight' }), 'Weight');
});

test('metaLabel: unknown measurementType => empty string', () => {
  assertEqual(metaLabel({ measurementType: 'mystery' }), '');
});

// --- formatSessionDate ---

test('formatSessionDate: empty string => empty string', () => {
  assertEqual(formatSessionDate(''), '');
});

test('formatSessionDate: bad input falls back to original', () => {
  assertEqual(formatSessionDate('not-a-date'), 'not-a-date');
});

test('formatSessionDate: valid ISO yields a string containing the year', () => {
  const out = formatSessionDate('2026-05-15');
  assertTrue(typeof out === 'string' && out.includes('2026'),
    `expected output containing "2026", got ${JSON.stringify(out)}`);
});

// --- todayISO ---

test('todayISO: matches yyyy-mm-dd format', () => {
  assertMatch(todayISO(), /^\d{4}-\d{2}-\d{2}$/);
});

// --- loadData ---

test('loadData: empty storage => fresh shape', () => {
  localStorage.removeItem(STORAGE_KEY);
  assertDeepEqual(loadData(), {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  });
});

test('loadData: corrupt JSON => fresh shape', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, '{not valid json');
  assertDeepEqual(loadData(), {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  });
});

test('loadData: data missing baselines key => fresh shape', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, something: 'else' }));
  assertDeepEqual(loadData(), {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  });
});

test('loadData: missing stoneWeights => filled in as empty object', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: { deadlift: 365 },
  }));
  const data = loadData();
  assertDeepEqual(data.stoneWeights, {});
  assertEqual(data.baselines.deadlift, 365);
});

test('loadData: missing sessions => filled in as empty array', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: {},
    stoneWeights: {},
  }));
  const data = loadData();
  assertTrue(Array.isArray(data.sessions));
  assertEqual(data.sessions.length, 0);
});

// --- legacy games-in-location migration ---

test('migration: competition session with location-as-games moves into games field', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [{
      id: 1,
      date: '2024-08-17',
      kind: 'competition',
      location: 'Grandfather Mountain',
      marks: { 'braemar-stone': [420] },
      stoneWeights: {},
    }],
  }));
  const data = loadData();
  assertEqual(data.sessions[0].games, 'Grandfather Mountain');
  assertEqual(data.sessions[0].location, '');
});

test('migration: training session is left untouched', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [{
      id: 2,
      date: '2024-08-18',
      kind: 'training',
      location: 'Garage Gym',
      marks: { deadlift: [365] },
      stoneWeights: {},
    }],
  }));
  const data = loadData();
  assertEqual(data.sessions[0].location, 'Garage Gym');
  assertTrue(data.sessions[0].games === undefined || data.sessions[0].games === '');
});

test('migration: competition session with existing games value is left untouched', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [{
      id: 3,
      date: '2024-09-01',
      kind: 'competition',
      games: 'Celtic Clash',
      location: 'Asheville, NC',
      marks: { 'braemar-stone': [420] },
      stoneWeights: {},
    }],
  }));
  const data = loadData();
  assertEqual(data.sessions[0].games, 'Celtic Clash');
  assertEqual(data.sessions[0].location, 'Asheville, NC');
});

test('migration: is idempotent across reloads', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [{
      id: 4,
      date: '2024-08-17',
      kind: 'competition',
      location: 'Grandfather Mountain',
      marks: {},
      stoneWeights: {},
    }],
  }));
  const first = loadData();
  assertEqual(first.sessions[0].games, 'Grandfather Mountain');
  assertEqual(first.sessions[0].location, '');
  const second = loadData();
  assertEqual(second.sessions[0].games, 'Grandfather Mountain');
  assertEqual(second.sessions[0].location, '');
});

test('migration: legacy session with no kind defaults to competition and migrates', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [{
      id: 5,
      date: '2024-07-04',
      location: 'Radford Highland Games',
      marks: {},
      stoneWeights: {},
    }],
  }));
  const data = loadData();
  assertEqual(data.sessions[0].games, 'Radford Highland Games');
  assertEqual(data.sessions[0].location, '');
});

// --- save + load round-trips ---

test('save + load: round-trip preserves baselines', () => {
  localStorage.removeItem(STORAGE_KEY);
  const fixture = {
    version: 1,
    baselines: { deadlift: 365, 'braemar-stone': 426 },
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

test('save + load: round-trip preserves sessions with attempts', () => {
  localStorage.removeItem(STORAGE_KEY);
  const session = {
    id: 1234567890,
    date: '2026-05-15',
    marks: { 'braemar-stone': [420, 425, 426], deadlift: [365] },
    stoneWeights: { 'braemar-stone': 22 },
  };
  const fixture = {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [session],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

test('save + load: preserves unknown future fields', () => {
  localStorage.removeItem(STORAGE_KEY);
  const fixture = {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
    futureField: 'hello',
  };
  saveData(fixture);
  assertEqual(loadData().futureField, 'hello');
});

// --- ITEMS sanity ---

test('ITEMS: contains 8 throws and 8 lifts', () => {
  const throws = ITEMS.filter((i) => i.category === 'throw');
  const lifts = ITEMS.filter((i) => i.category === 'lift');
  assertEqual(throws.length, 8, 'throw count');
  assertEqual(lifts.length, 8, 'lift count');
});

test('ITEMS: every item has id, name, category, measurementType', () => {
  for (const item of ITEMS) {
    assertTrue(typeof item.id === 'string' && item.id.length > 0, `id missing on ${item.name}`);
    assertTrue(typeof item.name === 'string' && item.name.length > 0, `name missing on ${item.id}`);
    assertTrue(item.category === 'throw' || item.category === 'lift', `bad category on ${item.id}`);
    assertTrue(
      ['distance', 'height', 'weight'].includes(item.measurementType),
      `bad measurementType on ${item.id}`
    );
  }
});

test('ITEMS: stone events both flagged capturesStoneWeight', () => {
  const stones = ITEMS.filter((i) => i.id === 'braemar-stone' || i.id === 'open-stone');
  assertEqual(stones.length, 2);
  assertTrue(stones.every((s) => s.capturesStoneWeight === true), 'both stones must capture stone weight');
});

// --- bestSinceReturn ---

test('bestSinceReturn: no sessions => null', () => {
  const data = { baselines: {}, stoneWeights: {}, sessions: [] };
  assertEqual(bestSinceReturn(data, 'deadlift'), null);
});

test('bestSinceReturn: single session, single attempt', () => {
  const data = { sessions: [{ id: 1, date: '2026-05-15', marks: { deadlift: [300] } }] };
  assertEqual(bestSinceReturn(data, 'deadlift'), 300);
});

test('bestSinceReturn: multiple sessions, returns max across all', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-15', marks: { deadlift: [300, 305] } },
    { id: 2, date: '2026-05-20', marks: { deadlift: [310] } },
    { id: 3, date: '2026-05-25', marks: { deadlift: [295, 308] } },
  ] };
  assertEqual(bestSinceReturn(data, 'deadlift'), 310);
});

test('bestSinceReturn: item not in any session => null', () => {
  const data = { sessions: [{ id: 1, date: '2026-05-15', marks: { deadlift: [300] } }] };
  assertEqual(bestSinceReturn(data, 'braemar-stone'), null);
});

// --- bestSinceReturnDetails ---

test('bestSinceReturnDetails: no sessions => null', () => {
  const data = { baselines: {}, stoneWeights: {}, sessions: [] };
  assertEqual(bestSinceReturnDetails(data, 'deadlift'), null);
});

test('bestSinceReturnDetails: single session returns full provenance', () => {
  const data = { sessions: [
    { id: 1234, date: '2026-05-15', location: 'Test Field', marks: { deadlift: [300] } },
  ] };
  const details = bestSinceReturnDetails(data, 'deadlift');
  assertEqual(details.value, 300);
  assertEqual(details.sessionId, 1234);
  assertEqual(details.sessionDate, '2026-05-15');
  assertEqual(details.sessionLocation, 'Test Field');
});

test('bestSinceReturnDetails: returns details of session containing the max', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-10', location: 'Field A', marks: { deadlift: [300, 305] } },
    { id: 2, date: '2026-05-20', location: 'Field B', marks: { deadlift: [310] } },
    { id: 3, date: '2026-05-25', location: 'Field C', marks: { deadlift: [295, 308] } },
  ] };
  const details = bestSinceReturnDetails(data, 'deadlift');
  assertEqual(details.value, 310);
  assertEqual(details.sessionId, 2);
  assertEqual(details.sessionLocation, 'Field B');
});

test('bestSinceReturnDetails: missing location returns null in sessionLocation', () => {
  const data = { sessions: [
    { id: 1234, date: '2026-05-15', marks: { deadlift: [300] } },
  ] };
  const details = bestSinceReturnDetails(data, 'deadlift');
  assertEqual(details.sessionLocation, null);
});

// --- validateBackup ---

function makeBackup(overrides) {
  return Object.assign({
    appName: 'highland-games-tracker',
    exportedAt: '2026-05-16T00:00:00.000Z',
    data: {
      version: 1,
      baselines: {},
      baselineMeta: {},
      stoneWeights: {},
      sessions: [],
    },
  }, overrides || {});
}

test('validateBackup: well-formed envelope => null', () => {
  assertEqual(validateBackup(makeBackup()), null);
});

test('validateBackup: null input => error', () => {
  assertTrue(typeof validateBackup(null) === 'string');
});

test('validateBackup: string input => error', () => {
  assertTrue(typeof validateBackup('hello') === 'string');
});

test('validateBackup: wrong appName => error', () => {
  const out = validateBackup(makeBackup({ appName: 'other-app' }));
  assertTrue(typeof out === 'string' && out.includes('Highland Games Tracker'));
});

test('validateBackup: missing data section => error', () => {
  const bad = makeBackup();
  delete bad.data;
  assertTrue(typeof validateBackup(bad) === 'string');
});

test('validateBackup: wrong version => error', () => {
  const bad = makeBackup();
  bad.data.version = 2;
  const out = validateBackup(bad);
  assertTrue(typeof out === 'string' && out.includes('version'));
});

test('validateBackup: missing baselines => error', () => {
  const bad = makeBackup();
  delete bad.data.baselines;
  assertTrue(typeof validateBackup(bad) === 'string');
});

test('validateBackup: baselines as array => error', () => {
  const bad = makeBackup();
  bad.data.baselines = [];
  assertTrue(typeof validateBackup(bad) === 'string');
});

test('validateBackup: sessions as string => error', () => {
  const bad = makeBackup();
  bad.data.sessions = '12 items';
  const out = validateBackup(bad);
  assertTrue(typeof out === 'string' && out.includes('sessions'));
});

test('validateBackup: missing optional fields => null (lenient)', () => {
  const lenient = makeBackup();
  delete lenient.data.baselineMeta;
  delete lenient.data.stoneWeights;
  delete lenient.data.sessions;
  assertEqual(validateBackup(lenient), null);
});

test('validateBackup: baselineMeta as array => error', () => {
  const bad = makeBackup();
  bad.data.baselineMeta = [];
  assertTrue(typeof validateBackup(bad) === 'string');
});

// --- bestSinceReturnDetails kind filter ---

test('bestSinceReturnDetails: competition filter excludes training sessions', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-10', kind: 'training',    marks: { deadlift: [350] } },
    { id: 2, date: '2026-05-15', kind: 'competition', marks: { deadlift: [310] } },
  ] };
  const details = bestSinceReturnDetails(data, 'deadlift', 'competition');
  assertEqual(details.value, 310);
  assertEqual(details.sessionKind, 'competition');
});

test('bestSinceReturnDetails: training filter excludes competition sessions', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-10', kind: 'training',    marks: { deadlift: [350] } },
    { id: 2, date: '2026-05-15', kind: 'competition', marks: { deadlift: [310] } },
  ] };
  const details = bestSinceReturnDetails(data, 'deadlift', 'training');
  assertEqual(details.value, 350);
  assertEqual(details.sessionKind, 'training');
});

test('bestSinceReturnDetails: all filter includes both kinds', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-10', kind: 'training',    marks: { deadlift: [350] } },
    { id: 2, date: '2026-05-15', kind: 'competition', marks: { deadlift: [310] } },
  ] };
  const details = bestSinceReturnDetails(data, 'deadlift', 'all');
  assertEqual(details.value, 350);
});

test('bestSinceReturnDetails: missing kind defaults to competition for filtering', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-10', marks: { deadlift: [320] } },
  ] };
  const compDetails = bestSinceReturnDetails(data, 'deadlift', 'competition');
  assertEqual(compDetails.value, 320);
  assertEqual(compDetails.sessionKind, 'competition');
  const trainDetails = bestSinceReturnDetails(data, 'deadlift', 'training');
  assertEqual(trainDetails, null);
});

test('bestSinceReturnDetails: competition filter with no matches returns null', () => {
  const data = { sessions: [
    { id: 1, date: '2026-05-10', kind: 'training', marks: { deadlift: [350] } },
  ] };
  assertEqual(bestSinceReturnDetails(data, 'deadlift', 'competition'), null);
});

// --- sessionKind helper ---

test('sessionKind: undefined session => competition', () => {
  assertEqual(sessionKind(undefined), 'competition');
});

test('sessionKind: explicit training => training', () => {
  assertEqual(sessionKind({ kind: 'training' }), 'training');
});

test('sessionKind: missing kind => competition', () => {
  assertEqual(sessionKind({ id: 1 }), 'competition');
});

test('sessionKind: unknown kind value => competition', () => {
  assertEqual(sessionKind({ kind: 'mystery' }), 'competition');
});

// --- loadData backward compatibility for baselineMeta ---

test('loadData: missing baselineMeta => filled in as empty object', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: { deadlift: 365 },
    stoneWeights: {},
    sessions: [],
  }));
  const data = loadData();
  assertDeepEqual(data.baselineMeta, {});
  assertEqual(data.baselines.deadlift, 365);
});

test('save + load: round-trip preserves baselineMeta', () => {
  localStorage.removeItem(STORAGE_KEY);
  const fixture = {
    version: 1,
    baselines: { 'braemar-stone': 339.5 },
    baselineMeta: { 'braemar-stone': { date: '2019-10-12', location: 'Radford Highlander Festival' } },
    stoneWeights: {},
    sessions: [],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

test('save + load: round-trip preserves session location and games', () => {
  localStorage.removeItem(STORAGE_KEY);
  const session = {
    id: 1234567890,
    date: '2024-08-03',
    kind: 'competition',
    games: 'Dublin Irish Festival',
    location: 'Dublin, OH',
    marks: { 'open-stone': [312] },
    stoneWeights: {},
  };
  const fixture = {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [session],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

// --- percentOfBaseline ---

test('percentOfBaseline: 300 / 400 => 75', () => {
  assertEqual(percentOfBaseline(300, 400), 75);
});

test('percentOfBaseline: equal => 100', () => {
  assertEqual(percentOfBaseline(400, 400), 100);
});

test('percentOfBaseline: best > baseline => over 100', () => {
  assertEqual(percentOfBaseline(420, 400), 105);
});

test('percentOfBaseline: baseline 0 => null', () => {
  assertEqual(percentOfBaseline(100, 0), null);
});

test('percentOfBaseline: null best => null', () => {
  assertEqual(percentOfBaseline(null, 100), null);
});

// --- formatMeasurement ---

test('formatMeasurement: 66 inches as distance => 5\' 6"', () => {
  assertEqual(formatMeasurement(66, 'distance'), `5' 6"`);
});

test('formatMeasurement: 60 inches as distance => 5\' (no inches)', () => {
  assertEqual(formatMeasurement(60, 'distance'), `5'`);
});

test('formatMeasurement: 66.5 inches as height => 5\' 6.5"', () => {
  assertEqual(formatMeasurement(66.5, 'height'), `5' 6.5"`);
});

test('formatMeasurement: 365 lb as weight', () => {
  assertEqual(formatMeasurement(365, 'weight'), '365 lb');
});

test('formatMeasurement: 365.5 lb as weight', () => {
  assertEqual(formatMeasurement(365.5, 'weight'), '365.5 lb');
});

test('formatMeasurement: null => empty string', () => {
  assertEqual(formatMeasurement(null, 'distance'), '');
});

test('formatMeasurement: 0 inches => 0\'', () => {
  assertEqual(formatMeasurement(0, 'distance'), `0'`);
});

// --- Harness ---

function runTests() {
  const backup = localStorage.getItem(STORAGE_KEY);
  const results = [];

  try {
    for (const t of tests) {
      try {
        t.fn();
        results.push({ name: t.name, status: 'PASS' });
      } catch (err) {
        results.push({ name: t.name, status: 'FAIL', message: err.message });
      }
    }
  } finally {
    if (backup !== null) {
      localStorage.setItem(STORAGE_KEY, backup);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  renderResults(results);
}

function renderResults(results) {
  const list = document.getElementById('test-results');
  const summary = document.getElementById('test-summary');
  list.innerHTML = '';

  const passed = results.filter((r) => r.status === 'PASS').length;
  const total = results.length;
  const failed = total - passed;

  summary.textContent = failed === 0
    ? `${passed} / ${total} passed`
    : `${passed} / ${total} passed — ${failed} failed`;
  summary.className = 'test-summary ' + (failed === 0 ? 'all-passed' : 'has-failures');
  summary.hidden = false;

  for (const r of results) {
    const li = document.createElement('li');
    li.className = `test-row ${r.status.toLowerCase()}`;

    const status = document.createElement('span');
    status.className = 'test-status';
    status.textContent = `[${r.status}]`;

    const name = document.createElement('span');
    name.className = 'test-name';
    name.textContent = r.name;

    li.appendChild(status);
    li.appendChild(name);

    if (r.status === 'FAIL') {
      const msg = document.createElement('div');
      msg.className = 'test-message';
      msg.textContent = r.message;
      li.appendChild(msg);
    }

    list.appendChild(li);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('run-btn').addEventListener('click', runTests);
});

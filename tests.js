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

function freshV2Shape() {
  return {
    version: 2,
    profile: {},
    prs: {},
    prMeta: {},
    goals: {},
    goalMeta: {},
    stoneWeights: {},
    userLifts: [],
    sessions: [],
  };
}

test('loadData: empty storage => v2 fresh shape', () => {
  localStorage.removeItem(STORAGE_KEY);
  assertDeepEqual(loadData(), freshV2Shape());
});

test('loadData: corrupt JSON => v2 fresh shape', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, '{not valid json');
  assertDeepEqual(loadData(), freshV2Shape());
});

test('loadData: data missing baselines and prs => v2 fresh shape', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, something: 'else' }));
  assertDeepEqual(loadData(), freshV2Shape());
});

test('loadData: v1 missing stoneWeights => filled, baseline moved to prs', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: { deadlift: 365 },
  }));
  const data = loadData();
  assertDeepEqual(data.stoneWeights, {});
  assertEqual(data.prs.deadlift, 365);
  assertEqual(data.version, 2);
});

test('loadData: v1 missing sessions => filled in as empty array', () => {
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

test('save + load: v2 round-trip preserves prs', () => {
  localStorage.removeItem(STORAGE_KEY);
  const fixture = {
    version: 2,
    profile: {},
    prs: { deadlift: 365, 'braemar-stone': 426 },
    prMeta: {},
    goals: {},
    goalMeta: {},
    stoneWeights: {},
    userLifts: [],
    sessions: [],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

test('save + load: v2 round-trip preserves sessions with attempts', () => {
  localStorage.removeItem(STORAGE_KEY);
  const session = {
    id: 1234567890,
    date: '2026-05-15',
    marks: { 'braemar-stone': [420, 425, 426], deadlift: [365] },
    stoneWeights: { 'braemar-stone': 22 },
  };
  const fixture = {
    version: 2,
    profile: {},
    prs: {},
    prMeta: {},
    goals: {},
    goalMeta: {},
    stoneWeights: {},
    userLifts: [],
    sessions: [session],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

test('save + load: preserves unknown future fields through migration', () => {
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

function makeV2Backup(overrides) {
  return Object.assign({
    appName: 'highland-games-tracker',
    exportedAt: '2026-05-16T00:00:00.000Z',
    data: {
      version: 2,
      profile: {},
      prs: {},
      prMeta: {},
      goals: {},
      goalMeta: {},
      stoneWeights: {},
      userLifts: [],
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

test('validateBackup: unsupported version (3) => error', () => {
  const bad = makeBackup();
  bad.data.version = 3;
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

// --- loadData backward compatibility for prMeta ---

test('loadData: v1 missing baselineMeta => prMeta filled in as empty object', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: { deadlift: 365 },
    stoneWeights: {},
    sessions: [],
  }));
  const data = loadData();
  assertDeepEqual(data.prMeta, {});
  assertEqual(data.prs.deadlift, 365);
});

test('save + load: v2 round-trip preserves prMeta', () => {
  localStorage.removeItem(STORAGE_KEY);
  const fixture = {
    version: 2,
    profile: {},
    prs: { 'braemar-stone': 339.5 },
    prMeta: { 'braemar-stone': { date: '2019-10-12', location: 'Radford Highlander Festival' } },
    goals: {},
    goalMeta: {},
    stoneWeights: {},
    userLifts: [],
    sessions: [],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

test('save + load: v2 round-trip preserves session location and games', () => {
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
    version: 2,
    profile: {},
    prs: {},
    prMeta: {},
    goals: {},
    goalMeta: {},
    stoneWeights: {},
    userLifts: [],
    sessions: [session],
  };
  saveData(fixture);
  assertDeepEqual(loadData(), fixture);
});

// --- v1 -> v2 schema migration ---

test('migrateSchemaV1toV2: renames baselines -> prs', () => {
  const data = { version: 1, baselines: { deadlift: 365 }, baselineMeta: {} };
  const changed = migrateSchemaV1toV2(data);
  assertEqual(changed, true);
  assertEqual(data.prs.deadlift, 365);
  assertEqual(data.baselines, undefined);
  assertEqual(data.version, 2);
});

test('migrateSchemaV1toV2: renames baselineMeta -> prMeta', () => {
  const data = {
    version: 1,
    baselines: {},
    baselineMeta: { deadlift: { date: '2026-01-01', location: 'Gym' } },
  };
  migrateSchemaV1toV2(data);
  assertEqual(data.prMeta.deadlift.date, '2026-01-01');
  assertEqual(data.prMeta.deadlift.location, 'Gym');
  assertEqual(data.baselineMeta, undefined);
});

test('migrateSchemaV1toV2: adds empty goals/goalMeta/userLifts/profile', () => {
  const data = { version: 1, baselines: {}, baselineMeta: {} };
  migrateSchemaV1toV2(data);
  assertDeepEqual(data.goals, {});
  assertDeepEqual(data.goalMeta, {});
  assertTrue(Array.isArray(data.userLifts));
  assertEqual(data.userLifts.length, 0);
  assertDeepEqual(data.profile, {});
});

test('migrateSchemaV1toV2: v1 lifts with baselines become userLifts entries with ids preserved', () => {
  const data = {
    version: 1,
    baselines: { deadlift: 365, 'overhead-press': 185 },
    baselineMeta: {},
  };
  migrateSchemaV1toV2(data);
  const ids = data.userLifts.map((l) => l.id).sort();
  assertDeepEqual(ids, ['deadlift', 'overhead-press']);
  const deadlift = data.userLifts.find((l) => l.id === 'deadlift');
  assertEqual(deadlift.name, 'Deadlift');
  assertEqual(deadlift.protocol, '10RM (40 sec)');
  assertEqual(deadlift.unit, 'lb');
  assertEqual(deadlift.active, true);
});

test('migrateSchemaV1toV2: lifts without baselines are not added to userLifts', () => {
  const data = { version: 1, baselines: { deadlift: 365 }, baselineMeta: {} };
  migrateSchemaV1toV2(data);
  assertEqual(data.userLifts.length, 1);
  assertEqual(data.userLifts[0].id, 'deadlift');
});

test('migrateSchemaV1toV2: throws are not added to userLifts even with baselines', () => {
  const data = {
    version: 1,
    baselines: { 'braemar-stone': 420, deadlift: 365 },
    baselineMeta: {},
  };
  migrateSchemaV1toV2(data);
  const ids = data.userLifts.map((l) => l.id);
  assertTrue(ids.indexOf('braemar-stone') === -1, 'throw should not be in userLifts');
  assertTrue(ids.indexOf('deadlift') !== -1, 'lift should be in userLifts');
});

test('migrateSchemaV1toV2: idempotent on v2 data', () => {
  const v2 = freshV2Shape();
  v2.prs = { deadlift: 365 };
  const before = JSON.stringify(v2);
  const changed = migrateSchemaV1toV2(v2);
  assertEqual(changed, false);
  assertEqual(JSON.stringify(v2), before);
});

test('migration persists: second loadData reads v2 directly, baselines key gone from storage', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: { deadlift: 365 },
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  }));
  loadData();
  const raw = localStorage.getItem(STORAGE_KEY);
  const stored = JSON.parse(raw);
  assertEqual(stored.version, 2);
  assertEqual(stored.baselines, undefined);
  assertEqual(stored.prs.deadlift, 365);
  // second loadData is a no-op shape-wise
  const reloaded = loadData();
  assertEqual(reloaded.version, 2);
  assertEqual(reloaded.prs.deadlift, 365);
});

test('migration: empty v1 baselines/baselineMeta produce empty v2 maps', () => {
  const data = { version: 1, baselines: {}, baselineMeta: {} };
  migrateSchemaV1toV2(data);
  assertDeepEqual(data.prs, {});
  assertDeepEqual(data.prMeta, {});
  assertEqual(data.userLifts.length, 0);
});

// --- v1 backup import & validateBackup combinations ---

test('validateBackup: comeback-tracker + v1 envelope => null', () => {
  const ok = makeBackup({ appName: 'comeback-tracker' });
  assertEqual(validateBackup(ok), null);
});

test('validateBackup: comeback-tracker + v2 envelope => null', () => {
  const ok = makeV2Backup({ appName: 'comeback-tracker' });
  assertEqual(validateBackup(ok), null);
});

test('validateBackup: highland-games-tracker + v1 envelope => null', () => {
  assertEqual(validateBackup(makeBackup()), null);
});

test('validateBackup: highland-games-tracker + v2 envelope => null', () => {
  assertEqual(validateBackup(makeV2Backup()), null);
});

test('validateBackup: v2 missing prs => error', () => {
  const bad = makeV2Backup();
  delete bad.data.prs;
  assertTrue(typeof validateBackup(bad) === 'string');
});

test('validateBackup: v2 prs as array => error', () => {
  const bad = makeV2Backup();
  bad.data.prs = [];
  assertTrue(typeof validateBackup(bad) === 'string');
});

test('validateBackup: v2 prMeta as array => error', () => {
  const bad = makeV2Backup();
  bad.data.prMeta = [];
  assertTrue(typeof validateBackup(bad) === 'string');
});

// --- profile capture / class taxonomy ---

test('PROFILE_CLASSES: 15 entries across 4 groups', () => {
  assertEqual(PROFILE_CLASSES.length, 15);
  const groups = new Set(PROFILE_CLASSES.map((c) => c.group));
  assertEqual(groups.size, 4);
  for (const g of ['Open', 'Masters', 'Adaptive', 'Other']) {
    assertTrue(groups.has(g), `missing group ${g}`);
  }
});

test('PROFILE_CLASSES: every class has id, label, group, tiers array', () => {
  for (const cls of PROFILE_CLASSES) {
    assertTrue(typeof cls.id === 'string' && cls.id.length > 0, `id on ${cls.label}`);
    assertTrue(typeof cls.label === 'string' && cls.label.length > 0, `label on ${cls.id}`);
    assertTrue(typeof cls.group === 'string' && cls.group.length > 0, `group on ${cls.id}`);
    assertTrue(Array.isArray(cls.tiers), `tiers array on ${cls.id}`);
  }
});

test('PROFILE_CLASSES: Open and Other classes carry no tiers', () => {
  for (const cls of PROFILE_CLASSES) {
    if (cls.group === 'Open' || cls.group === 'Other') {
      assertEqual(cls.tiers.length, 0, `${cls.id} should have no tiers`);
    }
  }
});

test('PROFILE_CLASSES: Masters classes have 6 tiers (M40..M65+)', () => {
  const masters = PROFILE_CLASSES.filter((c) => c.group === 'Masters');
  assertEqual(masters.length, 2);
  for (const cls of masters) {
    assertEqual(cls.tiers.length, 6, `${cls.id} tier count`);
  }
});

test('PROFILE_CLASSES: Adaptive classes have 3 tiers (Open/Masters 40+/Senior 50+)', () => {
  const adaptive = PROFILE_CLASSES.filter((c) => c.group === 'Adaptive');
  assertEqual(adaptive.length, 4);
  for (const cls of adaptive) {
    assertEqual(cls.tiers.length, 3, `${cls.id} tier count`);
  }
});

test('getProfileClass: known id returns the class', () => {
  const cls = getProfileClass('masters');
  assertTrue(cls !== null);
  assertEqual(cls.label, 'Masters');
});

test('getProfileClass: unknown id returns null', () => {
  assertEqual(getProfileClass('not-a-class'), null);
});

test('getProfileClass: empty / falsy id returns null', () => {
  assertEqual(getProfileClass(''), null);
  assertEqual(getProfileClass(null), null);
  assertEqual(getProfileClass(undefined), null);
});

test('buildProfileFromFormValues: trims name and applies defaults', () => {
  const p = buildProfileFromFormValues({
    name: '  Matt  ',
    setupCompletedAt: '2026-05-19T00:00:00.000Z',
  });
  assertEqual(p.name, 'Matt');
  assertEqual(p.gender, 'unspecified');
  assertEqual(p.weightSchedule, '');
  assertEqual(p.class, '');
  assertEqual(p.tier, '');
  assertEqual(p.setupCompletedAt, '2026-05-19T00:00:00.000Z');
});

test('buildProfileFromFormValues: passes through provided fields', () => {
  const p = buildProfileFromFormValues({
    name: 'Test',
    gender: 'male',
    weightSchedule: 'mens',
    class: 'amateur-b',
    tier: '',
    setupCompletedAt: '2026-05-19T00:00:00.000Z',
  });
  assertEqual(p.name, 'Test');
  assertEqual(p.gender, 'male');
  assertEqual(p.weightSchedule, 'mens');
  assertEqual(p.class, 'amateur-b');
  assertEqual(p.tier, '');
});

test('buildProfileFromFormValues: empty input still yields setupCompletedAt timestamp', () => {
  const p = buildProfileFromFormValues({});
  assertMatch(p.setupCompletedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('buildProfileFromFormValues: male gender defaults weightSchedule to mens', () => {
  const p = buildProfileFromFormValues({ gender: 'male' });
  assertEqual(p.weightSchedule, 'mens');
});

test('buildProfileFromFormValues: female gender defaults weightSchedule to womens', () => {
  const p = buildProfileFromFormValues({ gender: 'female' });
  assertEqual(p.weightSchedule, 'womens');
});

test('buildProfileFromFormValues: nonbinary leaves weightSchedule empty for explicit choice', () => {
  const p = buildProfileFromFormValues({ gender: 'nonbinary' });
  assertEqual(p.weightSchedule, '');
});

test('buildProfileFromFormValues: unspecified gender leaves weightSchedule empty', () => {
  const p = buildProfileFromFormValues({ gender: 'unspecified' });
  assertEqual(p.weightSchedule, '');
});

test('buildProfileFromFormValues: explicit weightSchedule overrides gender default', () => {
  const p = buildProfileFromFormValues({ gender: 'male', weightSchedule: 'womens' });
  assertEqual(p.weightSchedule, 'womens');
});

test('defaultWeightScheduleForGender: male/female map to mens/womens; others empty', () => {
  assertEqual(defaultWeightScheduleForGender('male'), 'mens');
  assertEqual(defaultWeightScheduleForGender('female'), 'womens');
  assertEqual(defaultWeightScheduleForGender('nonbinary'), '');
  assertEqual(defaultWeightScheduleForGender('unspecified'), '');
  assertEqual(defaultWeightScheduleForGender(''), '');
});

test('fresh install profile: empty object with no setupCompletedAt triggers first-launch', () => {
  localStorage.removeItem(STORAGE_KEY);
  const data = loadData();
  assertDeepEqual(data.profile, {});
  assertTrue(!data.profile.setupCompletedAt, 'no setupCompletedAt on fresh install');
});

test('migration: v1 data has no profile, so first-launch still fires after migrate', () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    baselines: { deadlift: 365 },
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  }));
  const data = loadData();
  assertDeepEqual(data.profile, {});
  assertTrue(!data.profile.setupCompletedAt, 'migrated v1 has no setupCompletedAt');
});

test('import path: v1 payload validates, migrates, then loads as v2', () => {
  localStorage.removeItem(STORAGE_KEY);
  // Mirrors what importData does after a v1 backup file is selected:
  // validateBackup -> migrateSchemaV1toV2 -> saveData
  const payload = makeBackup({
    appName: 'comeback-tracker',
    data: {
      version: 1,
      baselines: { deadlift: 365 },
      baselineMeta: { deadlift: { date: '2026-01-01', location: 'Gym' } },
      stoneWeights: {},
      sessions: [],
    },
  });
  assertEqual(validateBackup(payload), null);
  migrateSchemaV1toV2(payload.data);
  saveData(payload.data);
  const data = loadData();
  assertEqual(data.version, 2);
  assertEqual(data.prs.deadlift, 365);
  assertEqual(data.prMeta.deadlift.date, '2026-01-01');
  assertEqual(data.userLifts.length, 1);
  assertEqual(data.userLifts[0].id, 'deadlift');
  assertEqual(data.userLifts[0].name, 'Deadlift');
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

// --- unit system ---

test('UNITS: contains 10 units across 4 categories', () => {
  assertEqual(UNITS.length, 10);
  const categories = new Set(UNITS.map((u) => u.category));
  assertEqual(categories.size, 4);
  for (const c of UNIT_CATEGORIES) {
    assertTrue(categories.has(c), `missing category ${c}`);
  }
});

test('UNITS: weight has lb + kg', () => {
  const ids = UNITS.filter((u) => u.category === 'weight').map((u) => u.id).sort();
  assertDeepEqual(ids, ['kg', 'lb']);
});

test('UNITS: distance has mi/K/m/yd (4 units)', () => {
  const ids = UNITS.filter((u) => u.category === 'distance').map((u) => u.id).sort();
  assertDeepEqual(ids, ['K', 'm', 'mi', 'yd']);
});

test('UNITS: time category has exactly one unit (time)', () => {
  const time = UNITS.filter((u) => u.category === 'time');
  assertEqual(time.length, 1);
  assertEqual(time[0].id, 'time');
});

test('UNITS: count has reps/rounds/cal', () => {
  const ids = UNITS.filter((u) => u.category === 'count').map((u) => u.id).sort();
  assertDeepEqual(ids, ['cal', 'reps', 'rounds']);
});

test('UNITS: direction is "lower" only for time, "higher" otherwise', () => {
  for (const u of UNITS) {
    if (u.id === 'time') assertEqual(u.direction, 'lower', `time should be lower`);
    else assertEqual(u.direction, 'higher', `${u.id} should be higher`);
  }
});

test('getUnit: known id returns the unit', () => {
  const u = getUnit('lb');
  assertTrue(u !== null);
  assertEqual(u.category, 'weight');
});

test('getUnit: unknown id returns null', () => {
  assertEqual(getUnit('parsec'), null);
});

test('getUnit: empty / falsy id returns null', () => {
  assertEqual(getUnit(''), null);
  assertEqual(getUnit(null), null);
  assertEqual(getUnit(undefined), null);
});

// --- liftHasMarks ---

test('liftHasMarks: empty data => false', () => {
  assertEqual(liftHasMarks({}, 'deadlift'), false);
});

test('liftHasMarks: PR set => true', () => {
  assertEqual(liftHasMarks({ prs: { deadlift: 365 } }, 'deadlift'), true);
});

test('liftHasMarks: Goal set => true', () => {
  assertEqual(liftHasMarks({ goals: { deadlift: 400 } }, 'deadlift'), true);
});

test('liftHasMarks: session mark exists => true', () => {
  const data = { sessions: [{ marks: { deadlift: [365] } }] };
  assertEqual(liftHasMarks(data, 'deadlift'), true);
});

test('liftHasMarks: session marks empty array => false', () => {
  const data = { sessions: [{ marks: { deadlift: [] } }] };
  assertEqual(liftHasMarks(data, 'deadlift'), false);
});

test('liftHasMarks: other lift has marks but not this one => false', () => {
  const data = { prs: { 'overhead-press': 185 }, sessions: [{ marks: { 'overhead-press': [185] } }] };
  assertEqual(liftHasMarks(data, 'deadlift'), false);
});

test('liftHasMarks: missing liftId / null data => false', () => {
  assertEqual(liftHasMarks({}, ''), false);
  assertEqual(liftHasMarks(null, 'deadlift'), false);
});

// --- time parse / format ---

test('parseTimeToSeconds: "5:30" => 330', () => {
  assertEqual(parseTimeToSeconds('5:30'), 330);
});

test('parseTimeToSeconds: "1:00:00" => 3600', () => {
  assertEqual(parseTimeToSeconds('1:00:00'), 3600);
});

test('parseTimeToSeconds: "0:00" => 0', () => {
  assertEqual(parseTimeToSeconds('0:00'), 0);
});

test('parseTimeToSeconds: leading/trailing spaces tolerated', () => {
  assertEqual(parseTimeToSeconds('  2:15  '), 135);
});

test('parseTimeToSeconds: empty / null / non-string => null', () => {
  assertEqual(parseTimeToSeconds(''), null);
  assertEqual(parseTimeToSeconds(null), null);
  assertEqual(parseTimeToSeconds(330), null);
});

test('parseTimeToSeconds: single-part "5" => null (needs at least mm:ss)', () => {
  assertEqual(parseTimeToSeconds('5'), null);
});

test('parseTimeToSeconds: non-numeric parts => null', () => {
  assertEqual(parseTimeToSeconds('abc:def'), null);
});

test('parseTimeToSeconds: negative parts => null', () => {
  assertEqual(parseTimeToSeconds('-1:30'), null);
});

test('formatSecondsAsTime: 330 => "5:30"', () => {
  assertEqual(formatSecondsAsTime(330), '5:30');
});

test('formatSecondsAsTime: 3600 => "1:00:00"', () => {
  assertEqual(formatSecondsAsTime(3600), '1:00:00');
});

test('formatSecondsAsTime: 0 => "0:00"', () => {
  assertEqual(formatSecondsAsTime(0), '0:00');
});

test('formatSecondsAsTime: 59 => "0:59"', () => {
  assertEqual(formatSecondsAsTime(59), '0:59');
});

test('formatSecondsAsTime: 3725 => "1:02:05"', () => {
  assertEqual(formatSecondsAsTime(3725), '1:02:05');
});

test('formatSecondsAsTime: null / NaN / negative => empty string', () => {
  assertEqual(formatSecondsAsTime(null), '');
  assertEqual(formatSecondsAsTime(NaN), '');
  assertEqual(formatSecondsAsTime(-10), '');
});

test('round-trip: parse(format(s)) === s for various seconds', () => {
  for (const s of [0, 1, 59, 60, 330, 3599, 3600, 3725, 86399]) {
    assertEqual(parseTimeToSeconds(formatSecondsAsTime(s)), s);
  }
});

// --- applyFormSnapshotsToData (Set PRs & Goals page logic) ---

function baseV2Data() {
  return {
    version: 2,
    profile: {},
    prs: {},
    prMeta: {},
    goals: {},
    goalMeta: {},
    stoneWeights: {},
    userLifts: [],
    sessions: [],
  };
}

const fixedIdGen = (() => {
  let n = 0;
  return () => { n++; return `gen-${n}`; };
})();

test('applyFormSnapshotsToData: throw PR + Goal captured into prs / goals', () => {
  const data = baseV2Data();
  const next = applyFormSnapshotsToData(data, [
    { id: 'braemar-stone', prValue: 420, goalValue: 432, prDate: '2026-05-01', prLocation: 'Field' },
  ], [], { idGenerator: fixedIdGen });
  assertEqual(next.prs['braemar-stone'], 420);
  assertEqual(next.goals['braemar-stone'], 432);
  assertEqual(next.prMeta['braemar-stone'].date, '2026-05-01');
  assertEqual(next.prMeta['braemar-stone'].location, 'Field');
});

test('applyFormSnapshotsToData: null PR / null Goal removes existing entries', () => {
  const data = baseV2Data();
  data.prs['heavy-hammer'] = 800;
  data.goals['heavy-hammer'] = 900;
  data.prMeta['heavy-hammer'] = { date: '2025-01-01', location: 'old' };
  const next = applyFormSnapshotsToData(data, [
    { id: 'heavy-hammer', prValue: null, goalValue: null, prDate: '', prLocation: '' },
  ], [], { idGenerator: fixedIdGen });
  assertEqual(next.prs['heavy-hammer'], undefined);
  assertEqual(next.goals['heavy-hammer'], undefined);
  assertEqual(next.prMeta['heavy-hammer'], undefined);
});

test('applyFormSnapshotsToData: new lift card gets a generated id and active=true', () => {
  const localGen = (() => { let n = 0; return () => { n++; return `id-${n}`; }; })();
  const data = baseV2Data();
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'new-1', status: 'new', name: 'Front Squat', protocol: '1RM', unit: 'lb', prValue: 300, goalValue: 315 },
  ], { idGenerator: localGen });
  assertEqual(next.userLifts.length, 1);
  const lift = next.userLifts[0];
  assertEqual(lift.id, 'id-1');
  assertEqual(lift.name, 'Front Squat');
  assertEqual(lift.protocol, '1RM');
  assertEqual(lift.unit, 'lb');
  assertEqual(lift.active, true);
  assertEqual(next.prs['id-1'], 300);
  assertEqual(next.goals['id-1'], 315);
});

test('applyFormSnapshotsToData: existing lift gets name/protocol/unit updated, stays active', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'deadlift', name: 'Deadlift', protocol: '10RM', unit: 'lb', active: true });
  data.prs.deadlift = 365;
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'deadlift', status: 'saved', name: 'Deadlift (sumo)', protocol: '5RM', unit: 'lb', prValue: 385, goalValue: 405 },
  ], { idGenerator: fixedIdGen });
  assertEqual(next.userLifts.length, 1);
  const lift = next.userLifts[0];
  assertEqual(lift.name, 'Deadlift (sumo)');
  assertEqual(lift.protocol, '5RM');
  assertEqual(lift.active, true);
  assertEqual(next.prs.deadlift, 385);
  assertEqual(next.goals.deadlift, 405);
});

test('applyFormSnapshotsToData: missing lift card => active becomes false (soft-delete)', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'deadlift', name: 'Deadlift', protocol: '', unit: 'lb', active: true });
  data.prs.deadlift = 365;
  data.goals.deadlift = 405;
  data.sessions.push({ id: 1, date: '2026-05-01', marks: { deadlift: [365] }, stoneWeights: {} });
  const next = applyFormSnapshotsToData(data, [], [], { idGenerator: fixedIdGen });
  const lift = next.userLifts.find((l) => l.id === 'deadlift');
  assertEqual(lift.active, false);
  // PR / Goal / session marks preserved
  assertEqual(next.prs.deadlift, 365);
  assertEqual(next.goals.deadlift, 405);
});

test('applyFormSnapshotsToData: soft-deleted lift returning as a card flips active back to true', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'deadlift', name: 'Deadlift', protocol: '', unit: 'lb', active: false });
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'deadlift', status: 'saved', name: 'Deadlift', protocol: '', unit: 'lb', prValue: null, goalValue: null },
  ], { idGenerator: fixedIdGen });
  const lift = next.userLifts.find((l) => l.id === 'deadlift');
  assertEqual(lift.active, true);
});

test('applyFormSnapshotsToData: card with time unit stores seconds', () => {
  const data = baseV2Data();
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'new-1', status: 'new', name: 'Mile run', protocol: '', unit: 'time', prValue: 330, goalValue: 300 },
  ], { idGenerator: () => 'mile-id' });
  const lift = next.userLifts.find((l) => l.id === 'mile-id');
  assertEqual(lift.unit, 'time');
  assertEqual(next.prs['mile-id'], 330);
  assertEqual(next.goals['mile-id'], 300);
});

test('applyFormSnapshotsToData: unit-lock signal — locked unit (lift has marks) is respected by liftHasMarks', () => {
  // A direct integration check: a lift that has a PR is reported as having marks,
  // which is what the Set page uses to disable the unit dropdown.
  const data = baseV2Data();
  data.userLifts.push({ id: 'deadlift', name: 'Deadlift', protocol: '', unit: 'lb', active: true });
  data.prs.deadlift = 365;
  assertEqual(liftHasMarks(data, 'deadlift'), true);
  // The card snapshot trying to switch the unit will not be blocked by the
  // pure function — the lock lives in the UI. Stage 3b adds the conversion
  // engine; for now we assert the data signal is correct.
});

test('applyFormSnapshotsToData: default idGenerator produces unique ids', () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const data = baseV2Data();
    const next = applyFormSnapshotsToData(data, [], [
      { id: 'new-1', status: 'new', name: 'A', protocol: '', unit: 'lb', prValue: null, goalValue: null },
      { id: 'new-2', status: 'new', name: 'B', protocol: '', unit: 'lb', prValue: null, goalValue: null },
    ]);
    const ids = next.userLifts.map((l) => l.id);
    assertEqual(ids.length, 2);
    assertTrue(ids[0] !== ids[1], 'generated ids must be unique');
  }
});

test('applyFormSnapshotsToData: name and protocol are trimmed', () => {
  const data = baseV2Data();
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'new-1', status: 'new', name: '  Pull Up  ', protocol: '  AMRAP  ', unit: 'reps', prValue: 10, goalValue: 20 },
  ], { idGenerator: () => 'pull-id' });
  const lift = next.userLifts[0];
  assertEqual(lift.name, 'Pull Up');
  assertEqual(lift.protocol, 'AMRAP');
});

test('applyFormSnapshotsToData: throw with date only writes prMeta with date and no location', () => {
  const data = baseV2Data();
  const next = applyFormSnapshotsToData(data, [
    { id: 'braemar-stone', prValue: 420, goalValue: null, prDate: '2026-05-01', prLocation: '' },
  ], [], { idGenerator: fixedIdGen });
  assertEqual(next.prMeta['braemar-stone'].date, '2026-05-01');
  assertEqual(next.prMeta['braemar-stone'].location, undefined);
});

test('applyFormSnapshotsToData: does not mutate the input data object', () => {
  const data = baseV2Data();
  data.prs['braemar-stone'] = 100;
  data.userLifts.push({ id: 'd', name: 'D', protocol: '', unit: 'lb', active: true });
  const snapshot = JSON.stringify(data);
  applyFormSnapshotsToData(data, [
    { id: 'braemar-stone', prValue: 999, goalValue: null, prDate: '', prLocation: '' },
  ], [], { idGenerator: fixedIdGen });
  assertEqual(JSON.stringify(data), snapshot);
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

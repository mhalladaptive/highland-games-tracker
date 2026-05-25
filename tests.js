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

// --- formatLiftMark ---

test('formatLiftMark: 102.5 kg', () => {
  assertEqual(formatLiftMark(102.5, 'kg'), '102.5 kg');
});

test('formatLiftMark: 225 lb', () => {
  assertEqual(formatLiftMark(225, 'lb'), '225 lb');
});

test('formatLiftMark: 12 reps', () => {
  assertEqual(formatLiftMark(12, 'reps'), '12 reps');
});

test('formatLiftMark: time mark renders as mm:ss', () => {
  assertEqual(formatLiftMark(225, 'time'), '3:45');
});

test('formatLiftMark: time mark over an hour renders as h:mm:ss', () => {
  assertEqual(formatLiftMark(3725, 'time'), '1:02:05');
});

test('formatLiftMark: unknown unit => empty string', () => {
  assertEqual(formatLiftMark(100, 'banana'), '');
});

test('formatLiftMark: NaN / negative => empty string', () => {
  assertEqual(formatLiftMark(NaN, 'kg'), '');
  assertEqual(formatLiftMark(-5, 'kg'), '');
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

// --- convertValue (Stage 3b unit conversion) ---

test('convertValue: lb -> kg uses the international factor and rounds to 1 dp', () => {
  // 225 * 0.45359237 = 102.0832... -> 102.1
  assertEqual(convertValue(225, 'lb', 'kg'), 102.1);
});

test('convertValue: kg -> lb uses the international factor and rounds to 1 dp', () => {
  // 100 / 0.45359237 = 220.462... -> 220.5
  assertEqual(convertValue(100, 'kg', 'lb'), 220.5);
});

test('convertValue: same unit returns the (rounded) input value', () => {
  assertEqual(convertValue(225, 'lb', 'lb'), 225);
  assertEqual(convertValue(7.25, 'kg', 'kg'), 7.3);
});

test('convertValue: round-trip drift is bounded to about 0.1 (rounding-only)', () => {
  // 225 lb -> 102.1 kg -> 225.1 lb. Accepted per Resolved decisions #2.
  const there = convertValue(225, 'lb', 'kg');
  const back = convertValue(there, 'kg', 'lb');
  assertEqual(there, 102.1);
  assertEqual(back, 225.1);
  assertTrue(Math.abs(back - 225) <= 0.15, 'round-trip drift should be ~0.1');
});

test('convertValue: mi -> K uses meters/1000', () => {
  // 1 mi = 1609.344 m = 1.609 K -> 1.6
  assertEqual(convertValue(1, 'mi', 'K'), 1.6);
});

test('convertValue: K -> mi inverts the mi -> K factor', () => {
  // 1.6 K = 1600 m / 1609.344 = 0.994 mi -> 1.0
  assertEqual(convertValue(1.6, 'K', 'mi'), 1);
});

test('convertValue: m -> yd uses 1 / 0.9144', () => {
  // 1 m = 1.0936... yd -> 1.1
  assertEqual(convertValue(1, 'm', 'yd'), 1.1);
});

test('convertValue: yd -> m uses 0.9144', () => {
  // 1 yd = 0.9144 m -> 0.9
  assertEqual(convertValue(1, 'yd', 'm'), 0.9);
});

test('convertValue: rounds to exactly one decimal place', () => {
  // Half-and-up: 0.45 lb -> kg = 0.204... -> 0.2; 0.5 kg -> lb = 1.10... -> 1.1
  assertEqual(convertValue(0.5, 'kg', 'lb'), 1.1);
  assertEqual(convertValue(0.45, 'lb', 'kg'), 0.2);
});

test('convertValue: cross-category returns null (lb -> mi)', () => {
  assertEqual(convertValue(225, 'lb', 'mi'), null);
});

test('convertValue: Time units return null (no within-category conversion)', () => {
  assertEqual(convertValue(60, 'time', 'time'), null);
});

test('convertValue: Count units return null (reps/rounds/cal do not interconvert)', () => {
  assertEqual(convertValue(10, 'reps', 'rounds'), null);
  assertEqual(convertValue(10, 'reps', 'reps'), null);
  assertEqual(convertValue(100, 'cal', 'reps'), null);
});

test('convertValue: unknown unit returns null', () => {
  assertEqual(convertValue(1, 'parsec', 'm'), null);
  assertEqual(convertValue(1, 'm', 'parsec'), null);
});

test('convertValue: non-finite value returns null', () => {
  assertEqual(convertValue(NaN, 'lb', 'kg'), null);
  assertEqual(convertValue(Infinity, 'lb', 'kg'), null);
  assertEqual(convertValue(null, 'lb', 'kg'), null);
  assertEqual(convertValue(undefined, 'lb', 'kg'), null);
});

// --- buildLiftCard unit dropdown (Stage 3b three-state) ---

function dropdownOptionIds(card) {
  return Array.from(card.querySelectorAll('[data-field="liftUnit"] option')).map((o) => o.value);
}

test('dropdown state: lift with no marks => enabled, all 10 units', () => {
  const data = baseV2Data();
  const lift = { id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true };
  const card = buildLiftCard(lift, data, false);
  const select = card.querySelector('[data-field="liftUnit"]');
  assertEqual(select.disabled, false);
  assertEqual(dropdownOptionIds(card).length, 10);
});

test('dropdown state: marked Weight lift => enabled, filtered to weight (lb, kg)', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  const card = buildLiftCard(data.userLifts[0], data, false);
  const select = card.querySelector('[data-field="liftUnit"]');
  assertEqual(select.disabled, false);
  assertDeepEqual(dropdownOptionIds(card), ['lb', 'kg']);
});

test('dropdown state: marked Distance lift => enabled, filtered to distance (mi, K, m, yd)', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'run', name: 'Long run', protocol: '', unit: 'mi', active: true });
  data.goals.run = 5;
  const card = buildLiftCard(data.userLifts[0], data, false);
  const select = card.querySelector('[data-field="liftUnit"]');
  assertEqual(select.disabled, false);
  assertDeepEqual(dropdownOptionIds(card), ['mi', 'K', 'm', 'yd']);
});

test('dropdown state: marked Time lift => disabled, full 10-unit list (3a lock)', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true });
  data.prs.mile = 360;
  const card = buildLiftCard(data.userLifts[0], data, false);
  const select = card.querySelector('[data-field="liftUnit"]');
  assertEqual(select.disabled, true);
  assertEqual(dropdownOptionIds(card).length, 10);
});

test('dropdown state: marked Count lift => disabled, full 10-unit list (3a lock)', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'pu', name: 'Pull Up', protocol: 'AMRAP', unit: 'reps', active: true });
  data.prs.pu = 20;
  const card = buildLiftCard(data.userLifts[0], data, false);
  const select = card.querySelector('[data-field="liftUnit"]');
  assertEqual(select.disabled, true);
  assertEqual(dropdownOptionIds(card).length, 10);
});

test('dropdown state: brand-new lift card => enabled even when same id appears in marks', () => {
  // A brand-new card with a tmp id should never be treated as marked.
  const data = baseV2Data();
  const card = buildLiftCard({ id: 'new-1', name: '', protocol: '', unit: 'lb', active: true }, data, true);
  const select = card.querySelector('[data-field="liftUnit"]');
  assertEqual(select.disabled, false);
  assertEqual(dropdownOptionIds(card).length, 10);
});

test('live conversion: saved unmarked lift preserves typed PR/Goal on unit change', () => {
  // Regression: live conversion is for saved MARKED lifts only. A saved
  // unmarked Weight/Distance lift used to fall through the gate and have
  // its inputs blanked on unit change (recompute-from-null-saved-values),
  // wiping anything the athlete had just typed.
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  const card = buildLiftCard(data.userLifts[0], data, false);
  const prInput = card.querySelector('[data-field="liftPr"]');
  const goalInput = card.querySelector('[data-field="liftGoal"]');
  prInput.value = '225';
  goalInput.value = '245';
  const select = card.querySelector('[data-field="liftUnit"]');
  select.value = 'kg';
  select.dispatchEvent(new Event('change'));
  assertEqual(prInput.value, '225');
  assertEqual(goalInput.value, '245');
});

// --- Session-mark sweep on Save (Stage 3b risk-bearing path) ---

test('session sweep: unit change converts that lift\'s marks across all sessions', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  data.sessions.push({ id: 1, date: '2026-04-01', marks: { sq: [185, 205, 225] }, stoneWeights: {} });
  data.sessions.push({ id: 2, date: '2026-05-01', marks: { sq: [205] }, stoneWeights: {} });
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'sq', status: 'saved', name: 'Squat', protocol: '1RM', unit: 'kg', prValue: 102.1, goalValue: null },
  ], { idGenerator: fixedIdGen });
  // 185 lb -> 83.9 kg; 205 lb -> 93.0 kg; 225 lb -> 102.1 kg.
  assertDeepEqual(next.sessions[0].marks.sq, [83.9, 93, 102.1]);
  assertDeepEqual(next.sessions[1].marks.sq, [93]);
  // The userLifts entry now carries the new unit.
  assertEqual(next.userLifts.find((l) => l.id === 'sq').unit, 'kg');
  // PR arrives already converted; written as-is, not double-converted.
  assertEqual(next.prs.sq, 102.1);
});

test('session sweep: unchanged unit leaves session marks byte-identical', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  data.sessions.push({ id: 1, date: '2026-04-01', marks: { sq: [185, 205, 225] }, stoneWeights: {} });
  const before = JSON.stringify(data.sessions[0].marks);
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'sq', status: 'saved', name: 'Squat', protocol: '1RM', unit: 'lb', prValue: 235, goalValue: null },
  ], { idGenerator: fixedIdGen });
  assertEqual(JSON.stringify(next.sessions[0].marks), before);
});

test('session sweep: only the changed lift\'s marks convert; other lifts\' marks untouched', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.userLifts.push({ id: 'dl', name: 'Deadlift', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  data.prs.dl = 315;
  data.sessions.push({ id: 1, date: '2026-04-01', marks: { sq: [225], dl: [315] }, stoneWeights: {} });
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'sq', status: 'saved', name: 'Squat', protocol: '1RM', unit: 'kg', prValue: 102.1, goalValue: null },
    { id: 'dl', status: 'saved', name: 'Deadlift', protocol: '1RM', unit: 'lb', prValue: 315, goalValue: null },
  ], { idGenerator: fixedIdGen });
  assertDeepEqual(next.sessions[0].marks.sq, [102.1]);
  assertDeepEqual(next.sessions[0].marks.dl, [315]);
});

test('session sweep: throw marks are never touched by a lift unit change', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  data.sessions.push({
    id: 1, date: '2026-04-01',
    marks: { sq: [225], 'braemar-stone': [420, 426] },
    stoneWeights: {},
  });
  const next = applyFormSnapshotsToData(data, [
    { id: 'braemar-stone', prValue: 426, goalValue: 432, prDate: '', prLocation: '' },
  ], [
    { id: 'sq', status: 'saved', name: 'Squat', protocol: '1RM', unit: 'kg', prValue: 102.1, goalValue: null },
  ], { idGenerator: fixedIdGen });
  assertDeepEqual(next.sessions[0].marks['braemar-stone'], [420, 426]);
});

test('session sweep: lift with no session marks does not error', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  data.sessions.push({ id: 1, date: '2026-04-01', marks: {}, stoneWeights: {} });
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'sq', status: 'saved', name: 'Squat', protocol: '1RM', unit: 'kg', prValue: 102.1, goalValue: null },
  ], { idGenerator: fixedIdGen });
  assertEqual(next.userLifts.find((l) => l.id === 'sq').unit, 'kg');
  assertDeepEqual(next.sessions[0].marks, {});
});

test('session sweep: cross-category unit field leaves marks untouched (defensive)', () => {
  // A cross-category unit change cannot reach Save through the filtered
  // dropdown, but if data is forced in by tests or migration, marks must
  // not be silently mis-converted — convertValue returns null and the mark
  // stays as-is.
  const data = baseV2Data();
  data.userLifts.push({ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true });
  data.prs.mile = 360;
  data.sessions.push({ id: 1, date: '2026-04-01', marks: { mile: [360, 355] }, stoneWeights: {} });
  const next = applyFormSnapshotsToData(data, [], [
    { id: 'mile', status: 'saved', name: 'Mile', protocol: '', unit: 'mi', prValue: 1, goalValue: null },
  ], { idGenerator: fixedIdGen });
  // No conversion attempted (time -> mi is cross-category): marks untouched.
  assertDeepEqual(next.sessions[0].marks.mile, [360, 355]);
});

test('session sweep: applyFormSnapshotsToData returns sessions in its return object', () => {
  const data = baseV2Data();
  data.sessions.push({ id: 1, date: '2026-04-01', marks: {}, stoneWeights: {} });
  const next = applyFormSnapshotsToData(data, [], [], { idGenerator: fixedIdGen });
  assertTrue(Array.isArray(next.sessions), 'sessions should be returned');
  assertEqual(next.sessions.length, 1);
});

test('session sweep: does not mutate input sessions object', () => {
  const data = baseV2Data();
  data.userLifts.push({ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true });
  data.prs.sq = 225;
  data.sessions.push({ id: 1, date: '2026-04-01', marks: { sq: [185, 225] }, stoneWeights: {} });
  const snapshot = JSON.stringify(data.sessions);
  applyFormSnapshotsToData(data, [], [
    { id: 'sq', status: 'saved', name: 'Squat', protocol: '1RM', unit: 'kg', prValue: 102.1, goalValue: null },
  ], { idGenerator: fixedIdGen });
  assertEqual(JSON.stringify(data.sessions), snapshot);
});

// --- Stage 4a: Log Session userLifts rendering ---

function makeSessionFormFixture() {
  let fixture = document.getElementById('session-fixture');
  if (fixture) fixture.remove();
  fixture = document.createElement('div');
  fixture.id = 'session-fixture';
  fixture.innerHTML = `
    <input id="session-date" />
    <input id="session-location" />
    <input id="session-games" />
    <textarea id="throws-notes"></textarea>
    <textarea id="lifts-notes"></textarea>
    <div id="throws-list"></div>
    <div id="lifts-list"></div>
  `;
  document.body.appendChild(fixture);
  return fixture;
}

function removeSessionFormFixture() {
  const f = document.getElementById('session-fixture');
  if (f) f.remove();
}

function withSessionFixture(setupData, fn) {
  saveData(setupData);
  makeSessionFormFixture();
  try {
    fn();
  } finally {
    removeSessionFormFixture();
  }
}

function buildStage4aData(extras) {
  const data = baseV2Data();
  return Object.assign(data, extras || {});
}

test('renderForm: S&C list renders one row per active userLift', () => {
  const data = buildStage4aData({
    userLifts: [
      { id: 'sq',  name: 'Squat',    protocol: '1RM', unit: 'lb',   active: true  },
      { id: 'mile',name: 'Mile',     protocol: '',    unit: 'time', active: true  },
      { id: 'old', name: 'OldLift',  protocol: '',    unit: 'lb',   active: false },
    ],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const liftRows = document.querySelectorAll('#lifts-list .item-row[data-category="lift"]');
    assertEqual(liftRows.length, 2, 'should render 2 active lifts');
    assertEqual(liftRows[0].dataset.itemId, 'sq');
    assertEqual(liftRows[1].dataset.itemId, 'mile');
    // No row for the inactive lift.
    const oldRow = document.querySelector('[data-item-id="old"]');
    assertEqual(oldRow, null, 'no row for inactive lift on a new session');
  });
});

test('renderForm: no v1 ITEMS lifts render on Log Session', () => {
  const data = buildStage4aData({ userLifts: [] });
  withSessionFixture(data, () => {
    renderForm({}, {});
    // Throws still render (8 of them).
    const throwRows = document.querySelectorAll('#throws-list .item-row[data-category="throw"]');
    assertEqual(throwRows.length, 8);
    // None of the v1 ITEMS lift ids appear in lifts-list.
    for (const it of ITEMS) {
      if (it.category !== 'lift') continue;
      const row = document.querySelector(`#lifts-list [data-item-id="${it.id}"]`);
      assertEqual(row, null, `no ${it.id} row on Log Session`);
    }
  });
});

test('renderForm: lift row attempts cap at 10', () => {
  const data = buildStage4aData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true }],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const row = document.querySelector('#lifts-list [data-item-id="sq"]');
    assertEqual(row.querySelectorAll('.attempt').length, 1, 'starts with 1 slot');
    const addBtn = row.querySelector('.add-attempt');
    for (let i = 0; i < 12; i++) addBtn.click();
    assertEqual(row.querySelectorAll('.attempt').length, 10, 'caps at 10');
    assertEqual(addBtn.hidden, true, 'add button hidden at cap');
  });
});

test('renderForm: throw row attempts still cap at 3', () => {
  const data = buildStage4aData({});
  withSessionFixture(data, () => {
    renderForm({}, {});
    const row = document.querySelector('#throws-list [data-item-id="braemar-stone"]');
    // Throws pre-render all 3 slots and hide via CSS — DOM count is always 3.
    assertEqual(row.querySelectorAll('.attempt').length, 3, 'throw row has 3 slots');
    const addBtn = row.querySelector('.add-attempt');
    addBtn.click(); addBtn.click(); addBtn.click();
    assertEqual(parseInt(row.dataset.attempts, 10), 3, 'attempts caps at 3');
  });
});

test('renderForm: lift unit drives input type — weight is decimal, time is mm:ss', () => {
  const data = buildStage4aData({
    userLifts: [
      { id: 'sq',   name: 'Squat', protocol: '1RM', unit: 'kg',   active: true },
      { id: 'mile', name: 'Mile',  protocol: '',    unit: 'time', active: true },
    ],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const sqInput = document.querySelector('#lifts-list [data-item-id="sq"] [data-field="liftValue"]');
    assertEqual(sqInput.inputMode, 'decimal');
    assertEqual(sqInput.placeholder, '0');
    const mileInput = document.querySelector('#lifts-list [data-item-id="mile"] [data-field="liftValue"]');
    assertEqual(mileInput.inputMode, 'numeric');
    assertEqual(mileInput.placeholder, 'mm:ss');
  });
});

test('renderForm: time-unit mark renders as mm:ss; collectFormData parses back to seconds', () => {
  const data = buildStage4aData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
  });
  withSessionFixture(data, () => {
    renderForm({ mile: [225] }, {});
    const input = document.querySelector('[data-item-id="mile"] [data-field="liftValue"][data-slot="1"]');
    assertEqual(input.value, '3:45', 'pre-filled time renders as mm:ss');
    // Type a new time and collect.
    input.value = '4:10';
    document.getElementById('session-date').value = '2026-05-22';
    const collected = collectFormData();
    assertDeepEqual(collected.marks.mile, [250], 'mm:ss parsed back to seconds');
  });
});

test('collectFormData: lift mark in weight unit stored as plain number', () => {
  const data = buildStage4aData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'kg', active: true }],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const input = document.querySelector('[data-item-id="sq"] [data-field="liftValue"][data-slot="1"]');
    input.value = '102.5';
    document.getElementById('session-date').value = '2026-05-22';
    const collected = collectFormData();
    assertDeepEqual(collected.marks.sq, [102.5]);
  });
});

test('findAttemptGaps: lift row with empty slot before a filled one is reported', () => {
  const data = buildStage4aData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true }],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const row = document.querySelector('[data-item-id="sq"]');
    const addBtn = row.querySelector('.add-attempt');
    addBtn.click(); addBtn.click(); // 3 slots total
    const inputs = row.querySelectorAll('[data-field="liftValue"]');
    inputs[0].value = '100';
    // slot 2 left empty
    inputs[2].value = '120';
    const gaps = findAttemptGaps();
    assertEqual(gaps.length, 1);
    assertEqual(gaps[0].itemName, 'Squat');
    assertEqual(gaps[0].emptySlot, 2);
  });
});

test('findAttemptGaps: trailing empties on a lift row are not gaps', () => {
  const data = buildStage4aData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true }],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const row = document.querySelector('[data-item-id="sq"]');
    row.querySelector('.add-attempt').click();
    row.querySelector('.add-attempt').click();
    const inputs = row.querySelectorAll('[data-field="liftValue"]');
    inputs[0].value = '100';
    // slots 2 and 3 left empty — not a gap, just unused
    assertEqual(findAttemptGaps().length, 0);
  });
});

test('renderForm: empty-state appears when no active lifts', () => {
  const data = buildStage4aData({
    userLifts: [{ id: 'old', name: 'OldLift', protocol: '', unit: 'lb', active: false }],
  });
  withSessionFixture(data, () => {
    renderForm({}, {});
    const empty = document.querySelector('#lifts-list .empty-state.lifts-empty');
    assertTrue(empty, 'empty-state element rendered');
    const link = empty.querySelector('a[href="index.html"]');
    assertTrue(link, 'link to index.html present');
    assertEqual(link.textContent, 'Set PRs & Goals page');
    assertMatch(empty.textContent, /No S&C lifts yet/);
  });
});

test('renderForm: editing surfaces inactive lifts that the session has marks for, with a removed tag', () => {
  const data = buildStage4aData({
    userLifts: [
      { id: 'sq',  name: 'Squat',   protocol: '1RM', unit: 'lb', active: true  },
      { id: 'old', name: 'OldLift', protocol: '',    unit: 'lb', active: false },
    ],
  });
  withSessionFixture(data, () => {
    renderForm({ sq: [200], old: [150] }, {}, { includeInactiveLiftsFromMarks: true });
    const oldRow = document.querySelector('[data-item-id="old"]');
    assertTrue(oldRow, 'inactive-with-marks row rendered when editing');
    const tag = oldRow.querySelector('.removed-tag');
    assertTrue(tag, 'removed tag present');
    assertEqual(tag.textContent, 'removed');
    const input = oldRow.querySelector('[data-field="liftValue"][data-slot="1"]');
    assertEqual(input.value, '150');
    assertEqual(input.disabled, false, 'removed-lift row is editable');
  });
});

test('renderForm + collectFormData: editing preserves marks for a since-removed lift', () => {
  const data = buildStage4aData({
    userLifts: [
      { id: 'old', name: 'OldLift', protocol: '', unit: 'lb', active: false },
    ],
  });
  withSessionFixture(data, () => {
    renderForm({ old: [150, 160] }, {}, { includeInactiveLiftsFromMarks: true });
    document.getElementById('session-date').value = '2026-05-22';
    const collected = collectFormData();
    assertDeepEqual(collected.marks.old, [150, 160], 'marks survive Update Session');
  });
});

test('renderForm: new session does NOT surface inactive lifts (even if data has marks)', () => {
  const data = buildStage4aData({
    userLifts: [
      { id: 'old', name: 'OldLift', protocol: '', unit: 'lb', active: false },
    ],
  });
  withSessionFixture(data, () => {
    // No option flag — defaults to a fresh new-session render.
    renderForm({ old: [150] }, {});
    const oldRow = document.querySelector('[data-item-id="old"]');
    assertEqual(oldRow, null, 'inactive lift not rendered on a new session');
  });
});

test('buildSessionDetailsPanel: lift line resolves an inactive lift id and formats by unit', () => {
  const userLifts = [
    { id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: false },
  ];
  const session = {
    id: 1,
    date: '2026-04-01',
    marks: { mile: [225] },
    stoneWeights: {},
  };
  const details = buildSessionDetailsPanel(session, 'details-test', userLifts);
  const line = details.querySelector('.session-event-line');
  assertTrue(line, 'lift line rendered for inactive lift');
  assertMatch(line.querySelector('.session-event-name').textContent, /^Mile$/);
  assertMatch(line.querySelector('.session-event-marks').textContent, /^3:45$/);
});

test('buildSessionDetailsPanel: lift line formats weight-unit marks via unit label', () => {
  const userLifts = [
    { id: 'sq', name: 'Squat', protocol: '1RM', unit: 'kg', active: true },
  ];
  const session = { id: 2, date: '2026-04-02', marks: { sq: [102.5, 110] }, stoneWeights: {} };
  const details = buildSessionDetailsPanel(session, 'details-test-2', userLifts);
  const marks = details.querySelector('.session-event-marks').textContent;
  assertEqual(marks, '102.5 kg, 110 kg');
});

// --- Stage 4b: detection helpers ---

function stage4bData(extras) {
  return Object.assign(baseV2Data(), extras || {});
}

test('eventDirection: throw event => higher', () => {
  assertEqual(eventDirection('braemar-stone', stage4bData()), 'higher');
});

test('eventDirection: weight lift => higher', () => {
  const data = stage4bData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'kg', active: true }],
  });
  assertEqual(eventDirection('sq', data), 'higher');
});

test('eventDirection: time lift => lower', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
  });
  assertEqual(eventDirection('mile', data), 'lower');
});

test('eventDirection: unknown event => higher (default)', () => {
  assertEqual(eventDirection('mystery', stage4bData()), 'higher');
});

test('eventBest: empty / non-array => null', () => {
  assertEqual(eventBest([], 'higher'), null);
  assertEqual(eventBest(null, 'higher'), null);
});

test('eventBest: higher returns max', () => {
  assertEqual(eventBest([200, 225, 215], 'higher'), 225);
});

test('eventBest: lower returns min', () => {
  assertEqual(eventBest([330, 320, 315], 'lower'), 315);
});

test('eventBest: ignores non-finite entries', () => {
  assertEqual(eventBest([NaN, 100, null, 110], 'higher'), 110);
});

test('sessionPrUpdates: first-ever mark sets prs from session best', () => {
  const data = stage4bData();
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [400, 410, 405] } };
  const updates = sessionPrUpdates(session, data);
  assertEqual(updates['braemar-stone'], 410);
});

test('sessionPrUpdates: PR break updates with new best', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [395, 412] } };
  const updates = sessionPrUpdates(session, data);
  assertEqual(updates['braemar-stone'], 412);
});

test('sessionPrUpdates: no improvement => no entry', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 420 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [400, 410] } };
  const updates = sessionPrUpdates(session, data);
  assertEqual(updates['braemar-stone'], undefined);
});

test('sessionPrUpdates: time direction — faster session beats slower PR', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
    prs: { mile: 360 },
  });
  const session = { id: 1, date: '2026-05-22', marks: { mile: [355, 350] } };
  const updates = sessionPrUpdates(session, data);
  assertEqual(updates.mile, 350);
});

test('sessionPrUpdates: time direction — slower session does not update', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
    prs: { mile: 300 },
  });
  const session = { id: 1, date: '2026-05-22', marks: { mile: [320, 310] } };
  const updates = sessionPrUpdates(session, data);
  assertEqual(updates.mile, undefined);
});

test('detectMilestones: silent first-mark produces no milestone', () => {
  const data = stage4bData();
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [400, 410, 405] } };
  assertDeepEqual(detectMilestones(session, data), []);
});

test('detectMilestones: PR break fires PR milestone with previousValue', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [395, 412] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 1);
  assertEqual(ms[0].type, 'pr');
  assertEqual(ms[0].event, 'braemar-stone');
  assertEqual(ms[0].value, 412);
  assertEqual(ms[0].previousValue, 400);
});

test('detectMilestones: PR milestone carries class and tier snapshot from profile', () => {
  const data = stage4bData({
    prs: { 'braemar-stone': 400 },
    profile: { class: 'amateur-b', tier: '' },
  });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms[0].class, 'amateur-b');
  assertEqual(ms[0].tier, '');
});

test('detectMilestones: empty profile yields empty-string class/tier on PR', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms[0].class, '');
  assertEqual(ms[0].tier, '');
});

test('detectMilestones: Goal milestone fires when best meets-or-beats unachieved goal', () => {
  const data = stage4bData({ goals: { 'braemar-stone': 420 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 1);
  assertEqual(ms[0].type, 'goal');
  assertEqual(ms[0].value, 420);
  assertEqual(ms[0].goalValue, 420);
});

test('detectMilestones: Goal can fire on a first-ever mark (no PR required)', () => {
  const data = stage4bData({ goals: { 'braemar-stone': 410 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [415] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 1);
  assertEqual(ms[0].type, 'goal');
});

test('detectMilestones: Goal does not fire if already achieved', () => {
  const data = stage4bData({
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: '2026-05-01T00:00:00.000Z', achievedInSessionId: 99 } },
  });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 0);
});

test('detectMilestones: Goal does not fire when best falls short', () => {
  const data = stage4bData({ goals: { 'braemar-stone': 420 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [400, 415] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 0);
});

test('detectMilestones: same event PR + Goal renders as two separate milestones', () => {
  const data = stage4bData({
    prs: { 'braemar-stone': 400 },
    goals: { 'braemar-stone': 410 },
  });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [415] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 3, 'pr + goal + awesomeDay');
  assertEqual(ms[0].type, 'pr');
  assertEqual(ms[1].type, 'goal');
  assertEqual(ms[2].type, 'awesomeDay');
});

test('detectMilestones: Awesome Day fires at 2+ milestones', () => {
  const data = stage4bData({
    prs: { 'braemar-stone': 400, 'open-stone': 380 },
  });
  const session = {
    id: 1, date: '2026-05-22',
    marks: { 'braemar-stone': [420], 'open-stone': [395] },
  };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 3);
  assertEqual(ms[0].type, 'pr');
  assertEqual(ms[1].type, 'pr');
  assertEqual(ms[2].type, 'awesomeDay');
});

test('detectMilestones: Awesome Day does NOT fire on a single milestone', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 1);
  assertEqual(ms.find((m) => m.type === 'awesomeDay'), undefined);
});

test('detectMilestones: time-unit PR fires on a faster mark, not a higher number', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
    prs: { mile: 360 },
  });
  const session = { id: 1, date: '2026-05-22', marks: { mile: [355] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 1);
  assertEqual(ms[0].type, 'pr');
  assertEqual(ms[0].value, 355);
  assertEqual(ms[0].previousValue, 360);
});

test('detectMilestones: time-unit slower mark does NOT fire PR', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
    prs: { mile: 360 },
  });
  const session = { id: 1, date: '2026-05-22', marks: { mile: [370] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 0);
});

test('detectMilestones: time-unit Goal fires on a faster mark', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
    goals: { mile: 300 },
  });
  const session = { id: 1, date: '2026-05-22', marks: { mile: [299] } };
  const ms = detectMilestones(session, data);
  assertEqual(ms.length, 1);
  assertEqual(ms[0].type, 'goal');
});

test('detectMilestones: PR cards come before Goal cards in returned order', () => {
  const data = stage4bData({
    prs: { 'open-stone': 380 },
    goals: { 'braemar-stone': 410 },
  });
  const session = {
    id: 1, date: '2026-05-22',
    marks: { 'braemar-stone': [415], 'open-stone': [395] },
  };
  const ms = detectMilestones(session, data);
  // pr (open-stone) + goal (braemar-stone) + awesomeDay
  assertEqual(ms.length, 3);
  assertEqual(ms[0].type, 'pr');
  assertEqual(ms[0].event, 'open-stone');
  assertEqual(ms[1].type, 'goal');
  assertEqual(ms[1].event, 'braemar-stone');
  assertEqual(ms[2].type, 'awesomeDay');
});

test('detectMilestones: throw events listed before lift events when both PR', () => {
  const data = stage4bData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true }],
    prs: { 'braemar-stone': 400, sq: 225 },
  });
  const session = {
    id: 1, date: '2026-05-22',
    marks: { sq: [245], 'braemar-stone': [420] },
  };
  const ms = detectMilestones(session, data);
  assertEqual(ms[0].event, 'braemar-stone');
  assertEqual(ms[1].event, 'sq');
});

test('detectMilestones: session with no marks => []', () => {
  assertDeepEqual(detectMilestones({ id: 1, date: '2026-05-22', marks: {} }, stage4bData()), []);
});

test('detectMilestones: null session => []', () => {
  assertDeepEqual(detectMilestones(null, stage4bData()), []);
});

// --- Stage 4b: persistence on save ---

test('applyCelebrationUpdates: stamps session.milestones with detected milestones', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = {
    id: 1, date: '2026-05-22',
    location: 'Field', games: 'Test Games', kind: 'competition',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
  };
  applyCelebrationUpdates(session, data);
  assertEqual(Array.isArray(session.milestones), true);
  assertEqual(session.milestones.length, 1);
  assertEqual(session.milestones[0].type, 'pr');
});

test('applyCelebrationUpdates: silent first mark sets prs without producing milestone', () => {
  const data = stage4bData();
  const session = {
    id: 1, date: '2026-05-22',
    location: 'Field', games: 'Test Games', kind: 'competition',
    marks: { 'braemar-stone': [410] }, stoneWeights: {},
  };
  applyCelebrationUpdates(session, data);
  assertEqual(data.prs['braemar-stone'], 410);
  assertEqual(session.milestones.length, 0);
});

test('applyCelebrationUpdates: PR break updates prs and prMeta from session', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = {
    id: 1234, date: '2026-05-22',
    location: 'Field', games: 'Highland Test', kind: 'competition',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
  };
  applyCelebrationUpdates(session, data);
  assertEqual(data.prs['braemar-stone'], 420);
  assertEqual(data.prMeta['braemar-stone'].date, '2026-05-22');
  assertEqual(data.prMeta['braemar-stone'].location, 'Field');
  assertEqual(data.prMeta['braemar-stone'].gamesTitle, 'Highland Test');
  assertEqual(data.prMeta['braemar-stone'].sessionId, 1234);
});

test('applyCelebrationUpdates: prMeta omits empty location/gamesTitle', () => {
  const data = stage4bData({ prs: { 'braemar-stone': 400 } });
  const session = {
    id: 9, date: '2026-05-22',
    location: '', games: '', kind: 'training',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
  };
  applyCelebrationUpdates(session, data);
  assertEqual(data.prMeta['braemar-stone'].location, undefined);
  assertEqual(data.prMeta['braemar-stone'].gamesTitle, undefined);
  assertEqual(data.prMeta['braemar-stone'].date, '2026-05-22');
});

test('applyCelebrationUpdates: Goal milestone writes goalMeta with achievedInSessionId', () => {
  const data = stage4bData({ goals: { 'braemar-stone': 410 } });
  const session = {
    id: 42, date: '2026-05-22',
    location: '', games: '', kind: 'training',
    marks: { 'braemar-stone': [415] }, stoneWeights: {},
  };
  applyCelebrationUpdates(session, data);
  const meta = data.goalMeta['braemar-stone'];
  assertEqual(meta.value, 410);
  assertEqual(meta.achievedInSessionId, 42);
  assertMatch(meta.achievedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('applyCelebrationUpdates: silent-PR + Goal hit fires Goal but not PR card', () => {
  const data = stage4bData({ goals: { 'braemar-stone': 400 } });
  const session = {
    id: 1, date: '2026-05-22',
    location: '', games: '', kind: 'training',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
  };
  applyCelebrationUpdates(session, data);
  assertEqual(data.prs['braemar-stone'], 420);
  assertEqual(session.milestones.length, 1);
  assertEqual(session.milestones[0].type, 'goal');
});

test('handleSubmit (new session): persists milestones[] and updates prs/prMeta/goalMeta', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({
    prs: { 'braemar-stone': 400 },
    goals: { 'braemar-stone': 410 },
  }));

  const form = document.createElement('form');
  form.id = 'session-form';
  form.innerHTML = `
    <input id="session-date" value="2026-05-22" />
    <input id="session-location" value="Field" />
    <input id="session-games" value="Test Games" />
    <textarea id="throws-notes"></textarea>
    <textarea id="lifts-notes"></textarea>
    <button class="kind-btn active" data-kind="competition"></button>
    <button class="kind-btn" data-kind="training"></button>
    <button id="save-btn">Save Session</button>
    <div id="status"></div>
    <div id="edit-banner" hidden></div>
    <span id="edit-banner-date"></span>
    <button id="cancel-edit-btn"></button>
    <div id="throws-list">
      <div class="item-row" data-category="throw" data-item-id="braemar-stone" data-attempts="1" data-measurement-type="distance">
        <div class="attempts">
          <div class="attempt" data-slot="1">
            <input data-field="feet" data-slot="1" value="35" />
            <input data-field="inches" data-slot="1" value="0" />
          </div>
        </div>
      </div>
    </div>
    <div id="lifts-list"></div>
    <ul id="sessions-list"></ul>
    <p id="sessions-empty"></p>
  `;
  document.body.appendChild(form);

  try {
    handleSubmit({ preventDefault: () => {} });
    const data = loadData();
    assertEqual(data.sessions.length, 1);
    const session = data.sessions[0];
    assertTrue(Array.isArray(session.milestones), 'milestones[] persisted');
    // 35 ft = 420 inches; PR was 400 inches, goal 410 inches -> PR + Goal + Awesome
    assertEqual(session.milestones.length, 3);
    assertEqual(session.milestones[0].type, 'pr');
    assertEqual(session.milestones[1].type, 'goal');
    assertEqual(session.milestones[2].type, 'awesomeDay');
    assertEqual(data.prs['braemar-stone'], 420);
    assertEqual(data.prMeta['braemar-stone'].sessionId, session.id);
    assertEqual(data.prMeta['braemar-stone'].gamesTitle, 'Test Games');
    assertEqual(data.goalMeta['braemar-stone'].achievedInSessionId, session.id);
  } finally {
    form.remove();
  }
});

// --- Stage 4b: celebration card UI ---

test('buildCelebrationCard: PR card renders headline, event, mark, and previous value', () => {
  const data = stage4bData();
  const session = { id: 1, date: '2026-05-22', location: 'Field', games: 'Test Games' };
  const milestone = {
    type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '',
  };
  const card = buildCelebrationCard(milestone, session, data, [milestone]);
  assertTrue(card.classList.contains('celebration-card--pr'), 'pr class');
  assertMatch(card.querySelector('.celebration-card-headline').textContent, /Personal Record/);
  assertMatch(card.querySelector('.celebration-card-event').textContent, /Braemar Stone/);
  assertMatch(card.querySelector('.celebration-card-mark').textContent, /35'/);
  assertMatch(card.querySelector('.celebration-card-prev').textContent, /was 33'/);
  assertTrue(card.querySelector('.celebration-card-wordmark'), 'wordmark on PR card');
});

test('buildCelebrationCard: Goal card renders headline + "you set / you hit"', () => {
  const data = stage4bData();
  const session = { id: 1, date: '2026-05-22', location: '', games: '' };
  const milestone = { type: 'goal', event: 'braemar-stone', value: 432, goalValue: 420 };
  const card = buildCelebrationCard(milestone, session, data, [milestone]);
  assertTrue(card.classList.contains('celebration-card--goal'));
  assertMatch(card.querySelector('.celebration-card-headline').textContent, /Goal Achieved/);
  assertMatch(card.querySelector('.celebration-card-prev').textContent, /you set 35', you hit 36'/);
});

test('buildCelebrationCard: Awesome Day lists session milestones and shows date/games', () => {
  const data = stage4bData();
  const session = { id: 1, date: '2026-05-22', games: 'Highland Test' };
  const ms = [
    { type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' },
    { type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 },
    { type: 'awesomeDay' },
  ];
  const card = buildCelebrationCard(ms[2], session, data, ms);
  assertTrue(card.classList.contains('celebration-card--awesomeDay'));
  assertMatch(card.querySelector('.celebration-card-headline').textContent, /Awesome Day/);
  assertMatch(card.querySelector('.celebration-card-event').textContent, /Highland Test/);
  const items = card.querySelectorAll('.milestone-list li');
  assertEqual(items.length, 2, 'awesomeDay lists the two underlying milestones');
  assertMatch(items[0].textContent, /^PR/);
  assertMatch(items[1].textContent, /^Goal/);
});

test('buildCelebrationCard: PR card formats time-unit lift mark as mm:ss', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
  });
  const session = { id: 1, date: '2026-05-22' };
  const milestone = { type: 'pr', event: 'mile', value: 355, previousValue: 360, class: '', tier: '' };
  const card = buildCelebrationCard(milestone, session, data, [milestone]);
  assertEqual(card.querySelector('.celebration-card-mark').textContent, '5:55');
  assertMatch(card.querySelector('.celebration-card-prev').textContent, /was 6:00/);
});

test('showCelebrationQueue: builds overlay with first card, advances on click, closes after last', () => {
  const data = stage4bData();
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    milestones: [
      { type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' },
      { type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 },
      { type: 'awesomeDay' },
    ],
  };
  // Clean up any pre-existing overlay (paranoia for repeat runs).
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  showCelebrationQueue(session, data);

  let overlay = document.querySelector('.celebration-overlay');
  assertTrue(overlay, 'overlay created');
  assertTrue(overlay.querySelector('.celebration-card--pr'), 'first card is PR');
  // Same-event PR+Goal still renders as two distinct cards.
  overlay.click();
  overlay = document.querySelector('.celebration-overlay');
  assertTrue(overlay.querySelector('.celebration-card--goal'), 'second card is Goal');
  overlay.click();
  overlay = document.querySelector('.celebration-overlay');
  assertTrue(overlay.querySelector('.celebration-card--awesomeDay'), 'third card is Awesome Day');
  overlay.click();
  assertEqual(document.querySelector('.celebration-overlay'), null, 'queue closes after last card');
});

test('showCelebrationQueue: empty milestones leaves no overlay', () => {
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  showCelebrationQueue({ id: 1, date: '2026-05-22', milestones: [] }, stage4bData());
  assertEqual(document.querySelector('.celebration-overlay'), null);
});

test('showCelebrationQueue: × button ends the queue early', () => {
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  const data = stage4bData();
  const session = {
    id: 1, date: '2026-05-22',
    milestones: [
      { type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' },
      { type: 'pr', event: 'open-stone', value: 395, previousValue: 380, class: '', tier: '' },
      { type: 'awesomeDay' },
    ],
  };
  showCelebrationQueue(session, data);
  const overlay = document.querySelector('.celebration-overlay');
  assertTrue(overlay);
  const closeBtn = overlay.querySelector('.celebration-close');
  closeBtn.click();
  assertEqual(document.querySelector('.celebration-overlay'), null);
});

// --- Stage 4b: Past Sessions badge + View Celebrations replay ---

function makePastSessionsFixture() {
  let fixture = document.getElementById('past-fixture');
  if (fixture) fixture.remove();
  fixture = document.createElement('div');
  fixture.id = 'past-fixture';
  fixture.innerHTML = '<ul id="sessions-list"></ul><p id="sessions-empty"></p>';
  document.body.appendChild(fixture);
  return fixture;
}

function removePastSessionsFixture() {
  const f = document.getElementById('past-fixture');
  if (f) f.remove();
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
}

test('renderSessionsList: session with milestones shows a milestone badge', () => {
  const fixture = makePastSessionsFixture();
  try {
    renderSessionsList([{
      id: 1, date: '2026-05-22', kind: 'competition', games: '', location: '',
      marks: { 'braemar-stone': [420] }, stoneWeights: {},
      milestones: [
        { type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' },
        { type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 },
        { type: 'awesomeDay' },
      ],
    }], []);
    const badge = fixture.querySelector('.milestone-badge');
    assertTrue(badge, 'badge rendered');
    // The awesomeDay entry is not counted as a card.
    assertEqual(badge.textContent, '2 MILESTONES');
  } finally {
    removePastSessionsFixture();
  }
});

test('renderSessionsList: session with one milestone shows singular badge', () => {
  const fixture = makePastSessionsFixture();
  try {
    renderSessionsList([{
      id: 1, date: '2026-05-22', kind: 'training', games: '', location: '',
      marks: { 'braemar-stone': [420] }, stoneWeights: {},
      milestones: [{ type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' }],
    }], []);
    const badge = fixture.querySelector('.milestone-badge');
    assertEqual(badge.textContent, '1 MILESTONE');
  } finally {
    removePastSessionsFixture();
  }
});

test('renderSessionsList: pre-4b session (no milestones field) renders without badge or error', () => {
  const fixture = makePastSessionsFixture();
  try {
    renderSessionsList([{
      id: 1, date: '2026-05-15', kind: 'competition', games: 'Old Games', location: '',
      marks: { 'braemar-stone': [400] }, stoneWeights: {},
    }], []);
    assertEqual(fixture.querySelector('.milestone-badge'), null, 'no badge on pre-4b session');
    const view = fixture.querySelector('button');
    assertTrue(view, 'session row still rendered');
  } finally {
    removePastSessionsFixture();
  }
});

test('renderSessionsList: session with empty milestones array renders no badge', () => {
  const fixture = makePastSessionsFixture();
  try {
    renderSessionsList([{
      id: 1, date: '2026-05-22', kind: 'training', games: '', location: '',
      marks: { 'braemar-stone': [400] }, stoneWeights: {},
      milestones: [],
    }], []);
    assertEqual(fixture.querySelector('.milestone-badge'), null);
  } finally {
    removePastSessionsFixture();
  }
});

test('buildSessionDetailsPanel: milestone-bearing session shows View Celebrations button', () => {
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
    milestones: [{ type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' }],
  };
  const details = buildSessionDetailsPanel(session, 'details-celeb', []);
  const replay = details.querySelector('.view-celebrations-btn');
  assertTrue(replay, 'View Celebrations button rendered');
  assertEqual(replay.textContent, 'View Celebrations');
});

test('buildSessionDetailsPanel: session without milestones has no View Celebrations button', () => {
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
  };
  const details = buildSessionDetailsPanel(session, 'details-nope', []);
  assertEqual(details.querySelector('.view-celebrations-btn'), null);
});

test('View Celebrations: replay re-derives the same card sequence as save', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData());
  const session = {
    id: 1, date: '2026-05-22', games: 'Replay Games', location: '',
    marks: { 'braemar-stone': [420] }, stoneWeights: {},
    milestones: [
      { type: 'pr', event: 'braemar-stone', value: 420, previousValue: 400, class: '', tier: '' },
      { type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 },
      { type: 'awesomeDay' },
    ],
  };
  const details = buildSessionDetailsPanel(session, 'details-replay', []);
  document.body.appendChild(details);
  try {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
    details.querySelector('.view-celebrations-btn').click();
    let overlay = document.querySelector('.celebration-overlay');
    assertTrue(overlay.querySelector('.celebration-card--pr'), 'replay starts with PR');
    overlay.click();
    overlay = document.querySelector('.celebration-overlay');
    assertTrue(overlay.querySelector('.celebration-card--goal'), 'then Goal');
    overlay.click();
    overlay = document.querySelector('.celebration-overlay');
    assertTrue(overlay.querySelector('.celebration-card--awesomeDay'), 'then Awesome Day');
    overlay.click();
    assertEqual(document.querySelector('.celebration-overlay'), null, 'closes after last');
  } finally {
    details.remove();
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  }
});

// --- Stage 4c: recomputeDerivedState ---

test('recomputeDerivedState: empty data => empty slices', () => {
  const r = recomputeDerivedState(stage4bData());
  assertDeepEqual(r.prs, {});
  assertDeepEqual(r.prMeta, {});
  assertDeepEqual(r.goalMeta, {});
});

test('recomputeDerivedState: prs is max across sessions for higher direction', () => {
  const data = stage4bData({
    sessions: [
      { id: 1, date: '2026-05-01', location: 'A', games: '', kind: 'training', marks: { 'braemar-stone': [400, 410] } },
      { id: 2, date: '2026-05-10', location: 'B', games: '', kind: 'training', marks: { 'braemar-stone': [415, 405] } },
    ],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.prs['braemar-stone'], 415);
  assertEqual(r.prMeta['braemar-stone'].sessionId, 2);
  assertEqual(r.prMeta['braemar-stone'].location, 'B');
});

test('recomputeDerivedState: prs is min across sessions for time direction', () => {
  const data = stage4bData({
    userLifts: [{ id: 'mile', name: 'Mile', protocol: '', unit: 'time', active: true }],
    sessions: [
      { id: 1, date: '2026-05-01', marks: { mile: [360] } },
      { id: 2, date: '2026-05-10', marks: { mile: [355] } },
      { id: 3, date: '2026-05-20', marks: { mile: [358] } },
    ],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.prs.mile, 355);
  assertEqual(r.prMeta.mile.sessionId, 2);
});

test('recomputeDerivedState: prMeta tie-break is the earliest session', () => {
  const data = stage4bData({
    sessions: [
      { id: 2, date: '2026-05-10', marks: { 'braemar-stone': [420] } },
      { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [420] } },
      { id: 3, date: '2026-05-20', marks: { 'braemar-stone': [420] } },
    ],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.prMeta['braemar-stone'].sessionId, 1, 'earliest by date wins');
});

test('recomputeDerivedState: deleting PR-holder drops prs to next-best', () => {
  const data = stage4bData({
    sessions: [
      { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [400] } },
      { id: 2, date: '2026-05-10', marks: { 'braemar-stone': [410] } },
    ],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.prs['braemar-stone'], 410);
  // Now simulate the delete: session 2 (the PR holder) is removed.
  data.sessions = data.sessions.filter((s) => s.id !== 2);
  const after = recomputeDerivedState(data);
  assertEqual(after.prs['braemar-stone'], 400, 'drops to next-best after delete');
  assertEqual(after.prMeta['braemar-stone'].sessionId, 1);
});

test('recomputeDerivedState: deleting last session for event clears prs/prMeta', () => {
  const data = stage4bData({
    sessions: [
      { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [400], 'open-stone': [380] } },
      { id: 2, date: '2026-05-10', marks: { 'open-stone': [385] } },
    ],
  });
  data.sessions = data.sessions.filter((s) => s.id !== 1);
  const r = recomputeDerivedState(data);
  assertEqual(r.prs['braemar-stone'], undefined, 'event with no remaining marks drops from prs');
  assertEqual(r.prMeta['braemar-stone'], undefined);
  assertEqual(r.prs['open-stone'], 385);
});

test('recomputeDerivedState: goalMeta cleared when no remaining session meets goal', () => {
  const data = stage4bData({
    goals: { 'braemar-stone': 420 },
    goalMeta: { 'braemar-stone': { value: 420, achievedAt: '2026-05-10T00:00:00.000Z', achievedInSessionId: 2 } },
    sessions: [
      { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [410] } },
      { id: 2, date: '2026-05-10', marks: { 'braemar-stone': [425] } },
    ],
  });
  data.sessions = data.sessions.filter((s) => s.id !== 2);
  const r = recomputeDerivedState(data);
  assertEqual(r.goalMeta['braemar-stone'], undefined, 'goalMeta clears when no session meets goal');
});

test('recomputeDerivedState: goalMeta first-meets in chronological order', () => {
  const data = stage4bData({
    goals: { 'braemar-stone': 410 },
    sessions: [
      { id: 5, date: '2026-05-20', marks: { 'braemar-stone': [420] } },
      { id: 3, date: '2026-05-10', marks: { 'braemar-stone': [415] } },
      { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [405] } },
    ],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.goalMeta['braemar-stone'].achievedInSessionId, 3, 'first achiever by date');
  assertEqual(r.goalMeta['braemar-stone'].value, 410, 'records the goalValue (current goal)');
});

test('recomputeDerivedState: never touches active goals[event]', () => {
  const data = stage4bData({
    goals: { 'braemar-stone': 420, 'open-stone': 380 },
    sessions: [{ id: 1, date: '2026-05-01', marks: { 'braemar-stone': [400] } }],
  });
  const goalsBefore = JSON.parse(JSON.stringify(data.goals));
  const r = recomputeDerivedState(data);
  assertDeepEqual(data.goals, goalsBefore, 'recompute did not mutate goals');
  assertEqual(r.goals, undefined, 'recompute does not return goals');
});

test('recomputeDerivedState: achievedAt preserved when achiever+value unchanged', () => {
  const original = '2026-04-01T12:34:56.789Z';
  const data = stage4bData({
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: original, achievedInSessionId: 1 } },
    sessions: [{ id: 1, date: '2026-05-01', marks: { 'braemar-stone': [415] } }],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.goalMeta['braemar-stone'].achievedAt, original, 'wallclock preserved on idempotent recompute');
});

test('recomputeDerivedState: achievedAt regenerated when achiever changes', () => {
  const original = '2026-04-01T12:34:56.789Z';
  const data = stage4bData({
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: original, achievedInSessionId: 999 } },
    sessions: [{ id: 1, date: '2026-05-01', marks: { 'braemar-stone': [415] } }],
  });
  const r = recomputeDerivedState(data);
  assertEqual(r.goalMeta['braemar-stone'].achievedInSessionId, 1);
  assertEqual(r.goalMeta['braemar-stone'].achievedAt, '2026-05-01T00:00:00.000Z');
});

// --- Stage 4c: redetectMilestonesForEditedSession ---

test('redetectMilestonesForEditedSession: solo session has empty baseline (silent first mark)', () => {
  const solo = { id: 1, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const data = stage4bData({ sessions: [solo] });
  assertDeepEqual(redetectMilestonesForEditedSession(solo, data), []);
});

test('redetectMilestonesForEditedSession: prior session forms the baseline', () => {
  const prior = { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [400] } };
  const edited = { id: 2, date: '2026-05-22', marks: { 'braemar-stone': [420] } };
  const data = stage4bData({ goals: { 'braemar-stone': 410 }, sessions: [prior, edited] });
  const ms = redetectMilestonesForEditedSession(edited, data);
  assertEqual(ms.length, 3, 'PR + Goal + AwesomeDay');
  assertEqual(ms[0].type, 'pr');
  assertEqual(ms[0].previousValue, 400);
});

test('redetectMilestonesForEditedSession: prior session that already met goal blocks Goal milestone', () => {
  const prior = { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [420] } };
  const edited = { id: 2, date: '2026-05-22', marks: { 'braemar-stone': [425] } };
  const data = stage4bData({ goals: { 'braemar-stone': 410 }, sessions: [prior, edited] });
  const ms = redetectMilestonesForEditedSession(edited, data);
  // PR fires (425 beats 420), Goal does NOT fire (prior achieved 410).
  assertEqual(ms.filter((m) => m.type === 'goal').length, 0);
  assertEqual(ms.filter((m) => m.type === 'pr').length, 1);
});

// --- Stage 4c: diffCreatedMilestones ---

test('diffCreatedMilestones: identifies added entries by (type, event)', () => {
  const prev = [{ type: 'pr', event: 'braemar-stone' }];
  const next = [
    { type: 'pr', event: 'braemar-stone' },
    { type: 'goal', event: 'braemar-stone' },
    { type: 'awesomeDay' },
  ];
  const created = diffCreatedMilestones(prev, next);
  assertEqual(created.length, 2);
  assertEqual(created[0].type, 'goal');
  assertEqual(created[1].type, 'awesomeDay');
});

test('diffCreatedMilestones: same (type, event) is unchanged even if value differs', () => {
  const prev = [{ type: 'pr', event: 'braemar-stone', value: 410 }];
  const next = [{ type: 'pr', event: 'braemar-stone', value: 420 }];
  assertEqual(diffCreatedMilestones(prev, next).length, 0);
});

test('diffCreatedMilestones: awesomeDay keyed by type alone', () => {
  const prev = [{ type: 'awesomeDay' }];
  const next = [{ type: 'awesomeDay' }];
  assertEqual(diffCreatedMilestones(prev, next).length, 0);
});

// --- Stage 4c: handleSubmit (edit) ---

function buildEditFormFixture(sessionDate, marks) {
  const form = document.createElement('form');
  form.id = 'session-form';
  const throwRows = Object.keys(marks).map((eventId) => {
    const slots = marks[eventId].map((inches, idx) => {
      const { feet, inches: rem } = inchesToFeetInches(inches);
      return `
        <div class="attempt" data-slot="${idx + 1}">
          <input data-field="feet" data-slot="${idx + 1}" value="${feet}" />
          <input data-field="inches" data-slot="${idx + 1}" value="${rem}" />
        </div>
      `;
    }).join('');
    return `
      <div class="item-row" data-category="throw" data-item-id="${eventId}" data-attempts="${marks[eventId].length}" data-measurement-type="distance">
        <div class="attempts">${slots}</div>
      </div>
    `;
  }).join('');
  form.innerHTML = `
    <input id="session-date" value="${sessionDate}" />
    <input id="session-location" value="" />
    <input id="session-games" value="" />
    <textarea id="throws-notes"></textarea>
    <textarea id="lifts-notes"></textarea>
    <button class="kind-btn active" data-kind="training"></button>
    <button class="kind-btn" data-kind="competition"></button>
    <button id="save-btn">Update Session</button>
    <div id="status"></div>
    <div id="edit-banner"><span id="edit-banner-date"></span></div>
    <button id="cancel-edit-btn"></button>
    <div id="throws-list">${throwRows}</div>
    <div id="lifts-list"></div>
    <ul id="sessions-list"></ul>
    <p id="sessions-empty"></p>
  `;
  document.body.appendChild(form);
  return form;
}

test('handleSubmit (edit): recomputes prs/prMeta to reflect updated marks', () => {
  localStorage.removeItem(STORAGE_KEY);
  const sessionId = 1234;
  saveData(stage4bData({
    prs: { 'braemar-stone': 410 },
    prMeta: { 'braemar-stone': { date: '2026-05-20', sessionId } },
    sessions: [{
      id: sessionId, date: '2026-05-20', location: '', games: '', kind: 'training',
      marks: { 'braemar-stone': [410] }, stoneWeights: {},
      milestones: [{ type: 'pr', event: 'braemar-stone', value: 410, previousValue: 0, class: '', tier: '' }],
    }],
  }));
  editingSessionId = sessionId;
  const form = buildEditFormFixture('2026-05-20', { 'braemar-stone': [480] });
  try {
    handleSubmit({ preventDefault: () => {} });
    const data = loadData();
    assertEqual(data.prs['braemar-stone'], 480, 'PR recomputed to new max');
    assertEqual(data.prMeta['braemar-stone'].sessionId, sessionId);
  } finally {
    form.remove();
    editingSessionId = null;
  }
});

test('handleSubmit (edit): re-derives edited session milestones[]', () => {
  localStorage.removeItem(STORAGE_KEY);
  const priorId = 1, editedId = 2;
  saveData(stage4bData({
    prs: { 'braemar-stone': 400 },
    prMeta: { 'braemar-stone': { date: '2026-05-01', sessionId: priorId } },
    goals: { 'braemar-stone': 410 },
    sessions: [
      { id: priorId, date: '2026-05-01', location: '', games: '', kind: 'training',
        marks: { 'braemar-stone': [400] }, stoneWeights: {}, milestones: [] },
      { id: editedId, date: '2026-05-22', location: '', games: '', kind: 'training',
        marks: { 'braemar-stone': [405] }, stoneWeights: {}, milestones: [] },
    ],
  }));
  editingSessionId = editedId;
  // Edit raises the edited session's mark to 420 → PR + Goal + AwesomeDay.
  const form = buildEditFormFixture('2026-05-22', { 'braemar-stone': [420] });
  try {
    handleSubmit({ preventDefault: () => {} });
    const data = loadData();
    const edited = data.sessions.find((s) => s.id === editedId);
    assertEqual(edited.milestones.length, 3, 'PR + Goal + AwesomeDay re-derived');
    assertEqual(edited.milestones[0].type, 'pr');
    assertEqual(edited.milestones[0].previousValue, 400, 'baseline is the prior session');
    assertEqual(edited.milestones[1].type, 'goal');
    assertEqual(edited.milestones[2].type, 'awesomeDay');
  } finally {
    form.remove();
    editingSessionId = null;
  }
});

test('handleSubmit (edit): other sessions milestones[] left frozen', () => {
  localStorage.removeItem(STORAGE_KEY);
  const otherId = 7, editedId = 8;
  const frozen = [
    { type: 'pr', event: 'braemar-stone', value: 405, previousValue: 0, class: '', tier: '' },
  ];
  saveData(stage4bData({
    prs: { 'braemar-stone': 405 },
    sessions: [
      { id: otherId, date: '2026-05-01', location: '', games: '', kind: 'training',
        marks: { 'braemar-stone': [405] }, stoneWeights: {}, milestones: frozen },
      { id: editedId, date: '2026-05-22', location: '', games: '', kind: 'training',
        marks: { 'braemar-stone': [400] }, stoneWeights: {}, milestones: [] },
    ],
  }));
  editingSessionId = editedId;
  const form = buildEditFormFixture('2026-05-22', { 'braemar-stone': [410] });
  try {
    handleSubmit({ preventDefault: () => {} });
    const data = loadData();
    const other = data.sessions.find((s) => s.id === otherId);
    assertDeepEqual(other.milestones, frozen, 'other session milestones unchanged');
  } finally {
    form.remove();
    editingSessionId = null;
  }
});

test('handleSubmit (edit): created milestone fires celebration queue', () => {
  localStorage.removeItem(STORAGE_KEY);
  const priorId = 1, editedId = 2;
  saveData(stage4bData({
    prs: { 'braemar-stone': 400 },
    prMeta: { 'braemar-stone': { date: '2026-05-01', sessionId: priorId } },
    sessions: [
      { id: priorId, date: '2026-05-01', kind: 'training', location: '', games: '',
        marks: { 'braemar-stone': [400] }, stoneWeights: {}, milestones: [] },
      { id: editedId, date: '2026-05-22', kind: 'training', location: '', games: '',
        marks: { 'braemar-stone': [405] }, stoneWeights: {}, milestones: [] },
    ],
  }));
  editingSessionId = editedId;
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  const form = buildEditFormFixture('2026-05-22', { 'braemar-stone': [420] });
  try {
    handleSubmit({ preventDefault: () => {} });
    const overlay = document.querySelector('.celebration-overlay');
    assertTrue(overlay, 'overlay shown after edit creates a milestone');
    assertTrue(overlay.querySelector('.celebration-card--pr'), 'starts with PR card');
  } finally {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
    form.remove();
    editingSessionId = null;
  }
});

test('handleSubmit (edit): removed milestones are silent (no overlay)', () => {
  localStorage.removeItem(STORAGE_KEY);
  const editedId = 1;
  saveData(stage4bData({
    prs: { 'braemar-stone': 420 },
    sessions: [{
      id: editedId, date: '2026-05-22', kind: 'training', location: '', games: '',
      marks: { 'braemar-stone': [420] }, stoneWeights: {},
      milestones: [{ type: 'pr', event: 'braemar-stone', value: 420, previousValue: 0, class: '', tier: '' }],
    }],
  }));
  editingSessionId = editedId;
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  // Edit drops the mark — milestone goes away (silent, no PR celebration).
  const form = buildEditFormFixture('2026-05-22', { 'braemar-stone': [400] });
  try {
    handleSubmit({ preventDefault: () => {} });
    assertEqual(document.querySelector('.celebration-overlay'), null, 'no overlay when only removed');
    const data = loadData();
    const edited = data.sessions.find((s) => s.id === editedId);
    assertDeepEqual(edited.milestones, [], 'edited session milestones recomputed empty');
  } finally {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
    form.remove();
    editingSessionId = null;
  }
});

// --- Stage 4c: handleDelete ---

function makeDeleteFixture() {
  let fx = document.getElementById('delete-fixture');
  if (fx) fx.remove();
  fx = document.createElement('div');
  fx.id = 'delete-fixture';
  fx.innerHTML = '<p id="status"></p><ul id="sessions-list"></ul><p id="sessions-empty"></p>';
  document.body.appendChild(fx);
  return fx;
}

test('handleDelete: recomputes prs after deleting PR-holder', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({
    prs: { 'braemar-stone': 420 },
    sessions: [
      { id: 1, date: '2026-05-01', kind: 'training', location: '', games: '',
        marks: { 'braemar-stone': [400] }, stoneWeights: {}, milestones: [] },
      { id: 2, date: '2026-05-10', kind: 'training', location: '', games: '',
        marks: { 'braemar-stone': [420] }, stoneWeights: {}, milestones: [] },
    ],
  }));
  const fixture = makeDeleteFixture();
  const origConfirm = window.confirm;
  window.confirm = () => true;
  try {
    handleDelete(2);
    const data = loadData();
    assertEqual(data.prs['braemar-stone'], 400, 'drops to next-best');
    assertEqual(data.prMeta['braemar-stone'].sessionId, 1);
  } finally {
    window.confirm = origConfirm;
    fixture.remove();
  }
});

test('handleDelete: clears prs/prMeta when last session for event is removed', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({
    prs: { 'braemar-stone': 400 },
    prMeta: { 'braemar-stone': { date: '2026-05-01', sessionId: 1 } },
    sessions: [{
      id: 1, date: '2026-05-01', kind: 'training', location: '', games: '',
      marks: { 'braemar-stone': [400] }, stoneWeights: {}, milestones: [],
    }],
  }));
  const fixture = makeDeleteFixture();
  const origConfirm = window.confirm;
  window.confirm = () => true;
  try {
    handleDelete(1);
    const data = loadData();
    assertEqual(data.prs['braemar-stone'], undefined);
    assertEqual(data.prMeta['braemar-stone'], undefined);
  } finally {
    window.confirm = origConfirm;
    fixture.remove();
  }
});

test('handleDelete: clears goalMeta when no remaining session meets goal', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: '2026-05-10T00:00:00.000Z', achievedInSessionId: 2 } },
    sessions: [
      { id: 1, date: '2026-05-01', kind: 'training', location: '', games: '',
        marks: { 'braemar-stone': [400] }, stoneWeights: {}, milestones: [] },
      { id: 2, date: '2026-05-10', kind: 'training', location: '', games: '',
        marks: { 'braemar-stone': [420] }, stoneWeights: {}, milestones: [] },
    ],
  }));
  const fixture = makeDeleteFixture();
  const origConfirm = window.confirm;
  window.confirm = () => true;
  try {
    handleDelete(2);
    const data = loadData();
    assertEqual(data.goalMeta['braemar-stone'], undefined, 'goalMeta cleared');
    assertEqual(data.goals['braemar-stone'], 410, 'active goal untouched');
  } finally {
    window.confirm = origConfirm;
    fixture.remove();
  }
});

// --- Stage 4c: chain prompt ---

test('showCelebrationQueue: chainPrompts shows prompt panel after Goal card', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({ goals: { 'braemar-stone': 410 } }));
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    milestones: [{ type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 }],
  };
  showCelebrationQueue(session, loadData(), { chainPrompts: true });
  try {
    let overlay = document.querySelector('.celebration-overlay');
    assertTrue(overlay.querySelector('.celebration-card--goal'), 'starts with Goal card');
    overlay.click();
    overlay = document.querySelector('.celebration-overlay');
    assertTrue(overlay.querySelector('.chain-prompt'), 'next view is the chain prompt');
    assertTrue(overlay.querySelector('.chain-prompt-save'), 'has Save goal button');
    assertTrue(overlay.querySelector('.chain-prompt-skip'), 'has Not now button');
  } finally {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  }
});

test('showCelebrationQueue: chain prompt Save updates goals[event] and recomputes', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: '2026-05-22T00:00:00.000Z', achievedInSessionId: 1 } },
    sessions: [{
      id: 1, date: '2026-05-22', kind: 'training', location: '', games: '',
      marks: { 'braemar-stone': [420] }, stoneWeights: {}, milestones: [],
    }],
  }));
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    milestones: [{ type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 }],
  };
  showCelebrationQueue(session, loadData(), { chainPrompts: true });
  try {
    document.querySelector('.celebration-overlay').click();
    const prompt = document.querySelector('.chain-prompt');
    assertTrue(prompt, 'prompt visible');
    // Fill in 500 inches as a fresh, unmet goal (no session beats it).
    prompt.querySelector('[data-field="chainFeet"]').value = '41';
    prompt.querySelector('[data-field="chainInches"]').value = '8';
    prompt.querySelector('.chain-prompt-save').click();
    const data = loadData();
    assertEqual(data.goals['braemar-stone'], 500, '41 ft 8 in = 500 in');
    assertEqual(data.goalMeta['braemar-stone'], undefined, 'fresh unmet goal clears goalMeta');
  } finally {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  }
});

test('showCelebrationQueue: chain prompt Not now skips without changing goals', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData({ goals: { 'braemar-stone': 410 } }));
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    milestones: [{ type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 }],
  };
  showCelebrationQueue(session, loadData(), { chainPrompts: true });
  try {
    document.querySelector('.celebration-overlay').click();
    const prompt = document.querySelector('.chain-prompt');
    assertTrue(prompt);
    prompt.querySelector('.chain-prompt-skip').click();
    const data = loadData();
    assertEqual(data.goals['braemar-stone'], 410, 'goal unchanged after Not now');
    assertEqual(document.querySelector('.celebration-overlay'), null, 'queue closes after last skip');
  } finally {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  }
});

test('showCelebrationQueue: replay (no chainPrompts) does not prompt after Goal card', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(stage4bData());
  document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  const session = {
    id: 1, date: '2026-05-22', games: '', location: '',
    milestones: [{ type: 'goal', event: 'braemar-stone', value: 420, goalValue: 410 }],
  };
  showCelebrationQueue(session, loadData());
  try {
    document.querySelector('.celebration-overlay').click();
    assertEqual(document.querySelector('.chain-prompt'), null, 'no prompt on replay');
    assertEqual(document.querySelector('.celebration-overlay'), null, 'queue closes after last card');
  } finally {
    document.querySelectorAll('.celebration-overlay').forEach((el) => { el.remove(); });
  }
});

// --- Stage 4c: Set-page achieved-goal callout ---

test('isGoalAchievedAndUnreplaced: true when goalMeta.value === goals[event]', () => {
  const data = stage4bData({
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: 'x', achievedInSessionId: 1 } },
  });
  assertTrue(isGoalAchievedAndUnreplaced(data, 'braemar-stone'));
});

test('isGoalAchievedAndUnreplaced: false when no goalMeta', () => {
  const data = stage4bData({ goals: { 'braemar-stone': 410 } });
  assertEqual(isGoalAchievedAndUnreplaced(data, 'braemar-stone'), false);
});

test('isGoalAchievedAndUnreplaced: false when goal value differs from goalMeta value', () => {
  const data = stage4bData({
    goals: { 'braemar-stone': 420 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: 'x', achievedInSessionId: 1 } },
  });
  assertEqual(isGoalAchievedAndUnreplaced(data, 'braemar-stone'), false);
});

test('buildThrowRow: renders goal-achieved callout when flag set', () => {
  const item = ITEMS.find((it) => it.id === 'braemar-stone');
  const row = buildThrowRow(item, 420, 410, null, true);
  assertTrue(row.querySelector('.slot-goal .goal-achieved-callout'), 'callout inside goal slot');
});

test('buildThrowRow: no callout when flag false', () => {
  const item = ITEMS.find((it) => it.id === 'braemar-stone');
  const row = buildThrowRow(item, 420, 410, null, false);
  assertEqual(row.querySelector('.goal-achieved-callout'), null);
});

test('buildLiftCard: renders goal-achieved callout for achieved lift goal', () => {
  const data = stage4bData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true }],
    goals: { sq: 225 },
    goalMeta: { sq: { value: 225, achievedAt: 'x', achievedInSessionId: 1 } },
  });
  const card = buildLiftCard(data.userLifts[0], data, false);
  assertTrue(card.querySelector('.goal-achieved-callout'), 'lift card shows callout');
});

test('buildLiftCard: no callout for new (unsaved) lift card even if data would match', () => {
  const data = stage4bData({
    userLifts: [{ id: 'sq', name: 'Squat', protocol: '1RM', unit: 'lb', active: true }],
    goals: { sq: 225 },
    goalMeta: { sq: { value: 225, achievedAt: 'x', achievedInSessionId: 1 } },
  });
  const card = buildLiftCard({ id: 'new-1', name: '', protocol: '', unit: 'lb', active: true }, data, true);
  assertEqual(card.querySelector('.goal-achieved-callout'), null);
});

// --- Stage 4c fix: Set-page save re-evaluates goalMeta ---

test('applyPrGoalSubmit: raising a goal clears stale goalMeta and leaves prs alone', () => {
  // Before: athlete had achieved a 410 goal in session 1, then manually
  // raises the goal to 420 via the Set page. The stale goalMeta would
  // otherwise suppress the next session's Goal card. Also: the Set page
  // is allowed to write prs directly, so the recompute must NOT overwrite
  // a hand-entered PR.
  const current = stage4bData({
    prs: { 'braemar-stone': 425 },
    prMeta: { 'braemar-stone': { date: '2026-05-22', sessionId: 1 } },
    goals: { 'braemar-stone': 410 },
    goalMeta: { 'braemar-stone': { value: 410, achievedAt: '2026-05-10T00:00:00.000Z', achievedInSessionId: 1 } },
    sessions: [{
      id: 1, date: '2026-05-10', kind: 'training', location: '', games: '',
      marks: { 'braemar-stone': [415] }, stoneWeights: {}, milestones: [],
    }],
  });
  // Updates from the form: PR raised manually to 500 (well above any
  // session mark), goal raised to 420 (no session meets it).
  const updates = {
    prs: { 'braemar-stone': 500 },
    prMeta: { 'braemar-stone': { date: '2026-05-22', sessionId: 1 } },
    goals: { 'braemar-stone': 420 },
    userLifts: [],
    sessions: current.sessions,
  };
  const next = applyPrGoalSubmit(current, updates);
  assertEqual(next.goalMeta['braemar-stone'], undefined, 'stale goalMeta cleared after goal raised');
  assertEqual(next.prs['braemar-stone'], 500, 'hand-entered PR preserved (not recomputed to session max)');
});

// --- Stage 5a: sessionsInWindow ---

test('sessionsInWindow: last => the single most recent session', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: {} },
    { id: 2, date: '2026-05-10', marks: {} },
    { id: 3, date: '2026-05-05', marks: {} },
  ];
  const r = sessionsInWindow(sessions, 'last', 2026);
  assertEqual(r.length, 1);
  assertEqual(r[0].id, 2, 'most recent by date');
});

test('sessionsInWindow: last => same-date tie breaks to the later save id', () => {
  const sessions = [
    { id: 1, date: '2026-05-10', marks: {} },
    { id: 2, date: '2026-05-10', marks: {} },
  ];
  assertEqual(sessionsInWindow(sessions, 'last', 2026)[0].id, 2, 'higher id is the later save');
});

test('sessionsInWindow: past3 => the three most recent, chronological', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: {} },
    { id: 2, date: '2026-05-05', marks: {} },
    { id: 3, date: '2026-05-10', marks: {} },
    { id: 4, date: '2026-05-15', marks: {} },
  ];
  const r = sessionsInWindow(sessions, 'past3', 2026);
  assertDeepEqual(r.map((s) => s.id), [2, 3, 4], 'drops the oldest, keeps newest three in order');
});

test('sessionsInWindow: past3 => fewer than three returns all of them', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: {} },
    { id: 2, date: '2026-05-05', marks: {} },
  ];
  assertEqual(sessionsInWindow(sessions, 'past3', 2026).length, 2);
});

test('sessionsInWindow: ytd => only sessions on or after Jan 1 of the year', () => {
  const sessions = [
    { id: 1, date: '2025-12-31', marks: {} },
    { id: 2, date: '2026-01-01', marks: {} },
    { id: 3, date: '2026-06-15', marks: {} },
  ];
  const r = sessionsInWindow(sessions, 'ytd', 2026);
  assertDeepEqual(r.map((s) => s.id), [2, 3], 'Jan 1 included, prior-year Dec 31 excluded');
});

test('sessionsInWindow: ytd => empty when every session predates the year', () => {
  const sessions = [{ id: 1, date: '2025-12-31', marks: {} }];
  assertEqual(sessionsInWindow(sessions, 'ytd', 2026).length, 0);
});

test('sessionsInWindow: unknown window id falls back to past3', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: {} },
    { id: 2, date: '2026-05-05', marks: {} },
    { id: 3, date: '2026-05-10', marks: {} },
    { id: 4, date: '2026-05-15', marks: {} },
  ];
  assertEqual(sessionsInWindow(sessions, 'bogus', 2026).length, 3);
});

test('sessionsInWindow: empty / non-array sessions => empty window', () => {
  assertDeepEqual(sessionsInWindow([], 'past3', 2026), []);
  assertDeepEqual(sessionsInWindow(null, 'last', 2026), []);
});

// --- Stage 5a: bestMarkInSessions ---

test('bestMarkInSessions: max across all attempts of all in-window sessions', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [400, 410] } },
    { id: 2, date: '2026-05-10', marks: { 'braemar-stone': [405, 415] } },
  ];
  const r = bestMarkInSessions(sessions, 'braemar-stone');
  assertEqual(r.value, 415);
  assertEqual(r.date, '2026-05-10', 'date of the session holding the best');
});

test('bestMarkInSessions: no marks for the event => null (empty-state trigger)', () => {
  const sessions = [{ id: 1, date: '2026-05-01', marks: { 'open-stone': [300] } }];
  assertEqual(bestMarkInSessions(sessions, 'braemar-stone'), null);
});

test('bestMarkInSessions: empty window => null', () => {
  assertEqual(bestMarkInSessions([], 'braemar-stone'), null);
});

test('bestMarkInSessions: ignores non-finite attempts', () => {
  const sessions = [{ id: 1, date: '2026-05-01', marks: { 'braemar-stone': [NaN, 380] } }];
  assertEqual(bestMarkInSessions(sessions, 'braemar-stone').value, 380);
});

test('bestMarkInSessions: tie keeps the earliest session date (matches prMeta)', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: { 'braemar-stone': [420] } },
    { id: 2, date: '2026-05-10', marks: { 'braemar-stone': [420] } },
  ];
  assertEqual(bestMarkInSessions(sessions, 'braemar-stone').date, '2026-05-01');
});

// --- Stage 5a: percentOfPr ---

test('percentOfPr: best over PR, rounded down', () => {
  assertEqual(percentOfPr(415, 440), 94); // 94.31% -> 94
});

test('percentOfPr: just below PR caps at 99, never rounds up to 100', () => {
  assertEqual(percentOfPr(439, 440), 99); // 99.77% -> 99, capped because best < PR
  assertEqual(percentOfPr(438, 440), 99); // 99.5% -> would round to 100, capped to 99
});

test('percentOfPr: equal to PR => 100', () => {
  assertEqual(percentOfPr(440, 440), 100); // a best at the PR displays 100
});

test('percentOfPr: above PR clamps to 100, never over', () => {
  // Reachable via migrated v1 data: a session mark can exceed a stale
  // baseline (Resolved decision 7). The raw ratio is 125%; clamp to 100.
  assertEqual(percentOfPr(500, 400), 100);
});

test('percentOfPr: no PR (null / zero) => null', () => {
  assertEqual(percentOfPr(400, null), null);
  assertEqual(percentOfPr(400, 0), null);
});

test('percentOfPr: an in-window subset of the PR never exceeds 100', () => {
  // The PR is the all-time max; any windowed best is <= PR.
  assertTrue(percentOfPr(440, 440) <= 100);
  assertTrue(percentOfPr(420, 440) <= 100);
});

// --- Stage 5b: direction-aware percentOfPr ---

test('percentOfPr: time direction flips the ratio (pr/best)', () => {
  // 5:00 PR (300s); a 5:30 (330s) effort is slower -> 300/330 = 90.9% -> 91.
  assertEqual(percentOfPr(330, 300, 'lower'), 91);
});

test('percentOfPr: time equal to PR => 100', () => {
  assertEqual(percentOfPr(300, 300, 'lower'), 100);
});

test('percentOfPr: time just slower than PR caps at 99', () => {
  assertEqual(percentOfPr(301, 300, 'lower'), 99); // 99.7% -> capped below PR
});

test('percentOfPr: time faster than PR clamps to 100', () => {
  // Reachable via migrated data — a mark faster than a stale PR.
  assertEqual(percentOfPr(290, 300, 'lower'), 100);
});

test('percentOfPr: both directions land <= 100', () => {
  assertTrue(percentOfPr(420, 440, 'higher') <= 100);
  assertTrue(percentOfPr(330, 300, 'lower') <= 100);
});

test('percentOfPr: higher direction unaffected by the time flip', () => {
  assertEqual(percentOfPr(415, 440, 'higher'), 94);
  assertEqual(percentOfPr(415, 440), 94); // default direction is higher
});

// --- Stage 5b: mostRecentLiftMark (Snapshot) ---

test('mostRecentLiftMark: latest dated session with a mark, best attempt', () => {
  const sessions = [
    { id: 1, date: '2026-03-01', marks: { sq: [100, 110] } },
    { id: 2, date: '2026-05-01', marks: { sq: [105, 120] } },
    { id: 3, date: '2026-05-10', marks: { bench: [80] } }, // no sq -> skipped
  ];
  const r = mostRecentLiftMark(sessions, 'sq', 'higher');
  assertEqual(r.value, 120);
  assertEqual(r.date, '2026-05-01', 'date of the latest session that has the lift');
});

test('mostRecentLiftMark: time lift picks the fastest (min) of the latest session', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: { mile: [360, 355] } },
    { id: 2, date: '2026-05-10', marks: { mile: [365, 370] } },
  ];
  const r = mostRecentLiftMark(sessions, 'mile', 'lower');
  assertEqual(r.value, 365, 'latest session min — not the faster earlier session');
  assertEqual(r.date, '2026-05-10');
});

test('mostRecentLiftMark: no marks for the lift => null', () => {
  assertEqual(mostRecentLiftMark([{ id: 1, date: '2026-05-01', marks: { bench: [80] } }], 'sq', 'higher'), null);
});

// --- Stage 5b: topSessionBestsInWindow (Best 3) ---

test('topSessionBestsInWindow: top 3 session-bests, best-first, one slot per session', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: { sq: [200, 210, 205] } }, // session-best 210 -> ONE slot
    { id: 2, date: '2026-05-05', marks: { sq: [180] } },
    { id: 3, date: '2026-05-10', marks: { sq: [195] } },
  ];
  const r = topSessionBestsInWindow(sessions, 'sq', 'higher', 365, '2026-05-24');
  assertDeepEqual(r.map((e) => e.value), [210, 195, 180], 'three different days, not three attempts of one');
});

test('topSessionBestsInWindow: only the last 365 days qualify (rolling)', () => {
  const sessions = [
    { id: 1, date: '2026-05-10', marks: { sq: [100] } },
    { id: 2, date: '2024-01-01', marks: { sq: [999] } }, // far outside the window
  ];
  const r = topSessionBestsInWindow(sessions, 'sq', 'higher', 365, '2026-05-24');
  assertDeepEqual(r.map((e) => e.value), [100], 'old big session excluded despite the bigger mark');
});

test('topSessionBestsInWindow: the 365-day boundary is inclusive, 366 is out', () => {
  const sessions = [
    { id: 1, date: isoDaysBefore('2026-05-24', 365), marks: { sq: [50] } },
    { id: 2, date: isoDaysBefore('2026-05-24', 366), marks: { sq: [999] } },
  ];
  const r = topSessionBestsInWindow(sessions, 'sq', 'higher', 365, '2026-05-24');
  assertDeepEqual(r.map((e) => e.value), [50], '365 days ago in, 366 out');
});

test('topSessionBestsInWindow: fewer than 3 sessions returns what exists', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: { sq: [100] } },
    { id: 2, date: '2026-05-10', marks: { sq: [110] } },
  ];
  assertEqual(topSessionBestsInWindow(sessions, 'sq', 'higher', 365, '2026-05-24').length, 2);
});

test('topSessionBestsInWindow: time direction ranks fastest first', () => {
  const sessions = [
    { id: 1, date: '2026-05-01', marks: { mile: [360] } },
    { id: 2, date: '2026-05-10', marks: { mile: [350] } },
    { id: 3, date: '2026-05-15', marks: { mile: [370] } },
  ];
  const r = topSessionBestsInWindow(sessions, 'mile', 'lower', 365, '2026-05-24');
  assertDeepEqual(r.map((e) => e.value), [350, 360, 370], 'min first for time');
});

test('topSessionBestsInWindow: no qualifying sessions => empty (empty-state trigger)', () => {
  assertDeepEqual(topSessionBestsInWindow([], 'sq', 'higher', 365, '2026-05-24'), []);
});

// --- Stage 5b: lifts view rendering ---

function liftsTestData(extra) {
  return stage4bData(Object.assign({
    userLifts: [
      { id: 'sq', name: 'Squat', protocol: '1RM', unit: 'kg', active: true },
      { id: 'old', name: 'Retired', protocol: '1RM', unit: 'kg', active: false },
    ],
    prs: { sq: 150 },
    sessions: [{ id: 1, date: '2026-05-10', marks: { sq: [140] } }],
  }, extra || {}));
}

test('renderLifts: only active lifts render', () => {
  const list = document.createElement('div');
  list.id = 'lifts-list';
  document.body.appendChild(list);
  try {
    currentMode = 'snapshot';
    renderLifts(liftsTestData());
    assertEqual(list.querySelectorAll('.gap-row').length, 1, 'one row — inactive lift excluded');
    assertMatch(list.textContent, /Squat/);
    assertTrue(!/Retired/.test(list.textContent), 'soft-deleted lift absent');
  } finally {
    list.remove();
  }
});

test('renderLifts: no active lifts shows the linked Set-page empty state', () => {
  const list = document.createElement('div');
  list.id = 'lifts-list';
  document.body.appendChild(list);
  try {
    renderLifts(stage4bData({ userLifts: [] }));
    assertMatch(list.textContent, /No S&C lifts yet/);
    const link = list.querySelector('a');
    assertTrue(link && /index\.html$/.test(link.getAttribute('href')), 'links to the Set page');
  } finally {
    list.remove();
  }
});

test('buildSnapshotRow: a lift with no marks reads "no marks logged"', () => {
  const row = buildSnapshotRow({ id: 'sq', name: 'Squat', unit: 'kg' }, 150, 'higher', []);
  assertMatch(row.textContent, /no marks logged/);
});

test('buildSnapshotRow: shows the most-recent mark, its date, PR, and percentage', () => {
  const sessions = [{ id: 1, date: '2026-05-10', marks: { sq: [140] } }];
  const row = buildSnapshotRow({ id: 'sq', name: 'Squat', unit: 'kg' }, 150, 'higher', sessions);
  assertMatch(row.textContent, /93%/);   // 140/150 = 93.3 -> 93
  assertMatch(row.textContent, /140 kg/);
  assertMatch(row.textContent, /150 kg/); // PR
});

test('buildBest3Row: empty window reads "no marks logged"; otherwise up to three entries', () => {
  const empty = buildBest3Row({ id: 'sq', name: 'Squat', unit: 'kg' }, 150, 'higher', []);
  assertMatch(empty.textContent, /no marks logged/);

  const t = todayISO();
  const sessions = [
    { id: 1, date: isoDaysBefore(t, 20), marks: { sq: [120] } },
    { id: 2, date: isoDaysBefore(t, 15), marks: { sq: [130] } },
    { id: 3, date: isoDaysBefore(t, 10), marks: { sq: [140] } },
    { id: 4, date: isoDaysBefore(t, 5), marks: { sq: [110] } },
  ];
  const row = buildBest3Row({ id: 'sq', name: 'Squat', unit: 'kg' }, 150, 'higher', sessions);
  assertEqual(row.querySelectorAll('.best3-entry').length, 3, 'capped at the top 3 session-bests');
});

test('Progress toggle: switching to Lifts swaps the view and the secondary control', () => {
  localStorage.removeItem(STORAGE_KEY);
  saveData(liftsTestData());
  const root = document.createElement('div');
  root.innerHTML = [
    '<p class="intro" id="intro">throws intro</p>',
    '<div class="filter-bar"><button data-side="throws" class="filter-btn active"></button>',
    '<button data-side="lifts" class="filter-btn"></button></div>',
    '<div class="filter-bar" id="window-filter"></div>',
    '<div class="filter-bar" id="lift-mode" hidden></div>',
    '<section class="group" id="throws-view"><div id="throws-list"></div></section>',
    '<section class="group" id="lifts-view" hidden><div id="lifts-list"></div></section>',
  ].join('');
  document.body.appendChild(root);
  try {
    currentMode = 'snapshot';
    setSide('lifts');
    assertEqual(document.getElementById('throws-view').hidden, true, 'throws view hidden');
    assertEqual(document.getElementById('lifts-view').hidden, false, 'lifts view shown');
    assertEqual(document.getElementById('window-filter').hidden, true, 'window filter hidden on lifts');
    assertEqual(document.getElementById('lift-mode').hidden, false, 'mode selector shown on lifts');
    assertTrue(root.querySelector('[data-side="lifts"]').classList.contains('active'), 'Lifts button active');

    setSide('throws');
    assertEqual(document.getElementById('throws-view').hidden, false, 'throws view back');
    assertEqual(document.getElementById('lift-mode').hidden, true, 'mode selector hidden on throws');
  } finally {
    root.remove();
    currentSide = 'throws';
    currentMode = 'snapshot';
  }
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
  summary.className = `test-summary ${failed === 0 ? 'all-passed' : 'has-failures'}`;
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

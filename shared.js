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

// One-time migration: early Comeback Tracker versions had no Highland Games
// field, so users put the Games title in the Location field on competition
// sessions. Now that there's a dedicated `games` field, move location → games
// for any pre-existing competition session that doesn't already have a games
// value. Training sessions are left untouched — their locations are real.
function migrateLegacyGamesLocation(data) {
  if (!data || !Array.isArray(data.sessions)) return false;
  let migrated = false;
  for (const session of data.sessions) {
    if (!session) continue;
    if (sessionKind(session) !== 'competition') continue;
    if (session.games) continue;
    if (!session.location) continue;
    session.games = session.location;
    session.location = '';
    migrated = true;
  }
  return migrated;
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const fresh = {
    version: 1,
    baselines: {},
    baselineMeta: {},
    stoneWeights: {},
    sessions: [],
  };
  if (!raw) return fresh;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.baselines) {
      return fresh;
    }
    if (!parsed.baselineMeta || typeof parsed.baselineMeta !== 'object') {
      parsed.baselineMeta = {};
    }
    if (!parsed.stoneWeights || typeof parsed.stoneWeights !== 'object') {
      parsed.stoneWeights = {};
    }
    if (!Array.isArray(parsed.sessions)) {
      parsed.sessions = [];
    }
    if (migrateLegacyGamesLocation(parsed)) {
      saveData(parsed);
    }
    return parsed;
  } catch {
    return fresh;
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

function readNumber(input) {
  if (!input || input.value === '' || input.value == null) return null;
  const n = Number(input.value);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
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

function formatSessionDate(iso) {
  if (!iso) return '';
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return iso;
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function sessionKind(session) {
  if (!session) return 'competition';
  return session.kind === 'training' ? 'training' : 'competition';
}

function bestSinceReturnDetails(data, itemId, filter) {
  if (!data || !Array.isArray(data.sessions)) return null;
  const requestedKind = filter === 'competition' || filter === 'training' ? filter : null;
  let bestValue = null;
  let bestSession = null;
  for (const session of data.sessions) {
    if (!session || !session.marks) continue;
    if (requestedKind && sessionKind(session) !== requestedKind) continue;
    const marks = session.marks[itemId];
    if (!Array.isArray(marks)) continue;
    for (const mark of marks) {
      if (Number.isFinite(mark)) {
        if (bestValue === null || mark > bestValue) {
          bestValue = mark;
          bestSession = session;
        }
      }
    }
  }
  if (bestValue === null) return null;
  return {
    value: bestValue,
    sessionId: bestSession.id,
    sessionDate: bestSession.date,
    sessionLocation: bestSession.location || null,
    sessionKind: sessionKind(bestSession),
  };
}

function bestSinceReturn(data, itemId, filter) {
  const details = bestSinceReturnDetails(data, itemId, filter);
  return details ? details.value : null;
}

function percentOfBaseline(best, baseline) {
  if (!Number.isFinite(best) || !Number.isFinite(baseline) || baseline === 0) {
    return null;
  }
  return (best / baseline) * 100;
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return '';
  if (Number.isInteger(n)) return String(n);
  return String(+n.toFixed(2));
}

function validateBackup(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    return 'File is not a valid object.';
  }
  if (parsed.appName !== 'comeback-tracker') {
    return 'Not a Comeback Tracker backup file.';
  }
  if (!parsed.data || typeof parsed.data !== 'object') {
    return 'Backup file is missing the data section.';
  }
  if (parsed.data.version !== 1) {
    return `Unsupported data version: ${parsed.data.version}.`;
  }
  if (!parsed.data.baselines || typeof parsed.data.baselines !== 'object' || Array.isArray(parsed.data.baselines)) {
    return 'Backup file is missing or has invalid baselines.';
  }
  if (parsed.data.baselineMeta !== undefined) {
    if (typeof parsed.data.baselineMeta !== 'object' || parsed.data.baselineMeta === null || Array.isArray(parsed.data.baselineMeta)) {
      return 'Backup baselineMeta is the wrong type.';
    }
  }
  if (parsed.data.stoneWeights !== undefined) {
    if (typeof parsed.data.stoneWeights !== 'object' || parsed.data.stoneWeights === null || Array.isArray(parsed.data.stoneWeights)) {
      return 'Backup stoneWeights is the wrong type.';
    }
  }
  if (parsed.data.sessions !== undefined && !Array.isArray(parsed.data.sessions)) {
    return 'Backup sessions is the wrong type (expected array).';
  }
  return null;
}

function formatMeasurement(value, measurementType) {
  if (!Number.isFinite(value) || value < 0) return '';
  if (measurementType === 'weight') {
    return `${formatNumber(value)} lb`;
  }
  const { feet, inches } = inchesToFeetInches(value);
  if (feet === '' && inches === '') return '';
  if (inches === 0) {
    return `${feet}'`;
  }
  return `${feet}' ${formatNumber(inches)}"`;
}

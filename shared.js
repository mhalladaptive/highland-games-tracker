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

const STORAGE_KEY = 'highland-games-tracker-v1';
const SCHEMA_VERSION = 2;

// Class / tier taxonomy used by the profile capture modal (and Stage 3+).
// Source: v2-plan.md "Class taxonomy" — Open, Masters, Adaptive, Other groups.
// Tiers vary by class; an empty tiers array means the tier dropdown should
// hide entirely when this class is selected.
const MASTERS_TIERS = [
  { id: 'm40', label: 'M40' },
  { id: 'm45', label: 'M45' },
  { id: 'm50', label: 'M50' },
  { id: 'm55', label: 'M55' },
  { id: 'm60', label: 'M60' },
  { id: 'm65', label: 'M65+' },
];

const ADAPTIVE_TIERS = [
  { id: 'open',       label: 'Open' },
  { id: 'masters-40', label: 'Masters 40+' },
  { id: 'senior-50',  label: 'Senior Master 50+' },
];

const PROFILE_CLASSES = [
  { id: 'pro',                 label: 'Pro',                            group: 'Open',     tiers: [] },
  { id: 'amateur-a',           label: 'Amateur A',                      group: 'Open',     tiers: [] },
  { id: 'amateur-b',           label: 'Amateur B',                      group: 'Open',     tiers: [] },
  { id: 'amateur-c',           label: 'Amateur C',                      group: 'Open',     tiers: [] },
  { id: 'amateur-unspecified', label: 'Amateur (unspecified)',          group: 'Open',     tiers: [] },
  { id: 'novice',              label: 'Novice',                         group: 'Open',     tiers: [] },
  { id: 'lightweight',         label: 'Lightweight',                    group: 'Open',     tiers: [] },
  { id: 'junior',              label: 'Junior',                         group: 'Open',     tiers: [] },
  { id: 'masters',             label: 'Masters',                        group: 'Masters',  tiers: MASTERS_TIERS },
  { id: 'lightweight-masters', label: 'Lightweight Masters',            group: 'Masters',  tiers: MASTERS_TIERS },
  { id: 'para-seated',         label: 'Para-Seated',                    group: 'Adaptive', tiers: ADAPTIVE_TIERS },
  { id: 'para-standing-upper', label: 'Para Standing Upper Limb Loss',  group: 'Adaptive', tiers: ADAPTIVE_TIERS },
  { id: 'para-standing-lower', label: 'Para Standing Lower Limb Loss',  group: 'Adaptive', tiers: ADAPTIVE_TIERS },
  { id: 'para-standing-neuro', label: 'Para Standing Neuro/Muscular',   group: 'Adaptive', tiers: ADAPTIVE_TIERS },
  { id: 'unspecified',         label: 'Not specified / training only',  group: 'Other',    tiers: [] },
];

const PROFILE_CLASS_GROUPS = ['Open', 'Masters', 'Adaptive', 'Other'];

function getProfileClass(classId) {
  if (!classId) return null;
  return PROFILE_CLASSES.find((c) => c.id === classId) || null;
}

// weightSchedule defaults to match gender for Male/Female athletes — per
// v2-plan.md "Profile". Non-binary and Prefer-not-to-say pick explicitly,
// so an empty value stays empty for them.
function defaultWeightScheduleForGender(gender) {
  if (gender === 'male') return 'mens';
  if (gender === 'female') return 'womens';
  return '';
}

function buildProfileFromFormValues(values) {
  const v = values || {};
  const gender = v.gender || 'unspecified';
  const weightSchedule = v.weightSchedule || defaultWeightScheduleForGender(gender);
  return {
    name: typeof v.name === 'string' ? v.name.trim() : '',
    gender,
    weightSchedule,
    class: v.class || '',
    tier: v.tier || '',
    setupCompletedAt: v.setupCompletedAt || new Date().toISOString(),
  };
}

// Unit system: 10 units across 4 categories (v2-plan.md "Unit system").
// direction is 'higher' for everything except time, which is 'lower'. In
// Stage 3a the field is stored but unused — Stage 4 milestone logic reads
// it. Conversion rules live in Stage 3b.
const UNIT_CATEGORIES = ['weight', 'distance', 'time', 'count'];

const UNIT_CATEGORY_LABELS = {
  weight: 'Weight',
  distance: 'Distance',
  time: 'Time',
  count: 'Count',
};

// toBase is the multiplier to convert one of this unit to the category base
// (Weight: kg; Distance: m). Used by convertValue for same-category
// conversions. Time and Count units have no toBase — they do not convert.
const UNITS = [
  { id: 'lb',     label: 'lb',     category: 'weight',   direction: 'higher', toBase: 0.45359237 },
  { id: 'kg',     label: 'kg',     category: 'weight',   direction: 'higher', toBase: 1          },
  { id: 'mi',     label: 'mi',     category: 'distance', direction: 'higher', toBase: 1609.344   },
  { id: 'K',      label: 'K',      category: 'distance', direction: 'higher', toBase: 1000       },
  { id: 'm',      label: 'm',      category: 'distance', direction: 'higher', toBase: 1          },
  { id: 'yd',     label: 'yd',     category: 'distance', direction: 'higher', toBase: 0.9144     },
  { id: 'time',   label: 'time',   category: 'time',     direction: 'lower'  },
  { id: 'reps',   label: 'reps',   category: 'count',    direction: 'higher' },
  { id: 'rounds', label: 'rounds', category: 'count',    direction: 'higher' },
  { id: 'cal',    label: 'cal',    category: 'count',    direction: 'higher' },
];

function getUnit(unitId) {
  if (!unitId) return null;
  return UNITS.find((u) => u.id === unitId) || null;
}

// Convert a numeric value between two units in the same Weight or Distance
// category, rounded to one decimal place. Returns null on bad input (unknown
// unit, cross-category, Time/Count units, non-finite value) — never silently
// returns a wrong number.
function convertValue(value, fromUnitId, toUnitId) {
  if (!Number.isFinite(value)) return null;
  const from = getUnit(fromUnitId);
  const to = getUnit(toUnitId);
  if (!from || !to) return null;
  if (from.category !== to.category) return null;
  if (from.category !== 'weight' && from.category !== 'distance') return null;
  if (!Number.isFinite(from.toBase) || !Number.isFinite(to.toBase) || to.toBase === 0) return null;
  const result = (value * from.toBase) / to.toBase;
  return Math.round(result * 10) / 10;
}

// A lift "has marks" if a PR is set, a Goal is set, or any session contains
// at least one finite mark for that lift's id. Used by the unit-lock rule
// in Stage 3a and the conversion engine in Stage 3b.
function liftHasMarks(data, liftId) {
  if (!data || !liftId) return false;
  if (data.prs && Number.isFinite(data.prs[liftId])) return true;
  if (data.goals && Number.isFinite(data.goals[liftId])) return true;
  if (Array.isArray(data.sessions)) {
    for (const session of data.sessions) {
      if (!session || !session.marks) continue;
      const marks = session.marks[liftId];
      if (Array.isArray(marks) && marks.some((m) => Number.isFinite(m))) {
        return true;
      }
    }
  }
  return false;
}

// Apply a snapshot of the Set page's form state to the stored data, returning
// the next-state slices (prs, prMeta, goals, userLifts). Pure logic — no DOM,
// no localStorage — so app.js can keep the DOM-reading thin and the rules
// stay easy to test.
//
//   throwSnapshots: [{ id, prValue, goalValue, prDate, prLocation }]
//   liftCardSnapshots: [{ id, status: 'new'|'saved', name, protocol, unit,
//                         prValue, goalValue }]
//   options.idGenerator: returns a fresh id for 'new' lifts (defaults to
//                        crypto.randomUUID when available, otherwise a random
//                        fallback). Injectable for deterministic tests.
//
// A 'saved' lift that doesn't appear in liftCardSnapshots is treated as
// soft-deleted: active becomes false, but its userLifts entry, prs/goals,
// and any session marks for its id stay in storage so historical data is
// not destroyed.
function applyFormSnapshotsToData(currentData, throwSnapshots, liftCardSnapshots, options) {
  const opts = options || {};
  const idGenerator = opts.idGenerator || (() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'lift-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
  });

  const prs = Object.assign({}, currentData && currentData.prs);
  const prMeta = Object.assign({}, currentData && currentData.prMeta);
  const goals = Object.assign({}, currentData && currentData.goals);
  const userLifts = ((currentData && currentData.userLifts) || []).map((l) => Object.assign({}, l));

  for (const t of throwSnapshots || []) {
    if (!t || !t.id) continue;
    if (Number.isFinite(t.prValue)) prs[t.id] = t.prValue;
    else delete prs[t.id];
    if (Number.isFinite(t.goalValue)) goals[t.id] = t.goalValue;
    else delete goals[t.id];
    const date = (t.prDate || '').trim();
    const location = (t.prLocation || '').trim();
    if (date || location) {
      const meta = {};
      if (date) meta.date = date;
      if (location) meta.location = location;
      prMeta[t.id] = meta;
    } else {
      delete prMeta[t.id];
    }
  }

  const presentLiftIds = new Set();
  for (const c of liftCardSnapshots || []) {
    if (!c) continue;
    let id = c.id;
    if (c.status === 'new' || !id) id = idGenerator();
    presentLiftIds.add(id);
    const name = (c.name || '').trim();
    const protocol = (c.protocol || '').trim();
    const unit = c.unit || 'lb';
    let lift = userLifts.find((l) => l.id === id);
    if (lift) {
      lift.name = name;
      lift.protocol = protocol;
      lift.unit = unit;
      lift.active = true;
    } else {
      userLifts.push({ id, name, protocol, unit, active: true });
    }
    if (Number.isFinite(c.prValue)) prs[id] = c.prValue;
    else delete prs[id];
    if (Number.isFinite(c.goalValue)) goals[id] = c.goalValue;
    else delete goals[id];
  }
  for (const l of userLifts) {
    if (l.active && !presentLiftIds.has(l.id)) l.active = false;
  }

  return { prs, prMeta, goals, userLifts };
}

// Parse "mm:ss" or "h:mm:ss" into seconds. Returns null on bad input.
function parseTimeToSeconds(str) {
  if (typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  if (parts.length === 2) return nums[0] * 60 + nums[1];
  return nums[0] * 3600 + nums[1] * 60 + nums[2];
}

// Format a non-negative number of seconds as "mm:ss" (under an hour) or
// "h:mm:ss" (one hour and up). Returns '' on bad input.
function formatSecondsAsTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total - h * 3600) / 60);
  const s = total - h * 3600 - m * 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

function freshData() {
  return {
    version: SCHEMA_VERSION,
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

// Build v2 userLifts entries from v1 hard-coded lift items that carry a
// baseline value. Names/protocols come from ITEMS; v1 ids are preserved so
// existing session marks still resolve. Lifts without a baseline and all
// throws are skipped.
function buildUserLiftsFromV1(v1Prs) {
  const out = [];
  if (!v1Prs || typeof v1Prs !== 'object') return out;
  for (const item of ITEMS) {
    if (item.category !== 'lift') continue;
    const value = v1Prs[item.id];
    if (!Number.isFinite(value)) continue;
    out.push({
      id: item.id,
      name: item.name,
      protocol: item.protocol || '',
      unit: 'lb',
      active: true,
    });
  }
  return out;
}

// v1 -> v2 storage schema migration. Idempotent — short-circuits on
// data.version === 2. Returns true when it mutated the data so callers
// (loadData, importData) can persist.
function migrateSchemaV1toV2(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.version === SCHEMA_VERSION) return false;
  data.prs = data.baselines && typeof data.baselines === 'object' && !Array.isArray(data.baselines)
    ? data.baselines
    : {};
  data.prMeta = data.baselineMeta && typeof data.baselineMeta === 'object' && !Array.isArray(data.baselineMeta)
    ? data.baselineMeta
    : {};
  delete data.baselines;
  delete data.baselineMeta;
  if (!data.goals || typeof data.goals !== 'object' || Array.isArray(data.goals)) data.goals = {};
  if (!data.goalMeta || typeof data.goalMeta !== 'object' || Array.isArray(data.goalMeta)) data.goalMeta = {};
  if (!Array.isArray(data.userLifts)) data.userLifts = buildUserLiftsFromV1(data.prs);
  if (!data.profile || typeof data.profile !== 'object' || Array.isArray(data.profile)) data.profile = {};
  data.version = SCHEMA_VERSION;
  return true;
}

// Legacy migration carried over from the v1 fork: the original app had no
// dedicated Highland Games field, so competition sessions stored the Games
// title in the location field. Move location → games for any competition
// session that has a location but no games value. Training sessions are
// left untouched — their locations are real. Idempotent. In v2 native
// localStorage this is a no-op; it runs on data imported from v1 backups.
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
  if (!raw) return freshData();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return freshData();
    const isV2Shape = parsed.prs && typeof parsed.prs === 'object' && !Array.isArray(parsed.prs);
    const isV1Shape = parsed.baselines && typeof parsed.baselines === 'object' && !Array.isArray(parsed.baselines);
    if (!isV2Shape && !isV1Shape) return freshData();
    let mutated = false;
    if (migrateSchemaV1toV2(parsed)) mutated = true;
    if (!parsed.prMeta || typeof parsed.prMeta !== 'object') parsed.prMeta = {};
    if (!parsed.goals || typeof parsed.goals !== 'object') parsed.goals = {};
    if (!parsed.goalMeta || typeof parsed.goalMeta !== 'object') parsed.goalMeta = {};
    if (!parsed.stoneWeights || typeof parsed.stoneWeights !== 'object') parsed.stoneWeights = {};
    if (!Array.isArray(parsed.userLifts)) parsed.userLifts = [];
    if (!parsed.profile || typeof parsed.profile !== 'object' || Array.isArray(parsed.profile)) parsed.profile = {};
    if (!Array.isArray(parsed.sessions)) parsed.sessions = [];
    if (migrateLegacyGamesLocation(parsed)) mutated = true;
    if (mutated) saveData(parsed);
    return parsed;
  } catch {
    return freshData();
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
  if (parsed.appName !== 'highland-games-tracker' && parsed.appName !== 'comeback-tracker') {
    return 'Not a Highland Games Tracker backup file.';
  }
  if (!parsed.data || typeof parsed.data !== 'object') {
    return 'Backup file is missing the data section.';
  }
  if (parsed.data.version !== 1 && parsed.data.version !== 2) {
    return `Unsupported data version: ${parsed.data.version}.`;
  }
  if (parsed.data.version === 1) {
    if (!parsed.data.baselines || typeof parsed.data.baselines !== 'object' || Array.isArray(parsed.data.baselines)) {
      return 'Backup file is missing or has invalid baselines.';
    }
    if (parsed.data.baselineMeta !== undefined) {
      if (typeof parsed.data.baselineMeta !== 'object' || parsed.data.baselineMeta === null || Array.isArray(parsed.data.baselineMeta)) {
        return 'Backup baselineMeta is the wrong type.';
      }
    }
  } else {
    if (!parsed.data.prs || typeof parsed.data.prs !== 'object' || Array.isArray(parsed.data.prs)) {
      return 'Backup file is missing or has invalid prs.';
    }
    if (parsed.data.prMeta !== undefined) {
      if (typeof parsed.data.prMeta !== 'object' || parsed.data.prMeta === null || Array.isArray(parsed.data.prMeta)) {
        return 'Backup prMeta is the wrong type.';
      }
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

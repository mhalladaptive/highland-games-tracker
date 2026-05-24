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
// the next-state slices (prs, prMeta, goals, userLifts, sessions). Pure logic
// — no DOM, no localStorage — so app.js can keep the DOM-reading thin and
// the rules stay easy to test.
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
//
// When a saved lift's unit changes within Weight or Distance, every one of
// that lift's historical session marks is converted via convertValue (Stage
// 3b). The submitted PR/Goal arrive already converted from the live
// re-rendered inputs and are written as-is. Unchanged-unit saves leave
// session marks byte-identical; throw marks and other lifts' marks are
// never touched.
function applyFormSnapshotsToData(currentData, throwSnapshots, liftCardSnapshots, options) {
  const opts = options || {};
  const idGenerator = opts.idGenerator || (() => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `lift-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  });

  const prs = Object.assign({}, currentData && currentData.prs);
  const prMeta = Object.assign({}, currentData && currentData.prMeta);
  const goals = Object.assign({}, currentData && currentData.goals);
  const userLifts = ((currentData && currentData.userLifts) || []).map((l) => Object.assign({}, l));
  const sessions = ((currentData && currentData.sessions) || []).map((s) => {
    const copy = Object.assign({}, s);
    copy.marks = Object.assign({}, s && s.marks);
    return copy;
  });

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
    const lift = userLifts.find((l) => l.id === id);
    if (lift && lift.unit && lift.unit !== unit) {
      const fromCat = (getUnit(lift.unit) || {}).category;
      const toCat = (getUnit(unit) || {}).category;
      if (fromCat === toCat && (fromCat === 'weight' || fromCat === 'distance')) {
        for (const session of sessions) {
          if (!session || !session.marks) continue;
          const marks = session.marks[id];
          if (!Array.isArray(marks)) continue;
          session.marks[id] = marks.map((m) => {
            if (!Number.isFinite(m)) return m;
            const converted = convertValue(m, lift.unit, unit);
            return converted == null ? m : converted;
          });
        }
      }
    }
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

  return { prs, prMeta, goals, userLifts, sessions };
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

// Format a numeric lift mark by the lift's unit. Time marks are stored as
// seconds and render as mm:ss / h:mm:ss; every other unit renders as the
// numeric value followed by the unit label ("102.5 kg", "12 reps"). Pure —
// no DOM. Returns '' on bad input or unknown unit.
function formatLiftMark(value, unitId) {
  if (!Number.isFinite(value) || value < 0) return '';
  const unit = getUnit(unitId);
  if (!unit) return '';
  if (unit.category === 'time') return formatSecondsAsTime(value);
  return `${formatNumber(value)} ${unit.label}`;
}

// Direction-of-better for an event id. Throws (in ITEMS) are always 'higher'.
// User-defined lifts take direction from their unit ('higher' for everything
// except 'time', which is 'lower'). Unknown events default to 'higher'.
function eventDirection(eventId, data) {
  if (!eventId) return 'higher';
  const throwItem = ITEMS.find((it) => it.id === eventId && it.category === 'throw');
  if (throwItem) return 'higher';
  const lifts = (data && Array.isArray(data.userLifts)) ? data.userLifts : [];
  const lift = lifts.find((l) => l && l.id === eventId);
  if (lift) {
    const unit = getUnit(lift.unit);
    if (unit && unit.direction === 'lower') return 'lower';
  }
  return 'higher';
}

// Best mark in a list of attempts under the given direction. Returns null if
// the list has no finite attempts. Pure — no data lookups.
function eventBest(attempts, direction) {
  if (!Array.isArray(attempts)) return null;
  let best = null;
  const lower = direction === 'lower';
  for (const m of attempts) {
    if (!Number.isFinite(m)) continue;
    if (best === null) { best = m; continue; }
    if (lower ? m < best : m > best) best = m;
  }
  return best;
}

// Render-friendly display name for an event id (throw item name, or user lift
// name — including inactive lifts so old session marks still resolve).
// Returns '' if the id is unknown.
function eventDisplayName(eventId, data) {
  if (!eventId) return '';
  const throwItem = ITEMS.find((it) => it.id === eventId && it.category === 'throw');
  if (throwItem) return throwItem.name;
  const lifts = (data && Array.isArray(data.userLifts)) ? data.userLifts : [];
  const lift = lifts.find((l) => l && l.id === eventId);
  if (lift) return lift.name || '';
  return '';
}

// Format an event's mark value using the event's unit. Throws (measurementType
// 'distance' / 'height') render as feet-inches; lifts render per their unit.
// Pure — used by celebration cards.
function formatEventValue(eventId, value, data) {
  if (!Number.isFinite(value)) return '';
  const throwItem = ITEMS.find((it) => it.id === eventId && it.category === 'throw');
  if (throwItem) return formatMeasurement(value, throwItem.measurementType);
  const lifts = (data && Array.isArray(data.userLifts)) ? data.userLifts : [];
  const lift = lifts.find((l) => l && l.id === eventId);
  if (lift) return formatLiftMark(value, lift.unit);
  return formatNumber(value);
}

// Events whose `prs[event]` should update for this session — either silent
// first marks (no existing PR) or PR breaks (best beats current per
// direction). Pure: reads `data.prs` and the session's marks; writes nothing.
// The caller applies both the prs and prMeta updates.
function sessionPrUpdates(session, data) {
  const updates = {};
  if (!session || !session.marks || typeof session.marks !== 'object') return updates;
  const prs = (data && data.prs && typeof data.prs === 'object') ? data.prs : {};
  for (const eventId of Object.keys(session.marks)) {
    const direction = eventDirection(eventId, data);
    const best = eventBest(session.marks[eventId], direction);
    if (best === null) continue;
    const current = prs[eventId];
    if (!Number.isFinite(current)) {
      updates[eventId] = best;
      continue;
    }
    const beats = direction === 'lower' ? best < current : best > current;
    if (beats) updates[eventId] = best;
  }
  return updates;
}

// Build a prMeta entry from a session — date / sessionId always present,
// location and gamesTitle only when non-empty. Shared by the 4b new-session
// save path and the 4c recompute path.
function buildPrMetaFromSession(session) {
  const meta = { date: session.date, sessionId: session.id };
  if (session.location) meta.location = session.location;
  if (session.games) meta.gamesTitle = session.games;
  return meta;
}

// Sort sessions in chronological order (date ascending, then save order by
// id) — the tie-break used by prMeta and goalMeta recompute.
function sessionsByChronology(sessions) {
  return [...sessions].sort((a, b) => {
    const ad = (a && a.date) || '';
    const bd = (b && b.date) || '';
    if (ad !== bd) return ad.localeCompare(bd);
    const ai = (a && Number.isFinite(a.id)) ? a.id : 0;
    const bi = (b && Number.isFinite(b.id)) ? b.id : 0;
    return ai - bi;
  });
}

// Stage 4c — rebuild prs / prMeta / goalMeta from all sessions. Pure: reads
// data.sessions, data.goals, data.userLifts; returns the rebuilt slices and
// never mutates the input.
//
// Rules:
//   prs[event]    — best mark across all sessions for that event using the
//                   unit's direction (max for higher-is-better, min for time).
//                   If no session has a finite mark for an event, the event
//                   is absent from prs.
//   prMeta[event] — buildPrMetaFromSession of whichever session holds that
//                   best mark; ties go to the earliest session (date, then
//                   save order).
//   goalMeta[event] — for each event with a finite goals[event], scan
//                   sessions in chronological order; the first session whose
//                   best meets-or-beats the goal sets achievedInSessionId and
//                   achievedAt. If no session meets the goal, the event is
//                   absent from goalMeta.
//   goals         — never touched. The active goal is the athlete's, not a
//                   derived value.
//
// achievedAt: when the recomputed achiever and value match the previous
// goalMeta entry, the original timestamp is preserved so an unrelated edit
// does not silently rewrite history; otherwise it falls back to the session's
// date at midnight UTC (the closest we can reconstruct for a session we did
// not capture a wall-clock for).
function recomputeDerivedState(data) {
  const sessions = (data && Array.isArray(data.sessions)) ? data.sessions : [];
  const goals = (data && data.goals && typeof data.goals === 'object') ? data.goals : {};
  const prevGoalMeta = (data && data.goalMeta && typeof data.goalMeta === 'object') ? data.goalMeta : {};
  const sorted = sessionsByChronology(sessions);

  const eventBests = {};
  for (const session of sorted) {
    if (!session || !session.marks || typeof session.marks !== 'object') continue;
    for (const eventId of Object.keys(session.marks)) {
      const direction = eventDirection(eventId, data);
      const best = eventBest(session.marks[eventId], direction);
      if (best === null) continue;
      const existing = eventBests[eventId];
      if (!existing) {
        eventBests[eventId] = { value: best, session };
        continue;
      }
      const beats = direction === 'lower' ? best < existing.value : best > existing.value;
      if (beats) eventBests[eventId] = { value: best, session };
      // Equal best: keep the earlier session (sorted order means existing is earlier).
    }
  }

  const prs = {};
  const prMeta = {};
  for (const eventId of Object.keys(eventBests)) {
    const { value, session } = eventBests[eventId];
    prs[eventId] = value;
    prMeta[eventId] = buildPrMetaFromSession(session);
  }

  const goalMeta = {};
  for (const eventId of Object.keys(goals)) {
    const goalValue = goals[eventId];
    if (!Number.isFinite(goalValue)) continue;
    const direction = eventDirection(eventId, data);
    for (const session of sorted) {
      if (!session || !session.marks) continue;
      const best = eventBest(session.marks[eventId], direction);
      if (best === null) continue;
      const meets = direction === 'lower' ? best <= goalValue : best >= goalValue;
      if (!meets) continue;
      const prev = prevGoalMeta[eventId];
      const samePrev = prev && prev.achievedInSessionId === session.id && prev.value === goalValue;
      const achievedAt = (samePrev && typeof prev.achievedAt === 'string')
        ? prev.achievedAt
        : `${session.date}T00:00:00.000Z`;
      goalMeta[eventId] = {
        value: goalValue,
        achievedAt,
        achievedInSessionId: session.id,
      };
      break;
    }
  }

  return { prs, prMeta, goalMeta };
}

// Stage 4c — re-derive an edited session's milestones[] using the 4b
// detection rule, but against the baseline as of immediately BEFORE that
// session (best across chronologically-prior sessions, goalMeta from prior
// achievers only). The result is what the celebration system would have
// shown if this session were being saved fresh on top of the rest of
// history. Pure: returns the milestones array; the caller persists it and
// diffs against the old list.
function redetectMilestonesForEditedSession(editedSession, data) {
  if (!editedSession) return [];
  const sessions = (data && Array.isArray(data.sessions)) ? data.sessions : [];
  const priorSessions = sessions.filter((s) => {
    if (!s) return false;
    if (s.id === editedSession.id) return false;
    const sd = s.date || '';
    const ed = editedSession.date || '';
    if (sd !== ed) return sd < ed;
    const si = Number.isFinite(s.id) ? s.id : 0;
    const ei = Number.isFinite(editedSession.id) ? editedSession.id : 0;
    return si < ei;
  });
  const baselineSlices = recomputeDerivedState(Object.assign({}, data, { sessions: priorSessions }));
  const baselineData = Object.assign({}, data, {
    prs: baselineSlices.prs,
    prMeta: baselineSlices.prMeta,
    goalMeta: baselineSlices.goalMeta,
  });
  return detectMilestones(editedSession, baselineData);
}

// Stage 4c — milestone diff for the edited-session recompute. Two milestones
// are the same when their (type, event) match; awesomeDay is keyed by type
// alone. Returns the list of milestones present in `next` but not in `prev`
// — these are the ones whose celebration cards fire. Removed milestones are
// silent and surfaced separately (callers who care can compute them via the
// same equivalence, but Stage 4c does not need them).
function milestoneKey(m) {
  if (!m || !m.type) return '';
  if (m.type === 'awesomeDay') return 'awesomeDay';
  return `${m.type}:${m.event}`;
}

function diffCreatedMilestones(prev, next) {
  const seen = new Set((Array.isArray(prev) ? prev : []).map(milestoneKey));
  return (Array.isArray(next) ? next : []).filter((m) => !seen.has(milestoneKey(m)));
}

// Detect celebration milestones for a session. Pure — reads `data.prs`,
// `data.goals`, `data.goalMeta`, `data.userLifts`, `data.profile`; returns the
// milestones array. The caller persists the result on `session.milestones[]`
// and applies the prs / prMeta / goalMeta updates separately.
//
// Order: PR milestones first (in throw-then-lift event order), then Goal
// milestones (same order), then an `awesomeDay` capstone when total PR + Goal
// milestones >= 2.
//
// Rules:
//   PR     — fires only when an existing prs[event] is beaten per direction.
//            A first-ever mark sets prs silently (handled by the caller via
//            sessionPrUpdates) and produces no milestone.
//   Goal   — fires when goals[event] is set, best meets-or-beats per
//            direction, and goalMeta[event] is absent. Independent of PR.
//   Class/tier on PR milestones — snapshotted from data.profile; empty
//            strings when the profile has not set them.
function detectMilestones(session, data) {
  if (!session || !session.marks || typeof session.marks !== 'object') return [];
  const prs = (data && data.prs && typeof data.prs === 'object') ? data.prs : {};
  const goals = (data && data.goals && typeof data.goals === 'object') ? data.goals : {};
  const goalMeta = (data && data.goalMeta && typeof data.goalMeta === 'object') ? data.goalMeta : {};
  const profile = (data && data.profile && typeof data.profile === 'object') ? data.profile : {};
  const userLifts = (data && Array.isArray(data.userLifts)) ? data.userLifts : [];

  const orderedEvents = [];
  for (const item of ITEMS) {
    if (item.category !== 'throw') continue;
    if (session.marks[item.id]) orderedEvents.push(item.id);
  }
  for (const lift of userLifts) {
    if (!lift || !lift.id) continue;
    if (session.marks[lift.id] && orderedEvents.indexOf(lift.id) === -1) {
      orderedEvents.push(lift.id);
    }
  }
  for (const eventId of Object.keys(session.marks)) {
    if (orderedEvents.indexOf(eventId) === -1) orderedEvents.push(eventId);
  }

  const prMilestones = [];
  const goalMilestones = [];

  for (const eventId of orderedEvents) {
    const direction = eventDirection(eventId, data);
    const best = eventBest(session.marks[eventId], direction);
    if (best === null) continue;

    const currentPr = prs[eventId];
    if (Number.isFinite(currentPr)) {
      const beats = direction === 'lower' ? best < currentPr : best > currentPr;
      if (beats) {
        prMilestones.push({
          type: 'pr',
          event: eventId,
          value: best,
          previousValue: currentPr,
          class: profile.class || '',
          tier: profile.tier || '',
        });
      }
    }

    const goalValue = goals[eventId];
    if (Number.isFinite(goalValue)) {
      const meets = direction === 'lower' ? best <= goalValue : best >= goalValue;
      const alreadyAchieved = goalMeta[eventId] != null;
      if (meets && !alreadyAchieved) {
        goalMilestones.push({
          type: 'goal',
          event: eventId,
          value: best,
          goalValue,
        });
      }
    }
  }

  const milestones = prMilestones.concat(goalMilestones);
  if (milestones.length >= 2) milestones.push({ type: 'awesomeDay' });
  return milestones;
}

// Stage 5a — the three Progress-page session windows. Pure: takes the
// sessions array, a window id, and a reference year; returns the subset of
// sessions in that window. Sessions are ordered chronologically (date, then
// save order by id), the same tie-break prMeta uses.
//   'last'  — the single most recent session.
//   'past3' — the three most recent (fewer if fewer exist).
//   'ytd'   — every session dated on or after January 1 of `year` (defaults
//             to the current calendar year). ISO date strings compare
//             lexicographically, so the >= cutoff is exact.
// Unknown window ids fall back to 'past3'.
function sessionsInWindow(sessions, windowId, year) {
  const chrono = sessionsByChronology(Array.isArray(sessions) ? sessions : []);
  if (windowId === 'last') return chrono.slice(-1);
  if (windowId === 'ytd') {
    const y = Number.isFinite(year) ? year : new Date().getFullYear();
    const cutoff = `${y}-01-01`;
    return chrono.filter((s) => s && typeof s.date === 'string' && s.date >= cutoff);
  }
  return chrono.slice(-3);
}

// Stage 5a — best mark for an event across a set of (already windowed)
// sessions, with the date of the session that holds it. Throws are all
// higher-is-better, so this is the max across every attempt of every session.
// Returns { value, date } or null when no session has a finite mark for the
// event. Pure — no data lookups. Pass sessions chronologically (as
// sessionsInWindow returns them) and ties resolve to the earliest holder,
// matching the prMeta tie-break.
function bestMarkInSessions(sessions, eventId) {
  const list = Array.isArray(sessions) ? sessions : [];
  let best = null;
  let bestDate = null;
  for (const session of list) {
    if (!session || !session.marks) continue;
    const marks = session.marks[eventId];
    if (!Array.isArray(marks)) continue;
    for (const mark of marks) {
      if (!Number.isFinite(mark)) continue;
      if (best === null || mark > best) {
        best = mark;
        bestDate = session.date || null;
      }
    }
  }
  if (best === null) return null;
  return { value: best, date: bestDate };
}

// Stage 5a — the Progress page's percentage-of-PR: the best-in-window mark
// over the PR, as a rounded integer. Pure. Reuses percentOfBaseline for the
// raw ratio and returns null when there is no comparison to make (no PR set,
// or no in-window mark). Because the PR is the all-time max and the window is
// a subset of sessions, a real best-in-window is <= PR, so this is <= 100.
function percentOfPr(best, pr) {
  const pct = percentOfBaseline(best, pr);
  if (pct === null) return null;
  return Math.round(pct);
}

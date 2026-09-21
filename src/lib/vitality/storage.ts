import type { Attribute } from "@/types/attributes";
import type {
  VitalityDayLog,
  TrainingProgress,
  VitalityPersistedState,
} from "./types";
import { createInitialTrainingProgress } from "./training";
import { xpRequiredForLevel } from "@/lib/xp/leveling";
import { NUTRITION_DEFAULTS } from "./nutrition";
import { casablancaDate } from "@/lib/utils/casablanca";
import { calculateVitalityXp } from "./xp";
import { applyXpToVitality } from "./leveling";

const STORAGE_KEY = "pulses_vitality_v2";
const HISTORY_MAX = 60;

export function defaultDayLog(date = casablancaDate()): VitalityDayLog {
  return {
    date,
    proteinGoal: NUTRITION_DEFAULTS.proteinGoalGrams,
    practicesToday: [],
    hygiene: {},
    menus: {},
  };
}

export function defaultAttribute(): Attribute {
  return {
    name: "vitality",
    level: 2,
    currentXp: 180,
    xpToNext: xpRequiredForLevel(3),
    multiplier: 1.0,
  };
}

function toAttr(base: VitalityPersistedState["attributeBase"]): Attribute {
  return { name: "vitality", ...base };
}

function fromAttr(a: Attribute): VitalityPersistedState["attributeBase"] {
  return {
    level: a.level,
    currentXp: a.currentXp,
    xpToNext: a.xpToNext,
    multiplier: a.multiplier,
  };
}

/**
 * Load state. If dayLog is from a previous Casablanca day, seal it:
 * apply that day's XP to attributeBase, push log to history, start fresh day.
 */
export function loadVitalityState(): {
  attributeBase: Attribute;
  dayLog: VitalityDayLog;
  training: TrainingProgress;
  history: VitalityDayLog[];
} {
  const today = casablancaDate();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        attributeBase: defaultAttribute(),
        dayLog: defaultDayLog(today),
        training: createInitialTrainingProgress(),
        history: [],
      };
    }

    const parsed = JSON.parse(raw) as VitalityPersistedState;
    let attributeBase = toAttr(parsed.attributeBase);
    let dayLog = parsed.dayLog;
    let training = parsed.training ?? createInitialTrainingProgress();
    let history = parsed.history ?? [];

    // Seal previous day(s) if needed
    if (dayLog.date && dayLog.date < today && !dayLog.sealed) {
      const xp = calculateVitalityXp(dayLog).total;
      if (xp > 0) {
        attributeBase = applyXpToVitality(attributeBase, xp);
      }
      history = [...history, { ...dayLog, sealed: true }].slice(-HISTORY_MAX);
      dayLog = defaultDayLog(today);
    } else if (!dayLog.date || dayLog.date > today) {
      dayLog = defaultDayLog(today);
    }

    return { attributeBase, dayLog, training, history };
  } catch {
    return {
      attributeBase: defaultAttribute(),
      dayLog: defaultDayLog(today),
      training: createInitialTrainingProgress(),
      history: [],
    };
  }
}

export function saveVitalityState(
  attributeBase: Attribute,
  dayLog: VitalityDayLog,
  training: TrainingProgress,
  history: VitalityDayLog[]
) {
  const payload: VitalityPersistedState = {
    attributeBase: fromAttr(attributeBase),
    dayLog,
    training,
    history,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

/** Live display attribute = base + today's XP (can go up and down during the day) */
export function displayAttribute(
  attributeBase: Attribute,
  dayLog: VitalityDayLog
): Attribute {
  const xp = calculateVitalityXp(dayLog).total;
  if (xp <= 0) return attributeBase;
  return applyXpToVitality(attributeBase, xp);
}

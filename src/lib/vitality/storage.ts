/**
 * localStorage persistence for Vitality.
 * Keeps progress when switching tabs / refreshing.
 */

import type { Attribute } from "@/types/attributes";
import type {
  VitalityDayLog,
  TrainingProgress,
  VitalityPersistedState,
} from "./types";
import { createInitialTrainingProgress } from "./training";
import { xpRequiredForLevel } from "@/lib/xp/leveling";
import { NUTRITION_DEFAULTS } from "./nutrition";

const STORAGE_KEY = "pulses_vitality_v1";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function defaultDayLog(date = todayDate()): VitalityDayLog {
  return {
    date,
    proteinGoal: NUTRITION_DEFAULTS.proteinGoalGrams,
    practicesToday: [],
    hygiene: {},
    menus: {},
    shoppingNeeded: [],
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

export function loadVitalityState(): {
  attribute: Attribute;
  dayLog: VitalityDayLog;
  training: TrainingProgress;
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        attribute: defaultAttribute(),
        dayLog: defaultDayLog(),
        training: createInitialTrainingProgress(),
      };
    }

    const parsed = JSON.parse(raw) as VitalityPersistedState;
    const today = todayDate();

    // New day → reset day log, keep attribute + training progress
    const dayLog =
      parsed.dayLog?.date === today
        ? parsed.dayLog
        : defaultDayLog(today);

    return {
      attribute: {
        name: "vitality",
        level: parsed.attribute.level,
        currentXp: parsed.attribute.currentXp,
        xpToNext: parsed.attribute.xpToNext,
        multiplier: parsed.attribute.multiplier,
      },
      dayLog,
      training: parsed.training ?? createInitialTrainingProgress(),
    };
  } catch {
    return {
      attribute: defaultAttribute(),
      dayLog: defaultDayLog(),
      training: createInitialTrainingProgress(),
    };
  }
}

export function saveVitalityState(
  attribute: Attribute,
  dayLog: VitalityDayLog,
  training: TrainingProgress
) {
  const payload: VitalityPersistedState = {
    attribute: {
      level: attribute.level,
      currentXp: attribute.currentXp,
      xpToNext: attribute.xpToNext,
      multiplier: attribute.multiplier,
    },
    dayLog,
    training,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

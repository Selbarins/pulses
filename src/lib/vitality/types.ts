/**
 * Vitality domain types.
 */

export type TrainingType = "strength" | "other";

export type PracticeId =
  | "sit_to_stand"
  | "hinge"
  | "push"
  | "pull"
  | "carry_core";

export type HygieneId =
  | "hydration"
  | "mobility"
  | "wind_down"
  | "feet_check"
  | "sleep_ready";

export type MenuSlot = "breakfast" | "lunch" | "dinner" | "snack";

/** Single day’s logged values */
export interface VitalityDayLog {
  date: string; // YYYY-MM-DD

  // Glycemia
  glycemia?: number;
  glycemiaInTarget?: boolean;

  // Sleep
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;

  // Training — Phase 1 practices practiced today
  practicesToday?: PracticeId[];
  fullSession?: boolean;

  // Nutrition
  proteinGoal?: number;       // grams target for the day
  proteinEaten?: number;      // estimated grams
  proteinHit?: boolean;       // convenience flag
  menus?: Partial<Record<MenuSlot, string>>; // simple label per slot
  shoppingNeeded?: string[];  // items still missing

  // Hygiene
  hygiene?: Partial<Record<HygieneId, boolean>>;

  // Derived
  energy?: 1 | 2 | 3 | 4 | 5;
}

/** Long-term training progress (persists across days) */
export interface TrainingProgress {
  phase: 1 | 2 | 3;
  /** How many times each practice has been done in current phase */
  practiceCounts: Record<PracticeId, number>;
  /** Total sessions completed in current phase */
  sessionsCompleted: number;
  phase1Complete: boolean;
}

export interface VitalityXpBreakdown {
  glycemia: number;
  sleep: number;
  training: number;
  protein: number;
  hygiene: number;
  total: number;
}

export interface VitalityMetricDef {
  id: string;
  label: string;
  description?: string;
  baseXp: number;
  bonusXp?: number;
  dailyCap?: number;
}

/** Everything we persist */
export interface VitalityPersistedState {
  attribute: {
    level: number;
    currentXp: number;
    xpToNext: number;
    multiplier: number;
  };
  dayLog: VitalityDayLog;
  training: TrainingProgress;
}

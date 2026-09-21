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

export interface VitalityDayLog {
  date: string;
  glycemia?: number;
  glycemiaInTarget?: boolean;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  practicesToday?: PracticeId[];
  fullSession?: boolean;
  proteinGoal?: number;
  proteinEaten?: number;
  proteinHit?: boolean;
  menus?: Partial<Record<MenuSlot, string>>;
  hygiene?: Partial<Record<HygieneId, boolean>>;
  energy?: 1 | 2 | 3 | 4 | 5;
  /** Set true when day is sealed at midnight */
  sealed?: boolean;
}

export interface TrainingProgress {
  phase: 1 | 2 | 3;
  practiceCounts: Record<PracticeId, number>;
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

/** Persisted shape */
export interface VitalityPersistedState {
  /** Attribute at the start of the current (unsealed) day */
  attributeBase: {
    level: number;
    currentXp: number;
    xpToNext: number;
    multiplier: number;
  };
  dayLog: VitalityDayLog;
  training: TrainingProgress;
  /** Sealed past days (newest last) */
  history: VitalityDayLog[];
}

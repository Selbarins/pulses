/**
 * Hygiene & Recovery checklist.
 * Edit items here — each grants small XP.
 */

import type { HygieneId } from "./types";

export interface HygieneDef {
  id: HygieneId;
  label: string;
  description: string;
  xp: number;
}

export const HYGIENE_ITEMS: HygieneDef[] = [
  {
    id: "hydration",
    label: "Morning hydration",
    description: "Water first thing after waking.",
    xp: 8,
  },
  {
    id: "mobility",
    label: "Mobility / stretch",
    description: "5–10 min post-training or evening mobility.",
    xp: 10,
  },
  {
    id: "wind_down",
    label: "Evening wind-down",
    description: "No screens / light walk / breathing before bed.",
    xp: 10,
  },
  {
    id: "feet_check",
    label: "Feet & skin check",
    description: "Quick diabetic-aware check.",
    xp: 8,
  },
  {
    id: "sleep_ready",
    label: "Sleep environment",
    description: "Dark, cool, phone away.",
    xp: 8,
  },
];

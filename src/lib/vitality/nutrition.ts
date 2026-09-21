/**
 * Nutrition config — protein goal, menu slots, shopping list.
 * Edit goals and default menus here.
 */

import type { MenuSlot } from "./types";

export const NUTRITION_DEFAULTS = {
  /** Daily protein target in grams — change when goal changes */
  proteinGoalGrams: 140,
  /** XP for hitting the goal */
  hitGoalXp: 45,
  /** Smaller XP just for planning menus */
  planMenusXp: 15,
};

export const MENU_SLOTS: { id: MenuSlot; label: string }[] = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

/** Example starter menu ideas (player can overwrite) */
export const MENU_SUGGESTIONS: Record<MenuSlot, string[]> = {
  breakfast: ["Eggs + oats", "Greek yogurt + fruit", "Protein shake + banana"],
  lunch: ["Chicken + rice + veg", "Tuna salad", "Lentils + eggs"],
  dinner: ["Fish + potatoes", "Lean beef + veg", "Turkey stir-fry"],
  snack: ["Cottage cheese", "Protein yogurt", "Handful of nuts + fruit"],
};

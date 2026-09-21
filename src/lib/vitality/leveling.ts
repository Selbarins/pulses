/**
 * Apply awarded XP to a vitality Attribute and handle level-ups.
 * Pure — returns a new Attribute object.
 */

import type { Attribute } from "@/types/attributes";
import { xpRequiredForLevel } from "@/lib/xp/leveling";

/**
 * Add XP to the vitality attribute.
 * Handles multiple level-ups in one go if needed.
 */
export function applyXpToVitality(
  attr: Attribute,
  xpToAdd: number
): Attribute {
  if (attr.name !== "vitality") {
    throw new Error("applyXpToVitality only accepts the vitality attribute");
  }
  if (xpToAdd <= 0) return attr;

  let level = attr.level;
  let currentXp = attr.currentXp + xpToAdd;
  let xpToNext = attr.xpToNext;

  while (currentXp >= xpToNext && level < 20) {
    currentXp -= xpToNext;
    level += 1;
    xpToNext = xpRequiredForLevel(level + 1);
  }

  if (level >= 20) {
    level = 20;
    currentXp = Math.min(currentXp, xpToNext);
  }

  return {
    ...attr,
    level,
    currentXp,
    xpToNext,
  };
}

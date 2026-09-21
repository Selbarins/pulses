/**
 * Read vitality attribute for Home / Soul Orb without React.
 */

import type { Attribute } from "@/types/attributes";
import {
  loadVitalityState,
  displayAttribute,
  defaultAttribute,
} from "./storage";

export function getVitalityAttributeForHome(): Attribute {
  if (typeof window === "undefined") return defaultAttribute();
  try {
    const { attributeBase, dayLog } = loadVitalityState();
    return displayAttribute(attributeBase, dayLog);
  } catch {
    return defaultAttribute();
  }
}

export function level01FromAttribute(attr: Attribute) {
  return Math.min(1, Math.max(0, (attr.level - 1) / 19));
}

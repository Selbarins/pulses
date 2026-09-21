import type { CartItem, ShoppingState, ShopCategory } from "./types";

const KEY = "pulses_shopping_v1";

export function loadCart(): ShoppingState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { items: [] };
    return JSON.parse(raw) as ShoppingState;
  } catch {
    return { items: [] };
  }
}

export function saveCart(state: ShoppingState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function newItem(
  partial: Omit<CartItem, "id" | "createdAt" | "checked">
): CartItem {
  const now = new Date().toISOString();
  return {
    ...partial,
    id: crypto.randomUUID(),
    checked: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function grandTotal(items: CartItem[]) {
  return items.reduce((s, i) => s + i.price * i.quantity, 0);
}

export function totalByCategory(items: CartItem[], cat: ShopCategory) {
  return items
    .filter((i) => i.category === cat)
    .reduce((s, i) => s + i.price * i.quantity, 0);
}

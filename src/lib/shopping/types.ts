export type ShopCategory = "nutrition" | "household" | "personal" | "other";

export interface CartItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  quantity: number;
  checked: boolean;
  note?: string;
  createdAt: string;   // when added
  checkedAt?: string;  // when marked bought (wealth stats)
  updatedAt?: string;
}

export interface ShoppingState {
  items: CartItem[];
}

export const SHOP_CATEGORIES: { id: ShopCategory; label: string }[] = [
  { id: "nutrition", label: "Nutrition" },
  { id: "household", label: "Household" },
  { id: "personal", label: "Personal" },
  { id: "other", label: "Other" },
];

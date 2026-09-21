"use client";

import { useEffect, useState } from "react";
import type { CartItem, ShopCategory } from "@/lib/shopping";
import {
  loadCart,
  saveCart,
  newItem,
  grandTotal,
  SHOP_CATEGORIES,
} from "@/lib/shopping";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCategory?: ShopCategory;
}

export default function ShoppingCart({
  open,
  onClose,
  defaultCategory = "nutrition",
}: Props) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState<ShopCategory | "all">(defaultCategory);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [category, setCategory] = useState<ShopCategory>(defaultCategory);

  useEffect(() => {
    if (open) {
      setItems(loadCart().items);
      setFilter(defaultCategory);
      setCategory(defaultCategory);
    }
  }, [open, defaultCategory]);

  const persist = (next: CartItem[]) => {
    setItems(next);
    saveCart({ items: next });
  };

  const add = () => {
    const n = name.trim();
    const p = parseFloat(price);
    const q = parseInt(qty, 10);
    if (!n || Number.isNaN(p) || p < 0 || Number.isNaN(q) || q < 1) return;
    persist([
      ...items,
      newItem({ name: n, category, price: p, quantity: q }),
    ]);
    setName("");
    setPrice("");
    setQty("1");
  };

  const toggle = (id: string) => {
    persist(
      items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  const remove = (id: string) => {
    persist(items.filter((i) => i.id !== id));
  };

  const clearChecked = () => {
    persist(items.filter((i) => !i.checked));
  };

  const visible =
    filter === "all" ? items : items.filter((i) => i.category === filter);

  const total = grandTotal(filter === "all" ? items : visible);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-[#0f1218] border border-white/10 shadow-2xl p-4 pb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/70">
              Wealth
            </p>
            <h2 className="text-lg font-semibold text-white">Shopping Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setFilter("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
              filter === "all"
                ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            All
          </button>
          {SHOP_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${
                filter === c.id
                  ? "bg-amber-500/20 text-amber-200 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Add item */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-700/60 p-3 space-y-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Item name"
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
          />
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ShopCategory)}
              className="rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-xs text-slate-300"
            >
              {SHOP_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              inputMode="decimal"
              placeholder="Price"
              className="w-24 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
            />
            <input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              type="number"
              inputMode="numeric"
              placeholder="Qty"
              className="w-16 rounded-lg bg-slate-950 border border-slate-700 px-2 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40"
            />
            <button
              onClick={add}
              className="px-4 rounded-lg bg-amber-600 text-sm font-semibold text-white hover:bg-amber-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-2">
          {visible.length === 0 && (
            <li className="text-center text-sm text-slate-500 py-6">
              Cart is empty
            </li>
          )}
          {visible.map((item) => (
            <li
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                item.checked
                  ? "border-emerald-500/30 bg-emerald-500/10 opacity-70"
                  : "border-slate-700/60 bg-slate-950/50"
              }`}
            >
              <button
                onClick={() => toggle(item.id)}
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 ${
                  item.checked
                    ? "border-emerald-400 bg-emerald-500/30 text-white"
                    : "border-slate-600"
                }`}
              >
                {item.checked ? "✓" : ""}
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm ${
                    item.checked
                      ? "line-through text-slate-500"
                      : "text-slate-100"
                  }`}
                >
                  {item.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {item.category} · ×{item.quantity}
                </p>
              </div>
              <p className="text-sm tabular-nums text-amber-200/90 shrink-0">
                {(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => remove(item.id)}
                className="text-slate-600 hover:text-red-400 text-xs shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={clearChecked}
            className="text-xs text-slate-500 hover:text-slate-300"
          >
            Clear checked
          </button>
          <p className="text-lg font-semibold text-amber-100 tabular-nums">
            {total.toFixed(2)}
            <span className="text-xs text-slate-500 ml-1">total</span>
          </p>
        </div>
      </div>
    </div>
  );
}

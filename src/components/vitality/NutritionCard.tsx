"use client";

import { useState } from "react";
import type { MenuSlot } from "@/lib/vitality";
import { MENU_SLOTS, NUTRITION_DEFAULTS, MENU_SUGGESTIONS } from "@/lib/vitality";

interface Props {
  proteinGoal?: number;
  proteinHit?: boolean;
  menus?: Partial<Record<MenuSlot, string>>;
  shoppingNeeded?: string[];
  onUpdate: (patch: {
    proteinHit?: boolean;
    menus?: Partial<Record<MenuSlot, string>>;
    shoppingNeeded?: string[];
  }) => void;
}

export default function NutritionCard({
  proteinGoal = NUTRITION_DEFAULTS.proteinGoalGrams,
  proteinHit,
  menus = {},
  shoppingNeeded = [],
  onUpdate,
}: Props) {
  const [shopInput, setShopInput] = useState("");

  const addShopItem = () => {
    const t = shopInput.trim();
    if (!t) return;
    onUpdate({ shoppingNeeded: [...shoppingNeeded, t] });
    setShopInput("");
  };

  const removeShop = (i: number) => {
    onUpdate({ shoppingNeeded: shoppingNeeded.filter((_, idx) => idx !== i) });
  };

  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/60 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-pink-400/60">
            Resource
          </p>
          <h2 className="text-sm font-medium text-pink-100">Fuel · Protein</h2>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-pink-200 tabular-nums">
            {proteinGoal}
            <span className="text-xs text-slate-500 ml-0.5">g</span>
          </p>
          <p className="text-[9px] text-slate-500">daily goal</p>
        </div>
      </div>

      {/* Hit goal */}
      <button
        onClick={() => onUpdate({ proteinHit: !proteinHit })}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
          proteinHit
            ? "bg-emerald-600/90 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]"
            : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-pink-500/30"
        }`}
      >
        {proteinHit ? "Goal crushed ★" : `Hit ${proteinGoal}g protein`}
      </button>

      {/* Menu slots */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Today’s menus
        </p>
        {MENU_SLOTS.map((slot) => (
          <div key={slot.id} className="flex gap-2 items-center">
            <span className="w-16 text-[10px] text-slate-500 shrink-0">
              {slot.label}
            </span>
            <input
              value={menus[slot.id] ?? ""}
              onChange={(e) =>
                onUpdate({
                  menus: { ...menus, [slot.id]: e.target.value },
                })
              }
              placeholder={MENU_SUGGESTIONS[slot.id][0]}
              className="flex-1 rounded-lg bg-slate-950/70 border border-slate-700/60 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/40"
            />
          </div>
        ))}
      </div>

      {/* Shopping list */}
      <div className="space-y-2 pt-1 border-t border-slate-800">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">
          Shopping cart
        </p>
        <div className="flex gap-2">
          <input
            value={shopInput}
            onChange={(e) => setShopInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addShopItem()}
            placeholder="Add item…"
            className="flex-1 rounded-lg bg-slate-950/70 border border-slate-700/60 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/40"
          />
          <button
            onClick={addShopItem}
            className="px-3 rounded-lg bg-slate-800 text-xs text-pink-300 hover:bg-slate-700"
          >
            +
          </button>
        </div>
        {shoppingNeeded.length > 0 && (
          <ul className="space-y-1">
            {shoppingNeeded.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/50 rounded-lg px-2.5 py-1.5"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeShop(i)}
                  className="text-slate-500 hover:text-pink-400 text-[10px]"
                >
                  got it
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

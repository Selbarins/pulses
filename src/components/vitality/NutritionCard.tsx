"use client";

import type { MenuSlot } from "@/lib/vitality";
import { MENU_SLOTS, NUTRITION_DEFAULTS } from "@/lib/vitality";

interface Props {
  proteinGoal?: number;
  proteinHit?: boolean;
  menus?: Partial<Record<MenuSlot, string>>;
  onUpdate: (patch: {
    proteinHit?: boolean;
    menus?: Partial<Record<MenuSlot, string>>;
  }) => void;
  onOpenCart: () => void;
}

export default function NutritionCard({
  proteinGoal = NUTRITION_DEFAULTS.proteinGoalGrams,
  proteinHit,
  menus = {},
  onUpdate,
  onOpenCart,
}: Props) {
  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-pink-400/60">
            Resource
          </p>
          <h2 className="text-sm font-medium text-pink-100">Fuel · Protein</h2>
        </div>
        <p className="text-lg font-semibold text-pink-200 tabular-nums">
          {proteinGoal}
          <span className="text-xs text-slate-500 ml-0.5">g</span>
        </p>
      </div>

      <button
        onClick={() => onUpdate({ proteinHit: !proteinHit })}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition active:scale-[0.98] ${
          proteinHit
            ? "bg-emerald-600/90 text-white shadow-[0_0_16px_rgba(16,185,129,0.35)]"
            : "bg-slate-800 text-slate-300 border border-slate-700"
        }`}
      >
        {proteinHit ? "Goal crushed ★" : `Hit ${proteinGoal}g protein`}
      </button>

      <div className="space-y-1.5">
        {MENU_SLOTS.map((slot) => (
          <div key={slot.id} className="flex gap-2 items-center">
            <span className="w-14 text-[10px] text-slate-500 shrink-0">
              {slot.label}
            </span>
            <input
              value={menus[slot.id] ?? ""}
              onChange={(e) =>
                onUpdate({ menus: { ...menus, [slot.id]: e.target.value } })
              }
              placeholder="…"
              className="flex-1 rounded-lg bg-slate-950/70 border border-slate-700/60 px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500/40"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onOpenCart}
        className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm font-medium text-amber-200 hover:bg-amber-500/20 transition"
      >
        Open shopping cart
      </button>
    </section>
  );
}

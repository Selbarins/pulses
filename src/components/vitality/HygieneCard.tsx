"use client";

import type { HygieneId } from "@/lib/vitality";
import { HYGIENE_ITEMS } from "@/lib/vitality";

interface Props {
  hygiene?: Partial<Record<HygieneId, boolean>>;
  onToggle: (id: HygieneId) => void;
}

export default function HygieneCard({ hygiene = {}, onToggle }: Props) {
  const doneCount = HYGIENE_ITEMS.filter((i) => hygiene[i.id]).length;

  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-pink-400/60">
            Recovery
          </p>
          <h2 className="text-sm font-medium text-pink-100">
            Hygiene & Recovery
          </h2>
        </div>
        <span className="text-[11px] text-pink-300/70 tabular-nums">
          {doneCount}/{HYGIENE_ITEMS.length}
        </span>
      </div>

      <div className="space-y-1.5">
        {HYGIENE_ITEMS.map((item) => {
          const on = !!hygiene[item.id];
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.98] ${
                on
                  ? "border-pink-500/40 bg-pink-500/15"
                  : "border-slate-700/50 bg-slate-950/40 hover:border-slate-600"
              }`}
            >
              <div
                className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] shrink-0 ${
                  on
                    ? "border-pink-400 bg-pink-500/30 text-pink-100"
                    : "border-slate-600 text-transparent"
                }`}
              >
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${on ? "text-pink-100" : "text-slate-300"}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">
                +{item.xp}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

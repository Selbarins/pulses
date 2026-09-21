"use client";

import { useState } from "react";

interface Props {
  hours?: number;
  quality?: 1 | 2 | 3 | 4 | 5;
  onLog: (hours: number, quality: 1 | 2 | 3 | 4 | 5) => void;
  onClear: () => void;
}

export default function SleepCard({ hours, quality, onLog, onClear }: Props) {
  const [h, setH] = useState(hours?.toString() ?? "");
  const [q, setQ] = useState<1 | 2 | 3 | 4 | 5>(quality ?? 3);
  const logged = hours != null;

  return (
    <section className="rounded-2xl border border-pink-500/15 bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-pink-400/60">
            Quest
          </p>
          <h2 className="text-sm font-medium text-pink-100">Sleep</h2>
        </div>
        {logged && (
          <button
            onClick={() => {
              setH("");
              onClear();
            }}
            className="text-[10px] text-slate-500 hover:text-pink-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            placeholder="0"
            value={h}
            onChange={(e) => setH(e.target.value)}
            className="w-16 rounded-xl bg-slate-950/80 border border-slate-700/80 px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-pink-500/50"
          />
          <span className="text-[10px] text-slate-500">h</span>
        </div>

        <div className="flex-1 flex justify-end gap-1">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              onClick={() => setQ(n)}
              className={`h-9 w-9 rounded-lg text-base transition active:scale-90 ${
                n <= q
                  ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.6)]"
                  : "text-slate-600"
              }`}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          const n = parseFloat(h);
          if (Number.isNaN(n) || n <= 0) return;
          onLog(n, q);
        }}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-700 to-pink-500 text-sm font-semibold text-white shadow-[0_0_20px_rgba(236,72,153,0.25)] hover:brightness-110 active:scale-[0.98] transition"
      >
        {logged ? "Update" : "Claim XP"}
      </button>
    </section>
  );
}

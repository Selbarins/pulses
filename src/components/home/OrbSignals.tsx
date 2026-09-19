"use client";

interface OrbSignalsProps {
  level?: number;
  energy?: number; // 0–1
  streak?: number;
  multiplier?: number;
  burden?: number; // 0–1 cleared (0 = full burden, 1 = clear)
  burdenActive?: boolean; // kept for later logic; bar always shows
}

export default function OrbSignals({
  level = 4,
  energy = 0.72,
  streak = 9,
  multiplier = 1.25,
  burden = 0.35,
}: OrbSignalsProps) {
  const energyPct = Math.round(Math.min(1, Math.max(0, energy)) * 100);
  const burdenPct = Math.round(Math.min(1, Math.max(0, burden)) * 100);
  const streakLit = Math.min(streak, 12);

  return (
    <div className="w-full max-w-sm mx-auto px-4 mt-1 mb-6">
      {/* Single cluster — feels like a readout under the constellation */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
        {/* Top row: Level seal + Energy arc label */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Level as orbital seal */}
            <div className="relative h-10 w-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-amber-200/25" />
              <div className="absolute inset-1 rounded-full border border-amber-200/10" />
              <span className="text-sm text-amber-100/90 font-medium tabular-nums">
                {level}
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-[10px] text-slate-500 tracking-[0.15em] uppercase">
                Character
              </div>
              <div className="text-xs text-slate-300">Level {level}</div>
            </div>
          </div>

          <div className="text-right leading-tight">
            <div className="text-[10px] text-slate-500 tracking-[0.15em] uppercase">
              Energy
            </div>
            <div className="text-xs text-slate-200 tabular-nums">{energyPct}%</div>
          </div>
        </div>

        {/* Energy — soft luminous rail */}
        <div className="mb-3">
          <div className="h-1 rounded-full bg-slate-800/80 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c4b5a0] via-[#f5e6c8] to-[#e8d5a3]"
              style={{ width: energyPct + "%" }}
            />
          </div>
        </div>

        {/* Streak — filament segments (compound charge) */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-slate-500 tracking-[0.12em] uppercase w-10 shrink-0">
            Streak
          </span>
          <div className="flex-1 flex gap-[3px]">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={
                  "h-1 flex-1 rounded-full transition-colors " +
                  (i < streakLit
                    ? "bg-amber-300/70 shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                    : "bg-slate-800/90")
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-amber-100/70 tabular-nums shrink-0">
            {streak}d · {multiplier.toFixed(2)}x
          </span>
        </div>

        {/* Burden — always visible fracture rail */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 tracking-[0.12em] uppercase">
              Burden
            </span>
            <span className="text-[10px] text-slate-400 tabular-nums">
              {burdenPct < 100 ? burdenPct + "% cleared" : "Clear"}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-900/90 overflow-hidden border border-red-950/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-600/90 to-rose-400/80"
              style={{ width: burdenPct + "%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

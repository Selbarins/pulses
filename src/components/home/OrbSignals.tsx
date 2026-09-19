"use client";

interface OrbSignalsProps {
  level?: number;
  energy?: number;      // 0–1
  energyMax?: number;
  streak?: number;
  multiplier?: number;
  burden?: number;      // 0–1 progress to clear, or null if none
  burdenActive?: boolean;
}

export default function OrbSignals({
  level = 4,
  energy = 0.72,
  streak = 9,
  multiplier = 1.25,
  burden = 0.35,
  burdenActive={true},
}: OrbSignalsProps) {
  return (
    <div className="w-full max-w-md px-4 mt-2 mb-4 space-y-3">
      {/* Level + Energy */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full border border-amber-200/30 flex items-center justify-center">
            <span className="text-xs text-amber-100/90 font-medium">{level}</span>
          </div>
          <div className="text-[11px] text-slate-500 tracking-wide uppercase">
            Level
          </div>
        </div>

        <div className="flex-1 max-w-[140px]">
          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
            <span>Energy</span>
            <span>{Math.round(energy * 100)}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-400 to-amber-200/90"
              style={{ width: `${energy * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Streak charge */}
      <div className="flex items-center gap-3">
        <div className="text-[10px] text-slate-500 tracking-wide uppercase w-12">
          Streak
        </div>
        <div className="flex-1 flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < Math.min(streak, 7)
                  ? "bg-amber-300/80"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>
        <div className="text-[11px] text-amber-200/80 tabular-nums">
          {streak}d · {multiplier.toFixed(2)}×
        </div>
      </div>

      {/* Burden — exp-style bar, only when active */}
      {burdenActive && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-3 py-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-red-300/90 tracking-wide uppercase">Burden</span>
            <span className="text-red-200/70">{Math.round(burden * 100)}% cleared</span>
          </div>
          <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-800 to-red-400/90"
              style={{ width: `${burden * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

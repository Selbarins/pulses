"use client";

interface Props {
  level: number;
  currentXp: number;
  xpToNext: number;
  todayXp: number;
}

export default function LevelProgress({
  level,
  currentXp,
  xpToNext,
  todayXp,
}: Props) {
  const pct = Math.min(100, Math.round((currentXp / Math.max(xpToNext, 1)) * 100));

  const rank =
    level >= 15 ? "Radiant" :
    level >= 10 ? "Forged" :
    level >= 5  ? "Awakening" :
    "Initiate";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/80 to-slate-950 p-4">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-pink-500/10 blur-2xl" />

      <div className="relative flex items-end justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400/70">
            Vitality · {rank}
          </p>
          <p className="text-3xl font-semibold text-pink-100 tabular-nums leading-none mt-1">
            {level}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Today’s haul
          </p>
          <p className="text-xl font-medium text-pink-300 tabular-nums">
            +{todayXp}
            <span className="text-xs text-pink-400/60 ml-1">XP</span>
          </p>
        </div>
      </div>

      <div className="h-2.5 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-700 via-pink-400 to-rose-300 transition-all duration-700 shadow-[0_0_12px_rgba(244,114,182,0.45)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500 tabular-nums">
        {currentXp} / {xpToNext} XP → Level {level + 1}
      </p>
    </section>
  );
}

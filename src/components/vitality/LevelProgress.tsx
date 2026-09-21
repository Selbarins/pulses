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

  return (
    <section className="rounded-2xl bg-slate-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Vitality
          </p>
          <p className="text-lg font-medium text-pink-200">Level {level}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Today
          </p>
          <p className="text-sm text-pink-300 tabular-nums">+{todayXp} XP</p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-700 to-pink-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 tabular-nums">
        {currentXp} / {xpToNext} XP to next level
      </p>
    </section>
  );
}

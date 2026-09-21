"use client";

interface Props {
  unlocked: boolean;
}

export default function Phase2Teaser({ unlocked }: Props) {
  return (
    <section
      className={`rounded-2xl border p-3 ${
        unlocked
          ? "border-emerald-500/30 bg-emerald-950/20"
          : "border-slate-700/50 bg-slate-950/40 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">
            Campaign · Phase 2
          </p>
          <h2 className="text-sm font-medium text-slate-200">Foundation</h2>
          <p className="text-[10px] text-slate-500 mt-0.5">
            3×/week · same 5 patterns · add load
          </p>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full border border-slate-600 text-slate-400">
          {unlocked ? "Unlocked" : "Locked"}
        </span>
      </div>
    </section>
  );
}

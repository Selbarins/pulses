"use client";

import Link from "next/link";
import AttributeOrb from "@/components/orb/AttributeOrb";

interface AttributeShellProps {
  attribute: "wealth" | "vitality" | "focus" | "momentum" | "discipline";
  level01: number;
  title: string;
  children: React.ReactNode;
}

export default function AttributeShell({
  attribute,
  level01,
  title,
  children,
}: AttributeShellProps) {
  return (
    <main className="min-h-screen bg-[#0B0D10] text-white">
      {/* Centered hero orb */}
      <div className="pt-8 pb-2 flex flex-col items-center">
        <AttributeOrb attribute={attribute} level01={level01} size="md" />
        <h1 className="text-center text-xl font-medium tracking-wide text-slate-100 mt-1">
          {title}
        </h1>
      </div>

      <div className="px-4 pb-28 max-w-md mx-auto">{children}</div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-slate-800/90 text-sm text-slate-200 border border-slate-700"
        >
          ← Home
        </Link>
      </div>
    </main>
  );
}

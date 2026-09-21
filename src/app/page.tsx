"use client";

import { getVitalityAttributeForHome } from "@/lib/vitality";
import Link from "next/link";
import SoulOrb from "@/components/orb/SoulOrb";
import AttributeOrb from "@/components/orb/AttributeOrb";
import { orbStateFromStats } from "@/lib/orb/fromStats";
import type { Attribute } from "@/types/attributes";
import { useState, useEffect, useRef } from "react";
import OrbSignals from "@/components/home/OrbSignals";

const INITIAL: Attribute[] = [
  { name: "wealth",     level: 3, currentXp: 420, xpToNext: 1000, multiplier: 1.1  },
  { name: "vitality",  level: 2, currentXp: 180, xpToNext: 800,  multiplier: 1.0  },
  { name: "focus",     level: 1, currentXp: 90,  xpToNext: 600,  multiplier: 1.0  },
  { name: "momentum",  level: 2, currentXp: 310, xpToNext: 800,  multiplier: 1.0  },
  { name: "discipline",level: 4, currentXp: 50,  xpToNext: 1200, multiplier: 1.25 },
];

// Left→right order, vitality at center (index 2)
// translateY: outer orbs sit higher (negative = up), center dips down → inverted arc
const ARC_ITEMS = [
  { name: "wealth",     label: "Wealth",     href: "/wealth",     color: "#E8B84A", ty: -48 },
  { name: "focus",      label: "Focus",      href: "/focus",      color: "#60A5FA", ty: -20 },
  { name: "vitality",   label: "Vitality",   href: "/vitality",   color: "#F472B6", ty: 0   },
  { name: "momentum",   label: "Momentum",   href: "/momentum",   color: "#34D399", ty: -20 },
  { name: "discipline", label: "Discipline", href: "/discipline", color: "#F87171", ty: -48 },
] as const;

// Particle config per stream
const PARTICLE_COUNT = 18;
const STREAMS_PER_ORB = 3;

interface Particle {
  t: number;
  speed: number;
  size: number;
  opacity: number;
  stream: number; // 0 .. STREAMS_PER_ORB-1
  lateral: number; // sideways offset
}

// Quadratic bezier point
function bezier(p0: number, p1: number, p2: number, t: number) {
  return (1 - t) ** 2 * p0 + 2 * (1 - t) * t * p1 + t ** 2 * p2;
}

export default function Home() {
  const [attributes, setAttributes] = useState<Attribute[]>(INITIAL);
  const [streak] = useState(9);
  const [inDebt] = useState(false);

  // Sync vitality from Vitality page storage (localStorage)
  useEffect(() => {
    const syncVitality = () => {
      const vitality = getVitalityAttributeForHome();
      setAttributes((prev) =>
        prev.map((a) => (a.name === "vitality" ? vitality : a))
      );
    };

    syncVitality(); // on first load
    window.addEventListener("focus", syncVitality); // back from /vitality
    return () => window.removeEventListener("focus", syncVitality);
  }, []);

  const realState = orbStateFromStats(attributes, streak, inDebt);
  // Use real stats from attributes (vitality comes from storage)
const state = {
  ...realState,
  // Optional: keep a floor so the orb never looks fully dead while testing
  energy: Math.max(realState.energy, 0.35),
};

  const level01 = (name: string) => {
    const attr = attributes.find((a) => a.name === name);
    return attr ? Math.min(1, Math.max(0, (attr.level - 1) / 19)) : 0;
  };

  // ── Flow animation ─────────────────────────────────────────────────────────
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbRowRef    = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);

    // One set of particles per attribute (multi-stream energy)
    const particles = useRef<Particle[][]>(
      ARC_ITEMS.map(() =>
        Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
          t: i / PARTICLE_COUNT,
          speed: 0.22 + Math.random() * 0.18,
          size: 1.2 + Math.random() * 2.2,
          opacity: 0.35 + Math.random() * 0.55,
          stream: i % STREAMS_PER_ORB,
          lateral: (i % STREAMS_PER_ORB - 1) * 14,
        }))
      )
    );

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    const orbRow    = orbRowRef.current;
    if (!canvas || !container || !orbRow) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const getOrbCenters = () => {
      const containerRect = container.getBoundingClientRect();
      const links = orbRow.querySelectorAll("a");
      return Array.from(links).map((link) => {
        const rect = link.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top  + rect.height / 2 - containerRect.top,
        };
      });
    };

    const getSoulOrbCenter = () => {
      const containerRect = container.getBoundingClientRect();
      // SoulOrb canvas is the first child of container
      const soulDiv = container.querySelector(".soul-orb-wrapper") as HTMLElement;
      if (!soulDiv) return { x: canvas.width / 2, y: 190 };
      const rect = soulDiv.getBoundingClientRect();
      return {
        x: rect.left + rect.width  / 2 - containerRect.left,
        y: rect.top  + rect.height / 2 - containerRect.top,
      };
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const soul   = getSoulOrbCenter();
      const centers = getOrbCenters();

      ARC_ITEMS.forEach((item, idx) => {
        const orb = centers[idx];
        if (!orb) return;

        const stream = particles.current[idx];

                stream.forEach((p) => {
          p.t += delta * p.speed;
          if (p.t > 1) {
            p.t = 0;
            p.speed = 0.22 + Math.random() * 0.18;
            p.size = 1.2 + Math.random() * 2.2;
            p.opacity = 0.35 + Math.random() * 0.55;
          }

          const fade =
            p.t < 0.12 ? p.t / 0.12 :
            p.t > 0.78 ? 1 - (p.t - 0.78) / 0.22 : 1;

          const cpx2 = (orb.x + soul.x) / 2 + p.lateral * 0.4;
          const cpy2 = (orb.y + soul.y) / 2 - 50;
          const side = p.lateral * Math.sin(p.t * Math.PI);

          const px = bezier(orb.x, cpx2, soul.x, p.t) + side * 0.35;
          const py = bezier(orb.y, cpy2, soul.y, p.t);

          const grd = ctx.createRadialGradient(px, py, 0, px, py, p.size * 3.5);
          grd.addColorStop(0, item.color + "dd");
          grd.addColorStop(0.45, item.color + "66");
          grd.addColorStop(1, item.color + "00");

          ctx.globalAlpha = p.opacity * fade;
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = p.opacity * fade * 0.95;
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        });
      });

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0D10] flex flex-col items-center pb-16">
      <header className="w-full pt-6 pb-2 flex justify-center">
        <h1
          className="text-2xl tracking-[0.2em] text-slate-200/90"
          style={{ fontFamily: "var(--font-lora), serif" }}
        >
          Pulses
        </h1>
      </header>

      {/* Shared positioning container for canvas overlay */}
      <div ref={containerRef} className="relative w-full max-w-md">
        {/* Soul Orb */}
        <div className="soul-orb-wrapper w-full">
          <SoulOrb state={state} />
        </div>

        {/* Flow canvas — sits over everything, pointer-events off */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 10 }}
        />

        {/* Attribute Orbs — responsive, no clip */}
        <div
          ref={orbRowRef}
          className="relative flex justify-between items-end px-3 sm:px-4 pb-8 gap-1 sm:gap-3"
          style={{ zIndex: 20 }}
        >
          {ARC_ITEMS.map(({ name, label, href, ty }) => (
            <Link
              key={name}
              href={href}
              className="flex flex-col items-center flex-1 min-w-0"
              style={{ transform: `translateY(${ty * 0.65}px)` }}
            >
              <div className="w-[56px] h-[56px] sm:w-[64px] sm:h-[64px]">
                <AttributeOrb attribute={name} level01={level01(name)} size="sm" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate w-full text-center">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Game signals UNDER the small orbs */}
      <OrbSignals
        level={4}
        energy={0.72}
        streak={9}
        multiplier={1.25}
        burdenActive={false}
        burden={0.35}
      />
    </main>
  );
}

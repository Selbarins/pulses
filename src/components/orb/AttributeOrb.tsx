"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 1400;
const RADIUS = 1.0;

const ATTR_COLORS: Record<string, string> = {
  wealth: "#FFD666",
  vitality: "#FF5CA8",
  focus: "#4DA3FF",
  momentum: "#2EFFB0",
  discipline: "#FF6B6B",
};

interface AttributeOrbProps {
  attribute: "wealth" | "vitality" | "focus" | "momentum" | "discipline";
  level01: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function ParticleAttribute({ color, level01 }: { color: string; level01: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colorsArr = new Float32Array(COUNT * 3);
    const c = new THREE.Color(color);

    for (let i = 0; i < COUNT; i++) {
      const t = i / COUNT;
      const incl = Math.acos(1 - 2 * t);
      const azim = Math.PI * (1 + Math.sqrt(5)) * i;

      // Tight sphere
      const r = RADIUS * (0.88 + Math.random() * 0.12);

      positions[i * 3] = r * Math.sin(incl) * Math.cos(azim);
      positions[i * 3 + 1] = r * Math.sin(incl) * Math.sin(azim);
      positions[i * 3 + 2] = r * Math.cos(incl);

      // Flashy brightness
      const bright = 1.05 + level01 * 0.45 + Math.random() * 0.2;
      colorsArr[i * 3] = Math.min(1.4, c.r * bright);
      colorsArr[i * 3 + 1] = Math.min(1.4, c.g * bright);
      colorsArr[i * 3 + 2] = Math.min(1.4, c.b * bright);
    }
    return { positions, colors: colorsArr };
  }, [color, level01]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const speed = 0.15 + level01 * 0.35;
    pointsRef.current.rotation.y += delta * speed;
    pointsRef.current.rotation.x += delta * speed * 0.22;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.058}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function AttributeOrb({
  attribute,
  level01,
  size = "sm",
  className = "",
}: AttributeOrbProps) {
  // Always square so it stays a sphere
    const dim = size === "lg" ? 180 : size === "md" ? 120 : 56;

  return (
    <div
      className={className}
      style={{ width: dim, height: dim }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.4} />
        <ParticleAttribute color={ATTR_COLORS[attribute]} level01={level01} />
      </Canvas>
    </div>
  );
}

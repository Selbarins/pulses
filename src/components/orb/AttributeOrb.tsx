"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const COUNT = 2200;          // denser (was 1400)
const RADIUS = 1.05;

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

      // More volumetric shell (closer to SoulOrb feel)
      const r = RADIUS * (0.70 + Math.random() * 0.30);

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

  useFrame((state, delta) => {
  if (!pointsRef.current) return;

  // Faster base rotation + stronger level influence
  const speed = 0.28 + level01 * 0.55;
  pointsRef.current.rotation.y += delta * speed;
  pointsRef.current.rotation.x += delta * speed * 0.28;

  // Subtle organic breath / pulse (very small so it stays elegant)
  const t = state.clock.elapsedTime;
  const breathe = 1 + Math.sin(t * (1.1 + level01 * 0.6)) * (0.018 + level01 * 0.012);
  pointsRef.current.scale.setScalar(breathe);
});

  return (
  <points ref={pointsRef}>
    <bufferGeometry>
      <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      <bufferAttribute attach="attributes-color" args={[colors, 3]} />
    </bufferGeometry>
    <shaderMaterial
      transparent
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      vertexShader={`
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          vAlpha = 0.85;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = 0.065 * (300.0 / -mv.z);   // slightly larger soft points
        }
      `}
      fragmentShader={`
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          float core = clamp(1.0 - d, 0.0, 1.0);
          // same soft glow formula as SoulOrb
          float a = pow(core, 2.1) + pow(core, 6.5) * 0.75;
          gl_FragColor = vec4(vColor, a * vAlpha);
        }
      `}
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

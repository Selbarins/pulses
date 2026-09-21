"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*  Config                                                                    */
/* -------------------------------------------------------------------------- */

const CORE_COUNT = 3400;
const RADIUS = 1.45;
const CAMERA_Z = 5.2;
const FOV = 45;

/* -------------------------------------------------------------------------- */
/*  Public types                                                              */
/* -------------------------------------------------------------------------- */

export type OrbVisualState = {
  energy: number; // 0–1  → brightness, density, heartbeat
  speed: number; // rotation / swirl multiplier
  stability: number; // 0–1  → flicker + glitch (low = chaos)
  vitality: number; // 0–1  → pink life pulses (opacity)
  wealth: number; // 0–1  → warm gold (opacity)
  focus: number; // 0–1  → blue, ordered orbits (opacity)
  momentum: number; // 0–1  → green streamers (opacity)
  discipline: number; // 0–1  → red, tight crystalline (opacity)
  debt?: boolean; // cold dark + muted red edge, sagging
};

const DEFAULT_STATE: OrbVisualState = {
  energy: 0.55,
  speed: 1,
  stability: 0.85,
  vitality: 0.2,
  wealth: 0.25,
  focus: 0.15,
  momentum: 0.2,
  discipline: 0.3,
  debt: false,
};

/** Handy for testing every look */
export const ORB_PRESETS: Record<string, OrbVisualState> = {
  dormant: {
    energy: 0.12,
    speed: 0.35,
    stability: 0.9,
    vitality: 0.05,
    wealth: 0.05,
    focus: 0.05,
    momentum: 0.05,
    discipline: 0.1,
  },
  calm: DEFAULT_STATE,
  thriving: {
    energy: 0.75,
    speed: 1.15,
    stability: 0.9,
    vitality: 0.9,
    wealth: 0.15,
    focus: 0.2,
    momentum: 0.3,
    discipline: 0.4,
  },
  prosperous: {
    energy: 0.75,
    speed: 1.1,
    stability: 0.9,
    vitality: 0.15,
    wealth: 0.95,
    focus: 0.2,
    momentum: 0.25,
    discipline: 0.4,
  },
  focused: {
    energy: 0.7,
    speed: 0.95,
    stability: 0.95,
    vitality: 0.15,
    wealth: 0.15,
    focus: 0.95,
    momentum: 0.2,
    discipline: 0.5,
  },
  driven: {
    energy: 0.8,
    speed: 1.7,
    stability: 0.85,
    vitality: 0.25,
    wealth: 0.2,
    focus: 0.25,
    momentum: 0.95,
    discipline: 0.4,
  },
  disciplined: {
    energy: 0.7,
    speed: 0.9,
    stability: 0.98,
    vitality: 0.15,
    wealth: 0.15,
    focus: 0.3,
    momentum: 0.2,
    discipline: 0.95,
  },
  radiant: {
    energy: 1,
    speed: 1.5,
    stability: 0.95,
    vitality: 0.7,
    wealth: 0.7,
    focus: 0.5,
    momentum: 0.6,
    discipline: 0.6,
  },
  unstable: {
    energy: 0.55,
    speed: 1.4,
    stability: 0.12,
    vitality: 0.35,
    wealth: 0.35,
    focus: 0.25,
    momentum: 0.4,
    discipline: 0.15,
  },
  indebted: {
    energy: 0.3,
    speed: 0.55,
    stability: 0.4,
    vitality: 0.2,
    wealth: 0.2,
    focus: 0.15,
    momentum: 0.15,
    discipline: 0.2,
    debt: true,
  },
};

export function getOrbMood(s: OrbVisualState): string {
  if (s.debt) return "Indebted";
  if (s.stability < 0.35) return "Unstable";
  if (s.energy < 0.22) return "Dormant";
  if (s.discipline > 0.7 && s.stability > 0.85) return "Disciplined";
  if (s.focus > 0.7) return "Focused";
  if (s.momentum > 0.7) return "Driven";
  if (s.vitality > 0.65 && s.wealth > 0.65) return "Radiant";
  if (s.vitality > 0.65) return "Thriving";
  if (s.wealth > 0.65) return "Prosperous";
  return "Calm";
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type RGB = [number, number, number];

const hexToRgb = (hex: string): RGB => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

const lerp3 = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

type Uniforms = Record<string, THREE.IUniform>;

const makeSharedUniforms = (): Uniforms => ({
  uTime: { value: 0 },
  uSpin: { value: 0 },
  uEnergy: { value: 0.5 },
  uStability: { value: 1 },
  uVitality: { value: 0 },
  uWealth: { value: 0 },
  uFocus: { value: 0 },
  uMomentum: { value: 0 },
  uDiscipline: { value: 0 },
  uDebt: { value: 0 },
  uGlitch: { value: 0 },
  uScale: { value: 1000 },
  uSize: { value: 0.058 },
});

/* -------------------------------------------------------------------------- */
/*  Shaders                                                                   */
/* -------------------------------------------------------------------------- */

const GLSL_COMMON = /* glsl */ `
  // Attribute color identities
  const vec3 IVORY   = vec3(0.96, 0.90, 0.78); // base healthy
  const vec3 GOLD    = vec3(1.00, 0.78, 0.22); // Wealth
  const vec3 PINK    = vec3(1.00, 0.42, 0.72); // Vitality
  const vec3 BLUE    = vec3(0.35, 0.62, 1.00); // Focus
  const vec3 GREEN   = vec3(0.25, 0.95, 0.55); // Momentum
  const vec3 RED     = vec3(1.00, 0.28, 0.32); // Discipline
  const vec3 DEBT    = vec3(0.48, 0.10, 0.12); // Debt core
  const vec3 COLD    = vec3(0.38, 0.48, 0.62); // Debt cold
  const vec3 EMBER   = vec3(0.95, 0.22, 0.14); // Debt edge
  const float PI = 3.14159265;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 rotY(vec3 p, float a) {
    float c = cos(a), s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }
`;

const CORE_VERT = /* glsl */ `
  uniform float uTime, uEnergy, uStability, uVitality, uWealth, uFocus, uMomentum, uDiscipline, uDebt, uGlitch, uScale, uSize;
  attribute vec3 aColor;
  attribute vec4 aRand;   // x: fixed role slot, y: speed/size, z: phase, w: hash
  varying vec3 vColor;
  varying float vAlpha;
  ${GLSL_COMMON}

  void main() {
    vec3 pos = position;
    vec3 dir = normalize(pos);
    float r = length(position);

    // instability 0 (stable) → 1 (chaos)
    float fl = smoothstep(0.12, 0.88, 1.0 - uStability);

    // ---- FIXED equal slots (1/5 each attribute) ----------------------------
    // aRand.x is [0,1) → 5 equal buckets, independent of levels
    float slot = floor(aRand.x * 5.0); // 0 wealth, 1 vitality, 2 focus, 3 momentum, 4 discipline
    float isWealth     = step(0.5, 1.0 - abs(slot - 0.0));
    float isVitality   = step(0.5, 1.0 - abs(slot - 1.0));
    float isFocus      = step(0.5, 1.0 - abs(slot - 2.0));
    float isMomentum   = step(0.5, 1.0 - abs(slot - 3.0));
    float isDiscipline = step(0.5, 1.0 - abs(slot - 4.0));

    // opacity of this group = attribute level (debt mutes all)
    float mute = 1.0 - uDebt * 0.7;
    float groupLevel =
        isWealth     * uWealth * mute +
        isVitality   * uVitality * mute +
        isFocus      * uFocus * mute +
        isMomentum   * uMomentum * mute +
        isDiscipline * uDiscipline * mute;

    // base soft ivory when group is weak; attribute color when strong
    vec3 attrCol =
        isWealth     * GOLD +
        isVitality   * PINK +
        isFocus      * BLUE +
        isMomentum   * GREEN +
        isDiscipline * RED;

    // level fully controls presence — 0 = that attribute slot is off
    float intensity = groupLevel;             // 0 → no contribution
    vec3 col = attrCol;
    
    float size = uSize * (0.62 + aRand.y * 0.95) * (0.72 + uEnergy * 0.55);
    float bright = (0.4 + uEnergy * 0.4) * intensity;

    // heartbeat (energy-driven)
    float heart = 0.5 + 0.5 * sin(uTime * (0.9 + uEnergy * 2.4));
    bright *= 0.88 + heart * 0.28 * uEnergy;

            // ---- per-attribute motion (now affects all particles by level) ----------
    float motion = groupLevel; // still used for color intensity of this particle's slot

    // Momentum → liquid flow (tangential) — strongest visual driver
    {
      vec3 tang = normalize(cross(dir, vec3(0.0, 1.0, 0.0) + dir * 0.008));
      float flow = 0.5 + 0.5 * sin(uTime * (1.7 + uMomentum * 1.6) + aRand.z * 5.5 + pos.y * 1.6);
      pos += tang * flow * 0.078 * uMomentum;
    }

    // Vitality → organic breath (radial)
    {
      float breath = 0.5 + 0.5 * sin(uTime * (1.25 + uEnergy * 0.5) + aRand.z * 2.0 - pos.y * 2.6);
      pos += dir * breath * 0.042 * uVitality;
    }

    // Wealth → limited filaments (outward stretch)
    {
      float filament = 0.5 + 0.5 * sin(uTime * (0.8 + aRand.y * 1.4) + aRand.z * 16.0);
      float stretch = 1.0 + filament * 0.09 * uWealth;
      pos *= stretch;
    }

    // Focus → soft geometric pull toward clean surface
    {
      pos = mix(pos, dir * r, 0.11 * uFocus);
    }

    // Discipline → soft ordered cloud (gentle lock toward original radius)
    {
      pos = mix(pos, dir * r, 0.16 * uDiscipline);
    }

    // Slot-specific extra brightness / size (keeps color identity strong)
    if (isWealth > 0.5) {
      float sp = pow(max(0.0, sin(uTime * (1.5 + aRand.y * 3.5) + aRand.z * 40.0)), 5.0);
      bright += sp * 1.1 * motion;
      size  *= 1.0 + (0.3 + sp * 1.2) * motion;
    } else if (isVitality > 0.5) {
      float wave = 0.5 + 0.5 * sin(uTime * 1.5 - pos.y * 3.0 + aRand.z);
      bright += wave * 0.85 * motion;
      size  *= 1.0 + (0.35 + wave * 0.7) * motion;
    } else if (isFocus > 0.5) {
      float lattice = 0.5 + 0.5 * sin(uTime * 1.0 + pos.x * 3.8 + aRand.z);
      bright += lattice * 0.5 * motion;
      size  *= 1.0 + (0.18 + lattice * 0.35) * motion;
    } else if (isMomentum > 0.5) {
      float stream = 0.5 + 0.5 * sin(uTime * 2.0 + aRand.z * 7.0);
      bright += stream * 0.75 * motion;
      size  *= 1.0 + (0.25 + stream * 0.6) * motion;
    } else if (isDiscipline > 0.5) {
      float calm = 0.5 + 0.5 * sin(uTime * 0.65 + aRand.z * 8.0);
      bright += calm * 0.35 * motion;
      size  *= 1.0 + (0.12 + calm * 0.25) * motion;
    }

    // ---- global tightness (softer ordered cloud) ---------------------------
    float tight = 1.0 - uDiscipline * 0.08 + fl * 0.17 + uDebt * 0.11;
    pos *= tight;

    // ---- Debt: cold dark + muted red edge, sagging -------------------------
    float debtRole = step(aRand.w, 0.58);
    col = mix(col, COLD, uDebt * 0.4);
    col = mix(col, DEBT, uDebt * 0.88 * debtRole);
    float spark = step(0.97, aRand.y) * uDebt;
    col = mix(col, EMBER, spark);
    bright = mix(bright, 1.5 * (0.55 + 0.45 * sin(uTime * 1.4 + aRand.z * 18.0)), spark);
    bright *= 1.0 - uDebt * 0.4;
    // Clearly broken: sag + high-frequency jitter + occasional displacement
    pos.y -= uDebt * 0.16 * (0.3 + aRand.y);
    pos *= 1.0 - uDebt * 0.09;
    pos += (vec3(
      hash(vec2(aRand.w, uTime * 3.1)),
      hash(vec2(aRand.w + 1.3, uTime * 3.1)),
      hash(vec2(aRand.w + 2.7, uTime * 3.1))
    ) - 0.5) * uDebt * 0.07;

    // ---- opacity: slot vanishes when its attribute is 0 --------------------
    float energyDrop = smoothstep(0.35, 0.0, uEnergy);
    float alpha = (0.10 + uEnergy * 0.30) * (0.08 + groupLevel * 0.92);
    alpha *= 1.0 - energyDrop * 0.5 * step(aRand.y, 0.55);

    // instability: dropout + jitter + glitch
    float tick = floor(uTime * (6.0 + aRand.y * 14.0));
    float gate = hash(vec2(aRand.w * 91.7 + aRand.z * 13.1, tick));
    float dropped = step(gate, fl * 0.72);
    alpha *= mix(1.0, 0.04 + gate * 0.28, dropped);
    alpha *= 1.0 - fl * 0.38 * (0.5 + 0.5 * sin(uTime * 22.0 + aRand.z * 28.0));
    alpha *= 1.0 - uGlitch * 0.88;
    alpha *= 1.0 - uDebt * 0.32;

    vec3 jit = vec3(
      hash(vec2(aRand.w, tick + 1.0)),
      hash(vec2(aRand.w, tick + 2.0)),
      hash(vec2(aRand.w, tick + 3.0))
    ) - 0.5;
    pos += jit * (fl * 0.055 + uGlitch * 0.2);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uScale / -mv.z;

    float depth = clamp((-mv.z - 3.75) / 3.0, 0.0, 1.0);
    vColor = col * bright;
    vAlpha = alpha * mix(1.0, 0.48, depth);
  }
`;

const CORE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = clamp(1.0 - d, 0.0, 1.0);
    float a = pow(core, 2.1) + pow(core, 6.5) * 0.75;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                  */
/* -------------------------------------------------------------------------- */

function buildCore() {
  const positions = new Float32Array(CORE_COUNT * 3);
  const colors = new Float32Array(CORE_COUNT * 3);
  const rand = new Float32Array(CORE_COUNT * 4);

  const cCore = hexToRgb("#FFFFFF");
  const cMid  = hexToRgb("#FFFFFF");
  const cEdge = hexToRgb("#FFFFFF");

  for (let i = 0; i < CORE_COUNT; i++) {
    const t = i / CORE_COUNT;
    const incl = Math.acos(1 - 2 * t);
    const azim = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = RADIUS * (0.68 + Math.random() * 0.32);

    positions[i * 3] = r * Math.sin(incl) * Math.cos(azim);
    positions[i * 3 + 1] = r * Math.sin(incl) * Math.sin(azim);
    positions[i * 3 + 2] = r * Math.cos(incl);

    const mix = r / RADIUS;
    let c = lerp3(cCore, cMid, mix * 0.6);
    c = lerp3(c, cEdge, Math.max(0, mix - 0.7) * 2);
    colors.set(c, i * 3);

    for (let k = 0; k < 4; k++) rand[i * 4 + k] = Math.random();
  }
  return { positions, colors, rand };
}

/* -------------------------------------------------------------------------- */
/*  Layers                                                                    */
/* -------------------------------------------------------------------------- */

function CorePoints({ uniforms }: { uniforms: Uniforms }) {
  const { positions, colors, rand } = useMemo(buildCore, []);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    u.uTime.value = uniforms.uTime.value;
    u.uSpin.value = uniforms.uSpin.value;
    u.uEnergy.value = uniforms.uEnergy.value;
    u.uStability.value = uniforms.uStability.value;
    u.uVitality.value = uniforms.uVitality.value;
    u.uWealth.value = uniforms.uWealth.value;
    u.uFocus.value = uniforms.uFocus.value;
    u.uMomentum.value = uniforms.uMomentum.value;
    u.uDiscipline.value = uniforms.uDiscipline.value;
    u.uDebt.value = uniforms.uDebt.value;
    u.uGlitch.value = uniforms.uGlitch.value;
    u.uScale.value = uniforms.uScale.value;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
        <bufferAttribute attach="attributes-aRand" args={[rand, 4]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={CORE_VERT}
        fragmentShader={CORE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene                                                                     */
/* -------------------------------------------------------------------------- */

  function OrbScene({ state }: { state: OrbVisualState }) {
  const orbRef = useRef<THREE.Group>(null);
  const uniforms = useMemo(makeSharedUniforms, []);
  const pulse = useRef(0);
  const glitch = useRef(0);

  // always the latest props
  const stateRef = useRef(state);
  stateRef.current = state;

  const cur = useRef({
    energy: state.energy,
    speed: state.speed,
    stability: state.stability,
    vitality: state.vitality,
    wealth: state.wealth,
    focus: state.focus,
    momentum: state.momentum,
    discipline: state.discipline,
    debt: state.debt ? 1 : 0,
  });

  useFrame((rs, delta) => {
    const dt = Math.min(delta, 0.05);
    const c = cur.current;
    const s = stateRef.current; // ← latest, not stale
    const damp = THREE.MathUtils.damp;

    c.energy = damp(c.energy, clamp01(s.energy), 2.5, dt);
    c.speed = damp(c.speed, s.speed, 2.5, dt);
    c.stability = damp(c.stability, clamp01(s.stability), 3, dt);
    c.vitality = damp(c.vitality, clamp01(s.vitality), 2.5, dt);
    c.wealth = damp(c.wealth, clamp01(s.wealth), 2.5, dt);
    c.focus = damp(c.focus, clamp01(s.focus), 2.5, dt);
    c.momentum = damp(c.momentum, clamp01(s.momentum), 2.5, dt);
    c.discipline = damp(c.discipline, clamp01(s.discipline), 2.5, dt);
    c.debt = damp(c.debt, s.debt ? 1 : 0, 2, dt);

    const instab = 1 - c.stability;
    if (Math.random() < instab * instab * 0.08 * dt * 60) {
      glitch.current = 0.5 + Math.random() * 0.5;
    }
    glitch.current = Math.max(0, glitch.current - dt * 5);

    const u = uniforms;
    u.uTime.value += dt;
    u.uSpin.value += dt * c.speed;
    u.uEnergy.value     = c.energy;
    u.uStability.value = c.stability;
    u.uVitality.value  = c.vitality;
    u.uWealth.value    = c.wealth;
    u.uFocus.value     = c.focus;
    u.uMomentum.value  = c.momentum;
    u.uDiscipline.value = c.discipline;
    u.uDebt.value = c.debt;
    u.uGlitch.value = glitch.current;
    u.uScale.value =
      (rs.size.height * rs.gl.getPixelRatio()) /
      (2 * Math.tan(THREE.MathUtils.degToRad(FOV) / 2));

    pulse.current += dt * (0.85 + c.energy * 1.7 + c.momentum * 0.4);
    const g = orbRef.current;
    if (g) {
      g.rotation.y += dt * (0.14 + c.momentum * 0.12) * c.speed;
      g.rotation.x += dt * 0.045 * c.speed;

      const base = 0.93 + c.energy * 0.09 - c.debt * 0.06 - c.discipline * 0.02;
      const breatheAmp = 0.01 + c.energy * 0.022 + c.vitality * 0.012;
      const breathe = 1 + Math.sin(pulse.current) * breatheAmp;
      g.scale.setScalar(base * breathe);

      const shake = glitch.current * 0.032;
      g.position.set((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake, 0);
    }
  });

  return (
    <group ref={orbRef}>
      <CorePoints uniforms={uniforms} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

interface SoulOrbProps {
  state?: OrbVisualState;
  showMood?: boolean;
}

export default function SoulOrb({ state = DEFAULT_STATE, showMood = false }: SoulOrbProps) {
  return (
    <div className="relative w-full h-[380px] md:h-[480px]">
      <Canvas
        camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#0B0D10"]} />
        <OrbScene state={state} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.32 * (state?.speed ?? 1)}
        />
      </Canvas>

      {showMood && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/50">
          {getOrbMood(state)}
        </div>
      )}
    </div>
  );
}

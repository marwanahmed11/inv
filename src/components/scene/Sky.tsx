"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { sceneTime } from "./time";

/**
 * 0 = sunset, 1 = night. Sunset holds for a few seconds after the scene
 * appears, then dusk falls over ~22s. Reduced motion shows the night at once.
 */
export function nightAmount(elapsed: number, reduceMotion: boolean) {
  if (reduceMotion) return 1;
  const x = Math.min(Math.max((elapsed - 9) / 22, 0), 1);
  return x * x * (3 - 2 * x);
}

const SKY_W = 20;
const SKY_H = 12;
const SKY_Y = 2.6;
const SKY_Z = -5;

const skyVert = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Gradient sky that fades softly at its edges into the page's wine background.
const skyFrag = /* glsl */ `
uniform float uNight;
uniform vec2 uRes;
varying vec2 vUv;
void main() {
  float y = vUv.y;
  vec3 sLow = vec3(1.00, 0.74, 0.58);
  vec3 sMid = vec3(0.86, 0.42, 0.42);
  vec3 sTop = vec3(0.40, 0.07, 0.13);
  vec3 nLow = vec3(0.36, 0.12, 0.20);
  vec3 nMid = vec3(0.17, 0.05, 0.12);
  vec3 nTop = vec3(0.07, 0.03, 0.08);
  vec3 sun = mix(mix(sLow, sMid, smoothstep(0.18, 0.5, y)), sTop, smoothstep(0.45, 0.95, y));
  vec3 night = mix(mix(nLow, nMid, smoothstep(0.18, 0.5, y)), nTop, smoothstep(0.45, 0.95, y));
  vec3 col = mix(sun, night, uNight);
  // Fade in screen space so the sky never shows the canvas's rectangular edge.
  vec2 s = gl_FragCoord.xy / uRes;
  vec2 c = (s - vec2(0.5, 0.55)) * vec2(1.0, 1.05);
  float a = 1.0 - smoothstep(0.18, 0.5, length(c));
  gl_FragColor = vec4(col, a * 0.92);
}`;

const starVert = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uNight;
uniform float uPix;
varying float vA;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  vec2 ndc = gl_Position.xy / gl_Position.w;
  float edge = 1.0 - smoothstep(0.35, 0.95, length(ndc - vec2(0.0, 0.1)));
  float low = smoothstep(${(SKY_Y - 2.4).toFixed(1)}, ${(SKY_Y + 0.6).toFixed(1)}, position.y);
  vA = uNight * edge * low * (0.55 + 0.45 * sin(uTime * (0.8 + aSeed * 1.6) + aSeed * 40.0));
  gl_PointSize = (1.2 + aSeed * 2.4) * uPix;
}`;

const starFrag = /* glsl */ `
varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, r) * vA;
  gl_FragColor = vec4(1.0, 0.95, 0.88, a);
}`;

// Crescent: a disc minus an offset disc, with a faint halo.
const moonFrag = /* glsl */ `
uniform float uNight;
varying vec2 vUv;
void main() {
  vec2 p = vUv - 0.5;
  float d1 = length(p);
  float d2 = length(p - vec2(0.085, 0.06));
  float disc = 1.0 - smoothstep(0.17, 0.18, d1);
  float bite = 1.0 - smoothstep(0.15, 0.16, d2);
  float crescent = disc * (1.0 - bite);
  float halo = exp(-d1 * 9.0) * 0.35 * (1.0 - bite * 0.6);
  float a = (crescent + halo) * uNight;
  gl_FragColor = vec4(vec3(1.0, 0.95, 0.86), a);
}`;

export default function Sky({ quality, reduceMotion }: { quality: "high" | "low"; reduceMotion: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const moon = useRef<THREE.Mesh>(null);

  const skyU = useMemo(() => ({ uNight: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } }), []);
  const moonU = useMemo(() => ({ uNight: { value: 0 } }), []);
  const starU = useMemo(() => ({ uNight: { value: 0 }, uTime: { value: 0 }, uPix: { value: 1 } }), []);

  const stars = useMemo(() => {
    const n = quality === "high" ? 260 : 110;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    let s = 11;
    const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (r() - 0.5) * SKY_W * 0.9;
      pos[i * 3 + 1] = SKY_Y + (r() - 0.25) * SKY_H * 0.7;
      pos[i * 3 + 2] = SKY_Z + 0.05;
      seed[i] = r();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [quality]);

  useFrame((state) => {
    const n = nightAmount(sceneTime(), reduceMotion);
    skyU.uNight.value = n;
    state.gl.getDrawingBufferSize(skyU.uRes.value);
    moonU.uNight.value = n;
    starU.uNight.value = n;
    starU.uTime.value = reduceMotion ? 0 : state.clock.elapsedTime;
    starU.uPix.value = dpr;
    // The moon rises slowly as dusk falls.
    if (moon.current) moon.current.position.y = THREE.MathUtils.lerp(4.0, 5.0, n);
  });

  const common = { transparent: true, depthWrite: false, toneMapped: false, fog: false } as const;
  return (
    <group renderOrder={-10}>
      <mesh position={[0, SKY_Y, SKY_Z]} renderOrder={-10}>
        <planeGeometry args={[SKY_W, SKY_H]} />
        <shaderMaterial vertexShader={skyVert} fragmentShader={skyFrag} uniforms={skyU} {...common} />
      </mesh>
      <points geometry={stars} renderOrder={-9}>
        <shaderMaterial vertexShader={starVert} fragmentShader={starFrag} uniforms={starU} {...common} />
      </points>
      <mesh ref={moon} position={[-3.1, 4.0, SKY_Z + 0.1]} renderOrder={-9}>
        <planeGeometry args={[1.7, 1.7]} />
        <shaderMaterial vertexShader={skyVert} fragmentShader={moonFrag} uniforms={moonU} {...common} />
      </mesh>
    </group>
  );
}

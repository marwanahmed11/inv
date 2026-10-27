"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { invitation } from "@/config/invitation";

const { palette } = invitation;

const POST_H = 2.15;
const R = 1.7;
const TOP_Y = POST_H;

/** Deterministic PRNG so the arch looks identical on every load. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Position along the arch path: left post up, over the arc, right post down. t in [0,1]. */
function pathPoint(t: number): { p: THREE.Vector3; n: THREE.Vector3 } {
  const postLen = POST_H;
  const arcLen = Math.PI * R;
  const total = postLen * 2 + arcLen;
  const d = t * total;
  if (d < postLen) return { p: new THREE.Vector3(-R, d, 0), n: new THREE.Vector3(-1, 0, 0) };
  if (d < postLen + arcLen) {
    const a = Math.PI - ((d - postLen) / arcLen) * Math.PI;
    return {
      p: new THREE.Vector3(Math.cos(a) * R, TOP_Y + Math.sin(a) * R, 0),
      n: new THREE.Vector3(Math.cos(a), Math.sin(a), 0),
    };
  }
  return { p: new THREE.Vector3(R, postLen - (d - postLen - arcLen), 0), n: new THREE.Vector3(1, 0, 0) };
}

/** Warm fairy lights draped in soft swags along the front of the arch, gently twinkling. */
function FairyLights({ count, still }: { count: number; still: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const color = useMemo(() => new THREE.Color(), []);
  const bulbs = useMemo(() => {
    const swags = 9;
    return Array.from({ length: count }, (_, i) => {
      const t = 0.02 + (i / (count - 1)) * 0.96;
      const { p, n } = pathPoint(t);
      const sag = Math.abs(Math.sin(t * swags * Math.PI)) * 0.16;
      return { pos: p.clone().addScaledVector(n, -sag).add(new THREE.Vector3(0, 0, 0.16)), phase: i * 1.7 };
    });
  }, [count]);

  useLayoutEffect(() => {
    const m = ref.current!;
    const mat = new THREE.Matrix4();
    bulbs.forEach((b, i) => {
      mat.makeTranslation(b.pos.x, b.pos.y, b.pos.z);
      m.setMatrixAt(i, mat);
      m.setColorAt(i, color.setScalar(1));
    });
    m.instanceMatrix.needsUpdate = true;
    m.instanceColor!.needsUpdate = true;
  }, [bulbs, color]);

  useFrame((state) => {
    const m = ref.current;
    if (!m || still) return;
    const t = state.clock.elapsedTime;
    bulbs.forEach((b, i) => {
      const k = 0.65 + 0.35 * Math.sin(t * 1.6 + b.phase) * Math.sin(t * 0.7 + b.phase * 0.3);
      m.setColorAt(i, color.setScalar(k));
    });
    m.instanceColor!.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.022, 8, 6]} />
      <meshBasicMaterial color="#ffd7a3" toneMapped={false} />
    </instancedMesh>
  );
}

export default function Arch({ quality, reduceMotion = false }: { quality: "high" | "low"; reduceMotion?: boolean }) {
  const high = quality === "high";
  const petals = useRef<THREE.InstancedMesh>(null);
  const centers = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const r = rng(42);
    const flowers: { pos: THREE.Vector3; s: number; rot: THREE.Euler }[] = [];
    const leafList: { pos: THREE.Vector3; rot: THREE.Euler; s: number }[] = [];
    const nFlowers = high ? 64 : 34;
    const nLeaves = high ? 190 : 80;

    for (let i = 0; i < nLeaves; i++) {
      const t = r();
      // Foliage is fuller toward the top and the outer-left, lighter near the feet.
      const { p, n } = pathPoint(t);
      const q = p.clone().addScaledVector(n, (r() - 0.35) * 0.2);
      q.z += (r() - 0.5) * 0.25;
      leafList.push({
        pos: q,
        rot: new THREE.Euler(r() * 3, r() * 3, r() * 3),
        s: 0.7 + r() * 0.7,
      });
    }
    for (let i = 0; i < nFlowers; i++) {
      // Cluster near the crown and on the left side for an asymmetric, natural feel.
      const bias = r();
      let t = bias < 0.55 ? 0.28 + r() * 0.44 : bias < 0.8 ? r() * 0.3 : 0.6 + r() * 0.4;
      t = Math.min(Math.max(t, 0.04), 0.98);
      const { p, n } = pathPoint(t);
      const q = p.clone().addScaledVector(n, (r() - 0.4) * 0.22);
      q.z += (r() - 0.35) * 0.3;
      flowers.push({
        pos: q,
        s: 0.55 + r() * 0.65,
        rot: new THREE.Euler((r() - 0.5) * 0.9, (r() - 0.5) * 0.9, r() * 6),
      });
    }
    return { flowers, leafList };
  }, [high]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const sc = new THREE.Vector3();
    const pm = petals.current!;
    const cm = centers.current!;
    const lm = leaves.current!;
    const PET = 6;
    data.flowers.forEach((f, i) => {
      const fq = new THREE.Quaternion().setFromEuler(f.rot);
      for (let k = 0; k < PET; k++) {
        const a = (k / PET) * Math.PI * 2;
        const local = new THREE.Vector3(Math.cos(a) * 0.075 * f.s, Math.sin(a) * 0.075 * f.s, 0).applyQuaternion(fq);
        const pq = fq.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, a)));
        sc.set(1.0 * f.s, 0.62 * f.s, 0.26 * f.s);
        m.compose(f.pos.clone().add(local), pq, sc);
        pm.setMatrixAt(i * PET + k, m);
      }
      sc.setScalar(f.s);
      m.compose(f.pos.clone().add(new THREE.Vector3(0, 0, 0.02).applyQuaternion(fq)), q.identity(), sc);
      cm.setMatrixAt(i, m);
    });
    data.leafList.forEach((l, i) => {
      const lq = new THREE.Quaternion().setFromEuler(l.rot);
      sc.set(0.5 * l.s, 1.3 * l.s, 0.12 * l.s);
      m.compose(l.pos, lq, sc);
      lm.setMatrixAt(i, m);
    });
    [pm, cm, lm].forEach((x) => (x.instanceMatrix.needsUpdate = true));
  }, [data]);

  const segs = high ? 96 : 48;
  return (
    <group position={[0, 0.18, -0.6]}>
      {/* posts and arc in brushed rose */}
      {[-R, R].map((x) => (
        <mesh key={x} position={[x, POST_H / 2, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.055, POST_H, 20]} />
          <meshStandardMaterial color={palette.rose} metalness={0.85} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0, TOP_Y, 0]} castShadow>
        <torusGeometry args={[R, 0.05, 16, segs, Math.PI]} />
        <meshStandardMaterial color={palette.rose} metalness={0.85} roughness={0.35} />
      </mesh>
      {/* base feet */}
      {[-R, R].map((x) => (
        <mesh key={`f${x}`} position={[x, 0.03, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.06, 24]} />
          <meshStandardMaterial color={palette.rose} metalness={0.85} roughness={0.35} />
        </mesh>
      ))}

      <instancedMesh ref={leaves} args={[undefined, undefined, data.leafList.length]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#6F8460" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={petals} args={[undefined, undefined, data.flowers.length * 6]} frustumCulled={false}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshStandardMaterial color={palette.ivory} roughness={0.7} emissive="#3b3426" emissiveIntensity={0.12} />
      </instancedMesh>
      <instancedMesh ref={centers} args={[undefined, undefined, data.flowers.length]} frustumCulled={false}>
        <sphereGeometry args={[0.045, 10, 8]} />
        <meshStandardMaterial color={palette.rose} metalness={0.6} roughness={0.4} />
      </instancedMesh>

      <FairyLights count={high ? 90 : 50} still={reduceMotion} />
    </group>
  );
}

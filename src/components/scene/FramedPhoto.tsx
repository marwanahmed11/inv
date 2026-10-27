"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { invitation } from "@/config/invitation";

const { palette, photo } = invitation;

/** Arch-shaped outline (rounded top, flat base) centered on the origin. */
function archShape(w: number, h: number) {
  const r = w / 2;
  const s = new THREE.Shape();
  s.moveTo(-r, -h / 2);
  s.lineTo(r, -h / 2);
  s.lineTo(r, h / 2 - r);
  s.absarc(0, h / 2 - r, r, 0, Math.PI, false);
  s.lineTo(-r, -h / 2);
  return s;
}

/** Map shape-space positions to 0..1 UVs so the photo fills the arch. */
function fitUvs(geo: THREE.BufferGeometry, w: number, h: number) {
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / w + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / h + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** The couple's photo in an arched rose-gold frame, standing on a small easel. */
export default function FramedPhoto() {
  const tex = useTexture(photo.src);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const W = 0.82;
  const H = W * photo.aspect;
  const { picture, frame } = useMemo(() => {
    const picture = fitUvs(new THREE.ShapeGeometry(archShape(W, H), 32), W, H);
    const frame = new THREE.ExtrudeGeometry(archShape(W + 0.07, H + 0.07), {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2,
      curveSegments: 32,
    });
    return { picture, frame };
  }, [H]);

  const metal = { color: palette.rose, metalness: 0.85, roughness: 0.3 };
  return (
    <group position={[2.1, 0.18, 1.1]} rotation={[0, -0.45, 0]}>
      {/* easel legs */}
      {[-0.2, 0.2].map((x) => (
        <mesh key={x} position={[x, 0.55, -0.02]} rotation={[0.12, 0, x > 0 ? -0.1 : 0.1]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 1.15, 8]} />
          <meshStandardMaterial {...metal} />
        </mesh>
      ))}
      <mesh position={[0, 0.5, -0.22]} rotation={[-0.32, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.016, 1.05, 8]} />
        <meshStandardMaterial {...metal} />
      </mesh>
      <mesh position={[0, 0.5, 0.03]}>
        <boxGeometry args={[0.5, 0.025, 0.06]} />
        <meshStandardMaterial {...metal} />
      </mesh>

      <group position={[0, 0.5 + H / 2 + 0.04, 0.02]} rotation={[-0.1, 0, 0]}>
        <mesh geometry={frame} position={[0, 0, -0.035]} castShadow>
          <meshStandardMaterial {...metal} />
        </mesh>
        <mesh geometry={picture} position={[0, 0, 0.012]}>
          <meshStandardMaterial map={tex} roughness={0.75} />
        </mesh>
      </group>
    </group>
  );
}

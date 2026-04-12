'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ============================================
   CENTRAL HOLOGRAM — Visible, Glowing, Alive
   The core visual centerpiece of the desktop.
   ============================================ */
export default function CentralHologram() {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerWireRef = useRef<THREE.Mesh>(null);
  const outerWireRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.5 + Math.random() * 0.8;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const isCyan = Math.random() > 0.3;
      colors[i * 3] = isCyan ? 0 : 0.48;
      colors[i * 3 + 1] = isCyan ? 0.83 : 0.18;
      colors[i * 3 + 2] = 1;
    }
    return { pos, colors };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core: slow rotation + breathing scale
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.2;
      coreRef.current.rotation.y = t * 0.15;
      const s = 1 + Math.sin(t * 0.8) * 0.06;
      coreRef.current.scale.setScalar(s);
    }

    // Inner wireframe: counter-rotation
    if (innerWireRef.current) {
      innerWireRef.current.rotation.x = -t * 0.15;
      innerWireRef.current.rotation.z = t * 0.22;
    }

    // Outer wireframe: slow orbit
    if (outerWireRef.current) {
      outerWireRef.current.rotation.y = t * 0.08;
      outerWireRef.current.rotation.z = -t * 0.06;
    }

    // Glow: breathing opacity
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(t * 0.5) * 0.08;
    }

    // Pulse ring: expanding ring
    if (pulseRingRef.current) {
      const pulse = (t * 0.3) % 1;
      pulseRingRef.current.scale.setScalar(0.8 + pulse * 0.6);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.3 * (1 - pulse);
    }

    // Particles: slow orbit
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.05;
      particlesRef.current.rotation.x = Math.sin(t * 0.1) * 0.15;
    }
  });

  return (
    <group>
      {/* ── SOLID GLOWING CORE ── */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.28, 3]} />
        <meshStandardMaterial
          color="#00D4FF"
          emissive="#00D4FF"
          emissiveIntensity={0.6}
          transparent
          opacity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* ── BRIGHT INNER WIREFRAME ── */}
      <mesh ref={innerWireRef}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.35} wireframe />
      </mesh>

      {/* ── VISIBLE OUTER WIREFRAME ── */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.2} wireframe />
      </mesh>

      {/* ── GLOW SPHERE (visible!) ── */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>

      {/* ── PULSE RING ── */}
      <mesh ref={pulseRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.008, 8, 64]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} />
      </mesh>

      {/* ── ORBITING PARTICLES ── */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* ── BRIGHT CENTER LIGHT ── */}
      <pointLight color="#00D4FF" intensity={1.5} distance={10} />
      <pointLight color="#7B2FFF" intensity={0.4} distance={6} position={[0, 1, 0]} />
    </group>
  );
}

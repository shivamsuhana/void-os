'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══════════════════════════════════════════
   CENTRAL HOLOGRAM — Enhanced multi-layer core
   Breathing icosahedron + wireframe shells +
   energy tendrils + orbiting particles + pulse rings
   ═══════════════════════════════════════════ */
export default function CentralHologram() {
  const coreRef = useRef<THREE.Mesh>(null);
  const innerWireRef = useRef<THREE.Mesh>(null);
  const outerWireRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const pulseRing1Ref = useRef<THREE.Mesh>(null);
  const pulseRing2Ref = useRef<THREE.Mesh>(null);
  const pulseRing3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const dodecRef = useRef<THREE.Mesh>(null);
  const tendrilRef = useRef<THREE.Points>(null);
  const innerGlowRef = useRef<THREE.Mesh>(null);

  // Orbiting particle cloud
  const particleData = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.3 + Math.random() * 1.2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sizes[i] = 0.01 + Math.random() * 0.025;
      const choice = Math.random();
      if (choice > 0.55) { colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1; }
      else if (choice > 0.25) { colors[i * 3] = 0.48; colors[i * 3 + 1] = 0.18; colors[i * 3 + 2] = 1; }
      else { colors[i * 3] = 0.22; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.08; }
    }
    return { pos, colors, sizes };
  }, []);

  // Energy tendrils — lines radiating outward
  const tendrilData = useMemo(() => {
    const count = 150;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.5 + Math.random() * 0.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core: rotation + breathing
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.2;
      coreRef.current.rotation.y = t * 0.15;
      const s = 1 + Math.sin(t * 0.8) * 0.1;
      coreRef.current.scale.setScalar(s);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(t * 1.2) * 0.3;
    }

    // Inner wireframe: counter-rotation
    if (innerWireRef.current) {
      innerWireRef.current.rotation.x = -t * 0.15;
      innerWireRef.current.rotation.z = t * 0.22;
      const s = 1 + Math.sin(t * 0.6 + 1) * 0.05;
      innerWireRef.current.scale.setScalar(s);
    }

    // Outer wireframe
    if (outerWireRef.current) {
      outerWireRef.current.rotation.y = t * 0.08;
      outerWireRef.current.rotation.z = -t * 0.06;
    }

    // Dodecahedron shield
    if (dodecRef.current) {
      dodecRef.current.rotation.x = t * 0.05;
      dodecRef.current.rotation.y = -t * 0.12;
      dodecRef.current.rotation.z = t * 0.03;
      const mat = dodecRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.04 + Math.sin(t * 0.3) * 0.03;
    }

    // Inner glow pulse
    if (innerGlowRef.current) {
      const mat = innerGlowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(t * 1.5) * 0.1;
      innerGlowRef.current.scale.setScalar(0.35 + Math.sin(t * 0.8) * 0.05);
    }

    // Glow breathing
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.1 + Math.sin(t * 0.5) * 0.06;
    }

    // Pulse rings — staggered
    const animateRing = (ref: React.RefObject<THREE.Mesh | null>, offset: number) => {
      if (!ref.current) return;
      const pulse = ((t * 0.25) + offset) % 1;
      ref.current.scale.setScalar(0.6 + pulse * 0.9);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.4 * (1 - pulse);
    };
    animateRing(pulseRing1Ref, 0);
    animateRing(pulseRing2Ref, 0.33);
    animateRing(pulseRing3Ref, 0.66);

    // Particles — complex orbit
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.06;
      particlesRef.current.rotation.x = Math.sin(t * 0.08) * 0.15;
      // Breathe particles in/out
      const geo = particlesRef.current.geometry;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < Math.min(30, pos.count); i++) {
        const idx = Math.floor(Math.random() * pos.count);
        const ox = pos.getX(idx), oy = pos.getY(idx), oz = pos.getZ(idx);
        const len = Math.sqrt(ox * ox + oy * oy + oz * oz);
        const breathe = 1 + Math.sin(t * 2 + idx * 0.01) * 0.05;
        if (len > 0.1) {
          pos.setXYZ(idx, ox / len * len * breathe, oy / len * len * breathe, oz / len * len * breathe);
        }
      }
      pos.needsUpdate = true;
    }

    // Tendrils pulse outward
    if (tendrilRef.current) {
      tendrilRef.current.rotation.y = -t * 0.03;
      tendrilRef.current.rotation.z = t * 0.02;
      const mat = tendrilRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.3 + Math.sin(t * 2) * 0.15;
      mat.size = 0.015 + Math.sin(t * 1.5) * 0.005;
    }
  });

  return (
    <group>
      {/* Inner glow orb — bright center */}
      <mesh ref={innerGlowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color="#00D4FF" transparent opacity={0.25}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </mesh>

      {/* Solid glowing core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.3, 3]} />
        <meshStandardMaterial
          color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.9}
          transparent opacity={0.6} roughness={0.1} metalness={0.95}
        />
      </mesh>

      {/* Inner wireframe */}
      <mesh ref={innerWireRef}>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.4} wireframe />
      </mesh>

      {/* Outer wireframe */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.22} wireframe />
      </mesh>

      {/* Dodecahedron shield */}
      <mesh ref={dodecRef}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial color="#39FF14" transparent opacity={0.05} wireframe />
      </mesh>

      {/* Glow sphere — outer atmosphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial
          color="#00D4FF" transparent opacity={0.1}
          side={THREE.BackSide} blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Triple pulse rings */}
      <mesh ref={pulseRing1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.01, 8, 64]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.35} />
      </mesh>
      <mesh ref={pulseRing2Ref} rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[0.55, 0.008, 8, 64]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.35} />
      </mesh>
      <mesh ref={pulseRing3Ref} rotation={[Math.PI / 3, -0.4, 0.2]}>
        <torusGeometry args={[0.55, 0.006, 8, 64]} />
        <meshBasicMaterial color="#39FF14" transparent opacity={0.35} />
      </mesh>

      {/* Energy tendrils */}
      <points ref={tendrilRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[tendrilData, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.015} color="#00D4FF" transparent opacity={0.4}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </points>

      {/* Orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.02} vertexColors transparent opacity={0.9}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </points>

      {/* Lights — brighter */}
      <pointLight color="#00D4FF" intensity={2.5} distance={14} />
      <pointLight color="#7B2FFF" intensity={0.8} distance={10} position={[0, 1, 0]} />
      <pointLight color="#39FF14" intensity={0.4} distance={7} position={[0, -1, 0]} />
      <pointLight color="#FFB800" intensity={0.2} distance={5} position={[1, 0, 0]} />
    </group>
  );
}

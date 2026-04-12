'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

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

  const particleData = useMemo(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.4 + Math.random() * 1.0;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const choice = Math.random();
      if (choice > 0.6) { colors[i * 3] = 0; colors[i * 3 + 1] = 0.83; colors[i * 3 + 2] = 1; } // cyan
      else if (choice > 0.3) { colors[i * 3] = 0.48; colors[i * 3 + 1] = 0.18; colors[i * 3 + 2] = 1; } // purple
      else { colors[i * 3] = 0.22; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.08; } // green
    }
    return { pos, colors };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Core: rotation + breathing
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.2;
      coreRef.current.rotation.y = t * 0.15;
      const s = 1 + Math.sin(t * 0.8) * 0.08;
      coreRef.current.scale.setScalar(s);
    }

    // Inner wireframe: counter-rotation
    if (innerWireRef.current) {
      innerWireRef.current.rotation.x = -t * 0.15;
      innerWireRef.current.rotation.z = t * 0.22;
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
    }

    // Glow breathing
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.12 + Math.sin(t * 0.5) * 0.06;
    }

    // Pulse rings — staggered
    const animateRing = (ref: React.RefObject<THREE.Mesh | null>, offset: number) => {
      if (!ref.current) return;
      const pulse = ((t * 0.25) + offset) % 1;
      ref.current.scale.setScalar(0.6 + pulse * 0.8);
      const mat = ref.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.35 * (1 - pulse);
    };
    animateRing(pulseRing1Ref, 0);
    animateRing(pulseRing2Ref, 0.33);
    animateRing(pulseRing3Ref, 0.66);

    // Particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.04;
      particlesRef.current.rotation.x = Math.sin(t * 0.08) * 0.12;
    }
  });

  return (
    <group>
      {/* Solid glowing core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.3, 3]} />
        <meshStandardMaterial
          color="#00D4FF" emissive="#00D4FF" emissiveIntensity={0.8}
          transparent opacity={0.55} roughness={0.15} metalness={0.9}
        />
      </mesh>

      {/* Inner wireframe */}
      <mesh ref={innerWireRef}>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.35} wireframe />
      </mesh>

      {/* Outer wireframe */}
      <mesh ref={outerWireRef}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.2} wireframe />
      </mesh>

      {/* Dodecahedron shield — extra geometry layer */}
      <mesh ref={dodecRef}>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshBasicMaterial color="#39FF14" transparent opacity={0.06} wireframe />
      </mesh>

      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>

      {/* Triple pulse rings — staggered */}
      <mesh ref={pulseRing1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.008, 8, 64]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} />
      </mesh>
      <mesh ref={pulseRing2Ref} rotation={[Math.PI / 2.5, 0.3, 0]}>
        <torusGeometry args={[0.55, 0.006, 8, 64]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.3} />
      </mesh>
      <mesh ref={pulseRing3Ref} rotation={[Math.PI / 3, -0.4, 0.2]}>
        <torusGeometry args={[0.55, 0.005, 8, 64]} />
        <meshBasicMaterial color="#39FF14" transparent opacity={0.3} />
      </mesh>

      {/* Orbiting particles — more! */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.02} vertexColors transparent opacity={0.85}
          blending={THREE.AdditiveBlending} depthWrite={false}
        />
      </points>

      {/* Lights — stronger */}
      <pointLight color="#00D4FF" intensity={2.0} distance={12} />
      <pointLight color="#7B2FFF" intensity={0.6} distance={8} position={[0, 1, 0]} />
      <pointLight color="#39FF14" intensity={0.3} distance={6} position={[0, -1, 0]} />
    </group>
  );
}

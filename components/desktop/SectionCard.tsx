'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Section } from '@/lib/store';

export interface SectionData {
  id: Section;
  label: string;
  ext: string;
  icon: string;
  color: string;
  desc: string;
  shortcut: string;
}

/* ============================================
   SECTION CARD — Solid, visible, dramaric hover
   ============================================ */
export default function SectionCard({ section, index, total, onSelect, hovered, onHover }: {
  section: SectionData;
  index: number;
  total: number;
  onSelect: (id: Section) => void;
  hovered: boolean;
  onHover: (id: Section | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const borderRef = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.0;

  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = clock.getElapsedTime();

    // Floating bob
    groupRef.current.position.y = Math.sin(t * 0.4 + index * 1.2) * 0.1;

    // Scale on hover
    const targetScale = hovered ? 1.15 : 1;
    meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.08;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.08;
    meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.08;

    // Border glow on hover
    if (borderRef.current) {
      const mat = borderRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity += ((hovered ? 0.6 : 0.15) - mat.opacity) * 0.1;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
      rotation={[0, -angle + Math.PI / 2, 0]}
    >
      {/* ── SOLID CARD BACKGROUND ── */}
      <mesh
        ref={meshRef}
        onClick={() => onSelect(section.id)}
        onPointerEnter={() => onHover(section.id)}
        onPointerLeave={() => onHover(null)}
      >
        <planeGeometry args={[1.6, 0.9]} />
        <meshStandardMaterial
          color={hovered ? section.color : '#0c0c18'}
          emissive={section.color}
          emissiveIntensity={hovered ? 0.15 : 0.02}
          transparent
          opacity={hovered ? 0.85 : 0.6}
          side={THREE.DoubleSide}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* ── TOP ACCENT LINE ── */}
      <mesh position={[0, 0.45, 0.01]}>
        <planeGeometry args={[1.6, 0.02]} />
        <meshBasicMaterial color={section.color} transparent opacity={hovered ? 1 : 0.6} />
      </mesh>

      {/* ── VISIBLE BORDER ── */}
      <mesh ref={borderRef} position={[0, 0, -0.01]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshBasicMaterial
          color={section.color}
          transparent
          opacity={0.15}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── HOVER GLOW ── */}
      {hovered && (
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[2.0, 1.2]} />
          <meshBasicMaterial color={section.color} transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* ── HTML LABEL ── */}
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', minWidth: '130px', textAlign: 'center',
        }}>
          {/* Icon — BIG and COLORED */}
          <div style={{
            fontSize: '28px', lineHeight: 1,
            color: hovered ? section.color : 'rgba(232,232,240,0.6)',
            transition: 'all 0.3s',
            textShadow: hovered ? `0 0 20px ${section.color}` : `0 0 6px ${section.color}40`,
            filter: hovered ? `drop-shadow(0 0 12px ${section.color})` : 'none',
          }}>
            {section.icon}
          </div>

          {/* Label — VISIBLE */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px', fontWeight: 700,
            letterSpacing: '3px',
            color: hovered ? '#fff' : 'rgba(232,232,240,0.6)',
            transition: 'all 0.3s',
            textShadow: hovered ? `0 0 10px ${section.color}80` : 'none',
          }}>
            {section.label}
          </div>

          {/* Extension */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px', letterSpacing: '1px',
            color: hovered ? section.color : 'rgba(232,232,240,0.3)',
            transition: 'color 0.3s',
          }}>
            {section.ext}
          </div>

          {/* Shortcut */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px', letterSpacing: '1px',
            color: 'rgba(232,232,240,0.2)',
            marginTop: '2px',
          }}>
            [{section.shortcut}]
          </div>
        </div>
      </Html>

      {/* ── CONNECTION LINE ── */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, -Math.cos(angle) * (radius - 1), 0, -Math.sin(angle) * (radius - 1)]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={section.color} transparent opacity={hovered ? 0.4 : 0.08} />
      </line>
    </group>
  );
}

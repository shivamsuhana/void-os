'use client';

import { useRef, useState, useMemo } from 'react';
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

const noRaycast = () => {};

/* ============================================
   SECTION CARD — Premium holographic panels
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
  const scanRef = useRef(0);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.0;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Floating bob — each card on its own phase
    groupRef.current.position.y = Math.sin(t * 0.4 + index * 1.2) * 0.1;

    // Scan line effect
    scanRef.current = (scanRef.current + 0.008) % 1;
  });

  const rgb = `${parseInt(section.color.slice(1, 3), 16)},${parseInt(section.color.slice(3, 5), 16)},${parseInt(section.color.slice(5, 7), 16)}`;

  return (
    <group
      ref={groupRef}
      position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
      rotation={[0, -angle + Math.PI / 2, 0]}
    >
      {/* ── CLICKABLE CARD BODY ── */}
      <mesh
        onClick={() => onSelect(section.id)}
        onPointerEnter={() => onHover(section.id)}
        onPointerLeave={() => onHover(null)}
      >
        <planeGeometry args={[1.7, 1.0]} />
        <meshStandardMaterial
          color={hovered ? section.color : '#0a0a1a'}
          emissive={section.color}
          emissiveIntensity={hovered ? 0.18 : 0.02}
          transparent
          opacity={hovered ? 0.88 : 0.65}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* ── TOP ACCENT LINE — thicker when hovered ── */}
      <mesh position={[0, 0.5, 0.005]} raycast={noRaycast}>
        <planeGeometry args={[1.7, hovered ? 0.03 : 0.018]} />
        <meshBasicMaterial color={section.color} transparent opacity={hovered ? 1 : 0.5} />
      </mesh>

      {/* ── BOTTOM ACCENT ── */}
      <mesh position={[0, -0.5, 0.005]} raycast={noRaycast}>
        <planeGeometry args={[1.7, 0.008]} />
        <meshBasicMaterial color={section.color} transparent opacity={hovered ? 0.5 : 0.1} />
      </mesh>

      {/* ── WIREFRAME BORDER ── */}
      <mesh position={[0, 0, -0.01]} raycast={noRaycast}>
        <planeGeometry args={[1.75, 1.05]} />
        <meshBasicMaterial
          color={section.color}
          transparent
          opacity={hovered ? 0.45 : 0.12}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── HOVER GLOW ── */}
      {hovered && (
        <mesh position={[0, 0, -0.06]} raycast={noRaycast}>
          <planeGeometry args={[2.2, 1.4]} />
          <meshBasicMaterial color={section.color} transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* ── CORNER BRACKETS (tech look) ── */}
      {hovered && (
        <Html center position={[0, 0, 0.005]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{
            width: 160, height: 90, position: 'relative',
          }}>
            {/* TL corner */}
            <div style={{ position: 'absolute', top: -4, left: -4, width: 8, height: 8, borderLeft: `1px solid ${section.color}`, borderTop: `1px solid ${section.color}`, opacity: 0.6 }} />
            {/* TR corner */}
            <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRight: `1px solid ${section.color}`, borderTop: `1px solid ${section.color}`, opacity: 0.6 }} />
            {/* BL corner */}
            <div style={{ position: 'absolute', bottom: -4, left: -4, width: 8, height: 8, borderLeft: `1px solid ${section.color}`, borderBottom: `1px solid ${section.color}`, opacity: 0.6 }} />
            {/* BR corner */}
            <div style={{ position: 'absolute', bottom: -4, right: -4, width: 8, height: 8, borderRight: `1px solid ${section.color}`, borderBottom: `1px solid ${section.color}`, opacity: 0.6 }} />
          </div>
        </Html>
      )}

      {/* ── HTML LABEL ── */}
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '5px', minWidth: '130px', textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            fontSize: '28px', lineHeight: 1,
            color: hovered ? section.color : 'rgba(232,232,240,0.6)',
            transition: 'all 0.3s',
            textShadow: hovered ? `0 0 20px ${section.color}` : `0 0 6px ${section.color}40`,
            filter: hovered ? `drop-shadow(0 0 12px ${section.color})` : 'none',
          }}>
            {section.icon}
          </div>

          {/* Label */}
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

          {/* Description — only on hover */}
          {hovered && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '7px', letterSpacing: '0.5px',
              color: `rgba(${rgb},0.6)`,
              marginTop: '2px', maxWidth: '120px',
            }}>
              {section.desc}
            </div>
          )}

          {/* Shortcut */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px', letterSpacing: '1px',
            color: hovered ? 'rgba(232,232,240,0.4)' : 'rgba(232,232,240,0.15)',
            marginTop: '1px',
            transition: 'color 0.3s',
          }}>
            [{section.shortcut}]
          </div>
        </div>
      </Html>

      {/* ── CONNECTION LINE to center ── */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, -Math.cos(angle) * (radius - 1), 0, -Math.sin(angle) * (radius - 1)]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={section.color} transparent opacity={hovered ? 0.5 : 0.06} />
      </line>
    </group>
  );
}

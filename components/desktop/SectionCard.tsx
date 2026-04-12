'use client';

import { useRef, useMemo, useCallback, useEffect } from 'react';
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

/* ─── PARTICLE BURST on hover ─── */
function HoverParticles({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 40;

  const { positions, velocities } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const v = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.01 + Math.random() * 0.02;
      v[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      v[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      v[i * 3 + 2] = Math.cos(phi) * speed;
    }
    return { positions: p, velocities: v };
  }, []);

  useFrame(() => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const mat = ref.current.material as THREE.PointsMaterial;

    if (active) {
      mat.opacity = Math.min(mat.opacity + 0.05, 0.8);
      for (let i = 0; i < count; i++) {
        pos.array[i * 3] += velocities[i * 3];
        pos.array[i * 3 + 1] += velocities[i * 3 + 1];
        pos.array[i * 3 + 2] += velocities[i * 3 + 2];
        // Reset if too far
        const d = Math.sqrt(pos.array[i * 3] ** 2 + pos.array[i * 3 + 1] ** 2 + pos.array[i * 3 + 2] ** 2);
        if (d > 0.8) {
          pos.array[i * 3] = 0;
          pos.array[i * 3 + 1] = 0;
          pos.array[i * 3 + 2] = 0;
        }
      }
    } else {
      mat.opacity = Math.max(mat.opacity - 0.03, 0);
      for (let i = 0; i < count; i++) {
        pos.array[i * 3] *= 0.95;
        pos.array[i * 3 + 1] *= 0.95;
        pos.array[i * 3 + 2] *= 0.95;
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref} raycast={noRaycast}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.015} color={color} transparent opacity={0}
        blending={THREE.AdditiveBlending} depthWrite={false}
      />
    </points>
  );
}

/* ─── SCANNING LINE effect ─── */
function ScanLine({ color, active }: { color: string; active: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = active ? Math.sin(t * 2) * 0.45 : 0;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = active ? 0.15 + Math.sin(t * 4) * 0.08 : 0;
  });

  return (
    <mesh ref={ref} position={[0, 0, 0.01]} raycast={noRaycast}>
      <planeGeometry args={[1.7, 0.005]} />
      <meshBasicMaterial color={color} transparent opacity={0} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   SECTION CARD — Premium holographic panels
   with particle burst, scan line, corner brackets
   ═══════════════════════════════════════════ */
export default function SectionCard({ section, index, total, onSelect, hovered, onHover }: {
  section: SectionData;
  index: number;
  total: number;
  onSelect: (id: Section) => void;
  hovered: boolean;
  onHover: (id: Section | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  const glowIntensity = useRef(0);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.0;

  useFrame(({ clock }) => {
    if (!groupRef.current || !cardRef.current) return;
    const t = clock.getElapsedTime();

    // Floating bob
    groupRef.current.position.y = Math.sin(t * 0.4 + index * 1.2) * 0.12;

    // Subtle tilt toward camera on hover
    const targetRotX = hovered ? Math.sin(t * 1.5) * 0.03 : 0;
    cardRef.current.rotation.x += (targetRotX - cardRef.current.rotation.x) * 0.08;

    // Scale pulse on hover
    const targetScale = hovered ? 1.12 + Math.sin(t * 3) * 0.02 : 1;
    cardRef.current.scale.x += (targetScale - cardRef.current.scale.x) * 0.08;
    cardRef.current.scale.y += (targetScale - cardRef.current.scale.y) * 0.08;
    cardRef.current.scale.z += (targetScale - cardRef.current.scale.z) * 0.08;

    // Emissive glow animation
    glowIntensity.current += ((hovered ? 0.2 : 0.02) - glowIntensity.current) * 0.08;
    const mat = cardRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = glowIntensity.current;
    mat.opacity = hovered ? 0.88 : 0.55 + Math.sin(t * 0.5 + index) * 0.05;
  });

  const rgb = `${parseInt(section.color.slice(1, 3), 16)},${parseInt(section.color.slice(3, 5), 16)},${parseInt(section.color.slice(5, 7), 16)}`;

  return (
    <group
      ref={groupRef}
      position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
      rotation={[0, -angle + Math.PI / 2, 0]}
    >
      {/* ── PARTICLE BURST ── */}
      <HoverParticles color={section.color} active={hovered} />

      {/* ── SCAN LINE ── */}
      <ScanLine color={section.color} active={hovered} />

      {/* ── MAIN CARD ── */}
      <mesh
        ref={cardRef}
        onClick={() => onSelect(section.id)}
        onPointerEnter={() => onHover(section.id)}
        onPointerLeave={() => onHover(null)}
      >
        <planeGeometry args={[1.7, 1.0]} />
        <meshStandardMaterial
          color={hovered ? section.color : '#0a0a1a'}
          emissive={section.color}
          emissiveIntensity={0.02}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* ── TOP ACCENT BAR ── */}
      <mesh position={[0, 0.5, 0.005]} raycast={noRaycast}>
        <planeGeometry args={[1.7, hovered ? 0.035 : 0.018]} />
        <meshBasicMaterial color={section.color} transparent opacity={hovered ? 1 : 0.5} />
      </mesh>

      {/* ── BOTTOM ACCENT ── */}
      <mesh position={[0, -0.5, 0.005]} raycast={noRaycast}>
        <planeGeometry args={[1.7, hovered ? 0.02 : 0.008]} />
        <meshBasicMaterial color={section.color} transparent opacity={hovered ? 0.6 : 0.1} />
      </mesh>

      {/* ── SIDE ACCENTS (new) ── */}
      {hovered && (
        <>
          <mesh position={[-0.855, 0, 0.005]} raycast={noRaycast}>
            <planeGeometry args={[0.006, 0.6]} />
            <meshBasicMaterial color={section.color} transparent opacity={0.4} />
          </mesh>
          <mesh position={[0.855, 0, 0.005]} raycast={noRaycast}>
            <planeGeometry args={[0.006, 0.6]} />
            <meshBasicMaterial color={section.color} transparent opacity={0.4} />
          </mesh>
        </>
      )}

      {/* ── WIREFRAME BORDER ── */}
      <mesh position={[0, 0, -0.01]} raycast={noRaycast}>
        <planeGeometry args={[1.78, 1.08]} />
        <meshBasicMaterial
          color={section.color} transparent
          opacity={hovered ? 0.5 : 0.1} wireframe side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── GLOW BACKDROP ── */}
      {hovered && (
        <mesh position={[0, 0, -0.08]} raycast={noRaycast}>
          <planeGeometry args={[2.4, 1.5]} />
          <meshBasicMaterial
            color={section.color} transparent opacity={0.05}
            side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false}
          />
        </mesh>
      )}

      {/* ── CORNER BRACKETS (HUD tech look) ── */}
      <Html center position={[0, 0, 0.008]} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ width: 168, height: 96, position: 'relative', opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}>
          {[
            { top: -3, left: -3, bl: true, bt: true },
            { top: -3, right: -3, br: true, bt: true },
            { bottom: -3, left: -3, bl: true, bb: true },
            { bottom: -3, right: -3, br: true, bb: true },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', width: 10, height: 10,
              ...Object.fromEntries(Object.entries(pos).filter(([k]) => ['top', 'bottom', 'left', 'right'].includes(k))),
              borderLeft: pos.bl ? `1px solid ${section.color}88` : 'none',
              borderRight: pos.br ? `1px solid ${section.color}88` : 'none',
              borderTop: pos.bt ? `1px solid ${section.color}88` : 'none',
              borderBottom: pos.bb ? `1px solid ${section.color}88` : 'none',
            }} />
          ))}
        </div>
      </Html>

      {/* ── HTML LABEL ── */}
      <Html center distanceFactor={6} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '4px', minWidth: '140px', textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            fontSize: '30px', lineHeight: 1,
            color: hovered ? section.color : 'rgba(232,232,240,0.55)',
            transition: 'all 0.3s',
            textShadow: hovered ? `0 0 24px ${section.color}, 0 0 48px ${section.color}40` : `0 0 6px ${section.color}30`,
            filter: hovered ? `drop-shadow(0 0 14px ${section.color})` : 'none',
            transform: hovered ? 'scale(1.1)' : 'scale(1)',
          }}>
            {section.icon}
          </div>

          {/* Label */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: hovered ? '12px' : '11px', fontWeight: 700,
            letterSpacing: '3px',
            color: hovered ? '#fff' : 'rgba(232,232,240,0.55)',
            transition: 'all 0.3s',
            textShadow: hovered ? `0 0 12px ${section.color}80` : 'none',
          }}>
            {section.label}
          </div>

          {/* Extension */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px', letterSpacing: '1px',
            color: hovered ? section.color : 'rgba(232,232,240,0.25)',
            transition: 'color 0.3s',
          }}>
            {section.ext}
          </div>

          {/* Description — only on hover */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '7px', letterSpacing: '0.5px',
            color: `rgba(${rgb},${hovered ? 0.6 : 0})`,
            transition: 'color 0.3s',
            marginTop: hovered ? '2px' : '0',
            maxWidth: '120px',
            height: hovered ? 'auto' : '0', overflow: 'hidden',
          }}>
            {section.desc.toUpperCase()}
          </div>

          {/* Shortcut badge */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '7px', letterSpacing: '1.5px',
            color: hovered ? 'rgba(232,232,240,0.4)' : 'rgba(232,232,240,0.12)',
            transition: 'color 0.3s',
            padding: '1px 6px',
            border: `1px solid ${hovered ? `rgba(${rgb},0.2)` : 'rgba(255,255,255,0.03)'}`,
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
        <lineBasicMaterial
          color={section.color} transparent
          opacity={hovered ? 0.6 : 0.05}
        />
      </line>
    </group>
  );
}

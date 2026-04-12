'use client';

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useVoidStore, Section } from '@/lib/store';
import VoidPostProcessing from '@/components/shaders/VoidPostProcessing';
import CentralHologram from './CentralHologram';
import SectionCard, { SectionData } from './SectionCard';

/* ============================================
   SECTION DATA
   ============================================ */
const SECTIONS: SectionData[] = [
  { id: 'about', label: 'ABOUT', ext: '.exe', icon: '◎', color: '#00D4FF', desc: 'Identity & manifesto', shortcut: '1' },
  { id: 'work', label: 'WORK', ext: '.db', icon: '◈', color: '#7B2FFF', desc: 'Project tunnel', shortcut: '2' },
  { id: 'skills', label: 'SKILLS', ext: '.sys', icon: '⬡', color: '#FFB800', desc: 'Neural network', shortcut: '3' },
  { id: 'timeline', label: 'TIME', ext: '.log', icon: '◉', color: '#39FF14', desc: 'Career log', shortcut: '4' },
  { id: 'contact', label: 'CONTACT', ext: '.net', icon: '◇', color: '#FF3366', desc: 'Transmission', shortcut: '5' },
  { id: 'lab', label: 'LAB', ext: '.beta', icon: '⬢', color: '#39FF14', desc: 'Experiments', shortcut: '6' },
];

/* ============================================
   ORBIT RINGS — VISIBLE animated arcs
   ============================================ */
function OrbitRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) { ring1Ref.current.rotation.x = Math.PI / 2; ring1Ref.current.rotation.z = t * 0.12; }
    if (ring2Ref.current) { ring2Ref.current.rotation.x = Math.PI / 3; ring2Ref.current.rotation.y = t * 0.1; }
    if (ring3Ref.current) { ring3Ref.current.rotation.x = Math.PI / 2.5; ring3Ref.current.rotation.z = -t * 0.08; ring3Ref.current.rotation.y = t * 0.04; }
  });

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.6, 0.006, 8, 128]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.25} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.0, 0.004, 8, 128]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.18} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.4, 0.003, 8, 96]} />
        <meshBasicMaterial color="#39FF14" transparent opacity={0.1} />
      </mesh>
    </>
  );
}

/* ============================================
   DATA STREAM — particles flowing from center
   ============================================ */
function DataStream() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;

  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1 + Math.random() * 2;
      p[i * 3] = Math.cos(angle) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      p[i * 3 + 2] = Math.sin(angle) * r;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + t * 0.3;
      const pulseR = 1.2 + Math.sin(t * 2 + i * 0.5) * 0.8;
      pos.setXYZ(
        i,
        Math.cos(angle) * pulseR,
        Math.sin(t * 1.5 + i * 0.3) * 0.3,
        Math.sin(angle) * pulseR
      );
    }
    pos.needsUpdate = true;
    ref.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#00D4FF" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ============================================
   GRID FLOOR
   ============================================ */
function GridFloor() {
  return (
    <gridHelper
      args={[30, 60, '#00D4FF', '#7B2FFF']}
      position={[0, -2, 0]}
      material-transparent={true}
      material-opacity={0.05}
      material-depthWrite={false}
    />
  );
}

/* ============================================
   STARFIELD
   ============================================ */
function Starfield() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.003;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#FFFFFF" transparent opacity={0.6} depthWrite={false} />
    </points>
  );
}

/* ============================================
   DRAG CONTROLS
   ============================================ */
function DragRotation({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const { gl } = useThree();
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    const onDown = (e: PointerEvent) => { isDragging.current = true; prevMouse.current = { x: e.clientX, y: e.clientY }; canvas.style.cursor = 'grabbing'; };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      velocity.current = { x: dx * 0.003, y: dy * 0.002 };
      targetRotation.current.y += dx * 0.003;
      targetRotation.current.x += dy * 0.002;
      targetRotation.current.x = Math.max(-0.5, Math.min(0.5, targetRotation.current.x));
      prevMouse.current = { x: e.clientX, y: e.clientY };
    };
    const onUp = () => { isDragging.current = false; canvas.style.cursor = 'grab'; };

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.style.cursor = 'grab';

    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
    };
  }, [gl]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (!isDragging.current) {
      targetRotation.current.y += 0.0015;
      velocity.current.x *= 0.96;
      velocity.current.y *= 0.96;
      targetRotation.current.y += velocity.current.x;
      targetRotation.current.x += velocity.current.y;
    }
    groupRef.current.rotation.y += (targetRotation.current.y - groupRef.current.rotation.y) * 0.06;
    groupRef.current.rotation.x += (targetRotation.current.x - groupRef.current.rotation.x) * 0.06;
  });

  return null;
}

/* ============================================
   HUD READOUT
   ============================================ */
function HudReadout({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '7px', letterSpacing: '1.5px',
        color, opacity: 0.4,
        textShadow: `0 0 6px ${color}40`,
        whiteSpace: 'nowrap',
      }}>
        {text}
      </div>
    </Html>
  );
}

/* ============================================
   SCENE COMPOSITION
   ============================================ */
function HologramScene({ onSelect, hoveredId, onHover }: {
  onSelect: (id: Section) => void;
  hoveredId: Section | null;
  onHover: (id: Section | null) => void;
}) {
  const orbitalRef = useRef<THREE.Group>(null);

  return (
    <>
      <ambientLight intensity={0.08} />
      <Starfield />

      <group ref={orbitalRef}>
        <CentralHologram />
        <OrbitRings />
        <DataStream />
        <GridFloor />

        {SECTIONS.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            index={i}
            total={SECTIONS.length}
            onSelect={onSelect}
            hovered={hoveredId === section.id}
            onHover={onHover}
          />
        ))}

        {/* HUD readouts */}
        <HudReadout position={[-3.5, 2, 0]} text="SYS: OPERATIONAL" color="#39FF14" />
        <HudReadout position={[3.5, 2, 0]} text="NET: CONNECTED" color="#00D4FF" />
        <HudReadout position={[-3.5, -2, 0]} text="MEM: 64TB FREE" color="#FFB800" />
        <HudReadout position={[3.5, -2, 0]} text="CPU: QUANTUM" color="#7B2FFF" />
      </group>

      <DragRotation groupRef={orbitalRef} />
      <fog attach="fog" args={['#030306', 8, 30]} />
    </>
  );
}

/* ============================================
   VOID DESKTOP — Main component
   ============================================ */
export default function VoidDesktop() {
  const { navigateTo } = useVoidStore();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [canvasReady, setCanvasReady] = useState(false);
  const [hoveredId, setHoveredId] = useState<Section | null>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const hoveredSection = SECTIONS.find(s => s.id === hoveredId);

  useEffect(() => {
    setCanvasReady(true);
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase());
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.2 });
    if (topBarRef.current) tl.fromTo(topBarRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0);
    if (infoRef.current) tl.fromTo(infoRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.3);
    if (statusRef.current) tl.fromTo(statusRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6);
    if (hintRef.current) tl.fromTo(hintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.7);
    return () => { tl.kill(); };
  }, []);

  const handleAppClick = useCallback((section: Section) => {
    navigateTo(section);
  }, [navigateTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) handleAppClick(SECTIONS[num - 1].id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAppClick]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#030306', zIndex: 50, overflow: 'hidden' }}>
      {/* HUD Corner Brackets */}
      <div style={{ position: 'absolute', top: '50px', left: '16px', zIndex: 10, width: '20px', height: '20px', borderLeft: '1px solid rgba(0,212,255,0.15)', borderTop: '1px solid rgba(0,212,255,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50px', right: '16px', zIndex: 10, width: '20px', height: '20px', borderRight: '1px solid rgba(0,212,255,0.15)', borderTop: '1px solid rgba(0,212,255,0.15)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '50px', left: '16px', zIndex: 10, width: '20px', height: '20px', borderLeft: '1px solid rgba(0,212,255,0.1)', borderBottom: '1px solid rgba(0,212,255,0.1)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '50px', right: '16px', zIndex: 10, width: '20px', height: '20px', borderRight: '1px solid rgba(0,212,255,0.1)', borderBottom: '1px solid rgba(0,212,255,0.1)', pointerEvents: 'none' }} />

      {/* 3D Scene */}
      {canvasReady && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <Canvas camera={{ position: [0, 1.8, 6.5], fov: 42 }} gl={{ antialias: true, alpha: true }}>
            <HologramScene onSelect={handleAppClick} hoveredId={hoveredId} onHover={setHoveredId} />
          </Canvas>
          <VoidPostProcessing intensity={0.7} />
        </div>
      )}

      {/* Top Bar */}
      <div ref={topBarRef} style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px', opacity: 0,
        background: 'linear-gradient(180deg, rgba(3,3,6,0.7) 0%, transparent 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#39FF14', boxShadow: '0 0 8px rgba(57,255,20,0.6)',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.4)', letterSpacing: '3px' }}>
            VOID OS v3.0.1
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(0,212,255,0.4)', letterSpacing: '1px' }}>
            ▸ DESKTOP
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
            {[6, 9, 12, 15, 12].map((h, i) => (
              <div key={i} style={{ width: '2px', height: `${h}px`, background: `rgba(57,255,20,${0.2 + i * 0.08})`, borderRadius: '1px' }} />
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(232,232,240,0.7)', letterSpacing: '2px', fontWeight: 500, textShadow: '0 0 8px rgba(0,212,255,0.2)' }}>{time}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(232,232,240,0.25)', letterSpacing: '2px' }}>{date}</div>
          </div>
        </div>
      </div>

      {/* Hovered Section Info */}
      <div ref={infoRef} style={{
        position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center', opacity: 0,
        pointerEvents: 'none', minHeight: '50px',
      }}>
        {hoveredSection ? (
          <div key={hoveredSection.id}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700,
              color: hoveredSection.color, letterSpacing: '4px', marginBottom: '4px',
              textShadow: `0 0 25px ${hoveredSection.color}60`,
            }}>
              {hoveredSection.icon} {hoveredSection.label}<span style={{ color: 'rgba(232,232,240,0.25)', fontSize: '14px' }}>{hoveredSection.ext}</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.35)',
              letterSpacing: '2px',
            }}>
              {hoveredSection.desc.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'rgba(232,232,240,0.2)', letterSpacing: '3px',
          }}>
            DRAG TO ROTATE · CLICK TO LAUNCH
          </div>
        )}
      </div>

      {/* Status */}
      <div ref={statusRef} style={{
        position: 'absolute', bottom: '18px', left: '24px', zIndex: 10,
        fontFamily: 'var(--font-mono)', opacity: 0,
      }}>
        <div style={{ fontSize: '7px', color: 'rgba(232,232,240,0.2)', letterSpacing: '2px', marginBottom: '3px' }}>SYSTEM</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 8px rgba(57,255,20,0.7)' }} />
            <div style={{ position: 'absolute', top: '-3px', left: '-3px', width: '11px', height: '11px', borderRadius: '50%', border: '1px solid rgba(57,255,20,0.25)', animation: 'pulse-ring 2s infinite' }} />
          </div>
          <span style={{ fontSize: '8px', color: 'rgba(57,255,20,0.5)', letterSpacing: '1px' }}>ONLINE</span>
        </div>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse-ring { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }' }} />
      </div>

      {/* Hint */}
      <div ref={hintRef} style={{
        position: 'absolute', bottom: '18px', right: '24px', zIndex: 10,
        fontFamily: 'var(--font-mono)', fontSize: '7px',
        color: 'rgba(232,232,240,0.15)', letterSpacing: '2px', opacity: 0,
      }}>
        KEYS [1-6]
      </div>
    </div>
  );
}

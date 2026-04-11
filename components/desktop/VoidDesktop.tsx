'use client';

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useVoidStore, Section } from '@/lib/store';
import VoidPostProcessing from '@/components/shaders/VoidPostProcessing';

/* ============================================
   CENTRAL HOLOGRAM
   ============================================ */
function CentralHologram() {
  const innerRef = useRef<THREE.Mesh>(null);
  const midRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const count = 300;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.6 + Math.random() * 0.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      // Color: mix of cyan and purple
      const isCyan = Math.random() > 0.3;
      colors[i * 3] = isCyan ? 0 : 0.48;
      colors[i * 3 + 1] = isCyan ? 0.83 : 0.18;
      colors[i * 3 + 2] = isCyan ? 1 : 1;
    }
    return { pos, colors };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.25;
      innerRef.current.rotation.y = t * 0.18;
      const s = 1 + Math.sin(t * 0.6) * 0.04;
      innerRef.current.scale.setScalar(s);
    }
    if (midRef.current) {
      midRef.current.rotation.x = -t * 0.12;
      midRef.current.rotation.z = t * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.08;
      outerRef.current.rotation.z = -t * 0.06;
    }
    if (glowRef.current) {
      const glow = 0.1 + Math.sin(t * 0.4) * 0.05;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glow;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.04;
      particlesRef.current.rotation.x = Math.sin(t * 0.1) * 0.2;
    }
  });

  return (
    <group>
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.3, 2]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.07} />
      </mesh>
      <mesh ref={midRef}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.12} wireframe />
      </mesh>
      <mesh ref={outerRef}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.06} wireframe />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.85, 16, 16]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particleData.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[particleData.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.012} vertexColors transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <pointLight color="#00D4FF" intensity={0.5} distance={8} />
    </group>
  );
}

/* ============================================
   ORBIT RINGS — Animated arcs with dashes
   ============================================ */
function OrbitRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const ring4Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ring1Ref.current) { ring1Ref.current.rotation.x = Math.PI / 2; ring1Ref.current.rotation.z = t * 0.12; }
    if (ring2Ref.current) { ring2Ref.current.rotation.x = Math.PI / 3; ring2Ref.current.rotation.y = t * 0.1; }
    if (ring3Ref.current) { ring3Ref.current.rotation.x = Math.PI / 2.5; ring3Ref.current.rotation.z = -t * 0.08; ring3Ref.current.rotation.y = t * 0.04; }
    if (ring4Ref.current) { ring4Ref.current.rotation.x = Math.PI / 4; ring4Ref.current.rotation.z = t * 0.06; }
  });

  return (
    <>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[1.6, 0.004, 8, 128]} />
        <meshBasicMaterial color="#00D4FF" transparent opacity={0.12} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.0, 0.003, 8, 128]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[2.4, 0.002, 8, 96]} />
        <meshBasicMaterial color="#39FF14" transparent opacity={0.05} />
      </mesh>
      <mesh ref={ring4Ref}>
        <torusGeometry args={[1.2, 0.005, 8, 64]} />
        <meshBasicMaterial color="#FFB800" transparent opacity={0.04} />
      </mesh>
    </>
  );
}

/* ============================================
   DATA PARTICLES — streaming from center to cards
   ============================================ */
function DataStream() {
  const ref = useRef<THREE.Points>(null);
  const count = 150;

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
      <pointsMaterial size={0.015} color="#00D4FF" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ============================================
   SECTION DATA
   ============================================ */
const SECTIONS: Array<{ id: Section; label: string; ext: string; icon: string; color: string; desc: string; shortcut: string }> = [
  { id: 'about', label: 'ABOUT', ext: '.exe', icon: '◎', color: '#00D4FF', desc: 'Identity & manifesto', shortcut: '1' },
  { id: 'work', label: 'WORK', ext: '.db', icon: '◈', color: '#7B2FFF', desc: 'Project tunnel', shortcut: '2' },
  { id: 'skills', label: 'SKILLS', ext: '.sys', icon: '⬡', color: '#FFB800', desc: 'Neural network', shortcut: '3' },
  { id: 'timeline', label: 'TIME', ext: '.log', icon: '◉', color: '#39FF14', desc: 'Career log', shortcut: '4' },
  { id: 'contact', label: 'CONTACT', ext: '.net', icon: '◇', color: '#FF3366', desc: 'Transmission', shortcut: '5' },
  { id: 'lab', label: 'LAB', ext: '.beta', icon: '⬢', color: '#39FF14', desc: 'Experiments', shortcut: '6' },
];

/* ============================================
   SECTION CARD — with HTML label overlay
   ============================================ */
function SectionCard({ section, index, total, onSelect, hovered, onHover }: {
  section: typeof SECTIONS[0]; index: number; total: number;
  onSelect: (id: Section) => void; hovered: boolean;
  onHover: (id: Section | null) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;
  const radius = 3.0;

  useFrame(({ clock }) => {
    if (!groupRef.current || !meshRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.4 + index * 1.2) * 0.1;

    const targetScale = hovered ? 1.12 : 1;
    meshRef.current.scale.x += (targetScale - meshRef.current.scale.x) * 0.08;
    meshRef.current.scale.y += (targetScale - meshRef.current.scale.y) * 0.08;
    meshRef.current.scale.z += (targetScale - meshRef.current.scale.z) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
      rotation={[0, -angle + Math.PI / 2, 0]}
    >
      {/* Card background */}
      <mesh
        ref={meshRef}
        onClick={() => onSelect(section.id)}
        onPointerEnter={() => onHover(section.id)}
        onPointerLeave={() => onHover(null)}
      >
        <planeGeometry args={[1.5, 0.85]} />
        <meshBasicMaterial
          color={hovered ? section.color : '#080810'}
          transparent
          opacity={hovered ? 0.12 : 0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Border */}
      <mesh>
        <planeGeometry args={[1.5, 0.85]} />
        <meshBasicMaterial
          color={section.color}
          transparent
          opacity={hovered ? 0.35 : 0.1}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Hover glow plane */}
      {hovered && (
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[1.8, 1.1]} />
          <meshBasicMaterial color={section.color} transparent opacity={0.04} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* HTML Label overlay */}
      <Html
        center
        distanceFactor={6}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '4px', minWidth: '120px', textAlign: 'center',
        }}>
          {/* Icon */}
          <div style={{
            fontSize: '24px', lineHeight: 1,
            color: hovered ? section.color : 'rgba(232,232,240,0.35)',
            transition: 'color 0.3s, text-shadow 0.3s',
            textShadow: hovered ? `0 0 15px ${section.color}60` : 'none',
            filter: hovered ? `drop-shadow(0 0 8px ${section.color}40)` : 'none',
          }}>
            {section.icon}
          </div>

          {/* Label */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px', fontWeight: 600,
            letterSpacing: '3px',
            color: hovered ? '#E8E8F0' : 'rgba(232,232,240,0.3)',
            transition: 'color 0.3s',
          }}>
            {section.label}
          </div>

          {/* Extension */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '7px', letterSpacing: '1px',
            color: hovered ? section.color : 'rgba(232,232,240,0.15)',
            transition: 'color 0.3s',
          }}>
            {section.ext}
          </div>

          {/* Shortcut badge */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '7px', letterSpacing: '1px',
            color: 'rgba(232,232,240,0.12)',
            marginTop: '2px',
          }}>
            [{section.shortcut}]
          </div>
        </div>
      </Html>

      {/* Connection line to center */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, 0, 0, -Math.cos(angle) * (radius - 1), 0, -Math.sin(angle) * (radius - 1)]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={section.color} transparent opacity={hovered ? 0.25 : 0.04} />
      </line>
    </group>
  );
}

/* ============================================
   STARFIELD
   ============================================ */
function Starfield() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(2500 * 3);
    for (let i = 0; i < 2500; i++) {
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
      <pointsMaterial size={0.02} color="#FFFFFF" transparent opacity={0.5} depthWrite={false} />
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

    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    };

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

    const onUp = () => {
      isDragging.current = false;
      canvas.style.cursor = 'grab';
    };

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
   HUD READOUTS — floating data around edges
   ============================================ */
function HudReadout({ position, text, color }: { position: [number, number, number]; text: string; color: string }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none', userSelect: 'none' }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '7px', letterSpacing: '1.5px',
        color, opacity: 0.3,
        textShadow: `0 0 4px ${color}30`,
        whiteSpace: 'nowrap',
      }}>
        {text}
      </div>
    </Html>
  );
}

/* ============================================
   SCENE
   ============================================ */
function HologramScene({ onSelect, hoveredId, onHover }: {
  onSelect: (id: Section) => void;
  hoveredId: Section | null;
  onHover: (id: Section | null) => void;
}) {
  const orbitalRef = useRef<THREE.Group>(null);

  return (
    <>
      <ambientLight intensity={0.03} />
      <Starfield />

      <group ref={orbitalRef}>
        <CentralHologram />
        <OrbitRings />
        <DataStream />

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
      <fog attach="fog" args={['#030306', 7, 28]} />
    </>
  );
}

/* ============================================
   VOID DESKTOP
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.3)', letterSpacing: '3px' }}>
            VOID OS v2045.1
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(0,212,255,0.3)', letterSpacing: '1px' }}>
            ▸ DESKTOP
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '3px', height: '8px', background: 'rgba(57,255,20,0.3)' }} />
            <div style={{ width: '3px', height: '12px', background: 'rgba(57,255,20,0.4)' }} />
            <div style={{ width: '3px', height: '6px', background: 'rgba(57,255,20,0.2)' }} />
            <div style={{ width: '3px', height: '14px', background: 'rgba(57,255,20,0.5)' }} />
            <div style={{ width: '3px', height: '10px', background: 'rgba(57,255,20,0.3)' }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(232,232,240,0.6)', letterSpacing: '2px', fontWeight: 500 }}>{time}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(232,232,240,0.2)', letterSpacing: '2px' }}>{date}</div>
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
              fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700,
              color: hoveredSection.color, letterSpacing: '4px', marginBottom: '4px',
              textShadow: `0 0 20px ${hoveredSection.color}40`,
            }}>
              {hoveredSection.icon} {hoveredSection.label}<span style={{ color: 'rgba(232,232,240,0.2)', fontSize: '13px' }}>{hoveredSection.ext}</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.3)',
              letterSpacing: '2px',
            }}>
              {hoveredSection.desc.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'rgba(232,232,240,0.15)', letterSpacing: '3px',
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
        <div style={{ fontSize: '7px', color: 'rgba(232,232,240,0.15)', letterSpacing: '2px', marginBottom: '3px' }}>SYSTEM</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 4px rgba(57,255,20,0.4)' }} />
          <span style={{ fontSize: '8px', color: 'rgba(57,255,20,0.4)', letterSpacing: '1px' }}>ONLINE</span>
        </div>
      </div>

      {/* Hint */}
      <div ref={hintRef} style={{
        position: 'absolute', bottom: '18px', right: '24px', zIndex: 10,
        fontFamily: 'var(--font-mono)', fontSize: '7px',
        color: 'rgba(232,232,240,0.12)', letterSpacing: '2px', opacity: 0,
      }}>
        KEYS [1-6]
      </div>
    </div>
  );
}

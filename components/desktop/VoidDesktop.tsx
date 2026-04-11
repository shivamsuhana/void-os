'use client';

import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useVoidStore, Section } from '@/lib/store';

/* ── Starfield reacts to mouse ── */
function ReactiveStars() {
  const ref = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pointer.y * 0.05, 0.02);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, pointer.x * 0.05, 0.02);
  });
  return (
    <group ref={ref}>
      <Stars radius={100} depth={80} count={3000} factor={4} saturation={0.2} fade speed={0.5} />
    </group>
  );
}

/* ── Floating ambient particles ── */
function AmbientParticles() {
  const count = 100;
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);
  const colors = useMemo(() => {
    const cols = new Float32Array(count * 3);
    const palette = [[0, 0.83, 1], [0.48, 0.18, 1], [0.22, 1, 0.08]];
    for (let i = 0; i < count; i++) {
      const c = palette[Math.floor(Math.random() * palette.length)];
      cols[i * 3] = c[0]; cols[i * 3 + 1] = c[1]; cols[i * 3 + 2] = c[2];
    }
    return cols;
  }, []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const time = clock.getElapsedTime();
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) arr[i * 3 + 1] += Math.sin(time + i) * 0.001;
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function DesktopScene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00D4FF" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#7B2FFF" />
      <ReactiveStars />
      <AmbientParticles />
    </>
  );
}

const APP_ICONS: Array<{ id: Section; label: string; ext: string; icon: string; color: string; shortcut: string }> = [
  { id: 'about', label: 'ABOUT', ext: '.exe', icon: '👤', color: '#00D4FF', shortcut: '1' },
  { id: 'work', label: 'WORK', ext: '.db', icon: '📁', color: '#7B2FFF', shortcut: '2' },
  { id: 'skills', label: 'SKILLS', ext: '.sys', icon: '🧠', color: '#FFB800', shortcut: '3' },
  { id: 'timeline', label: 'TIMELINE', ext: '.log', icon: '📋', color: '#39FF14', shortcut: '4' },
  { id: 'contact', label: 'CONTACT', ext: '.net', icon: '📡', color: '#FF3366', shortcut: '5' },
  { id: 'lab', label: 'LAB', ext: '.beta', icon: '🧪', color: '#39FF14', shortcut: '6' },
];

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default function VoidDesktop() {
  const { setActiveSection } = useVoidStore();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAppClick = useCallback((section: Section) => {
    setActiveSection(section);
  }, [setActiveSection]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= 6) handleAppClick(APP_ICONS[num - 1].id);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleAppClick]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--void-black)', zIndex: 50, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ background: 'transparent' }} gl={{ antialias: true, alpha: true }}>
          <DesktopScene />
        </Canvas>
      </div>

      {/* Desktop Grid */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 40px 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', maxWidth: '600px', width: '100%' }}>
          {APP_ICONS.map((app, index) => (
            <button key={app.id} onClick={() => handleAppClick(app.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                padding: '24px 16px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                animation: `fadeInUp 0.6s ease ${index * 0.1}s both`,
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.background = `rgba(${hexToRgb(app.color)}, 0.08)`; el.style.borderColor = `rgba(${hexToRgb(app.color)}, 0.3)`; el.style.transform = 'translateY(-8px) scale(1.05)'; el.style.boxShadow = `0 0 30px rgba(${hexToRgb(app.color)}, 0.2)`; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.03)'; el.style.borderColor = 'rgba(255,255,255,0.06)'; el.style.transform = 'none'; el.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '32px', lineHeight: 1 }}>{app.icon}</span>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--ghost-white)', letterSpacing: '1px' }}>
                  {app.label}<span style={{ color: app.color, opacity: 0.7 }}>{app.ext}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>⌘{app.shortcut}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Dock */}
      <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, display: 'flex', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' }}>
        {APP_ICONS.map((app) => (
          <button key={app.id} onClick={() => handleAppClick(app.id)} title={`${app.label}${app.ext}`}
            style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontSize: '18px', transition: 'all 0.3s ease', background: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${hexToRgb(app.color)}, 0.15)`; e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'none'; }}
          >{app.icon}</button>
        ))}
      </div>

      {/* System Tray */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 20, display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--acid-green)', boxShadow: '0 0 8px rgba(57,255,20,0.5)' }} />
          VOID OS v2045.1
        </span>
      </div>

      {/* Clock */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 20, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{time}</div>
    </div>
  );
}

'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { PROJECTS, Project } from '@/lib/portfolio-data';
import VoidPostProcessing from '@/components/shaders/VoidPostProcessing';

/* ═══════════════════════════════════════════
   NO-OP RAYCAST — prevents decorative meshes from stealing clicks
   ═══════════════════════════════════════════ */
const noRaycast = () => {};

/* ═══════════════════════════════════════════
   3D PROJECT CARD — Fixed interaction + enhanced visuals
   ═══════════════════════════════════════════ */
function ProjectCard3D({ project, position, index, onSelect }: {
  project: Project; position: [number, number, number]; index: number;
  onSelect: (p: Project) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();
  const glowOpacity = useRef(0.015);
  const edgeOpacity = useRef(0.08);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Gentle float
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4 + index * 2) * 0.12;
    groupRef.current.position.x = position[0] + Math.cos(t * 0.3 + index) * 0.06;

    // Tilt
    if (hovered) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.25, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.15, 0.05);
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(t * 0.2 + index) * 0.06, 0.025);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.cos(t * 0.15 + index) * 0.03, 0.025);
    }

    // Scale
    const s = hovered ? 1.08 : 1;
    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, s, 0.06);
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, s, 0.06);

    // Update child material opacities
    glowOpacity.current = hovered ? 0.1 + Math.sin(t * 3) * 0.03 : 0.015;
    edgeOpacity.current = hovered ? 0.35 : 0.06;
    groupRef.current.children.forEach((child) => {
      if (child.userData.isGlow && (child as THREE.Mesh).material) {
        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = glowOpacity.current;
      }
      if (child.userData.isEdge && (child as THREE.Mesh).material) {
        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = edgeOpacity.current;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ── CLICKABLE HITBOX — the ONLY mesh that receives pointer events ── */}
      <mesh
        onClick={(e) => { e.stopPropagation(); onSelect(project); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
      >
        <planeGeometry args={[2.6, 1.6]} />
        <meshStandardMaterial
          color={hovered ? project.color : '#10102a'}
          emissive={project.color}
          emissiveIntensity={hovered ? 0.3 : 0.08}
          transparent opacity={0.9} side={THREE.DoubleSide}
          roughness={0.3} metalness={0.6}
        />
      </mesh>

      {/* ── DECORATIVE LAYERS — all raycast disabled ── */}

      {/* Top accent glow bar */}
      <mesh position={[0, 0.8, 0.005]} raycast={noRaycast}>
        <planeGeometry args={[2.6, 0.025]} />
        <meshBasicMaterial color={project.color} transparent opacity={hovered ? 1 : 0.5} />
      </mesh>

      {/* Bottom accent */}
      <mesh position={[0, -0.8, 0.005]} raycast={noRaycast}>
        <planeGeometry args={[2.6, 0.012]} />
        <meshBasicMaterial color={project.color} transparent opacity={hovered ? 0.5 : 0.15} />
      </mesh>

      {/* Wireframe edge — BEHIND the card */}
      <mesh position={[0, 0, -0.02]} userData={{ isEdge: true }} raycast={noRaycast}>
        <planeGeometry args={[2.7, 1.7]} />
        <meshBasicMaterial color={project.color} wireframe transparent opacity={0.15} />
      </mesh>

      {/* Glow backdrop — BEHIND everything */}
      <mesh position={[0, 0, -0.08]} userData={{ isGlow: true }} raycast={noRaycast}>
        <planeGeometry args={[3.0, 1.9]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.015} side={THREE.BackSide} />
      </mesh>

      {/* HTML Label — overlaid on the card */}
      <Html
        center
        position={[0, 0, 0.01]}
        distanceFactor={5.5}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', minWidth: '200px', textAlign: 'center', padding: '14px',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '7px', letterSpacing: '2px', color: project.color, opacity: 0.7 }}>{project.year}</span>
            {project.featured && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '6px', letterSpacing: '1px', color: '#39FF14', padding: '1px 4px', border: '1px solid rgba(57,255,20,0.3)' }}>★</span>}
          </div>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontSize: hovered ? '16px' : '14px',
            fontWeight: 700, color: hovered ? '#EEEEF5' : 'rgba(232,232,240,0.8)',
            transition: 'all 0.3s', textShadow: hovered ? `0 0 20px ${project.color}50` : 'none',
          }}>{project.title}</div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '7px', letterSpacing: '0.5px',
            color: hovered ? 'rgba(232,232,240,0.4)' : 'rgba(232,232,240,0.15)',
            transition: 'color 0.3s', maxWidth: '170px', lineHeight: 1.6,
          }}>{project.description.slice(0, 65)}...</div>
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: '6px', padding: '1px 5px',
                border: `1px solid ${project.color}30`, borderRadius: '1px',
                color: hovered ? project.color : 'rgba(232,232,240,0.18)', transition: 'color 0.3s',
              }}>{tag}</span>
            ))}
          </div>
          {hovered && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '7px', letterSpacing: '2px', color: project.color, opacity: 0.6, marginTop: '4px' }}>▸ CLICK TO EXPLORE</div>
          )}
        </div>
      </Html>
    </group>
  );
}

/* ═══════════════════════════════════════════
   TUNNEL PARTICLES — Enhanced density + glow
   ═══════════════════════════════════════════ */
function TunnelParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 1500;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette: [number, number, number][] = [[0, 0.83, 1], [0.48, 0.18, 1], [0.22, 1, 0.08], [1, 0.72, 0]];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.5 + Math.random() * 12;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += 0.06;
      if (arr[i * 3 + 2] > 50) arr[i * 3 + 2] = -50;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.z = clock.getElapsedTime() * 0.004;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ═══════════════════════════════════════════
   TUNNEL RING — glowing torus at depth intervals
   ═══════════════════════════════════════════ */
function TunnelRing({ z, color, radius }: { z: number; color: string; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.06;
  });
  return (
    <mesh ref={ref} position={[0, 0, z]}>
      <torusGeometry args={[radius, 0.012, 8, 80]} />
      <meshBasicMaterial color={color} transparent opacity={0.25} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════
   TUNNEL SCENE — Curved camera fly-through
   ═══════════════════════════════════════════ */
function TunnelScene({ scrollProgress, projects, onSelect }: {
  scrollProgress: number; projects: Project[];
  onSelect: (p: Project) => void;
}) {
  const { camera } = useThree();

  const cardPositions: [number, number, number][] = useMemo(() =>
    projects.map((_, i) => {
      const side = i % 2 === 0 ? -2.0 : 2.0;
      const z = -i * 7;
      const y = Math.sin(i * 0.8) * 0.3;
      return [side, y, z] as [number, number, number];
    }), [projects]);

  useFrame(() => {
    const maxZ = -(projects.length - 1) * 7;
    const targetZ = -scrollProgress * Math.abs(maxZ);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5 + targetZ, 0.05);
    camera.position.x = Math.sin(camera.position.z * 0.012) * 0.5;
    camera.position.y = Math.cos(camera.position.z * 0.008) * 0.2 + 0.1;
    camera.rotation.z = Math.sin(camera.position.z * 0.006) * 0.015;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 5]} intensity={1.0} color="#00D4FF" />
      <pointLight position={[-3, -2, -5]} intensity={0.7} color="#7B2FFF" />
      <pointLight position={[0, 0, -15]} intensity={0.5} color="#39FF14" />
      <fog attach="fog" args={['#050510', 5, 45]} />

      <TunnelParticles />

      {/* Tunnel rings — more, varied */}
      {Array.from({ length: 30 }).map((_, i) => (
        <TunnelRing
          key={i}
          z={-i * 5}
          color={i % 4 === 0 ? '#00D4FF' : i % 4 === 1 ? '#7B2FFF' : i % 4 === 2 ? '#39FF14' : '#FFB800'}
          radius={3.5 + Math.sin(i * 0.6) * 1.5}
        />
      ))}

      {/* Project cards */}
      {projects.map((project, i) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          position={cardPositions[i]}
          index={i}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════
   CASE STUDY MODAL — Full-screen project detail
   ═══════════════════════════════════════════ */
function CaseStudyOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const rgb = `${parseInt(project.color.slice(1, 3), 16)},${parseInt(project.color.slice(3, 5), 16)},${parseInt(project.color.slice(5, 7), 16)}`;

  useEffect(() => {
    const tl = gsap.timeline();
    if (overlayRef.current) tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    if (cardRef.current) tl.fromTo(cardRef.current, { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, 0.1);
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);

    // Typewriter
    let i = 0;
    const text = project.longDescription;
    const iv = setInterval(() => { i += 2; setTypewriterText(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setTimeout(() => setStatsVisible(true), 300); } }, 8);
    return () => { tl.kill(); window.removeEventListener('keydown', handler); clearInterval(iv); };
  }, [onClose, project.longDescription]);

  const handleClose = () => {
    if (overlayRef.current) gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    if (cardRef.current) gsap.to(cardRef.current, { opacity: 0, y: 20, duration: 0.2, onComplete: onClose });
  };

  return (
    <div ref={overlayRef} onClick={handleClose} style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(3,3,6,0.88)', backdropFilter: 'blur(25px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, opacity: 0,
    }}>
      <div ref={cardRef} onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 680, maxHeight: '85vh', overflowY: 'auto',
        background: 'rgba(8,8,20,0.95)', border: `1px solid ${project.color}22`,
        boxShadow: `0 0 60px rgba(${rgb},0.1), 0 0 1px ${project.color}44`, opacity: 0,
      }}>
        {/* Header bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(8,8,20,0.95)', borderBottom: `1px solid ${project.color}15`, backdropFilter: 'blur(10px)' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: project.color, boxShadow: `0 0 8px ${project.color}` }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: project.color }}>{project.title}.exe</span>
          <div style={{ flex: 1 }} />
          <button onClick={handleClose} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,0.4)', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF3B5C44'; e.currentTarget.style.color = '#FF3B5C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,232,240,0.4)'; }}
          >✕ CLOSE</button>
        </div>

        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`, opacity: 0.4 }} />

        <div style={{ padding: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, marginBottom: 4, color: '#E8E8F0' }}>{project.title}</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: project.color, marginBottom: 16, letterSpacing: '0.5px' }}>{project.description}</p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {project.tags.map(tag => (
              <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '4px 10px', border: `1px solid ${project.color}30`, background: `rgba(${rgb},0.08)`, color: project.color, letterSpacing: '0.5px' }}>{tag}</span>
            ))}
          </div>

          {/* Terminal description */}
          <div style={{ padding: '16px 18px', marginBottom: 20, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,232,240,0.5)', lineHeight: 1.9 }}>
            <div style={{ fontSize: '7px', letterSpacing: '2px', color: 'rgba(232,232,240,0.4)', marginBottom: 8 }}>$ cat README.md</div>
            {typewriterText}
            <span style={{ opacity: typewriterText.length < project.longDescription.length ? 1 : 0, color: project.color, animation: 'blink 0.8s infinite' }}>█</span>
          </div>

          {/* Stats */}
          {statsVisible && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {[{ label: 'YEAR', value: project.year }, { label: 'TECH STACK', value: `${project.tags.length} tools` }, { label: 'STATUS', value: project.liveUrl ? 'LIVE' : 'SOURCE' }].map(s => (
                <div key={s.label} style={{ padding: '12px', textAlign: 'center', background: `rgba(${rgb},0.04)`, border: `1px solid ${project.color}15` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: project.color, textShadow: `0 0 10px ${project.color}44` }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,0.3)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px 20px', textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', background: `rgba(${rgb},0.08)`, border: `1px solid ${project.color}33`, color: project.color, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `rgba(${rgb},0.15)`; }} onMouseLeave={e => { e.currentTarget.style.background = `rgba(${rgb},0.08)`; }}
              >◉ LIVE DEMO</a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px 20px', textAlign: 'center', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(232,232,240,0.5)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#E8E8F0'; }} onMouseLeave={e => { e.currentTarget.style.color = 'rgba(232,232,240,0.5)'; }}
              >⌥ SOURCE CODE</a>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: '@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}' }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WORK SECTION — MAIN
   ═══════════════════════════════════════════ */
export default function WorkSection() {
  const { navigateTo } = useVoidStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll/wheel control
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScrollProgress(prev => Math.max(0, Math.min(1, prev + e.deltaY * 0.0006)));
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handler, { passive: false });
    return () => { if (container) container.removeEventListener('wheel', handler); };
  }, []);

  // Drag to scroll
  const isDragging = useRef(false);
  const lastY = useRef(0);
  useEffect(() => {
    const handleDown = (e: MouseEvent) => { isDragging.current = true; lastY.current = e.clientY; };
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = lastY.current - e.clientY;
      lastY.current = e.clientY;
      setScrollProgress(prev => Math.max(0, Math.min(1, prev + delta * 0.0015)));
    };
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => { window.removeEventListener('mousedown', handleDown); window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'fixed', inset: 0, background: '#050510', zIndex: 50, overflow: 'hidden' }}>
      {/* Process bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(3,3,6,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(123,47,255,0.08)', padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)' }}>
        <button onClick={() => navigateTo('desktop')} style={{ background: 'none', border: '1px solid rgba(0,212,255,.15)', padding: '5px 14px', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: '#00D4FF', cursor: 'pointer', transition: 'all .2s', borderRadius: 2 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.5)'; e.currentTarget.style.background = 'rgba(0,212,255,.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.15)'; e.currentTarget.style.background = 'none'; }}
        >← DESKTOP</button>
        <div style={{ width: 1, height: 14, background: 'rgba(123,47,255,.12)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7B2FFF', boxShadow: '0 0 8px #7B2FFF' }} />
        <span style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.55)' }}>VOID_OS</span>
        <span style={{ color: 'rgba(232,232,240,.55)' }}>/</span>
        <span style={{ fontSize: '8px', letterSpacing: '2px', color: '#7B2FFF', textShadow: '0 0 8px rgba(123,47,255,.3)' }}>WORK.db</span>
        <div style={{ marginLeft: 'auto', fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.4)' }}>DEPTH: {Math.round(scrollProgress * 100)}%</div>
      </div>

      {/* 3D Tunnel */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 55 }} gl={{ antialias: true }}>
          <TunnelScene scrollProgress={scrollProgress} projects={PROJECTS} onSelect={setSelectedProject} />
        </Canvas>
        <VoidPostProcessing intensity={1.0} />
      </div>

      {/* HUD Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* Header */}
        <div style={{ position: 'absolute', top: 80, left: 40 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', color: '#7B2FFF', textShadow: '0 0 10px rgba(123,47,255,.3)', marginBottom: 8 }}>02 // WORK.db</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)', marginBottom: 6, color: '#E8E8F0' }}>
            Project <span style={{ color: '#7B2FFF', textShadow: '0 0 15px rgba(123,47,255,.3)' }}>Tunnel</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,.65)', letterSpacing: '1px' }}>SCROLL TO FLY · CLICK CARD TO EXPLORE</p>
        </div>

        {/* Vertical progress */}
        <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 2, height: 200, background: 'rgba(255,255,255,0.08)' }}>
          <div style={{ width: '100%', height: `${scrollProgress * 100}%`, background: 'linear-gradient(180deg, #00D4FF, #7B2FFF)', boxShadow: '0 0 8px rgba(0,212,255,0.3)', transition: 'height 0.1s ease' }} />
          <div style={{ position: 'absolute', right: 10, whiteSpace: 'nowrap', top: `${scrollProgress * 100}%`, transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,.65)' }}>
            {Math.round(scrollProgress * PROJECTS.length)}/{PROJECTS.length}
          </div>
        </div>

        {/* Project indicators — bottom */}
        <div style={{ position: 'absolute', bottom: 30, left: 40, display: 'flex', gap: 6 }}>
          {PROJECTS.map((p, i) => {
            const isActive = Math.abs(scrollProgress - i / Math.max(PROJECTS.length - 1, 1)) < 0.18;
            return (
              <div key={p.id} style={{
                pointerEvents: 'auto', cursor: 'pointer',
                width: isActive ? 24 : 8, height: 3, borderRadius: 1,
                background: isActive ? p.color : 'rgba(255,255,255,0.1)',
                boxShadow: isActive ? `0 0 6px ${p.color}55` : 'none',
                transition: 'all 0.4s ease',
              }} onClick={() => setScrollProgress(i / Math.max(PROJECTS.length - 1, 1))} />
            );
          })}
        </div>
      </div>

      {/* Case study modal */}
      {selectedProject && <CaseStudyOverlay project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}

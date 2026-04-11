'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { PROJECTS, Project } from '@/lib/portfolio-data';
import VoidPostProcessing from '@/components/shaders/VoidPostProcessing';

/* ============================================
   3D PROJECT CARD with Html label
   ============================================ */
function ProjectCard3D({ project, position, index, onSelect, scrollProgress }: {
  project: Project; position: [number, number, number]; index: number;
  onSelect: (p: Project) => void; scrollProgress: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();
  const color = useMemo(() => new THREE.Color(project.color), [project.color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + index * 2) * 0.15;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.3 + index) * 0.08;

    if (hovered) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, pointer.x * 0.4, 0.08);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -pointer.y * 0.3, 0.08);
    } else {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, Math.sin(t * 0.2 + index) * 0.1, 0.03);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, Math.cos(t * 0.15 + index) * 0.05, 0.03);
    }

    const targetScale = hovered ? 1.1 : 1;
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);

    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = hovered ? 0.12 + Math.sin(t * 3) * 0.04 : 0.02;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(project); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
      >
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial
          color={hovered ? project.color : '#0a0a14'}
          emissive={project.color}
          emissiveIntensity={hovered ? 0.18 : 0.03}
          transparent opacity={0.92} side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top accent line */}
      <mesh position={[0, 0.75, 0.01]}>
        <planeGeometry args={[2.4, 0.025]} />
        <meshBasicMaterial color={project.color} transparent opacity={hovered ? 0.9 : 0.4} />
      </mesh>

      {/* Wireframe border */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.45, 1.55]} />
        <meshBasicMaterial color={project.color} wireframe transparent opacity={hovered ? 0.25 : 0.06} />
      </mesh>

      {/* Glow */}
      <mesh ref={glowRef} position={[0, 0, -0.1]} scale={1.3}>
        <planeGeometry args={[2.8, 1.8]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.02} side={THREE.DoubleSide} />
      </mesh>

      {/* HTML Label — always visible */}
      <Html
        center
        position={[0, 0, 0.02]}
        distanceFactor={5.5}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '6px', minWidth: '180px', textAlign: 'center',
          padding: '12px',
        }}>
          {/* Year badge */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px', letterSpacing: '2px',
            color: project.color, opacity: 0.7,
          }}>
            {project.year}
          </div>

          {/* Project title */}
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: hovered ? '15px' : '13px',
            fontWeight: 700,
            color: hovered ? '#E8E8F0' : 'rgba(232,232,240,0.5)',
            transition: 'all 0.3s',
            textShadow: hovered ? `0 0 20px ${project.color}50` : 'none',
            lineHeight: 1.2,
          }}>
            {project.title}
          </div>

          {/* Description */}
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '8px', letterSpacing: '0.5px',
            color: hovered ? 'rgba(232,232,240,0.4)' : 'rgba(232,232,240,0.2)',
            transition: 'color 0.3s',
            maxWidth: '160px', lineHeight: 1.5,
          }}>
            {project.description.slice(0, 60)}...
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '6px', padding: '1px 4px',
                border: `1px solid ${project.color}30`,
                borderRadius: '1px',
                color: hovered ? project.color : 'rgba(232,232,240,0.2)',
                transition: 'color 0.3s',
              }}>{tag}</span>
            ))}
          </div>

          {/* Click hint */}
          {hovered && (
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '7px', letterSpacing: '2px',
              color: project.color, opacity: 0.5,
              marginTop: '4px',
            }}>
              ▸ CLICK TO EXPLORE
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

/* ============================================
   TUNNEL PARTICLES
   ============================================ */
function TunnelParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 1000;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette: [number, number, number][] = [[0, 0.83, 1], [0.48, 0.18, 1], [0.22, 1, 0.08], [1, 0.72, 0]];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 10;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += 0.08;
      if (arr[i * 3 + 2] > 40) arr[i * 3 + 2] = -40;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.z = clock.getElapsedTime() * 0.006;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors transparent opacity={0.5} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

/* ============================================
   TUNNEL RINGS
   ============================================ */
function TunnelRing({ z, color, radius }: { z: number; color: string; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = clock.getElapsedTime() * 0.1;
  });
  return (
    <mesh ref={ref} position={[0, 0, z]}>
      <torusGeometry args={[radius, 0.01, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.08} />
    </mesh>
  );
}

/* ============================================
   TUNNEL SCENE — curved camera path
   ============================================ */
function TunnelScene({ scrollProgress, projects, onSelect }: {
  scrollProgress: number; projects: Project[];
  onSelect: (p: Project) => void;
}) {
  const { camera } = useThree();

  const cardPositions: [number, number, number][] = useMemo(() =>
    projects.map((_, i) => {
      const side = i % 2 === 0 ? -1.8 : 1.8;
      const z = -i * 6;
      const y = Math.sin(i * 0.8) * 0.3;
      return [side, y, z] as [number, number, number];
    }), [projects]);

  // Curved camera path — sine wave on X and Y for cinematic feel
  useFrame(() => {
    const maxZ = -(projects.length - 1) * 6;
    const targetZ = -scrollProgress * Math.abs(maxZ);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5 + targetZ, 0.05);
    // Gentle S-curve on X axis
    camera.position.x = Math.sin(camera.position.z * 0.015) * 0.6;
    // Gentle bob on Y axis
    camera.position.y = Math.cos(camera.position.z * 0.01) * 0.25 + 0.1;
    // Slight roll for cinematic tilt
    camera.rotation.z = Math.sin(camera.position.z * 0.008) * 0.02;
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[3, 3, 5]} intensity={0.4} color="#00D4FF" />
      <pointLight position={[-3, -2, -5]} intensity={0.3} color="#7B2FFF" />
      <fog attach="fog" args={['#030306', 5, 40]} />

      <TunnelParticles />

      {Array.from({ length: 25 }).map((_, i) => (
        <TunnelRing
          key={i}
          z={-i * 6}
          color={i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#7B2FFF' : '#39FF14'}
          radius={4 + Math.sin(i * 0.7) * 1.5}
        />
      ))}

      {projects.map((project, i) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          position={cardPositions[i]}
          index={i}
          onSelect={onSelect}
          scrollProgress={scrollProgress}
        />
      ))}
    </>
  );
}

/* ============================================
   CASE STUDY OVERLAY — GSAP entrance
   ============================================ */
function CaseStudyOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    if (overlayRef.current) tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    if (cardRef.current) tl.fromTo(cardRef.current, { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.3)' }, 0.1);

    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => { tl.kill(); window.removeEventListener('keydown', handler); };
  }, [onClose]);

  const rgb = `${parseInt(project.color.slice(1, 3), 16)},${parseInt(project.color.slice(3, 5), 16)},${parseInt(project.color.slice(5, 7), 16)}`;

  return (
    <div ref={overlayRef} onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(3,3,6,0.94)', backdropFilter: 'blur(20px)',
    }}>
      <div ref={cardRef} onClick={e => e.stopPropagation()} style={{
        maxWidth: '680px', width: '92%', maxHeight: '85vh', overflow: 'auto',
        background: 'rgba(10,10,18,0.95)', border: `1px solid rgba(${rgb}, 0.2)`,
        borderRadius: '2px', position: 'relative',
      }}>
        {/* Glitch header bar */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }} />

        <div style={{ padding: '36px' }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: '12px', right: '12px',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)',
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer',
          }}
            onMouseEnter={e => { gsap.to(e.currentTarget, { borderColor: project.color, color: project.color, duration: 0.2 }); }}
            onMouseLeave={e => { gsap.to(e.currentTarget, { borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', duration: 0.3 }); }}
          >✕</button>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: project.color, letterSpacing: '3px', marginBottom: '10px' }}>
            CASE STUDY · {project.year}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, marginBottom: '12px', lineHeight: 1.1 }}>
            {project.title}
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '24px' }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 8px',
                borderRadius: '2px', background: `rgba(${rgb}, 0.08)`,
                border: `1px solid rgba(${rgb}, 0.15)`, color: project.color,
              }}>{tag}</span>
            ))}
          </div>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--text-dim)',
            lineHeight: 1.9, marginBottom: '32px',
          }}>
            {project.longDescription}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '10px 22px',
                borderRadius: '2px', background: project.color, color: '#030306',
                fontWeight: 600, letterSpacing: '1px', cursor: 'pointer',
              }}
                onMouseEnter={e => { gsap.to(e.currentTarget, { scale: 1.03, duration: 0.15 }); }}
                onMouseLeave={e => { gsap.to(e.currentTarget, { scale: 1, duration: 0.2 }); }}
              >◉ LIVE DEMO</a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '10px 22px',
                borderRadius: '2px', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--white)', letterSpacing: '1px', cursor: 'pointer',
              }}
                onMouseEnter={e => { gsap.to(e.currentTarget, { borderColor: project.color, color: project.color, scale: 1.03, duration: 0.15 }); }}
                onMouseLeave={e => { gsap.to(e.currentTarget, { borderColor: 'rgba(255,255,255,0.08)', color: '#E8E8F0', scale: 1, duration: 0.2 }); }}
              >⌥ SOURCE CODE</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   WORK.db — MAIN
   ============================================ */
export default function WorkSection() {
  const { navigateTo } = useVoidStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const indicatorsRef = useRef<HTMLDivElement>(null);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (headerRef.current) tl.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.1);
    if (progressRef.current) tl.fromTo(progressRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.4);
    if (indicatorsRef.current) tl.fromTo(indicatorsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.5);
    return () => { tl.kill(); };
  }, []);

  // Scroll/wheel
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScrollProgress(prev => Math.max(0, Math.min(1, prev + e.deltaY * 0.0008)));
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handler, { passive: false });
    return () => { if (container) container.removeEventListener('wheel', handler); };
  }, []);

  // Drag
  const isDragging = useRef(false);
  const lastY = useRef(0);
  useEffect(() => {
    const handleDown = (e: MouseEvent) => { isDragging.current = true; lastY.current = e.clientY; };
    const handleMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = lastY.current - e.clientY;
      lastY.current = e.clientY;
      setScrollProgress(prev => Math.max(0, Math.min(1, prev + delta * 0.002)));
    };
    const handleUp = () => { isDragging.current = false; };
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return (
    <div ref={containerRef} style={{
      position: 'fixed', inset: 0, background: '#030306', zIndex: 50, overflow: 'hidden',
    }}>
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      {/* 3D Tunnel */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 55 }} gl={{ antialias: true }}>
          <TunnelScene scrollProgress={scrollProgress} projects={PROJECTS} onSelect={setSelectedProject} />
        </Canvas>
        <VoidPostProcessing intensity={1.0} />
      </div>

      {/* HUD */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        <div ref={headerRef} style={{
          position: 'absolute', top: '80px', left: '40px', opacity: 0,
        }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>02 // WORK.db</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)',
            marginBottom: '6px',
          }}>
            Selected <span className="glow-text-purple">Work</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            SCROLL OR DRAG TO FLY · CLICK CARD TO EXPLORE
          </p>
        </div>

        {/* Progress bar */}
        <div ref={progressRef} style={{
          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
          width: '2px', height: '200px', borderRadius: '1px',
          background: 'rgba(255,255,255,0.04)', opacity: 0,
        }}>
          <div style={{
            width: '100%', borderRadius: '1px',
            height: `${scrollProgress * 100}%`,
            background: 'linear-gradient(180deg, var(--blue), var(--purple))',
            boxShadow: '0 0 8px rgba(0,212,255,0.3)',
            transition: 'height 0.1s ease',
          }} />
          <div style={{
            position: 'absolute', right: '10px', whiteSpace: 'nowrap',
            top: `${scrollProgress * 100}%`, transform: 'translateY(-50%)',
            fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)',
          }}>
            {Math.round(scrollProgress * PROJECTS.length)}/{PROJECTS.length}
          </div>
        </div>

        {/* Project indicators */}
        <div ref={indicatorsRef} style={{
          position: 'absolute', bottom: '30px', left: '40px',
          display: 'flex', gap: '6px', opacity: 0,
        }}>
          {PROJECTS.map((p, i) => {
            const isActive = Math.abs(scrollProgress - i / PROJECTS.length) < 0.15;
            return (
              <div key={p.id} style={{
                pointerEvents: 'auto', cursor: 'pointer',
                width: isActive ? '24px' : '8px', height: '3px', borderRadius: '1px',
                background: isActive ? p.color : 'rgba(255,255,255,0.1)',
                boxShadow: isActive ? `0 0 6px ${p.color}55` : 'none',
                transition: 'all 0.4s ease',
              }}
                onClick={() => setScrollProgress(i / PROJECTS.length)}
              />
            );
          })}
        </div>
      </div>

      {selectedProject && <CaseStudyOverlay project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}

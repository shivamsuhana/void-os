'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useVoidStore } from '@/lib/store';
import { PROJECTS, Project } from '@/lib/portfolio-data';
import VoidPostProcessing from '@/components/shaders/VoidPostProcessing';

/* ============================================
   3D PROJECT CARD — floats in tunnel space
   Physically tilts toward mouse, glows on proximity
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

    // Float animation
    meshRef.current.position.y = position[1] + Math.sin(t * 0.4 + index * 2) * 0.15;
    meshRef.current.position.x = position[0] + Math.cos(t * 0.3 + index) * 0.08;

    // Tilt toward mouse when hovered
    if (hovered) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, pointer.x * 0.4, 0.08);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -pointer.y * 0.3, 0.08);
    } else {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, Math.sin(t * 0.2 + index) * 0.1, 0.03);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, Math.cos(t * 0.15 + index) * 0.05, 0.03);
    }

    // Scale on hover
    const targetScale = hovered ? 1.08 : 1;
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1);
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, 0.1);

    // Glow pulse
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = hovered ? 0.12 + Math.sin(t * 3) * 0.04 : 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Card plane */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(project); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'none'; }}
      >
        <planeGeometry args={[2.2, 1.4]} />
        <meshStandardMaterial
          color={hovered ? project.color : '#111118'}
          emissive={project.color}
          emissiveIntensity={hovered ? 0.15 : 0.03}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Top accent line */}
      <mesh position={[0, 0.7, 0.01]}>
        <planeGeometry args={[2.2, 0.02]} />
        <meshBasicMaterial color={project.color} transparent opacity={hovered ? 0.9 : 0.4} />
      </mesh>

      {/* Wireframe border */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.25, 1.45]} />
        <meshBasicMaterial color={project.color} wireframe transparent opacity={hovered ? 0.2 : 0.06} />
      </mesh>

      {/* Glow plane behind */}
      <mesh ref={glowRef} position={[0, 0, -0.1]} scale={1.3}>
        <planeGeometry args={[2.5, 1.7]} />
        <meshBasicMaterial color={project.color} transparent opacity={0.03} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* ============================================
   TUNNEL PARTICLES — flying through space
   ============================================ */
function TunnelParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette: [number, number, number][] = [[0, 0.83, 1], [0.48, 0.18, 1], [0.22, 1, 0.08], [1, 0.72, 0]];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 8;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
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
      if (arr[i * 3 + 2] > 30) arr[i * 3 + 2] = -30;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.z = clock.getElapsedTime() * 0.008;
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
   TUNNEL RING STRUCTURES
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
   TUNNEL SCENE — camera on scroll
   ============================================ */
function TunnelScene({ scrollProgress, projects, onSelect }: {
  scrollProgress: number; projects: Project[];
  onSelect: (p: Project) => void;
}) {
  const cameraGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // Card positions: alternating left and right, staggered along Z
  const cardPositions: [number, number, number][] = useMemo(() =>
    projects.map((_, i) => {
      const side = i % 2 === 0 ? -1.8 : 1.8;
      const z = -i * 5;
      const y = (Math.random() - 0.5) * 0.5;
      return [side, y, z] as [number, number, number];
    }), [projects]);

  // Camera follows scroll along Z axis
  useFrame(() => {
    const maxZ = -(projects.length - 1) * 5;
    const targetZ = -scrollProgress * Math.abs(maxZ);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5 + targetZ, 0.06);
    camera.position.x = Math.sin(camera.position.z * 0.02) * 0.3;
    camera.position.y = Math.cos(camera.position.z * 0.015) * 0.15;
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 5]} intensity={0.3} color="#00D4FF" />
      <pointLight position={[-3, -2, -5]} intensity={0.25} color="#7B2FFF" />
      <fog attach="fog" args={['#030306', 5, 35]} />

      <TunnelParticles />

      {/* Tunnel rings at regular intervals */}
      {Array.from({ length: 20 }).map((_, i) => (
        <TunnelRing
          key={i}
          z={-i * 6}
          color={i % 3 === 0 ? '#00D4FF' : i % 3 === 1 ? '#7B2FFF' : '#39FF14'}
          radius={4 + Math.sin(i * 0.7) * 1}
        />
      ))}

      {/* Project cards floating in space */}
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
   CASE STUDY OVERLAY — full immersive modal
   ============================================ */
function CaseStudyOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    setTimeout(() => setEntering(false), 50);
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const rgb = `${parseInt(project.color.slice(1, 3), 16)},${parseInt(project.color.slice(3, 5), 16)},${parseInt(project.color.slice(5, 7), 16)}`;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: entering ? 'transparent' : 'rgba(3,3,6,0.94)',
      backdropFilter: entering ? 'none' : 'blur(20px)',
      transition: 'all 0.4s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: '680px', width: '92%', maxHeight: '85vh', overflow: 'auto',
        background: 'rgba(10,10,18,0.95)', border: `1px solid rgba(${rgb}, 0.2)`,
        borderRadius: '2px', position: 'relative',
        transform: entering ? 'scale(0.9) translateY(20px)' : 'scale(1) translateY(0)',
        opacity: entering ? 0 : 1,
        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Glitch header bar */}
        <div style={{ height: '3px', background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }} />

        <div style={{ padding: '36px' }}>
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '12px', right: '12px',
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)',
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = project.color; e.currentTarget.style.color = project.color; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
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

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '10px 22px',
                borderRadius: '2px', background: project.color, color: '#030306',
                fontWeight: 600, letterSpacing: '1px', transition: 'opacity 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >◉ LIVE DEMO</a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '10px 22px',
                borderRadius: '2px', border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--white)', letterSpacing: '1px', transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = project.color; e.currentTarget.style.color = project.color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--white)'; }}
              >⌥ SOURCE CODE</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   WORK.db — MAIN SECTION ORCHESTRATOR
   ============================================ */
export default function WorkSection() {
  const { navigateTo } = useVoidStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  // Scroll/wheel controls tunnel camera
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setScrollProgress(prev => Math.max(0, Math.min(1, prev + e.deltaY * 0.0008)));
    };
    const container = containerRef.current;
    if (container) container.addEventListener('wheel', handler, { passive: false });
    return () => { if (container) container.removeEventListener('wheel', handler); };
  }, []);

  // Drag navigation
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
      <button className="back-button" onClick={() => navigateTo('desktop')}>← VOID DESKTOP</button>

      {/* 3D Tunnel Canvas */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: visible ? 1 : 0, transition: 'opacity 0.8s ease',
      }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 55 }} gl={{ antialias: true }}>
          <TunnelScene scrollProgress={scrollProgress} projects={PROJECTS} onSelect={setSelectedProject} />
        </Canvas>
        <VoidPostProcessing intensity={1.0} />
      </div>

      {/* HUD Overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
        {/* Section label */}
        <div style={{
          position: 'absolute', top: '80px', left: '40px',
          animation: visible ? 'fadeInUp 0.6s ease 0.2s both' : 'none',
        }}>
          <div className="section-label" style={{ marginBottom: '8px' }}>02 // WORK.db</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px, 3vw, 36px)',
            marginBottom: '6px',
          }}>
            Selected <span className="glow-text-purple">Work</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            SCROLL OR DRAG TO FLY THROUGH
          </p>
        </div>

        {/* Scroll progress bar */}
        <div style={{
          position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
          width: '2px', height: '200px', borderRadius: '1px',
          background: 'rgba(255,255,255,0.04)',
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
        <div style={{
          position: 'absolute', bottom: '30px', left: '40px',
          display: 'flex', gap: '6px',
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

      {/* CRT overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 11, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
      }} />

      {selectedProject && <CaseStudyOverlay project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}

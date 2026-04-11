'use client';

import { useState, useRef, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { PROJECTS, Project } from '@/lib/portfolio-data';

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

/* ── Project Card with 3D tilt ── */
function ProjectCard({ project, index, onSelect }: { project: Project; index: number; onSelect: (p: Project) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (y - 0.5) * -15, y: (x - 0.5) * 15 });
    setGlowPos({ x: x * 100, y: y * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onSelect(project)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative', cursor: 'pointer', borderRadius: '16px',
        background: 'var(--glass)', border: '1px solid var(--glass-border)',
        overflow: 'hidden', transition: 'border-color 0.3s ease',
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
        animation: `fadeInUp 0.6s ease ${index * 0.15}s both`,
      }}
    >
      {/* Mouse-follow glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: tilt.x !== 0 ? 1 : 0, transition: 'opacity 0.3s',
        background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(${hexToRgb(project.color)}, 0.15) 0%, transparent 60%)`,
      }} />

      {/* Featured Badge */}
      {project.featured && (
        <div style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 2,
          fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px',
          padding: '4px 8px', borderRadius: '4px',
          background: `rgba(${hexToRgb(project.color)}, 0.15)`,
          border: `1px solid rgba(${hexToRgb(project.color)}, 0.3)`,
          color: project.color,
        }}>★ FEATURED</div>
      )}

      {/* Color Accent Bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

      {/* Content */}
      <div style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--ghost-white)' }}>
            {project.title}
          </h3>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{project.year}</span>
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '20px' }}>
          {project.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
          {project.tags.map((tag) => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px',
              borderRadius: '3px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-dim)',
            }}>{tag}</span>
          ))}
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: project.color,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          VIEW CASE STUDY →
        </div>
      </div>
    </div>
  );
}

/* ── Case Study Modal ── */
function CaseStudyModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(3,3,6,0.9)', backdropFilter: 'blur(10px)', animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '700px', width: '90%', maxHeight: '80vh', overflow: 'auto',
          background: 'var(--void-deep)', border: '1px solid var(--glass-border)',
          borderRadius: '20px', padding: '40px', position: 'relative',
          animation: 'fadeInUp 0.4s ease',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-dim)',
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* Color bar */}
        <div style={{ height: '3px', background: project.color, borderRadius: '2px', marginBottom: '24px' }} />

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: project.color, letterSpacing: '2px', marginBottom: '8px' }}>
          CASE STUDY
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>
          {project.title}
        </h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {project.tags.map((tag) => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '3px 8px',
              borderRadius: '3px', background: `rgba(${hexToRgb(project.color)}, 0.1)`,
              border: `1px solid rgba(${hexToRgb(project.color)}, 0.2)`, color: project.color,
            }}>{tag}</span>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-dim)', lineHeight: 1.8, marginBottom: '32px' }}>
          {project.longDescription}
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '10px 20px',
              borderRadius: '8px', background: project.color, color: 'var(--void-black)',
              fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'opacity 0.2s',
            }}>◉ LIVE DEMO</a>
          )}
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px', padding: '10px 20px',
              borderRadius: '8px', border: '1px solid var(--glass-border)',
              color: 'var(--ghost-white)', display: 'inline-flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.2s',
            }}>⌥ GITHUB</a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Work Section ── */
export default function WorkSection() {
  const { setActiveSection } = useVoidStore();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const allTags = Array.from(new Set(PROJECTS.flatMap((p) => p.tags)));
  const filtered = activeFilter ? PROJECTS.filter((p) => p.tags.includes(activeFilter)) : PROJECTS;

  return (
    <div className="section-container" style={{ background: 'var(--void-black)' }}>
      <button className="back-button" onClick={() => setActiveSection('desktop')}>← VOID DESKTOP</button>

      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '40px' }}>
        <div className="section-header">
          <span className="section-tag">// WORK.db</span>
          <h1>Selected <span className="glow-text-purple">Work</span></h1>
          <p className="section-desc">Projects that push the boundaries of what&apos;s possible on the web.</p>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
          <button
            onClick={() => setActiveFilter(null)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '6px 14px',
              borderRadius: '6px', transition: 'all 0.2s',
              background: !activeFilter ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${!activeFilter ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: !activeFilter ? 'var(--plasma-blue)' : 'var(--text-dim)',
            }}
          >ALL</button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveFilter(tag === activeFilter ? null : tag)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '6px 14px',
                borderRadius: '6px', transition: 'all 0.2s',
                background: tag === activeFilter ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${tag === activeFilter ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: tag === activeFilter ? 'var(--plasma-blue)' : 'var(--text-dim)',
              }}
            >{tag}</button>
          ))}
        </div>

        {/* Project Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filtered.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onSelect={setSelectedProject} />
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      {selectedProject && <CaseStudyModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}

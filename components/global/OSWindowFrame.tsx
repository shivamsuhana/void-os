'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';

/**
 * OSWindowFrame — Wraps every section to look like an actual OS application window.
 *
 * Features:
 * - Glass title bar with colored dot, section name, file extension
 * - Window controls: minimize + close (close = back to desktop)
 * - Glassmorphism border with subtle glow
 * - GSAP entry animation (scale 0.96 → 1, fade in)
 * - Subtle top-edge light reflection
 */
interface OSWindowFrameProps {
  name: string;
  ext: string;
  color: string;
  children: ReactNode;
}

export default function OSWindowFrame({ name, ext, color, children }: OSWindowFrameProps) {
  const { navigateTo } = useVoidStore();
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frameRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(
      frameRef.current,
      { opacity: 0, scale: 0.96, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    );

    return () => { tl.kill(); };
  }, []);

  const handleClose = () => {
    if (!frameRef.current) return;
    gsap.to(frameRef.current, {
      opacity: 0, scale: 0.97, y: 8, duration: 0.25, ease: 'power2.in',
      onComplete: () => navigateTo('desktop'),
    });
  };

  return (
    <div
      ref={frameRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        opacity: 0,
      }}
    >
      {/* ═══ TITLE BAR ═══ */}
      <div
        style={{
          height: 36,
          minHeight: 36,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          background: 'rgba(8,8,20,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${color}22`,
          zIndex: 20,
          gap: 10,
          // Top edge light — makes it feel like a physical window
          boxShadow: `inset 0 1px 0 ${color}15, 0 1px 8px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Colored dot indicator */}
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          boxShadow: `0 0 6px ${color}88, 0 0 12px ${color}44`,
          flexShrink: 0,
        }} />

        {/* Window title */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '2.5px',
          color: `${color}cc`,
          textShadow: `0 0 8px ${color}33`,
          userSelect: 'none',
          flexShrink: 0,
        }}>
          {name}<span style={{ color: 'rgba(232,232,240,0.2)' }}>{ext}</span>
        </div>

        {/* Fake path breadcrumb */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          color: 'rgba(232,232,240,0.12)',
          letterSpacing: '1px',
          marginLeft: 4,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          flex: 1,
        }}>
          ~/void-os/sectors/{name.toLowerCase()}/
        </div>

        {/* Window controls — right side */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
          {/* Minimize */}
          <button
            onClick={handleClose}
            style={{
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(232,232,240,0.06)',
              borderRadius: 3,
              color: 'rgba(232,232,240,0.25)',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232,232,240,0.06)';
              e.currentTarget.style.color = 'rgba(232,232,240,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(232,232,240,0.25)';
            }}
            title="Minimize"
          >
            _
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            style={{
              width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: '1px solid rgba(255,51,102,0.1)',
              borderRadius: 3,
              color: 'rgba(255,51,102,0.35)',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-mono)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,51,102,0.12)';
              e.currentTarget.style.color = '#FF3366';
              e.currentTarget.style.borderColor = 'rgba(255,51,102,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,51,102,0.35)';
              e.currentTarget.style.borderColor = 'rgba(255,51,102,0.1)';
            }}
            title="Close — Return to Desktop"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ═══ LEFT EDGE ACCENT ═══ */}
      <div style={{
        position: 'absolute',
        left: 0, top: 36, bottom: 0,
        width: 1,
        background: `linear-gradient(180deg, ${color}40 0%, ${color}08 40%, transparent 100%)`,
        zIndex: 15,
        pointerEvents: 'none',
      }} />

      {/* ═══ CONTENT AREA ═══ */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </div>
    </div>
  );
}

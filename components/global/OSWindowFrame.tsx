'use client';

import { useEffect, useRef, ReactNode } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';

/**
 * OSWindowFrame — Wraps every section to look like an actual OS application window.
 * v2: More visible title bar, bigger close button, stronger glass effect
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
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        opacity: 0,
      }}
    >
      {/* ═══ TITLE BAR — PROMINENT ═══ */}
      <div
        style={{
          height: 44,
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: 'rgba(5,5,16,0.95)',
          borderBottom: `1px solid ${color}44`,
          zIndex: 9998,
          gap: 12,
          boxShadow: `inset 0 -1px 0 ${color}22, 0 2px 12px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Colored dot — bigger */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: color,
          boxShadow: `0 0 8px ${color}aa, 0 0 16px ${color}44`,
          flexShrink: 0,
        }} />

        {/* Window title — more visible */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '2.5px',
          color: color,
          textShadow: `0 0 10px ${color}55`,
          userSelect: 'none',
          flexShrink: 0,
          fontWeight: 600,
        }}>
          {name}<span style={{ color: 'rgba(232,232,240,0.35)', fontWeight: 400 }}>{ext}</span>
        </div>

        {/* Path breadcrumb */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'rgba(232,232,240,0.2)',
          letterSpacing: '1px',
          marginLeft: 4,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          flex: 1,
        }}>
          ~/void-os/sectors/{name.toLowerCase()}/
        </div>

        {/* Running indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginRight: 8,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#39FF14',
            boxShadow: '0 0 6px #39FF14aa',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            color: 'rgba(57,255,20,0.5)',
            letterSpacing: '1.5px',
          }}>RUNNING</span>
        </div>

        {/* ═══ CLOSE BUTTON — BIG AND OBVIOUS ═══ */}
        <button
          onClick={handleClose}
          style={{
            width: 32, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,51,102,0.08)',
            border: '1px solid rgba(255,51,102,0.2)',
            borderRadius: 4,
            color: '#FF3366',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,51,102,0.2)';
            e.currentTarget.style.borderColor = '#FF3366';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(255,51,102,0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,51,102,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,51,102,0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Close — Return to Desktop"
        >
          ✕
        </button>
      </div>

      {/* ═══ TOP ACCENT LINE ═══ */}
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, transparent 5%, ${color}55 30%, ${color}88 50%, ${color}55 70%, transparent 95%)`,
        zIndex: 9997,
        pointerEvents: 'none',
      }} />

      {/* ═══ LEFT EDGE ACCENT ═══ */}
      <div style={{
        position: 'absolute',
        left: 0, top: 44, bottom: 34,
        width: 2,
        background: `linear-gradient(180deg, ${color}60 0%, ${color}15 40%, transparent 100%)`,
        zIndex: 9997,
        pointerEvents: 'none',
      }} />

      {/* ═══ CONTENT AREA ═══ */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {children}
      </div>

      {/* Pulse animation for running indicator */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}} />
    </div>
  );
}

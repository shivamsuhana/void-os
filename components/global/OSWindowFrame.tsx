'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';

/**
 * OSWindowFrame v3 — With live CPU/MEM/NET system meters
 */
interface OSWindowFrameProps {
  name: string;
  ext: string;
  color: string;
  children: ReactNode;
}

function SystemMeters({ color }: { color: string }) {
  const [cpu, setCpu] = useState(42);
  const [mem, setMem] = useState(61);
  const [net, setNet] = useState(28);

  useEffect(() => {
    const iv = setInterval(() => {
      setCpu(v => Math.max(15, Math.min(94, v + (Math.random() - 0.48) * 14)));
      setMem(v => Math.max(40, Math.min(85, v + (Math.random() - 0.48) * 6)));
      setNet(v => Math.max(5, Math.min(99, v + (Math.random() - 0.48) * 22)));
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  const bar = (val: number, label: string, c: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(232,232,240,0.35)', letterSpacing: '1px', width: 24 }}>{label}</span>
      <div style={{ width: 36, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${val}%`, background: c, boxShadow: `0 0 4px ${c}88`, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: c, opacity: 0.8, width: 22 }}>{Math.round(val)}%</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginRight: 10 }}>
      {bar(cpu, 'CPU', color)}
      {bar(mem, 'MEM', '#7B2FFF')}
      {bar(net, 'NET', '#39FF14')}
    </div>
  );
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
      {/* ═══ TITLE BAR ═══ */}
      <div
        style={{
          height: 46,
          minHeight: 46,
          display: 'flex',
          alignItems: 'center',
          padding: '0 14px',
          background: 'linear-gradient(180deg, rgba(8,8,22,0.99) 0%, rgba(5,5,16,0.97) 100%)',
          borderBottom: `1px solid ${color}33`,
          zIndex: 9998,
          gap: 10,
          boxShadow: `inset 0 -1px 0 ${color}18, 0 2px 20px rgba(0,0,0,0.6)`,
          position: 'relative',
        }}
      >
        {/* Colored status dot with pulse */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}66`,
          flexShrink: 0,
          animation: 'os-dot-pulse 2.5s ease-in-out infinite',
        }} />

        {/* Window title */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '3px',
          color: color,
          textShadow: `0 0 12px ${color}66`,
          userSelect: 'none',
          flexShrink: 0,
          fontWeight: 600,
        }}>
          {name}<span style={{ color: 'rgba(232,232,240,0.3)', fontWeight: 400 }}>{ext}</span>
        </div>

        {/* Path breadcrumb */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          color: 'rgba(232,232,240,0.18)',
          letterSpacing: '1px',
          marginLeft: 4,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          flex: 1,
        }}>
          ~/void-os/sectors/{name.toLowerCase()}/
        </div>

        {/* System meters */}
        <SystemMeters color={color} />

        {/* Running indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          marginRight: 6,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            background: '#39FF14',
            boxShadow: '0 0 6px #39FF14',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '7px',
            color: 'rgba(57,255,20,0.5)',
            letterSpacing: '1.5px',
          }}>LIVE</span>
        </div>

        {/* CLOSE BUTTON */}
        <button
          onClick={handleClose}
          style={{
            width: 34, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,51,102,0.08)',
            border: '1px solid rgba(255,51,102,0.25)',
            borderRadius: 3,
            color: '#FF3366',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,51,102,0.22)';
            e.currentTarget.style.borderColor = '#FF3366';
            e.currentTarget.style.boxShadow = '0 0 14px rgba(255,51,102,0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,51,102,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,51,102,0.25)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Close — Return to Desktop"
        >
          ✕
        </button>
      </div>

      {/* ═══ TOP ACCENT LINE ═══ */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent 3%, ${color}44 20%, ${color}99 50%, ${color}44 80%, transparent 97%)`,
        zIndex: 9997,
        pointerEvents: 'none',
        boxShadow: `0 0 8px ${color}33`,
      }} />

      {/* ═══ LEFT EDGE ACCENT ═══ */}
      <div style={{
        position: 'absolute',
        left: 0, top: 48, bottom: 34,
        width: 2,
        background: `linear-gradient(180deg, ${color}80 0%, ${color}20 50%, transparent 100%)`,
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes os-dot-pulse { 0%,100% { box-shadow: 0 0 10px var(--c,#00D4FF), 0 0 20px color-mix(in srgb, var(--c,#00D4FF) 40%, transparent); } 50% { box-shadow: 0 0 6px var(--c,#00D4FF), 0 0 10px color-mix(in srgb, var(--c,#00D4FF) 20%, transparent); } }
      `}} />
    </div>
  );
}

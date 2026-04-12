'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TIMELINE, TimelineEntry } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';

/* ═══════════════════════════════════════════
   NEURAL PATHWAY BACKGROUND
   ═══════════════════════════════════════════ */
function CircuitBG() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight * 3;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight * 3; };
    window.addEventListener('resize', resize);

    // Circuit lines
    ctx.strokeStyle = 'rgba(0,212,255,0.02)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      let x = Math.random() * W, y = Math.random() * H;
      ctx.moveTo(x, y);
      for (let s = 0; s < 6; s++) {
        const dir = Math.floor(Math.random() * 4);
        const len = 20 + Math.random() * 80;
        if (dir === 0) x += len;
        else if (dir === 1) x -= len;
        else if (dir === 2) y += len;
        else y -= len;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      // End dot
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.04)'; ctx.fill();
    }

    return () => window.removeEventListener('resize', resize);
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />;
}

/* ═══════════════════════════════════════════
   TIMELINE NODE — SVG marker on the pathway
   ═══════════════════════════════════════════ */
function TimelineNode({ entry, index, active }: { entry: TimelineEntry; index: number; active: boolean }) {
  const rgb = `${parseInt(entry.color.slice(1, 3), 16)},${parseInt(entry.color.slice(3, 5), 16)},${parseInt(entry.color.slice(5, 7), 16)}`;
  return (
    <div style={{
      position: 'relative', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5, transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      transform: active ? 'scale(1.3)' : 'scale(1)',
    }}>
      {/* Outer pulse */}
      {active && (
        <div style={{
          position: 'absolute', width: 36, height: 36, borderRadius: '50%',
          border: `1px solid ${entry.color}`,
          opacity: 0.3, animation: 'nodePulse 1.8s ease-in-out infinite',
        }} />
      )}
      {/* Core */}
      <div style={{
        width: entry.isMilestone ? 14 : 10, height: entry.isMilestone ? 14 : 10,
        borderRadius: '50%', background: active ? entry.color : `rgba(${rgb},0.3)`,
        boxShadow: active ? `0 0 12px ${entry.color}, 0 0 24px ${entry.color}44` : 'none',
        transition: 'all 0.4s', position: 'relative',
      }}>
        {entry.isMilestone && (
          <div style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            border: `1px solid ${entry.color}66`,
          }} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TIMELINE CARD
   ═══════════════════════════════════════════ */
function TimelineCard({ entry, index, active, side }: { entry: TimelineEntry; index: number; active: boolean; side: 'left' | 'right' }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rgb = `${parseInt(entry.color.slice(1, 3), 16)},${parseInt(entry.color.slice(3, 5), 16)},${parseInt(entry.color.slice(5, 7), 16)}`;
  const [hov, setHov] = useState(false);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        maxWidth: 380, width: '100%',
        padding: '20px 22px',
        background: hov ? `rgba(${rgb},0.06)` : 'rgba(255,255,255,0.025)',
        border: `1px solid ${active ? entry.color + '33' : 'rgba(255,255,255,0.04)'}`,
        borderLeft: side === 'left' ? `3px solid ${active ? entry.color : entry.color + '44'}` : undefined,
        borderRight: side === 'right' ? `3px solid ${active ? entry.color : entry.color + '44'}` : undefined,
        borderRadius: '2px',
        opacity: active ? 1 : 0.3,
        transform: active ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', overflow: 'hidden', cursor: 'default',
        boxShadow: hov ? `0 4px 30px rgba(${rgb},0.08)` : 'none',
      }}
    >
      {/* Top glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${entry.color}33, transparent)`, opacity: active ? 1 : 0 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: entry.color, letterSpacing: '2px', textShadow: active ? `0 0 8px ${entry.color}40` : 'none' }}>{entry.period}</span>
        {entry.isMilestone && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#39FF14', letterSpacing: '1px',
            padding: '2px 8px', border: '1px solid rgba(57,255,20,0.25)', background: 'rgba(57,255,20,0.06)',
            textShadow: '0 0 6px rgba(57,255,20,0.3)',
          }}>★ MILESTONE</span>
        )}
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: 4, color: '#E8E8F0', textShadow: active ? `0 0 12px ${entry.color}15` : 'none' }}>{entry.title}</h3>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: entry.color, marginBottom: 10, letterSpacing: '1px', opacity: 0.5 }}>{entry.company}</div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(232,232,240,0.45)', lineHeight: 1.8, marginBottom: 12 }}>{entry.description}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {entry.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)', fontSize: '8px', padding: '2px 8px',
            border: `1px solid ${entry.color}18`, color: `rgba(${rgb},0.5)`, letterSpacing: '0.5px',
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TIMELINE SECTION
   ═══════════════════════════════════════════ */
export default function TimelineSection() {
  const { navigateTo } = useVoidStore();
  const [activeIdx, setActiveIdx] = useState(-1);
  const [signalY, setSignalY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const signalRef = useRef<HTMLDivElement>(null);

  // Scroll-based signal propagation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollParent = container.closest('[style*="overflow"]') as HTMLElement || document.documentElement;
      const scrollTop = scrollParent === document.documentElement ? window.scrollY : scrollParent.scrollTop;
      const viewH = window.innerHeight;

      // Determine which node is active based on scroll
      let bestIdx = -1;
      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const triggerY = viewH * 0.55;
        if (rect.top < triggerY) bestIdx = i;
      });
      setActiveIdx(bestIdx);
    };

    // Listen on the scroll parent
    const scrollEl = container.closest('[style*="overflow"]') as HTMLElement;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050510', overflowY: 'auto', zIndex: 50 }}>
      {/* CRT */}
      <SectionAmbientBG color="#39FF14" particleCount={30} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />

      {/* Process bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,3,6,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(57,255,20,0.08)', padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)' }}>
        <button onClick={() => navigateTo('desktop')} style={{
          background: 'none', border: '1px solid rgba(0,212,255,.15)', padding: '5px 14px',
          fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: '#00D4FF',
          cursor: 'pointer', transition: 'all .2s', borderRadius: 2,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.5)'; e.currentTarget.style.background = 'rgba(0,212,255,.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.15)'; e.currentTarget.style.background = 'none'; }}
        >← DESKTOP</button>
        <div style={{ width: 1, height: 14, background: 'rgba(57,255,20,.12)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 8px #39FF14' }} />
        <span style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.35)' }}>VOID_OS</span>
        <span style={{ color: 'rgba(232,232,240,.15)' }}>/</span>
        <span style={{ fontSize: '8px', letterSpacing: '2px', color: '#39FF14', textShadow: '0 0 8px rgba(57,255,20,.3)' }}>TIME.log</span>
        <div style={{ marginLeft: 'auto', fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.2)' }}>
          {activeIdx >= 0 ? `NODE ${activeIdx + 1}/${TIMELINE.length}` : 'SCROLL TO BEGIN'}
        </div>
      </div>

      <div ref={containerRef} style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,60px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #39FF14)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', color: '#39FF14', textShadow: '0 0 10px rgba(57,255,20,.3)' }}>04 // TIME.log</span>
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, #39FF14, transparent)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,48px)', lineHeight: 1.1, marginBottom: 8, color: '#E8E8F0' }}>
            Signal <span style={{ color: '#39FF14', textShadow: '0 0 20px rgba(57,255,20,.3)' }}>Pathway</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(232,232,240,.35)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Scroll to propagate the signal through my journey — each node lights up as the data reaches it.
          </p>
        </div>

        {/* Timeline items */}
        <div style={{ position: 'relative' }}>
          {/* Central pathway line */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2,
            transform: 'translateX(-50%)',
            background: 'rgba(57,255,20,0.06)',
          }}>
            {/* Progress fill */}
            <div style={{
              width: '100%',
              height: activeIdx >= 0 ? `${((activeIdx + 1) / TIMELINE.length) * 100}%` : '0%',
              background: 'linear-gradient(180deg, #39FF14, #00D4FF)',
              boxShadow: '0 0 8px rgba(57,255,20,0.4), 0 0 20px rgba(57,255,20,0.15)',
              transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
              borderRadius: 1,
            }} />
            {/* Signal dot */}
            {activeIdx >= 0 && (
              <div style={{
                position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)',
                top: `${((activeIdx + 1) / TIMELINE.length) * 100}%`,
                width: 8, height: 8, borderRadius: '50%',
                background: '#39FF14', boxShadow: '0 0 12px #39FF14, 0 0 30px rgba(57,255,20,0.4)',
                transition: 'top 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            )}
          </div>

          {/* Timeline entries */}
          {TIMELINE.map((entry, i) => {
            const isLeft = i % 2 === 0;
            const active = i <= activeIdx;

            return (
              <div
                key={entry.id}
                ref={el => { nodeRefs.current[i] = el; }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 40px 1fr',
                  alignItems: 'start',
                  marginBottom: i < TIMELINE.length - 1 ? 40 : 0,
                  minHeight: 140,
                }}
              >
                {/* Left side */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 20 }}>
                  {isLeft && <TimelineCard entry={entry} index={i} active={active} side="left" />}
                </div>

                {/* Center node */}
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                  <TimelineNode entry={entry} index={i} active={active} />
                </div>

                {/* Right side */}
                <div style={{ paddingLeft: 20 }}>
                  {!isLeft && <TimelineCard entry={entry} index={i} active={active} side="right" />}
                </div>
              </div>
            );
          })}

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes nodePulse{0%{transform:scale(1);opacity:0.3;}50%{transform:scale(1.6);opacity:0;}100%{transform:scale(1);opacity:0.3;}}
            @media(max-width:768px){
              [style*="grid-template-columns: 1fr 40px 1fr"]{grid-template-columns:20px 1fr!important;}
              [style*="padding-right: 20px"]{padding-right:0!important;display:block!important;justify-content:flex-start!important;}
              [style*="padding-left: 20px"]{padding-left:12px!important;}
            }
          ` }} />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid rgba(57,255,20,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,.15)' }}>TIME.log — SIGNAL COMPLETE</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['work', 'WORK.db →'], ['skills', 'SKILLS.sys →']].map(([section, label]) => (
              <button key={section} onClick={() => navigateTo(section as 'work' | 'skills')} style={{
                background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px',
                color: '#39FF14', opacity: .5, cursor: 'pointer', transition: 'opacity .2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '.5'}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TIMELINE, TimelineEntry } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';
import OSWindowFrame from '@/components/global/OSWindowFrame';

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

  const onMove = (e: React.MouseEvent) => {
    if (!cardRef.current || !hov) return;
    const r = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    cardRef.current.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.03)`;
  };
  const onLeave = (e: React.MouseEvent) => {
    setHov(false);
    if (cardRef.current) cardRef.current.style.transform = active ? 'translateY(0)' : 'translateY(14px)';
    (e.currentTarget as HTMLElement).style.background = 'none';
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
      style={{
        maxWidth: 420, width: '100%',
        padding: '0',
        opacity: active ? 1 : 0.25,
        transform: active ? 'translateY(0)' : 'translateY(14px)',
        transition: hov ? 'none' : 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', cursor: 'default',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main card */}
      <div style={{
        background: hov
          ? `linear-gradient(135deg, rgba(${rgb},0.1), rgba(8,8,22,0.97))`
          : active
            ? 'linear-gradient(135deg, rgba(8,8,22,0.95), rgba(5,5,16,0.9))'
            : 'rgba(5,5,16,0.6)',
        border: `1px solid ${active ? (hov ? entry.color + '88' : entry.color + '33') : 'rgba(255,255,255,0.05)'}`,
        borderLeft: side === 'left'
          ? `3px solid ${active ? entry.color : entry.color + '33'}`
          : undefined,
        borderRight: side === 'right'
          ? `3px solid ${active ? entry.color : entry.color + '33'}`
          : undefined,
        boxShadow: hov
          ? `0 20px 60px rgba(${rgb},0.25), 0 0 40px rgba(${rgb},0.1), inset 0 0 60px rgba(${rgb},0.04)`
          : active ? `0 4px 30px rgba(${rgb},0.1)` : 'none',
        padding: '18px 20px',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Scanlines */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)', zIndex: 0 }} />
        {/* Top glow bar */}
        {active && <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: hov ? 2 : 1, background: `linear-gradient(90deg, transparent, ${entry.color}${hov ? 'aa' : '66'}, transparent)`, transition: 'all 0.3s' }} />}
        {/* Corner brackets on hover */}
        {hov && [
          { top: 5, left: 5, borderTop: `1px solid ${entry.color}88`, borderLeft: `1px solid ${entry.color}88` },
          { top: 5, right: 5, borderTop: `1px solid ${entry.color}88`, borderRight: `1px solid ${entry.color}88` },
          { bottom: 5, left: 5, borderBottom: `1px solid ${entry.color}88`, borderLeft: `1px solid ${entry.color}88` },
          { bottom: 5, right: 5, borderBottom: `1px solid ${entry.color}88`, borderRight: `1px solid ${entry.color}88` },
        ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 8, height: 8, pointerEvents: 'none', zIndex: 5, ...s }} />)}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header row: period + milestone badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px',
              color: entry.color, textShadow: active ? `0 0 12px ${entry.color}80` : 'none',
              padding: '3px 10px', border: `1px solid ${entry.color}${active ? '55' : '22'}`,
              background: `rgba(${rgb},${active ? '0.1' : '0.04'})`,
              transition: 'all 0.3s',
            }}>{entry.period}</div>
            {entry.isMilestone && (
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#39FF14',
                letterSpacing: '1.5px', padding: '3px 8px',
                border: '1px solid rgba(57,255,20,0.35)', background: 'rgba(57,255,20,0.08)',
                textShadow: '0 0 8px rgba(57,255,20,0.6)', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 4px #39FF14', display: 'inline-block', animation: 'nodePulse 2s infinite' }} />
                MILESTONE
              </div>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: 800,
            marginBottom: 3, color: hov ? '#fff' : '#E8E8F0',
            textShadow: hov ? `0 0 20px ${entry.color}60, 0 0 40px ${entry.color}20` : 'none',
            transition: 'all 0.3s', letterSpacing: '0.3px', lineHeight: 1.2,
          }}>{entry.title}</h3>

          {/* Company with accent line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 20, height: 1, background: entry.color, opacity: active ? 0.6 : 0.2 }} />
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', color: entry.color,
              letterSpacing: '1.5px', opacity: hov ? 1 : 0.7,
              textShadow: hov ? `0 0 10px ${entry.color}60` : 'none', transition: 'all 0.3s',
            }}>{entry.company}</div>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '12px',
            color: `rgba(232,232,240,${hov ? 0.8 : 0.55})`,
            lineHeight: 1.9, marginBottom: 14, transition: 'color 0.3s',
          }}>{entry.description}</p>

          {/* Tech chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 6px' }}>
            {entry.tags.map((tag, ti) => (
              <span key={tag} style={{
                fontFamily: 'var(--font-mono)', fontSize: '8px', padding: '3px 10px',
                border: `1px solid ${hov ? entry.color + '66' : entry.color + '22'}`,
                color: hov ? entry.color : `rgba(${rgb},0.6)`,
                letterSpacing: '0.5px', transition: `all 0.3s ease ${ti * 30}ms`,
                background: hov ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.02)',
                boxShadow: hov ? `0 0 8px rgba(${rgb},0.2)` : 'none',
                textShadow: hov ? `0 0 6px ${entry.color}44` : 'none',
              }}>{tag}</span>
            ))}
          </div>

          {/* Signal readout — bottom data strip */}
          {active && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid rgba(${rgb},0.1)`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: entry.color, boxShadow: `0 0 6px ${entry.color}`, animation: 'nodePulse 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: `rgba(${rgb},0.6)`, letterSpacing: '1.5px' }}>NODE_{String(index + 1).padStart(2, '0')} · SIGNAL ACTIVE</span>
            </div>
          )}
        </div>
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

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    <OSWindowFrame name="TIME" ext=".log" color="#39FF14">
    <div style={{ position: 'relative', background: '#050510', overflowY: 'auto', height: '100%' }}>
      <SectionAmbientBG color="#39FF14" particleCount={40} />
      {/* CRT scanlines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
      {/* Holographic grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(57,255,20,1) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      {/* Animated scan line */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.12), transparent)', pointerEvents: 'none', zIndex: 56, animation: 'timeline-scan 5s linear infinite' }} />
      <style dangerouslySetInnerHTML={{ __html: '@keyframes timeline-scan{0%{top:-2px}100%{top:100vh}}' }} />

      <div ref={containerRef} style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,60px)', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, #39FF14)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', color: '#39FF14', textShadow: '0 0 12px rgba(57,255,20,.5)' }}>04 // TIME.log</span>
            <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, #39FF14, transparent)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,5vw,52px)', lineHeight: 1.1, marginBottom: 10, color: '#E8E8F0', textShadow: '0 0 40px rgba(57,255,20,0.1)' }}>
            Signal <span style={{ color: '#39FF14', textShadow: '0 0 30px rgba(57,255,20,.5), 0 0 60px rgba(57,255,20,.2)' }}>Pathway</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(232,232,240,.55)', maxWidth: 500, margin: '0 auto', lineHeight: 1.8 }}>
            Scroll to propagate the signal through my journey — each node lights up as the data reaches it.
          </p>
        </div>

        {/* Timeline items */}
        <div style={{ position: 'relative' }}>
          {/* Central pathway line */}
          <div style={{
            position: 'absolute', left: isMobile ? '20px' : '50%', top: 0, bottom: 0, width: 2,
            transform: 'translateX(-50%)',
            transition: 'left 0.3s ease',
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
                  gridTemplateColumns: isMobile ? '40px 1fr' : '1fr 40px 1fr',
                  alignItems: 'start',
                  marginBottom: i < TIMELINE.length - 1 ? 40 : 0,
                  minHeight: 140,
                }}
              >
                {isMobile ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
                      <TimelineNode entry={entry} index={i} active={active} />
                    </div>
                    <div style={{ paddingLeft: 10 }}>
                      <TimelineCard entry={entry} index={i} active={active} side="right" />
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            );
          })}

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes nodePulse{0%{transform:scale(1);opacity:0.3;}50%{transform:scale(1.6);opacity:0;}100%{transform:scale(1);opacity:0.3;}}
          ` }} />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid rgba(57,255,20,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,.55)' }}>TIME.log — SIGNAL COMPLETE</span>
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
    </OSWindowFrame>
  );
}

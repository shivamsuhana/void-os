'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TIMELINE, TimelineEntry } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';
import OSWindowFrame from '@/components/global/OSWindowFrame';

/* ═══════════════════════════════════════════
   GLITCH DECODE TEXT — Characters randomize then settle
   ═══════════════════════════════════════════ */
function GlitchReveal({ text, active, color = '#39FF14', size = '14px' }: { text: string; active: boolean; color?: string; size?: string }) {
  const [display, setDisplay] = useState(text.replace(/[^ ]/g, '█'));
  const chars = '!@#$%^&*{}[]|<>?/\\█▓▒░';

  useEffect(() => {
    if (!active) { setDisplay(text.replace(/[^ ]/g, '█')); return; }
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setDisplay(text.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        if (i < step) return ch;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(''));
      if (step >= text.length) clearInterval(iv);
    }, 30);
    return () => clearInterval(iv);
  }, [active, text]);

  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: size, color, letterSpacing: '1px', textShadow: `0 0 8px ${color}55` }}>
      {display}
    </span>
  );
}

/* ═══════════════════════════════════════════
   YEAR BEACON — Large holographic year display
   ═══════════════════════════════════════════ */
function YearBeacon({ year, color, active }: { year: string; color: string; active: boolean }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      opacity: active ? 1 : 0.2,
      transition: 'opacity 0.6s',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(48px, 8vw, 72px)',
        fontWeight: 900,
        color: 'transparent',
        WebkitTextStroke: `1px ${color}${active ? '66' : '22'}`,
        lineHeight: 1,
        userSelect: 'none',
        transition: 'all 0.6s',
        textShadow: active ? `0 0 40px ${color}22` : 'none',
      }}>
        {year}
      </div>
      {active && (
        <div style={{
          width: 1, height: 40,
          background: `linear-gradient(180deg, ${color}66, transparent)`,
          marginTop: 8,
        }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   HOLOGRAPHIC CARD — Futuristic timeline entry
   ═══════════════════════════════════════════ */
function HoloCard({ entry, active, index }: { entry: TimelineEntry; active: boolean; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState(false);
  const rgb = `${parseInt(entry.color.slice(1, 3), 16)},${parseInt(entry.color.slice(3, 5), 16)},${parseInt(entry.color.slice(5, 7), 16)}`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.background = `radial-gradient(ellipse at ${x}% ${y}%, rgba(${rgb},0.12), rgba(${rgb},0.03) 60%, rgba(8,8,20,0.9))`;
  };

  useEffect(() => {
    if (!cardRef.current || !active) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, x: index % 2 === 0 ? -30 : 30, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 }
    );
  }, [active, index]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={(e) => { setHov(false); e.currentTarget.style.background = 'rgba(8,8,20,0.9)'; }}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        width: '100%',
        padding: '24px 28px',
        background: 'rgba(8,8,20,0.9)',
        borderTop: `1px solid rgba(${rgb},${active ? (hov ? 0.5 : 0.2) : 0.05})`,
        borderBottom: `1px solid rgba(${rgb},${active ? (hov ? 0.5 : 0.2) : 0.05})`,
        borderLeft: `2px solid ${active ? entry.color : `rgba(${rgb},0.1)`}`,
        borderRight: `1px solid rgba(${rgb},${active ? 0.1 : 0.03})`,
        opacity: active ? 1 : 0.15,
        transform: hov ? 'translateX(8px) scale(1.01)' : 'translateX(0)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        cursor: 'default',
        boxShadow: hov ? `0 8px 40px rgba(${rgb},0.12), inset 0 0 60px rgba(${rgb},0.03)` : 'none',
      }}
    >
      {/* Scanline overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,.006) 3px, rgba(255,255,255,.006) 6px)', zIndex: 0 }} />
      {/* Top glow line */}
      <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: `linear-gradient(90deg, transparent, ${entry.color}${hov ? '66' : '22'}, transparent)`, transition: 'all 0.3s', zIndex: 1 }} />
      {/* Left accent glow */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 30, background: `linear-gradient(90deg, rgba(${rgb},${hov ? 0.08 : 0.02}), transparent)`, pointerEvents: 'none', transition: 'all 0.3s', zIndex: 0 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Status dot */}
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: active ? entry.color : 'rgba(255,255,255,0.1)',
              boxShadow: active ? `0 0 8px ${entry.color}88` : 'none',
              transition: 'all 0.4s',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: entry.color, letterSpacing: '2px',
              textShadow: active ? `0 0 10px ${entry.color}44` : 'none',
            }}>
              {entry.period}
            </span>
            {/* Type badge */}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '1.5px',
              padding: '2px 8px',
              border: `1px solid rgba(${rgb},0.2)`,
              color: `rgba(${rgb},0.6)`,
              textTransform: 'uppercase',
            }}>
              {entry.type}
            </span>
          </div>

          {entry.isMilestone && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#39FF14',
              letterSpacing: '1.5px', padding: '3px 10px',
              border: '1px solid rgba(57,255,20,0.25)',
              background: 'rgba(57,255,20,0.06)',
              textShadow: '0 0 8px rgba(57,255,20,0.4)',
            }}>★ MILESTONE</span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: hov ? '19px' : '18px',
          fontWeight: 700, marginBottom: 6,
          color: hov ? '#fff' : '#E8E8F0',
          textShadow: hov ? `0 0 20px ${entry.color}33` : 'none',
          transition: 'all 0.3s', lineHeight: 1.3,
        }}>
          {entry.title}
        </h3>

        {/* Company/org */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: `rgba(${rgb},${hov ? 0.8 : 0.5})`,
          marginBottom: 12, letterSpacing: '1px',
          transition: 'color 0.3s',
        }}>
          ↳ {entry.company}
        </div>

        {/* Description */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '13px',
          color: `rgba(232,232,240,${hov ? 0.75 : 0.55})`,
          lineHeight: 1.9, marginBottom: 16,
          transition: 'color 0.3s',
        }}>
          {entry.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {entry.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '3px 10px',
              border: `1px solid rgba(${rgb},${hov ? 0.35 : 0.12})`,
              color: hov ? entry.color : `rgba(${rgb},0.5)`,
              letterSpacing: '0.5px', transition: 'all 0.3s',
              background: hov ? `rgba(${rgb},0.06)` : 'transparent',
            }}>{tag}</span>
          ))}
        </div>

        {/* Data stream decoration */}
        <div style={{
          position: 'absolute', bottom: 8, right: 12,
          fontFamily: 'var(--font-mono)', fontSize: '7px',
          color: `rgba(${rgb},0.15)`, letterSpacing: '1px',
        }}>
          NODE_{String(index).padStart(2, '0')} :: {entry.id.toUpperCase().replace(/-/g, '_')}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   TIMELINE SECTION — 2045 HOLOGRAPHIC VERSION
   ═══════════════════════════════════════════ */
export default function TimelineSection() {
  const { navigateTo } = useVoidStore();
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Extract unique years for beacons
  const years = [...new Set(TIMELINE.map(e => e.period.split('-')[0].split('–')[0]))];

  // Scroll-based signal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const viewH = window.innerHeight;
      let bestIdx = -1;
      nodeRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < viewH * 0.6) bestIdx = i;
      });
      setActiveIdx(bestIdx);
    };

    const scrollEl = container.closest('[style*="overflow"]') as HTMLElement;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, []);

  const progress = activeIdx >= 0 ? ((activeIdx + 1) / TIMELINE.length) * 100 : 0;

  return (
    <OSWindowFrame name="TIME" ext=".log" color="#39FF14">
    <div style={{ position: 'relative', background: '#050510', overflowY: 'auto', height: '100%' }}>
      <SectionAmbientBG color="#39FF14" particleCount={35} />
      {/* CRT + vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)' }} />
      {/* Holographic grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(57,255,20,1) 1px,transparent 1px),linear-gradient(90deg,rgba(57,255,20,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      {/* Scan line */}
      <div style={{ position: 'fixed', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.12), transparent)', pointerEvents: 'none', zIndex: 56, animation: 'timelineScan 5s linear infinite' }} />

      <div ref={containerRef} style={{ maxWidth: 950, margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,60px)', position: 'relative', zIndex: 1 }}>

        {/* ═══ HEADER — Large glitch text ═══ */}
        <div style={{ marginBottom: 60, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, #39FF14)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '4px', color: '#39FF14', textShadow: '0 0 12px rgba(57,255,20,.4)' }}>04 // TIME.log</span>
            <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, #39FF14, transparent)' }} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(36px,6vw,56px)', lineHeight: 1.1, marginBottom: 12,
            color: '#E8E8F0',
          }}>
            Signal <span style={{ color: '#39FF14', textShadow: '0 0 30px rgba(57,255,20,.4), 0 0 60px rgba(57,255,20,.15)' }}>Pathway</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(232,232,240,.5)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
            Scroll to propagate the signal — each node activates as data reaches it.
          </p>

          {/* Signal progress bar */}
          <div style={{ maxWidth: 300, margin: '20px auto 0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(57,255,20,0.5)', letterSpacing: '1px' }}>
              SIGNAL
            </span>
            <div style={{ flex: 1, height: 2, background: 'rgba(57,255,20,0.08)', overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: 'linear-gradient(90deg, #39FF14, #00D4FF)',
                boxShadow: '0 0 8px rgba(57,255,20,0.6)',
                transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(57,255,20,0.5)', letterSpacing: '1px' }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* ═══ TIMELINE ENTRIES ═══ */}
        <div style={{ position: 'relative' }}>
          {/* Central beam */}
          <div style={{
            position: 'absolute', left: isMobile ? 12 : 24, top: 0, bottom: 0, width: 2,
            background: 'rgba(57,255,20,0.04)',
          }}>
            {/* Progress glow */}
            <div style={{
              width: '100%',
              height: `${progress}%`,
              background: 'linear-gradient(180deg, #39FF14, #00D4FF)',
              boxShadow: '0 0 12px rgba(57,255,20,0.5), 0 0 30px rgba(57,255,20,0.2)',
              transition: 'height 0.6s cubic-bezier(0.16,1,0.3,1)',
              borderRadius: 1,
            }} />
            {/* Signal dot */}
            {activeIdx >= 0 && (
              <div style={{
                position: 'absolute', left: '50%', transform: 'translate(-50%, -50%)',
                top: `${progress}%`,
                width: 10, height: 10, borderRadius: '50%',
                background: '#39FF14',
                boxShadow: '0 0 16px #39FF14, 0 0 40px rgba(57,255,20,0.5)',
                transition: 'top 0.6s cubic-bezier(0.16,1,0.3,1)',
              }} />
            )}
          </div>

          {/* Entries */}
          {TIMELINE.map((entry, i) => {
            const active = i <= activeIdx;
            const showYear = i === 0 || TIMELINE[i - 1].period !== entry.period;

            return (
              <div
                key={entry.id}
                ref={el => { nodeRefs.current[i] = el; }}
                style={{
                  paddingLeft: isMobile ? 40 : 60,
                  marginBottom: i < TIMELINE.length - 1 ? 24 : 0,
                  position: 'relative',
                }}
              >
                {/* Node on beam */}
                <div style={{
                  position: 'absolute',
                  left: isMobile ? 6 : 18,
                  top: showYear ? 70 : 24,
                  width: 14, height: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 5,
                }}>
                  {/* Pulse ring */}
                  {active && (
                    <div style={{
                      position: 'absolute',
                      width: entry.isMilestone ? 28 : 22,
                      height: entry.isMilestone ? 28 : 22,
                      borderRadius: '50%',
                      border: `1px solid ${entry.color}55`,
                      animation: 'nodePulse 2s ease-in-out infinite',
                    }} />
                  )}
                  {/* Core dot */}
                  <div style={{
                    width: entry.isMilestone ? 10 : 7,
                    height: entry.isMilestone ? 10 : 7,
                    borderRadius: '50%',
                    background: active ? entry.color : 'rgba(255,255,255,0.1)',
                    boxShadow: active ? `0 0 10px ${entry.color}, 0 0 20px ${entry.color}66` : 'none',
                    transition: 'all 0.4s',
                  }} />
                </div>

                {/* Year beacon — only show when year changes */}
                {showYear && (
                  <div style={{ marginBottom: 16 }}>
                    <YearBeacon year={entry.period} color={entry.color} active={active} />
                  </div>
                )}

                {/* Card */}
                <HoloCard entry={entry} active={active} index={i} />
              </div>
            );
          })}
        </div>

        {/* ═══ FOOTER ═══ */}
        <div style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid rgba(57,255,20,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: 'rgba(232,232,240,.5)' }}>TIME.log — SIGNAL COMPLETE</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(57,255,20,0.3)', letterSpacing: '1px', marginTop: 4 }}>
              {TIMELINE.length} NODES PROCESSED :: {TIMELINE.filter(e => e.isMilestone).length} MILESTONES ACHIEVED
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['work', 'WORK.db →'], ['skills', 'SKILLS.sys →']].map(([section, label]) => (
              <button key={section} onClick={() => navigateTo(section as 'work' | 'skills')} style={{
                background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px',
                color: '#39FF14', opacity: .5, cursor: 'pointer', transition: 'opacity .2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '.5'}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes nodePulse{0%{transform:scale(1);opacity:0.4;}50%{transform:scale(1.8);opacity:0;}100%{transform:scale(1);opacity:0.4;}}
        @keyframes timelineScan{0%{top:-2px}100%{top:100vh}}
      ` }} />
    </div>
    </OSWindowFrame>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TIMELINE, TimelineEntry } from '@/lib/portfolio-data';

/* ============================================
   TIMELINE CARD
   ============================================ */
function TimelineCard({ entry, index, cardRef }: { entry: TimelineEntry; index: number; cardRef: (el: HTMLDivElement | null) => void }) {
  const isLeft = index % 2 === 0;
  const rgb = `${parseInt(entry.color.slice(1, 3), 16)},${parseInt(entry.color.slice(3, 5), 16)},${parseInt(entry.color.slice(5, 7), 16)}`;

  const CardContent = (
    <div style={{
      maxWidth: '360px', width: '100%',
      padding: '20px',
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(${rgb}, 0.1)`,
      borderRadius: '2px',
      borderLeft: isLeft ? `2px solid ${entry.color}` : undefined,
      borderRight: !isLeft ? `2px solid ${entry.color}` : undefined,
      transition: 'border-color 0.3s, background 0.3s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        gsap.to(e.currentTarget, { background: 'rgba(255,255,255,0.04)', borderColor: `rgba(${rgb},0.25)`, duration: 0.2 });
      }}
      onMouseLeave={e => {
        gsap.to(e.currentTarget, { background: 'rgba(255,255,255,0.02)', borderColor: `rgba(${rgb},0.1)`, duration: 0.3 });
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: entry.color, letterSpacing: '2px' }}>
          {entry.period}
        </span>
        {entry.isMilestone && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--green)', letterSpacing: '1px',
            padding: '2px 6px', border: '1px solid rgba(57,255,20,0.2)', borderRadius: '2px',
          }}>MILESTONE</span>
        )}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
        {entry.title}
      </h3>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '1px' }}>
        {entry.company}
      </div>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.8 }}>
        {entry.description}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '12px' }}>
        {entry.tags.map(tag => (
          <span key={tag} style={{
            fontFamily: 'var(--font-mono)', fontSize: '8px', padding: '2px 6px',
            border: `1px solid rgba(${rgb}, 0.15)`, borderRadius: '2px',
            color: entry.color, letterSpacing: '0.5px',
          }}>{tag}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={cardRef} style={{
      display: 'grid', gridTemplateColumns: '1fr 40px 1fr',
      gap: '0', marginBottom: '24px', opacity: 0,
    }}>
      {/* Left */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '20px' }}>
        {isLeft && CardContent}
      </div>

      {/* Spine */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{
          width: entry.isMilestone ? '14px' : '10px',
          height: entry.isMilestone ? '14px' : '10px',
          borderRadius: '50%',
          background: entry.isMilestone ? entry.color : 'rgba(255,255,255,0.08)',
          border: `2px solid ${entry.color}`,
          boxShadow: entry.isMilestone ? `0 0 12px ${entry.color}55` : 'none',
          flexShrink: 0, marginTop: '20px',
        }} />
        <div style={{
          width: '1px', flex: 1, marginTop: '4px',
          background: `linear-gradient(180deg, ${entry.color}30, transparent)`,
        }} />
      </div>

      {/* Right */}
      <div style={{ paddingLeft: '20px' }}>
        {!isLeft && CardContent}
      </div>
    </div>
  );
}

/* ============================================
   TIMELINE SECTION
   ============================================ */
export default function TimelineSection() {
  const { navigateTo } = useVoidStore();
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // GSAP orchestrated entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });

    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (labelRef.current) tl.fromTo(labelRef.current, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.1);
    if (titleRef.current) tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.2);
    if (subtitleRef.current) tl.fromTo(subtitleRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.35);

    // Cards stagger in with alternating slide direction
    cardRefs.current.filter(Boolean).forEach((card, i) => {
      const isLeft = i % 2 === 0;
      tl.fromTo(card!,
        { opacity: 0, x: isLeft ? -40 : 40, y: 15 },
        { opacity: 1, x: 0, y: 0, duration: 0.7, ease: 'power3.out' },
        0.5 + i * 0.18
      );
    });

    if (endRef.current) {
      tl.fromTo(endRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' },
        0.5 + TIMELINE.length * 0.18 + 0.2
      );
    }

    return () => { tl.kill(); };
  }, []);

  // Scroll progress
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handler = () => {
      const max = container.scrollHeight - container.clientHeight;
      setProgress(max > 0 ? container.scrollTop / max : 0);
    };
    container.addEventListener('scroll', handler);
    return () => container.removeEventListener('scroll', handler);
  }, []);

  return (
    <div ref={scrollRef} style={{ position: 'fixed', inset: 0, background: 'var(--void)', overflow: 'auto', zIndex: 50 }}>
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 40px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div ref={labelRef} className="section-label" style={{ opacity: 0 }}>04 // TIMELINE.log</div>
          <h2 ref={titleRef} style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '8px', opacity: 0,
          }}>
            Career <span className="glow-text-green">Log</span>
          </h2>
          <p ref={subtitleRef} style={{
            fontSize: '13px', color: 'var(--text-dim)', maxWidth: '420px',
            lineHeight: 1.8, opacity: 0,
          }}>
            A chronological record of milestones, roles, and the evolution of a developer.
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'fixed', left: '20px', top: '50%', transform: 'translateY(-50%)',
          zIndex: 60, width: '2px', height: '120px', borderRadius: '1px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{
            width: '100%', borderRadius: '1px',
            height: `${Math.min(100, progress * 100)}%`,
            background: 'linear-gradient(180deg, var(--green), var(--blue))',
            boxShadow: '0 0 6px rgba(57,255,20,0.3)',
            transition: 'height 0.1s ease',
          }} />
        </div>

        {/* Cards */}
        {TIMELINE.map((entry, i) => (
          <TimelineCard
            key={entry.id}
            entry={entry}
            index={i}
            cardRef={el => { cardRefs.current[i] = el; }}
          />
        ))}

        {/* End marker */}
        <div ref={endRef} style={{ textAlign: 'center', padding: '40px 0', opacity: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '3px' }}>
            THE JOURNEY CONTINUES...
          </div>
          <div style={{ width: '30px', height: '1px', margin: '12px auto 0', background: 'linear-gradient(90deg, transparent, var(--blue), transparent)' }} />
        </div>
      </div>

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
  );
}

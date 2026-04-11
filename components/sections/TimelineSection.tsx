'use client';

import { useEffect, useRef, useState } from 'react';
import { useVoidStore } from '@/lib/store';
import { TIMELINE, TimelineEntry } from '@/lib/portfolio-data';

function TimelineCard({ entry, index, isVisible }: { entry: TimelineEntry; index: number; isVisible: boolean }) {
  const isLeft = index % 2 === 0;
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Particle burst on milestone
  useEffect(() => {
    if (!entry.isMilestone || !isVisible || !particleCanvasRef.current) return;
    const canvas = particleCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 200; canvas.height = 200;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }> = [];
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 1 + Math.random() * 3;
      particles.push({
        x: 100, y: 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: ['#39FF14', '#00D4FF', '#FFB800'][Math.floor(Math.random() * 3)],
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, 200, 200);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.02;
        p.life -= 0.015;
        if (p.life <= 0) continue;
        alive = true;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive) frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [entry.isMilestone, isVisible]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: isLeft ? 'flex-end' : 'flex-start',
      paddingLeft: isLeft ? 0 : 'calc(50% + 30px)',
      paddingRight: isLeft ? 'calc(50% + 30px)' : 0,
      marginBottom: '40px',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0)' : `translateX(${isLeft ? '-40px' : '40px'})`,
      transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      position: 'relative',
    }}>
      {/* Timeline dot */}
      <div style={{
        position: 'absolute', left: '50%', top: '20px',
        transform: 'translateX(-50%)',
        width: entry.isMilestone ? '16px' : '10px',
        height: entry.isMilestone ? '16px' : '10px',
        borderRadius: '50%',
        background: entry.color,
        boxShadow: `0 0 12px ${entry.color}66`,
        zIndex: 2,
        border: entry.isMilestone ? '2px solid var(--void-black)' : 'none',
      }} />

      {/* Particle burst for milestones */}
      {entry.isMilestone && (
        <canvas ref={particleCanvasRef} style={{
          position: 'absolute', left: 'calc(50% - 100px)', top: '-80px',
          width: '200px', height: '200px', pointerEvents: 'none', zIndex: 3,
        }} />
      )}

      {/* Card */}
      <div className="glass-card" style={{
        padding: '24px', maxWidth: '400px', width: '100%',
        borderLeft: `3px solid ${entry.color}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: entry.color, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {entry.type === 'milestone' ? '★ MILESTONE' : entry.company}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
            {entry.period}
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          {entry.title}
        </h3>

        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '12px' }}>
          {entry.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {entry.tags.map((tag) => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '2px 8px',
              borderRadius: '3px', background: `${entry.color}15`,
              border: `1px solid ${entry.color}30`, color: entry.color,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TimelineSection() {
  const { setActiveSection } = useVoidStore();
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.2 }
    );

    cardsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Progress calculation
  const startYear = 2022;
  const currentYear = new Date().getFullYear();
  const progress = Math.min(((currentYear - startYear) / 6) * 100, 100);

  return (
    <div className="section-container" style={{ background: 'var(--void-black)', minHeight: '100vh', overflowY: 'auto' }}>
      <button className="back-button" onClick={() => setActiveSection('desktop')}>← VOID DESKTOP</button>

      <div style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '40px' }}>
        <div className="section-header">
          <span className="section-tag">// TIMELINE.log</span>
          <h1>Experience <span className="glow-text-green">Log</span></h1>
        </div>

        {/* Progress Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto 60px', padding: '0 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>{startYear}</span>
            <span>{currentYear}</span>
          </div>
          <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, var(--acid-green), var(--plasma-blue))',
              width: `${progress}%`,
              boxShadow: '0 0 12px rgba(57,255,20,0.3)',
              transition: 'width 2s ease',
            }} />
          </div>
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Center spine */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0,
            width: '2px', transform: 'translateX(-50%)',
            background: 'linear-gradient(180deg, var(--acid-green)22, var(--plasma-blue)22, var(--void-purple)22)',
          }} />

          {TIMELINE.map((entry, i) => (
            <div key={entry.id} ref={(el) => { cardsRef.current[i] = el; }} data-index={i}>
              <TimelineCard entry={entry} index={i} isVisible={visibleCards.has(i)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

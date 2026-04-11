'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER, LOCATIONS } from '@/lib/portfolio-data';
import { textReveal, enableMagneticHover } from '@/lib/animations';

/* ============================================
   ROTATING GLOBE — Canvas wireframe
   ============================================ */
function Globe({ size = 160 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = size * 2; canvas.height = size * 2;
    let angle = 0, frame: number;

    const draw = () => {
      ctx.clearRect(0, 0, size * 2, size * 2);
      const cx = size, cy = size, r = size * 0.7;

      const grd = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.4);
      grd.addColorStop(0, 'rgba(0, 212, 255, 0.04)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size * 2, size * 2);

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy - r * Math.sin(latRad);
        const xr = r * Math.cos(latRad);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.beginPath(); ctx.ellipse(cx, y, xr, xr * 0.06, 0, 0, Math.PI * 2); ctx.stroke();
      }

      for (let lon = 0; lon < 180; lon += 20) {
        const lonRad = ((lon + angle) * Math.PI) / 180;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(lonRad)), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      LOCATIONS.forEach(loc => {
        const lonRad = ((loc.lng + angle) * Math.PI) / 180;
        const latRad = (loc.lat * Math.PI) / 180;
        const px = cx + r * Math.cos(latRad) * Math.sin(lonRad);
        const py = cy - r * Math.sin(latRad);
        if (Math.cos(lonRad) > -0.2) {
          const ping = (Date.now() * 0.002) % 1;
          ctx.beginPath(); ctx.arc(px, py, 3 + ping * 10, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(57, 255, 20, ${0.4 - ping * 0.4})`;
          ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = '#39FF14';
          ctx.shadowColor = '#39FF14'; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.font = '9px "JetBrains Mono"';
          ctx.fillStyle = 'rgba(57, 255, 20, 0.6)';
          ctx.fillText(loc.label, px + 7, py + 3);
        }
      });
      angle += 0.2;
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: `${size}px`, height: `${size}px` }} />;
}

/* ============================================
   ANIMATED STAT — GSAP counter
   ============================================ */
function AnimatedStat({ value, label, index }: { value: string; label: string; index: number }) {
  const valRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!valRef.current || !containerRef.current) return;
    const numMatch = value.match(/\d+/);
    const suffix = value.replace(/\d+/, '');

    // Entrance
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 1.0 + index * 0.15, ease: 'power3.out' }
    );

    // Counter animation
    if (numMatch) {
      const target = parseInt(numMatch[0]);
      gsap.fromTo({ val: 0 }, { val: target }, {
        val: target,
        duration: 1.5,
        delay: 1.2 + index * 0.15,
        ease: 'power2.out',
        onUpdate: function () {
          if (valRef.current) valRef.current.textContent = Math.round(this.targets()[0].val) + suffix;
        },
      });
    } else {
      gsap.fromTo(valRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1.2 + index * 0.15 });
      valRef.current.textContent = value;
    }
  }, [value, index]);

  return (
    <div ref={containerRef} style={{
      padding: '18px 14px', textAlign: 'center', opacity: 0,
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '2px',
    }}>
      <div ref={valRef} style={{
        fontFamily: 'var(--font-display)', fontSize: '24px',
        fontWeight: 800, color: 'var(--blue)', marginBottom: '4px',
      }}>0</div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '8px',
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px',
      }}>{label}</div>
    </div>
  );
}

/* ============================================
   ABOUT SECTION
   ============================================ */
export default function AboutSection() {
  const { navigateTo } = useVoidStore();
  const [cvProgress, setCvProgress] = useState<number | null>(null);

  // Refs for GSAP
  const labelRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const manifestoRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const bioRef = useRef<HTMLDivElement>(null);
  const techLabelRef = useRef<HTMLDivElement>(null);
  const techChipsRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  // GSAP orchestrated entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });

    // Back button
    if (backRef.current) {
      tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    }

    // Label + line
    if (labelRef.current) {
      tl.fromTo(labelRef.current, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.1);
    }
    if (lineRef.current) {
      tl.fromTo(lineRef.current, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.7, ease: 'power2.out' }, 0.2);
    }

    // Title with text decode
    if (titleRef.current) {
      tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.3);
    }

    // Left column slides in from left
    if (leftColRef.current) {
      tl.fromTo(leftColRef.current, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.4);
    }

    // Right column slides in from right
    if (rightColRef.current) {
      tl.fromTo(rightColRef.current, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.4);
    }

    // Manifesto lines stagger one by one
    const manifestoEls = manifestoRefs.current.filter(Boolean);
    manifestoEls.forEach((el, i) => {
      tl.fromTo(el!,
        { opacity: 0, color: 'rgba(232,232,240,0.06)' },
        {
          opacity: 1,
          color: () => {
            const text = el!.textContent || '';
            const glowWords = ['experiences.', 'breathe.', 'think.', 'alive.', 'coded.'];
            return glowWords.some(w => text.includes(w)) ? '#00D4FF' : '#E8E8F0';
          },
          duration: 0.5,
          ease: 'power2.out',
        },
        0.6 + i * 0.12
      );
    });

    // Bio block
    if (bioRef.current) {
      tl.fromTo(bioRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.5);
    }

    // Tech arsenal label
    if (techLabelRef.current) {
      tl.fromTo(techLabelRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.8);
    }

    // Tech chips stagger
    if (techChipsRef.current) {
      const chips = techChipsRef.current.children;
      tl.fromTo(chips,
        { opacity: 0, y: 10, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, stagger: 0.03, ease: 'back.out(1.5)' },
        1.9
      );
    }

    // CV button
    if (cvRef.current) {
      tl.fromTo(cvRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 1.5);
      enableMagneticHover(cvRef.current, 0.15);
    }

    return () => { tl.kill(); };
  }, []);

  const handleDownloadCV = useCallback(() => {
    setCvProgress(0);
    gsap.to({ val: 0 }, {
      val: 100, duration: 2, ease: 'power1.inOut',
      onUpdate: function () {
        setCvProgress(Math.round(this.targets()[0].val));
      },
      onComplete: () => {
        setTimeout(() => setCvProgress(null), 1500);
      },
    });
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--void)', overflow: 'auto', zIndex: 50 }}>
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '80px 40px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '56px' }}>
          <div ref={labelRef} style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px',
            color: 'var(--purple)', letterSpacing: '4px', marginBottom: '10px',
            display: 'flex', alignItems: 'center', gap: '12px', opacity: 0,
          }}>
            01 // ABOUT.exe
            <span ref={lineRef} style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--purple), transparent)', display: 'block', transform: 'scaleX(0)' }} />
          </div>
          <h2 ref={titleRef} style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '8px', opacity: 0,
          }}>
            The Human Behind <span className="glow-text-blue">The Machine</span>
          </h2>
        </div>

        {/* Two Column */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '56px', alignItems: 'start' }}>
          {/* LEFT */}
          <div ref={leftColRef} style={{ opacity: 0 }}>
            {/* Globe */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: '28px',
              padding: '20px', background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.03)', borderRadius: '2px',
            }}>
              <Globe size={140} />
            </div>

            {/* Info cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
              {[
                { label: 'IDENTITY', value: OWNER.name, color: 'var(--white)' },
                { label: 'ROLE', value: OWNER.role, color: 'var(--blue)' },
                { label: 'LOCATION', value: OWNER.location, color: 'var(--white)' },
                { label: 'STATUS', value: 'AVAILABLE FOR WORK', color: 'var(--green)' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.03)', borderRadius: '2px',
                  transition: 'border-color 0.3s',
                  cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'; }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '2px' }}>{item.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: item.color, fontWeight: 500 }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              {OWNER.stats.map((stat, i) => (
                <AnimatedStat key={i} value={stat.value} label={stat.label} index={i} />
              ))}
            </div>

            {/* CV */}
            <button ref={cvRef} onClick={handleDownloadCV} style={{
              width: '100%', fontFamily: 'var(--font-mono)', fontSize: '10px',
              padding: '14px 20px', borderRadius: '2px', opacity: 0,
              border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.03)',
              color: 'var(--blue)', cursor: 'pointer', letterSpacing: '2px',
              position: 'relative', overflow: 'hidden', transition: 'background 0.3s, border-color 0.3s',
            }}
              onMouseEnter={e => {
                gsap.to(e.currentTarget, { borderColor: 'rgba(0,212,255,0.4)', background: 'rgba(0,212,255,0.08)', duration: 0.2 });
              }}
              onMouseLeave={e => {
                gsap.to(e.currentTarget, { borderColor: 'rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.03)', duration: 0.3 });
              }}
            >
              {cvProgress === null ? '↓ DOWNLOAD RESUME.pdf' : cvProgress >= 100 ? '✓ COMPLETE' : `DOWNLOADING... ${cvProgress}%`}
              {cvProgress !== null && cvProgress < 100 && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, height: '2px',
                  width: `${cvProgress}%`, background: 'var(--blue)',
                  boxShadow: '0 0 8px rgba(0,212,255,0.4)',
                }} />
              )}
            </button>
          </div>

          {/* RIGHT */}
          <div ref={rightColRef} style={{ opacity: 0 }}>
            {/* Manifesto */}
            <div style={{ marginBottom: '40px' }}>
              {OWNER.manifesto.map((line, i) => {
                const isTitle = i < 2;
                return (
                  <p key={i}
                    ref={el => { manifestoRefs.current[i] = el; }}
                    style={{
                      fontFamily: isTitle ? 'var(--font-display)' : 'var(--font-body)',
                      fontSize: isTitle ? '26px' : '15px',
                      fontWeight: isTitle ? 800 : 400,
                      lineHeight: isTitle ? 1.2 : 1.9,
                      color: 'rgba(232,232,240,0.06)',
                      marginBottom: isTitle ? '4px' : '2px',
                      transition: 'text-shadow 0.6s ease',
                    }}
                  >
                    {line}
                  </p>
                );
              })}
            </div>

            {/* Bio */}
            <div ref={bioRef} style={{
              padding: '20px', marginBottom: '32px', opacity: 0,
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: '2px', borderLeft: '2px solid rgba(0,212,255,0.2)',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-dim)', lineHeight: 1.9 }}>
                {OWNER.bio}
              </p>
            </div>

            {/* Tech Arsenal */}
            <div>
              <div ref={techLabelRef} style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '12px', opacity: 0,
              }}>
                TECH ARSENAL
              </div>
              <div ref={techChipsRef} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {OWNER.techArsenal.map((tech, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    padding: '4px 10px', borderRadius: '2px', opacity: 0,
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'var(--text-dim)', letterSpacing: '0.5px',
                    cursor: 'default', transition: 'none',
                  }}
                    onMouseEnter={e => {
                      gsap.to(e.currentTarget, { borderColor: 'rgba(0,212,255,0.35)', color: '#00D4FF', background: 'rgba(0,212,255,0.06)', duration: 0.15, ease: 'power2.out' });
                    }}
                    onMouseLeave={e => {
                      gsap.to(e.currentTarget, { borderColor: 'rgba(255,255,255,0.06)', color: 'var(--text-dim)', background: 'transparent', duration: 0.25, ease: 'power2.out' });
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
  );
}

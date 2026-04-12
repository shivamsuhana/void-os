'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

/* ============================================
   FLOATING PARTICLES — 300 ambient dots
   ============================================ */
function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const COLORS = ['0,212,255', '123,47,255', '57,255,20', '255,184,0'];
    const particles = Array.from({ length: 300 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 0.5 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: 0.1 + Math.random() * 0.35,
      pulse: Math.random() * Math.PI * 2,
    }));

    function animate() {
      ctx!.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        const a = p.alpha + Math.sin(p.pulse) * 0.1;
        ctx!.fillStyle = `rgba(${p.color},${a})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.8 }} />;
}

/* ============================================
   BIOS SCREEN — Centered terminal-style
   ============================================ */
function BiosScreen({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const DIAG = [
    { text: 'Quantum Core', status: '[OK]', color: '#39FF14' },
    { text: 'Neural Stack', status: '[OK]', color: '#39FF14' },
    { text: 'Memory Fabric', status: '64 TB', color: '#FFB800' },
    { text: 'GPU Mesh', status: '[OK]', color: '#39FF14' },
    { text: 'Holographic Engine', status: '[OK]', color: '#39FF14' },
    { text: 'AI Subsystem', status: 'ACTIVE', color: '#00D4FF' },
    { text: 'Identity Module', status: 'LOADING', color: '#00D4FF' },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({ onComplete: () => { setTimeout(onComplete, 300); } });

    // Header fade in
    if (headerRef.current) {
      tl.fromTo(headerRef.current, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 }, 0);
    }

    // Diagnostic lines
    DIAG.forEach((line, i) => {
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;justify-content:space-between;font-size:10px;line-height:2;opacity:0;transform:translateY(4px)';
      const dots = '.'.repeat(30 - line.text.length);
      const glow = ['[OK]', 'ACTIVE'].includes(line.status) ? `text-shadow:0 0 10px ${line.color}80` : '';
      el.innerHTML = `<span style="color:rgba(232,232,240,0.65)">${line.text}<span style="color:rgba(232,232,240,0.15)">${dots}</span></span><span style="color:${line.color};font-weight:600;${glow}">${line.status}</span>`;
      container.appendChild(el);

      tl.to(el, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.2 + i * 0.15);

      if (line.status === '[OK]') {
        const span = el.querySelector('span:last-child') as HTMLElement;
        if (span) tl.fromTo(span, { textShadow: `0 0 25px ${line.color}` }, { textShadow: `0 0 8px ${line.color}55`, duration: 0.25 }, 0.2 + i * 0.15 + 0.06);
      }
    });

    // Progress bar
    tl.to(progressRef.current, { scaleX: 1, duration: 0.8, ease: 'power1.inOut', transformOrigin: 'left center' }, 0.2);
    if (glowRef.current) tl.to(glowRef.current, { scaleX: 1, duration: 0.8, ease: 'power1.inOut', transformOrigin: 'left center' }, 0.2);
    tl.to({ val: 0 }, {
      val: 100, duration: 0.8,
      onUpdate: function () { if (progressTextRef.current) progressTextRef.current.textContent = `${Math.round(this.targets()[0].val)}%`; },
    }, 0.2);

    // Footer
    if (footerRef.current) {
      tl.fromTo(footerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 1.0);
    }

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{
        width: 'min(420px, 85vw)',
        padding: '24px 28px',
        border: '1px solid rgba(0,212,255,0.1)',
        background: 'rgba(3,3,6,0.6)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 0 60px rgba(0,212,255,0.05), inset 0 0 30px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div ref={headerRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, opacity: 0 }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#00D4FF', textShadow: '0 0 12px rgba(0,212,255,0.4)', letterSpacing: '2px' }}>VOID BIOS</div>
            <div style={{ fontSize: '7px', color: 'rgba(232,232,240,0.3)', letterSpacing: '1.5px', marginTop: 3 }}>v3.0.1 · QUANTUM ENGINE</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '7px', color: '#39FF14', letterSpacing: '1px', textShadow: '0 0 6px rgba(57,255,20,0.3)' }}>● ONLINE</div>
          </div>
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(0,212,255,0.15), rgba(123,47,255,0.1), transparent)', marginBottom: 10 }} />

        {/* Diag lines */}
        <div ref={containerRef} style={{ marginBottom: 14 }} />

        <div style={{ height: 1, background: 'rgba(0,212,255,0.08)', marginBottom: 12 }} />

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(232,232,240,0.5)', marginBottom: 5, letterSpacing: '1.5px' }}>
          <span>LOADING</span>
          <span ref={progressTextRef}>0%</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
          <div ref={progressRef} style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, #00D4FF, #7B2FFF)',
            transform: 'scaleX(0)', transformOrigin: 'left center',
            position: 'relative', zIndex: 2,
          }} />
          <div ref={glowRef} style={{
            position: 'absolute', top: -3, left: 0, right: 0, height: 9,
            background: 'linear-gradient(90deg, rgba(0,212,255,0.25), rgba(123,47,255,0.2))',
            filter: 'blur(4px)', borderRadius: 4,
            transform: 'scaleX(0)', transformOrigin: 'left center',
          }} />
        </div>

        {/* Footer */}
        <div ref={footerRef} style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', opacity: 0 }}>
          <span style={{ fontSize: '6px', color: 'rgba(232,232,240,0.18)', letterSpacing: '1px' }}>8 CORES · 16 THREADS</span>
          <span style={{ fontSize: '6px', color: 'rgba(232,232,240,0.18)', letterSpacing: '1px' }}>4.8 GHz</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   GLITCH TRANSITION
   ============================================ */
function GlitchTransition({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({ onComplete });

    const bars: HTMLDivElement[] = [];
    for (let i = 0; i < 12; i++) {
      const bar = document.createElement('div');
      bar.style.cssText = `position:absolute;left:0;right:0;height:${2 + Math.random() * 8}px;top:${5 + Math.random() * 90}%;opacity:0;`;
      bar.style.background = i % 3 === 0 ? 'rgba(0,212,255,0.2)' : i % 3 === 1 ? 'rgba(123,47,255,0.15)' : 'rgba(57,255,20,0.1)';
      bar.style.transform = `translateX(${(Math.random() - 0.5) * 40}px)`;
      container.appendChild(bar);
      bars.push(bar);
    }

    tl.to(bars, { opacity: 1, duration: 0.08, stagger: { each: 0.01, from: 'random' } }, 0);
    tl.to(bars, {
      x: () => `+=${(Math.random() - 0.5) * 60}`,
      opacity: 0, duration: 0.2,
      stagger: { each: 0.015, from: 'random' }, ease: 'power2.in',
    }, 0.12);

    const flash = document.createElement('div');
    flash.style.cssText = 'position:absolute;inset:0;background:rgba(232,232,240,0.08);opacity:0;';
    container.appendChild(flash);
    tl.to(flash, { opacity: 1, duration: 0.05 }, 0.25);
    tl.to(flash, { opacity: 0, duration: 0.1 }, 0.3);

    return () => { tl.kill(); };
  }, [onComplete]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 100, overflow: 'hidden' }} />;
}

/* ============================================
   NAME REVEAL — Decode + holographic shimmer
   ============================================ */
function NameReveal({ onReady }: { onReady: () => void }) {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = nameRef.current;
    const role = roleRef.current;
    const line = lineRef.current;
    const tagline = taglineRef.current;
    const cta = ctaRef.current;
    if (!name || !role || !line || !tagline || !cta) return;

    const nameText = OWNER.name.toUpperCase();
    const roleText = OWNER.role;
    const taglineText = 'The portfolio that feels alive.';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?';

    const tl = gsap.timeline();

    // Line reveal
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.out' }, 0);

    // Name: decode from scrambled chars
    name.textContent = nameText.replace(/[^ ]/g, () => chars[Math.floor(Math.random() * chars.length)]);
    tl.fromTo(name, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.2);
    tl.to({ progress: 0 }, {
      progress: 1, duration: 1.0, ease: 'power1.inOut',
      onUpdate: function () {
        const p = this.targets()[0].progress;
        const resolved = Math.floor(p * nameText.length);
        let result = '';
        for (let i = 0; i < nameText.length; i++) {
          if (nameText[i] === ' ') { result += ' '; continue; }
          result += i < resolved ? nameText[i] : chars[Math.floor(Math.random() * chars.length)];
        }
        name.textContent = result;
      },
      onComplete: () => {
        name.textContent = nameText;
        if (shimmerRef.current) {
          gsap.to(shimmerRef.current, {
            left: '120%', duration: 1.2, ease: 'power2.inOut', delay: 0.3,
            repeat: -1, repeatDelay: 3,
          });
        }
      },
    }, 0.2);

    // Role
    tl.fromTo(role, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 1.0);
    role.textContent = roleText;

    // Tagline typewriter
    tl.to({ progress: 0 }, {
      progress: 1, duration: 1.5, ease: 'none',
      onUpdate: function () {
        const p = this.targets()[0].progress;
        tagline.textContent = taglineText.slice(0, Math.floor(p * taglineText.length));
      },
    }, 1.3);

    // CTA
    tl.fromTo(cta, { opacity: 0, y: 10 }, {
      opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
      onComplete: onReady,
    }, 2.5);

    // Cursor blink
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });
    }

    return () => { tl.kill(); };
  }, [onReady]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <div ref={lineRef} style={{
        width: '80px', height: '2px', marginBottom: '28px',
        background: 'linear-gradient(90deg, transparent, #00D4FF, #7B2FFF, transparent)',
        transformOrigin: 'center',
        boxShadow: '0 0 12px rgba(0,212,255,0.3)',
      }} />

      {/* Name with holographic shimmer */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <h1 ref={nameRef} style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(42px, 8vw, 80px)', letterSpacing: '8px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #E8E8F0 20%, #00D4FF 50%, #7B2FFF 80%, #FF3366 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '16px', lineHeight: 1.1,
          textAlign: 'center', opacity: 0,
          filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.3)) drop-shadow(0 0 40px rgba(123,47,255,0.15))',
        }} />
        <div ref={shimmerRef} style={{
          position: 'absolute', top: 0, left: '-50%', width: '30%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
          transform: 'skewX(-15deg)',
          pointerEvents: 'none',
        }} />
      </div>

      <div ref={roleRef} style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
        color: '#00D4FF', letterSpacing: '4px', marginBottom: '28px', opacity: 0,
        textShadow: '0 0 12px rgba(0,212,255,0.3)',
      }} />

      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '13px',
        color: 'rgba(232,232,240,0.65)', letterSpacing: '0.5px',
        minHeight: '20px', display: 'flex', alignItems: 'center',
      }}>
        <span ref={taglineRef} />
        <span ref={cursorRef} style={{
          width: '7px', height: '15px', background: '#00D4FF',
          marginLeft: '2px', display: 'inline-block',
          boxShadow: '0 0 12px rgba(0,212,255,0.6)',
        }} />
      </div>

      {/* CTA */}
      <div ref={ctaRef} className="boot-cta" style={{
        marginTop: '50px', fontFamily: "'JetBrains Mono', monospace",
        fontSize: '10px', color: 'rgba(232,232,240,0.5)',
        letterSpacing: '3px', opacity: 0,
        padding: '10px 24px',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: '2px',
        boxShadow: '0 0 15px rgba(0,212,255,0.05), inset 0 0 15px rgba(0,212,255,0.03)',
      }}>
        PRESS ANY KEY TO ENTER VOID OS
      </div>

      <div style={{
        marginTop: '16px', fontFamily: "'JetBrains Mono', monospace",
        fontSize: '8px', color: 'rgba(232,232,240,0.2)', letterSpacing: '3px',
      }}>
        v3.0.1 • QUANTUM RENDERING ENGINE
      </div>
    </div>
  );
}

/* ============================================
   AMBIENT GRID
   ============================================ */
function AmbientGrid() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.35, pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '100% 40px',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(90deg, rgba(123,47,255,0.02) 1px, transparent 1px)',
        backgroundSize: '40px 100%',
      }} />
    </div>
  );
}

/* ============================================
   MAIN BOOT SEQUENCE
   ============================================ */
export default function BootSequence() {
  const { setBootComplete, setActiveSection, setBootPhase } = useVoidStore();
  const [phase, setPhase] = useState<'bios' | 'glitch' | 'reveal'>('bios');
  const [isReady, setIsReady] = useState(false);

  const handleBiosComplete = useCallback(() => setPhase('glitch'), []);
  const handleGlitchComplete = useCallback(() => {
    setPhase('reveal');
    setBootPhase('ready');
  }, [setBootPhase]);
  const handleReady = useCallback(() => setIsReady(true), []);

  const handleEnter = useCallback(() => {
    if (!isReady) return;

    // Create wormhole canvas
    const wormhole = document.createElement('canvas');
    wormhole.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    wormhole.width = window.innerWidth;
    wormhole.height = window.innerHeight;
    document.body.appendChild(wormhole);
    const wCtx = wormhole.getContext('2d')!;
    const cx = wormhole.width / 2, cy = wormhole.height / 2;

    // Zoom text effect
    const bootEl = document.querySelector('.boot-container') as HTMLElement;
    if (bootEl) {
      gsap.to(bootEl, {
        scale: 1.1, filter: 'blur(8px)', opacity: 0,
        duration: 0.4, ease: 'power2.in',
      });
    }

    // Wormhole tunnel
    const colors = ['rgba(0,212,255,0.4)', 'rgba(123,47,255,0.3)', 'rgba(57,255,20,0.2)', 'rgba(255,184,0,0.2)'];
    const rings: { z: number; r: number; color: string; speed: number }[] = [];
    for (let i = 0; i < 40; i++) {
      rings.push({
        z: i * 25, r: 50 + Math.random() * 200,
        color: colors[i % colors.length],
        speed: 8 + Math.random() * 8,
      });
    }

    const startT = performance.now();
    const duration = 1200;
    let frame: number;

    const drawWormhole = (now: number) => {
      const elapsed = now - startT;
      const progress = Math.min(elapsed / duration, 1);
      wCtx.clearRect(0, 0, wormhole.width, wormhole.height);

      wCtx.fillStyle = `rgba(3,3,6,${0.3 + progress * 0.7})`;
      wCtx.fillRect(0, 0, wormhole.width, wormhole.height);

      for (const ring of rings) {
        ring.z -= ring.speed * (1 + progress * 3);
        if (ring.z < 1) ring.z += 1000;

        const scale = 400 / ring.z;
        const screenR = ring.r * scale;
        const alpha = Math.max(0, 0.4 - ring.z / 1000) * (1 - progress * 0.5);

        wCtx.beginPath();
        wCtx.arc(cx, cy, Math.max(1, screenR), 0, Math.PI * 2);
        wCtx.strokeStyle = ring.color;
        wCtx.globalAlpha = alpha;
        wCtx.lineWidth = Math.max(0.5, 2 * scale);
        wCtx.stroke();
      }

      wCtx.globalAlpha = 0.15 + progress * 0.3;
      const cg = wCtx.createRadialGradient(cx, cy, 0, cx, cy, 100 + progress * 300);
      cg.addColorStop(0, 'rgba(0,212,255,0.3)');
      cg.addColorStop(0.5, 'rgba(123,47,255,0.1)');
      cg.addColorStop(1, 'rgba(0,0,0,0)');
      wCtx.fillStyle = cg;
      wCtx.fillRect(0, 0, wormhole.width, wormhole.height);
      wCtx.globalAlpha = 1;

      if (progress > 0.85) {
        const flashAlpha = (progress - 0.85) / 0.15 * 0.2;
        wCtx.fillStyle = `rgba(232,232,240,${flashAlpha})`;
        wCtx.fillRect(0, 0, wormhole.width, wormhole.height);
      }

      if (progress < 1) {
        frame = requestAnimationFrame(drawWormhole);
      } else {
        cancelAnimationFrame(frame);
        gsap.to(wormhole, {
          opacity: 0, duration: 0.3, ease: 'power2.out',
          onComplete: () => wormhole.remove(),
        });
        setBootComplete(true);
        setActiveSection('desktop');
      }
    };

    setTimeout(() => {
      frame = requestAnimationFrame(drawWormhole);
    }, 350);
  }, [isReady, setBootComplete, setActiveSection]);

  useEffect(() => {
    if (!isReady) return;
    const handler = () => handleEnter();
    window.addEventListener('keydown', handler);
    window.addEventListener('click', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
    };
  }, [isReady, handleEnter]);

  // Breathing glow on CTA
  useEffect(() => {
    if (!isReady) return;
    const el = document.querySelector('.boot-cta') as HTMLElement;
    if (el) {
      gsap.to(el, {
        boxShadow: '0 0 25px rgba(0,212,255,0.15), inset 0 0 15px rgba(0,212,255,0.05)',
        borderColor: 'rgba(0,212,255,0.3)',
        color: 'rgba(232,232,240,0.6)',
        duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
    }
  }, [isReady]);

  return (
    <div className="boot-container" style={{
      position: 'fixed', inset: 0, background: '#050510', zIndex: 1000, overflow: 'hidden',
    }}>
      <FloatingParticles />
      <AmbientGrid />

      {/* Scanlines + Vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 49, pointerEvents: 'none', background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />

      {phase === 'bios' && <BiosScreen onComplete={handleBiosComplete} />}
      {phase === 'glitch' && <GlitchTransition onComplete={handleGlitchComplete} />}
      {phase === 'reveal' && <NameReveal onReady={handleReady} />}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

/* ─── COLORS ─── */
const C = {
  cyan: '#00D4FF',
  purple: '#7B2FFF',
  green: '#39FF14',
  amber: '#FFB800',
  red: '#FF3B5C',
  white: '#E8E8F0',
};

/* ============================================
   PHASE 1: POWER ON — A quick flicker + static
   ============================================ */
function PowerOn({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline({ onComplete });

    // Start black screen
    tl.set(el, { opacity: 1 });
    // CRT power flicker
    tl.to(el, { backgroundColor: '#0a0a14', duration: 0.05 }, 0.3);
    tl.to(el, { backgroundColor: '#020208', duration: 0.05 }, 0.4);
    tl.to(el, { backgroundColor: '#0d0d1a', duration: 0.04 }, 0.55);
    tl.to(el, { backgroundColor: '#030306', duration: 0.1 }, 0.65);
    // Horizontal scan line
    const scanline = document.createElement('div');
    scanline.style.cssText = 'position:absolute;left:0;right:0;height:2px;background:rgba(0,212,255,0.15);top:0;';
    el.appendChild(scanline);
    tl.to(scanline, { top: '100%', duration: 0.6, ease: 'none' }, 0.4);
    tl.to(scanline, { opacity: 0, duration: 0.1 }, 0.9);

    return () => { tl.kill(); };
  }, [onComplete]);

  return <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 10, background: '#000', overflow: 'hidden' }} />;
}

/* ============================================
   PHASE 2: DIAGNOSTICS — Terminal lines loading
   ============================================ */
function Diagnostics({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);

  const LINES = [
    { text: '> VOID OS BOOT PROTOCOL v3.0.1', color: C.cyan, delay: 0 },
    { text: '> Initializing quantum cores...', color: C.white, delay: 0.3 },
    { text: '  ├ Core 0 ████████████ [OK]', color: C.green, delay: 0.7 },
    { text: '  ├ Core 1 ████████████ [OK]', color: C.green, delay: 0.95 },
    { text: '  ├ Core 2 ████████████ [OK]', color: C.green, delay: 1.2 },
    { text: '  └ Core 3 ████████████ [OK]', color: C.green, delay: 1.4 },
    { text: '> Neural stack............ ACTIVE', color: C.cyan, delay: 1.8 },
    { text: '> Memory fabric........... 64 TB', color: C.amber, delay: 2.2 },
    { text: '> GPU mesh................ LINKED', color: C.green, delay: 2.5 },
    { text: '> Holographic engine...... READY', color: C.green, delay: 2.8 },
    { text: '> AI subsystem............ ONLINE', color: C.cyan, delay: 3.2 },
    { text: '> Identity module......... LOADING', color: C.amber, delay: 3.5 },
    { text: '', color: '', delay: 3.9 },
    { text: '> ALL SYSTEMS NOMINAL', color: C.green, delay: 4.0 },
  ];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tl = gsap.timeline({ onComplete: () => { setTimeout(onComplete, 400); } });

    LINES.forEach((line) => {
      const el = document.createElement('div');
      el.style.cssText = `font-size:11px;line-height:1.8;opacity:0;color:${line.color || C.white};font-family:'JetBrains Mono',monospace;white-space:pre;`;

      // Status glow effect
      if (line.text.includes('[OK]') || line.text.includes('ACTIVE') || line.text.includes('ONLINE') || line.text.includes('NOMINAL')) {
        el.style.textShadow = `0 0 8px ${line.color}60`;
      }
      el.textContent = line.text || '\u00A0';
      container.appendChild(el);

      tl.to(el, { opacity: 1, duration: 0.08 }, line.delay);

      // Glitch flicker on some lines
      if (line.text.includes('Core') || line.text.includes('Neural') || line.text.includes('AI')) {
        tl.to(el, { opacity: 0.4, x: 2, duration: 0.03 }, line.delay + 0.08);
        tl.to(el, { opacity: 1, x: 0, duration: 0.05 }, line.delay + 0.11);
      }
    });

    // Progress bar
    tl.to(progressRef.current, { scaleX: 1, duration: 3.8, ease: 'power1.inOut', transformOrigin: 'left' }, 0.2);
    tl.to({ v: 0 }, {
      v: 100, duration: 3.8,
      onUpdate: function () {
        if (percentRef.current) percentRef.current.textContent = `${Math.round(this.targets()[0].v)}%`;
      },
    }, 0.2);

    return () => { tl.kill(); };
  }, [onComplete]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      paddingBottom: '14vh',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <div style={{ width: 'min(480px, 88vw)' }}>
        <div ref={containerRef} style={{ marginBottom: 20, minHeight: 200 }} />

        {/* Progress */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'rgba(232,232,240,0.5)', marginBottom: 5, letterSpacing: '2px' }}>
          <span>BOOTING VOID OS</span>
          <span ref={percentRef}>0%</span>
        </div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
          <div ref={progressRef} style={{
            height: '100%',
            background: `linear-gradient(90deg, ${C.cyan}, ${C.purple})`,
            transform: 'scaleX(0)',
            boxShadow: `0 0 8px ${C.cyan}40`,
          }} />
        </div>
        <div style={{ marginTop: 8, fontSize: '7px', color: 'rgba(232,232,240,0.2)', letterSpacing: '1.5px' }}>
          8 CORES · 64 TB MEM · QRE v3.0.1
        </div>
      </div>
    </div>
  );
}

/* ============================================
   PHASE 3: GLITCH TRANSITION
   ============================================ */
function GlitchBurst({ onComplete }: { onComplete: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tl = gsap.timeline({ onComplete });

    // Create horizontal glitch bars
    for (let i = 0; i < 15; i++) {
      const bar = document.createElement('div');
      const h = 1 + Math.random() * 6;
      bar.style.cssText = `position:absolute;left:0;right:0;height:${h}px;top:${Math.random() * 100}%;opacity:0;`;
      bar.style.background = i % 3 === 0 ? `rgba(0,212,255,0.25)` : i % 3 === 1 ? `rgba(123,47,255,0.2)` : `rgba(57,255,20,0.15)`;
      bar.style.transform = `translateX(${(Math.random() - 0.5) * 50}px)`;
      el.appendChild(bar);

      tl.to(bar, { opacity: 1, duration: 0.04, stagger: 0.008 }, i * 0.015);
      tl.to(bar, { opacity: 0, x: `+=${(Math.random() - 0.5) * 80}`, duration: 0.12, ease: 'power2.in' }, 0.12 + i * 0.01);
    }

    // Screen flash
    tl.to(el, { backgroundColor: 'rgba(232,232,240,0.06)', duration: 0.04 }, 0.22);
    tl.to(el, { backgroundColor: 'transparent', duration: 0.08 }, 0.26);

    return () => { tl.kill(); };
  }, [onComplete]);

  return <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 100, overflow: 'hidden' }} />;
}

/* ============================================
   PHASE 4: NAME REVEAL — Cinematic decode
   ============================================ */
function NameReveal({ onReady }: { onReady: () => void }) {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const name = nameRef.current;
    const role = roleRef.current;
    const line = lineRef.current;
    const tag = tagRef.current;
    const cta = ctaRef.current;
    if (!name || !role || !line || !tag || !cta) return;

    const nameText = OWNER.name.toUpperCase();
    const roleText = OWNER.role;
    const tagText = 'Building the future, one pixel at a time.';
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?<>{}';

    const tl = gsap.timeline();

    // Line
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0);

    // Name decode
    name.textContent = nameText.replace(/[^ ]/g, () => glyphs[Math.floor(Math.random() * glyphs.length)]);
    tl.fromTo(name, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0.15);
    tl.to({ p: 0 }, {
      p: 1, duration: 1.4, ease: 'power1.inOut',
      onUpdate: function () {
        const prog = this.targets()[0].p;
        const resolved = Math.floor(prog * nameText.length);
        let str = '';
        for (let i = 0; i < nameText.length; i++) {
          if (nameText[i] === ' ') { str += ' '; continue; }
          str += i < resolved ? nameText[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        name.textContent = str;
      },
      onComplete: () => {
        name.textContent = nameText;
        // Start shimmer
        if (shimmerRef.current) {
          gsap.set(shimmerRef.current, { left: '-50%' });
          gsap.to(shimmerRef.current, { left: '120%', duration: 3.5, ease: 'power2.inOut', delay: 1, repeat: -1, repeatDelay: 6 });
        }
      },
    }, 0.15);

    // Role
    tl.fromTo(role, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, 1.4);
    role.textContent = roleText;

    // Tagline typewriter
    tl.to({ p: 0 }, {
      p: 1, duration: 1.8, ease: 'none',
      onUpdate: function () {
        tag.textContent = tagText.slice(0, Math.floor(this.targets()[0].p * tagText.length));
      },
    }, 1.6);

    // CTA
    tl.fromTo(cta, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', onComplete: onReady }, 3.2);

    // Cursor
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });
    }

    return () => { tl.kill(); };
  }, [onReady]);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      paddingBottom: '10vh',
    }}>
      {/* Separator line */}
      <div ref={lineRef} style={{
        width: 70, height: 2, marginBottom: 30,
        background: `linear-gradient(90deg, transparent, ${C.cyan}, ${C.purple}, transparent)`,
        transformOrigin: 'center', boxShadow: `0 0 10px ${C.cyan}40`,
      }} />

      {/* Name */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <h1 ref={nameRef} style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 800,
          fontSize: 'clamp(40px, 7.5vw, 76px)', letterSpacing: '6px',
          background: `linear-gradient(135deg, ${C.white} 0%, ${C.cyan} 40%, ${C.purple} 70%, ${C.red} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', lineHeight: 1.1, textAlign: 'center', opacity: 0,
          filter: `drop-shadow(0 0 18px ${C.cyan}40) drop-shadow(0 0 35px ${C.purple}20)`,
        }} />
        {/* Shimmer overlay */}
        <div ref={shimmerRef} style={{
          position: 'absolute', top: 0, left: '-50%', width: '25%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          transform: 'skewX(-20deg)', pointerEvents: 'none',
        }} />
      </div>

      {/* Role */}
      <div ref={roleRef} style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
        color: C.cyan, letterSpacing: '4px', marginTop: 18, marginBottom: 30, opacity: 0,
        textShadow: `0 0 10px ${C.cyan}40`,
      }} />

      {/* Tagline */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
        color: 'rgba(232,232,240,0.6)', letterSpacing: '0.5px',
        minHeight: 20, display: 'flex', alignItems: 'center',
      }}>
        <span ref={tagRef} />
        <span ref={cursorRef} style={{
          width: 6, height: 14, background: C.cyan, marginLeft: 2, display: 'inline-block',
          boxShadow: `0 0 10px ${C.cyan}80`,
        }} />
      </div>

      {/* CTA */}
      <div ref={ctaRef} className="boot-cta" style={{
        marginTop: 50, fontFamily: "'JetBrains Mono', monospace",
        fontSize: '9px', color: 'rgba(232,232,240,0.45)', letterSpacing: '3px', opacity: 0,
        padding: '10px 22px', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 2,
      }}>
        [ PRESS ANY KEY TO ENTER ]
      </div>
    </div>
  );
}

/* ============================================
   AMBIENT LAYERS
   ============================================ */
function AmbientLayers() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    c.style.width = W + 'px'; c.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const colors = ['0,212,255', '123,47,255', '57,255,20', '255,184,0'];
    const dots = Array.from({ length: 160 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      size: 0.5 + Math.random() * 1.8,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 0.08 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
    }));

    let t = 0;
    function draw() {
      t += 0.008;
      ctx!.clearRect(0, 0, W, H);

      // Pulsing center radial glow
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.2);
      const g = ctx!.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.5);
      g.addColorStop(0, `rgba(123,47,255,${0.03 + pulse * 0.02})`);
      g.addColorStop(0.5, `rgba(0,212,255,${0.01 + pulse * 0.01})`);
      g.addColorStop(1, 'transparent');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);

      // Corner lamp — top left cyan
      const tl = ctx!.createRadialGradient(0, 0, 0, 0, 0, W * 0.35);
      tl.addColorStop(0, `rgba(0,212,255,${0.04 + pulse * 0.02})`);
      tl.addColorStop(1, 'transparent');
      ctx!.fillStyle = tl; ctx!.fillRect(0, 0, W, H);

      // Corner lamp — bottom right purple
      const br = ctx!.createRadialGradient(W, H, 0, W, H, W * 0.35);
      br.addColorStop(0, `rgba(123,47,255,${0.04 + pulse * 0.02})`);
      br.addColorStop(1, 'transparent');
      ctx!.fillStyle = br; ctx!.fillRect(0, 0, W, H);

      for (const d of dots) {
        d.x += d.vx; d.y += d.vy; d.phase += 0.015;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        ctx!.fillStyle = `rgba(${d.color},${d.alpha + Math.sin(d.phase) * 0.06})`;
        ctx!.beginPath(); ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2); ctx!.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.8 }} />
      {/* Holographic grid — stronger */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px)', backgroundSize: '100% 50px' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(90deg,rgba(123,47,255,0.03) 1px,transparent 1px)', backgroundSize: '50px 100%' }} />
      </div>
      {/* Animated boot scan line */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)', zIndex: 3, animation: 'boot-scan 4s linear infinite', boxShadow: '0 0 8px rgba(0,212,255,0.2)' }} />
      {/* Scanlines */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />
      {/* Stronger vignette */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 49, pointerEvents: 'none', background: 'radial-gradient(ellipse at center,transparent 35%,rgba(0,0,0,0.65) 100%)' }} />
      <style dangerouslySetInnerHTML={{ __html: '@keyframes boot-scan{0%{top:-1px}100%{top:100vh}}' }} />
    </>
  );
}


/* ============================================
   MAIN BOOT SEQUENCE — 4 phases
   ============================================ */
export default function BootSequence() {
  const { setBootComplete, setActiveSection, setBootPhase } = useVoidStore();
  const [phase, setPhase] = useState<'power' | 'diag' | 'glitch' | 'reveal'>('power');
  const [isReady, setIsReady] = useState(false);

  const handlePowerDone = useCallback(() => setPhase('diag'), []);
  const handleDiagDone = useCallback(() => setPhase('glitch'), []);
  const handleGlitchDone = useCallback(() => {
    setPhase('reveal');
    setBootPhase('ready');
  }, [setBootPhase]);
  const handleReady = useCallback(() => setIsReady(true), []);

  // Wormhole entry
  const handleEnter = useCallback(() => {
    if (!isReady) return;

    const wormhole = document.createElement('canvas');
    wormhole.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;';
    wormhole.width = window.innerWidth;
    wormhole.height = window.innerHeight;
    document.body.appendChild(wormhole);
    const wCtx = wormhole.getContext('2d')!;
    const cx = wormhole.width / 2, cy = wormhole.height / 2;

    // Zoom blur on current content
    const bootEl = document.querySelector('.boot-container') as HTMLElement;
    if (bootEl) {
      gsap.to(bootEl, { scale: 1.08, filter: 'blur(6px)', opacity: 0, duration: 0.4, ease: 'power2.in' });
    }

    // Tunnel rings
    const colors = ['rgba(0,212,255,0.4)', 'rgba(123,47,255,0.3)', 'rgba(57,255,20,0.2)'];
    const rings: { z: number; r: number; color: string; speed: number }[] = [];
    for (let i = 0; i < 40; i++) {
      rings.push({ z: i * 25, r: 50 + Math.random() * 200, color: colors[i % colors.length], speed: 8 + Math.random() * 8 });
    }

    const startT = performance.now();
    const dur = 1200;
    let frame: number;

    const draw = (now: number) => {
      const t = Math.min((now - startT) / dur, 1);
      wCtx.clearRect(0, 0, wormhole.width, wormhole.height);
      wCtx.fillStyle = `rgba(3,3,6,${0.3 + t * 0.7})`;
      wCtx.fillRect(0, 0, wormhole.width, wormhole.height);

      for (const r of rings) {
        r.z -= r.speed * (1 + t * 3);
        if (r.z < 1) r.z += 1000;
        const s = 400 / r.z;
        const alpha = Math.max(0, 0.4 - r.z / 1000) * (1 - t * 0.5);
        wCtx.beginPath();
        wCtx.arc(cx, cy, Math.max(1, r.r * s), 0, Math.PI * 2);
        wCtx.strokeStyle = r.color;
        wCtx.globalAlpha = alpha;
        wCtx.lineWidth = Math.max(0.5, 2 * s);
        wCtx.stroke();
      }

      wCtx.globalAlpha = 0.15 + t * 0.3;
      const g = wCtx.createRadialGradient(cx, cy, 0, cx, cy, 100 + t * 300);
      g.addColorStop(0, 'rgba(0,212,255,0.3)');
      g.addColorStop(0.5, 'rgba(123,47,255,0.1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      wCtx.fillStyle = g;
      wCtx.fillRect(0, 0, wormhole.width, wormhole.height);
      wCtx.globalAlpha = 1;

      if (t > 0.85) {
        wCtx.fillStyle = `rgba(232,232,240,${(t - 0.85) / 0.15 * 0.2})`;
        wCtx.fillRect(0, 0, wormhole.width, wormhole.height);
      }

      if (t < 1) {
        frame = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(frame);
        gsap.to(wormhole, { opacity: 0, duration: 0.3, onComplete: () => wormhole.remove() });
        setBootComplete(true);
        setActiveSection('desktop');
      }
    };

    setTimeout(() => { frame = requestAnimationFrame(draw); }, 350);
  }, [isReady, setBootComplete, setActiveSection]);

  // Key / click listener
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

  // CTA pulse
  useEffect(() => {
    if (!isReady) return;
    const el = document.querySelector('.boot-cta') as HTMLElement;
    if (el) {
      gsap.to(el, {
        boxShadow: `0 0 20px rgba(0,212,255,0.12), inset 0 0 12px rgba(0,212,255,0.04)`,
        borderColor: 'rgba(0,212,255,0.3)',
        color: 'rgba(232,232,240,0.6)',
        duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut',
      });
    }
  }, [isReady]);

  return (
    <div className="boot-container" style={{
      position: 'fixed', inset: 0, background: '#030306', zIndex: 1000, overflow: 'hidden',
    }}>
      <AmbientLayers />

      {phase === 'power' && <PowerOn onComplete={handlePowerDone} />}
      {phase === 'diag' && <Diagnostics onComplete={handleDiagDone} />}
      {phase === 'glitch' && <GlitchBurst onComplete={handleGlitchDone} />}
      {phase === 'reveal' && <NameReveal onReady={handleReady} />}
    </div>
  );
}

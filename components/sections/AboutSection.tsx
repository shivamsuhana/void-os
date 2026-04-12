'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER, LOCATIONS } from '@/lib/portfolio-data';
import { enableMagneticHover } from '@/lib/animations';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';

/* ═══════════════════════════════════════════
   HEX GRID BACKGROUND
   ═══════════════════════════════════════════ */
function HexGridBG() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 50; i++) particles.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, size: Math.random() * 2 + .5, alpha: Math.random() * .3 + .05 });
    let t = 0, frame: number;
    const draw = () => {
      t += .005;
      ctx.fillStyle = 'rgba(3,3,6,.15)'; ctx.fillRect(0, 0, W, H);
      const hexR = 40;
      ctx.strokeStyle = `rgba(0,212,255,${.015 + Math.sin(t) * .008})`; ctx.lineWidth = .5;
      for (let gy = -1; gy < H / (hexR * Math.sqrt(3)) + 1; gy++) {
        for (let gx = -1; gx < W / (hexR * 1.5) + 1; gx++) {
          const cx2 = gx * hexR * 1.5, cy2 = gy * hexR * Math.sqrt(3) + (gx % 2 ? hexR * Math.sqrt(3) / 2 : 0);
          ctx.beginPath();
          for (let a = 0; a < 6; a++) { const ang = Math.PI / 3 * a + Math.PI / 6, px = cx2 + hexR * .4 * Math.cos(ang), py = cy2 + hexR * .4 * Math.sin(ang); a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
          ctx.closePath(); ctx.stroke();
        }
      }
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0; if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.alpha * (.7 + .3 * Math.sin(t * 3 + p.x * .01))})`; ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    }; draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ═══════════════════════════════════════════
   GLOW CARD — Premium with mouse-tracking gradient
   ═══════════════════════════════════════════ */
function GlowCard({ children, color = '#00D4FF', style = {}, className = '', ...props }: { children: React.ReactNode; color?: string; style?: React.CSSProperties; className?: string; [k: string]: unknown }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, ${color}12, ${color}04 50%, rgba(255,255,255,.02))`;
    card.style.borderColor = `${color}55`;
    card.style.boxShadow = `0 0 20px ${color}10, inset 0 0 30px ${color}05`;
  }, [color]);

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative', background: 'rgba(255,255,255,.03)',
        border: `1px solid ${color}18`,
        transition: 'border-color .3s, background .5s, box-shadow .3s, transform .3s',
        backdropFilter: 'blur(4px)',
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${color}18`;
        el.style.background = 'rgba(255,255,255,.03)';
        el.style.boxShadow = 'none';
        el.style.transform = 'translateY(0)';
      }}
      {...props}
    >{children}</div>
  );
}

/* ═══════════════════════════════════════════
   ASCII PHOTO MORPH
   ═══════════════════════════════════════════ */
const ASCII_CHARS = '█▓▒░ ·:;+=xX$&@#';

function AsciiPhoto({ hovered }: { hovered: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = 320;
    const H = canvas.height = 380;

    // Draw a procedural "face" placeholder (geometric portrait)
    const drawFace = (octx: CanvasRenderingContext2D, w: number, h: number) => {
      octx.fillStyle = '#111';
      octx.fillRect(0, 0, w, h);

      // Skin tone base
      const skinGrad = octx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.38);
      skinGrad.addColorStop(0, '#c8956c');
      skinGrad.addColorStop(1, '#8B5E3C');
      octx.fillStyle = skinGrad;
      octx.beginPath();
      octx.ellipse(w * 0.5, h * 0.42, w * 0.33, h * 0.38, 0, 0, Math.PI * 2);
      octx.fill();

      // Hair
      octx.fillStyle = '#1a0a00';
      octx.beginPath();
      octx.ellipse(w * 0.5, h * 0.18, w * 0.34, h * 0.2, 0, 0, Math.PI * 2);
      octx.fill();
      octx.beginPath();
      octx.ellipse(w * 0.5, h * 0.55, w * 0.33, h * 0.1, 0, 0, Math.PI);
      octx.fill();

      // Eyes
      [0.34, 0.66].forEach(ex => {
        octx.fillStyle = '#fff';
        octx.beginPath();
        octx.ellipse(w * ex, h * 0.38, w * 0.07, h * 0.04, 0, 0, Math.PI * 2);
        octx.fill();
        octx.fillStyle = '#1a3a6b';
        octx.beginPath();
        octx.arc(w * ex, h * 0.38, w * 0.04, 0, Math.PI * 2);
        octx.fill();
        octx.fillStyle = '#000';
        octx.beginPath();
        octx.arc(w * ex, h * 0.38, w * 0.022, 0, Math.PI * 2);
        octx.fill();
        // eyebrow
        octx.strokeStyle = '#1a0a00';
        octx.lineWidth = 3;
        octx.beginPath();
        octx.moveTo(w * (ex - 0.07), h * 0.33);
        octx.quadraticCurveTo(w * ex, h * 0.3, w * (ex + 0.07), h * 0.33);
        octx.stroke();
      });

      // Nose
      octx.strokeStyle = '#8B5E3C';
      octx.lineWidth = 2;
      octx.beginPath();
      octx.moveTo(w * 0.5, h * 0.4);
      octx.lineTo(w * 0.46, h * 0.5);
      octx.lineTo(w * 0.54, h * 0.5);
      octx.stroke();

      // Mouth
      octx.strokeStyle = '#7a3b2a';
      octx.lineWidth = 3;
      octx.beginPath();
      octx.moveTo(w * 0.4, h * 0.56);
      octx.quadraticCurveTo(w * 0.5, h * 0.62, w * 0.6, h * 0.56);
      octx.stroke();

      // Shirt / neck
      const shirtGrad = octx.createLinearGradient(0, h * 0.75, 0, h);
      shirtGrad.addColorStop(0, '#0a0a1a');
      shirtGrad.addColorStop(1, '#141428');
      octx.fillStyle = shirtGrad;
      octx.fillRect(0, h * 0.78, w, h * 0.22);
      // Collar glow
      octx.fillStyle = 'rgba(0,212,255,0.13)';
      octx.beginPath();
      octx.moveTo(w * 0.3, h * 0.78);
      octx.lineTo(w * 0.5, h * 0.86);
      octx.lineTo(w * 0.7, h * 0.78);
      octx.fill();
    };

    // Offscreen face canvas
    const face = document.createElement('canvas');
    face.width = W; face.height = H;
    drawFace(face.getContext('2d')!, W, H);
    const faceData = face.getContext('2d')!.getImageData(0, 0, W, H).data;

    // Build ASCII grid
    const COLS = 48, ROWS = 58;
    const cw = W / COLS, ch = H / ROWS;

    const cells: { brightness: number; r: number; g: number; b: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const px = Math.floor(c * cw + cw / 2);
        const py = Math.floor(r * ch + ch / 2);
        const i = (py * W + px) * 4;
        const brightness = (faceData[i] * 0.299 + faceData[i + 1] * 0.587 + faceData[i + 2] * 0.114) / 255;
        cells.push({ brightness, r: faceData[i], g: faceData[i + 1], b: faceData[i + 2] });
      }
    }

    let t = 0;
    const draw = () => {
      t += 0.025;
      const p = progressRef.current;
      ctx.clearRect(0, 0, W, H);

      if (p > 0) { ctx.globalAlpha = p; ctx.drawImage(face, 0, 0, W, H); ctx.globalAlpha = 1; }

      if (p < 1) {
        ctx.globalAlpha = 1 - p;
        const fontSize = Math.max(5, cw * 0.85);
        ctx.font = `bold ${fontSize}px "JetBrains Mono", "Space Mono", monospace`;
        ctx.textBaseline = 'middle';

        cells.forEach((cell, idx) => {
          const col = idx % COLS;
          const row = Math.floor(idx / COLS);
          const charIdx = Math.floor((1 - cell.brightness) * (ASCII_CHARS.length - 1));
          const ch_ = ASCII_CHARS[charIdx];
          if (ch_.trim() === '') return;

          const flicker = 0.7 + 0.3 * Math.sin(t * 3 + col * 0.4 + row * 0.3);
          const alpha = Math.min(1, cell.brightness * 2.5) * flicker;

          if (p < 0.3) {
            ctx.fillStyle = cell.brightness > 0.6 ? '#00D4FF' : cell.brightness > 0.3 ? '#E8E8F0' : '#7B2FFF';
          } else {
            ctx.fillStyle = `rgb(${cell.r},${cell.g},${cell.b})`;
          }
          ctx.globalAlpha = (1 - p) * alpha;
          ctx.fillText(ch_, col * cw, row * ch + ch / 2);
        });
        ctx.globalAlpha = 1;
      }

      if (p < 0.5) {
        const scanY = (t * 80) % H;
        const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, `rgba(0,212,255,${(1 - p) * 0.15})`);
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, scanY - 2, W, 4);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  useEffect(() => {
    let raf: number;
    const target = hovered ? 1 : 0;
    const animate = () => {
      const diff = target - progressRef.current;
      if (Math.abs(diff) < 0.001) { progressRef.current = target; return; }
      progressRef.current += diff * 0.06;
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [hovered]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }} />;
}

/* ═══════════════════════════════════════════
   INTERACTIVE GLOBE
   ═══════════════════════════════════════════ */
function Globe() {
  const ref = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false), lx = useRef(0), vel = useRef(0.003);
  const rotRef = useRef(0), rafRef = useRef<number>(0);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const SIZE = 280; c.width = SIZE; c.height = SIZE;
    const cx = SIZE / 2, cy = SIZE / 2, R = SIZE * 0.42;

    const toXY = (lat: number, lon: number, rot: number) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lon + rot) * Math.PI / 180;
      const x = R * Math.sin(phi) * Math.cos(theta);
      const y = R * Math.cos(phi);
      const z = R * Math.sin(phi) * Math.sin(theta);
      return { x: cx + x, y: cy - y, z, visible: z > -R * 0.1 };
    };

    const gridLines: { lat: number; lon: number }[][] = [];
    for (let lat = -80; lat <= 80; lat += 20) { const pts: { lat: number; lon: number }[] = []; for (let lon = 0; lon <= 360; lon += 3) pts.push({ lat, lon }); gridLines.push(pts); }
    for (let lon = 0; lon < 360; lon += 20) { const pts: { lat: number; lon: number }[] = []; for (let lat = -90; lat <= 90; lat += 3) pts.push({ lat, lon }); gridLines.push(pts); }

    let t = 0;
    const draw = () => {
      t += 0.016;
      if (!dragging.current) { rotRef.current += vel.current; vel.current += (0.003 - vel.current) * 0.02; }
      const rot = rotRef.current * (180 / Math.PI);
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Globe fill
      const gGlobe = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, 0, cx, cy, R);
      gGlobe.addColorStop(0, '#0d1f3c'); gGlobe.addColorStop(0.6, '#060d1a'); gGlobe.addColorStop(1, '#050510');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = gGlobe; ctx.fill();

      // Atmosphere
      const gAtmo = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.12);
      gAtmo.addColorStop(0, 'rgba(0,212,255,.13)'); gAtmo.addColorStop(0.5, 'rgba(0,212,255,.04)'); gAtmo.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2); ctx.fillStyle = gAtmo; ctx.fill();

      // Grid lines
      gridLines.forEach(line => {
        ctx.beginPath(); let started = false;
        line.forEach(({ lat, lon }) => {
          const p = toXY(lat, lon, rot);
          if (!p.visible) { started = false; return; }
          if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = 'rgba(0,212,255,0.07)'; ctx.lineWidth = 0.5; ctx.stroke();
      });

      // Location dots
      LOCATIONS.forEach(loc => {
        const p = toXY(loc.lat, loc.lng, rot);
        if (!p.visible) return;
        const depth = (p.z + R) / (2 * R);
        const alpha = 0.3 + depth * 0.7;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + loc.lat);
        ctx.beginPath(); ctx.arc(p.x, p.y, 6 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(57,255,20,${alpha * 0.3})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#39FF14'; ctx.globalAlpha = alpha; ctx.fill(); ctx.globalAlpha = 1;
        if (depth > 0.55) {
          ctx.font = 'bold 8px "JetBrains Mono"'; ctx.fillStyle = `rgba(57,255,20,${alpha * 0.7})`;
          ctx.fillText(loc.label, p.x + 6, p.y - 4);
        }
      });

      // Specular
      const gSpec = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, 0, cx - R * 0.2, cy - R * 0.25, R * 0.5);
      gSpec.addColorStop(0, 'rgba(255,255,255,0.06)'); gSpec.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = gSpec; ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    }; draw();

    const onDown = (e: MouseEvent) => { dragging.current = true; lx.current = e.clientX; vel.current = 0; c.style.cursor = 'grabbing'; };
    const onMove = (e: MouseEvent) => { if (!dragging.current) return; const dx = e.clientX - lx.current; rotRef.current += dx * 0.008; vel.current = dx * 0.008; lx.current = e.clientX; };
    const onUp = () => { dragging.current = false; c.style.cursor = 'grab'; };
    c.addEventListener('mousedown', onDown); window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    return () => { cancelAnimationFrame(rafRef.current); c.removeEventListener('mousedown', onDown); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);
  return <canvas ref={ref} style={{ display: 'block', cursor: 'grab', width: '100%', maxWidth: 280 }} />;
}

/* ═══════════════════════════════════════════
   PROFICIENCY BAR
   ═══════════════════════════════════════════ */
function ProfBar({ label, value, color, delay, go }: { label: string; value: number; color: string; delay: number; go: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => { if (go) setTimeout(() => setW(value), delay); }, [go, value, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.5)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color, textShadow: `0 0 6px ${color}66` }}>{value}%</span>
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,.06)', borderRadius: 1 }}>
        <div style={{ height: '100%', width: `${w}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 8px ${color}66`, borderRadius: 1, transition: 'width 1.2s cubic-bezier(.16,1,.3,1)' }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════ */
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => { const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: .15 }); if (ref.current) obs.observe(ref.current); return () => obs.disconnect(); }, []);
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(28px)', transition: `opacity .8s ease ${delay}ms, transform .8s cubic-bezier(.16,1,.3,1) ${delay}ms` }}>{children}</div>;
}

/* ═══════════════════════════════════════════
   KINETIC MANIFESTO — word-by-word animation
   ═══════════════════════════════════════════ */
function KineticManifesto({ visible }: { visible: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [entered, setEntered] = useState<number[]>([]);

  const WORDS = OWNER.manifesto.flatMap((line, li) => {
    const words = line.split(' ').map((w, wi) => ({
      text: w,
      size: li < 2 ? (w.length > 6 ? 'xl' : 'lg') : (w.length > 8 ? 'md' : 'sm'),
      color: li < 2 ? 'white' : li === 2 || li === 4 ? 'blue' : li === 5 || li === 6 ? 'amber' : 'dim',
    }));
    return words;
  });

  const SIZES: Record<string, string> = { sm: '0.85rem', md: '1.1rem', lg: '1.5rem', xl: '2rem' };
  const COLORS: Record<string, string> = { dim: 'rgba(232,232,240,0.3)', white: '#E8E8F0', blue: '#00D4FF', amber: '#FFB800', purple: '#7B2FFF' };

  useEffect(() => {
    if (!visible) return;
    WORDS.forEach((_, i) => { setTimeout(() => setEntered(p => [...p, i]), i * 60 + 200); });
  }, [visible]);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', alignItems: 'baseline' }}>
      {WORDS.map((item, i) => (
        <span key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          style={{
            fontFamily: item.size === 'xl' || item.size === 'lg' ? 'var(--font-display)' : 'var(--font-mono)',
            fontWeight: item.size === 'xl' || item.size === 'lg' ? 800 : 400,
            fontSize: SIZES[item.size],
            color: hovered === i ? '#00D4FF' : COLORS[item.color],
            textShadow: hovered === i ? '0 0 20px rgba(0,212,255,.5)' : item.color === 'blue' ? '0 0 15px rgba(0,212,255,.3)' : 'none',
            transform: entered.includes(i) ? (hovered === i ? 'translateY(-3px) scale(1.04)' : 'translateY(0)') : 'translateY(20px)',
            opacity: entered.includes(i) ? 1 : 0,
            transition: 'transform .3s cubic-bezier(.16,1,.3,1), color .2s, text-shadow .2s, opacity .5s',
            cursor: 'default', display: 'inline-block',
          }}
        >{item.text}</span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ABOUT SECTION
   ═══════════════════════════════════════════ */
export default function AboutSection() {
  const { navigateTo } = useVoidStore();
  const [photoHov, setPhotoHov] = useState(false);
  const [statsGo, setStatsGo] = useState(false);
  const [manifestoVis, setManifestoVis] = useState(false);
  const [cvState, setCvState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [cvProg, setCvProg] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs1 = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsGo(true); }, { threshold: .2 });
    const obs2 = new IntersectionObserver(([e]) => { if (e.isIntersecting) setManifestoVis(true); }, { threshold: .2 });
    if (statsRef.current) obs1.observe(statsRef.current);
    if (manifestoRef.current) obs2.observe(manifestoRef.current);
    return () => { obs1.disconnect(); obs2.disconnect(); };
  }, []);

  const downloadCV = () => {
    if (cvState !== 'idle') return;
    setCvState('loading');
    const iv = setInterval(() => {
      setCvProg(p => {
        if (p >= 100) { clearInterval(iv); setCvState('done'); window.open('/resume', '_blank'); setTimeout(() => { setCvState('idle'); setCvProg(0); }, 2500); return 100; }
        return Math.min(100, p + Math.random() * 8 + 2);
      });
    }, 60);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050510', overflowY: 'auto', zIndex: 50 }}>
      <HexGridBG />
      <SectionAmbientBG color="#00D4FF" particleCount={40} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center,transparent 40%,rgba(0,0,0,.5) 100%)' }} />

      {/* Process bar with back button */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,3,6,.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,212,255,.08)', padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)' }}>
        <button onClick={() => navigateTo('desktop')} style={{
          background: 'none', border: '1px solid rgba(0,212,255,.15)', padding: '5px 14px',
          fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: '#00D4FF',
          cursor: 'pointer', transition: 'all .2s', borderRadius: 2,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.5)'; e.currentTarget.style.background = 'rgba(0,212,255,.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.15)'; e.currentTarget.style.background = 'none'; }}
        >← DESKTOP</button>
        <div style={{ width: 1, height: 14, background: 'rgba(0,212,255,.1)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 8px #39FF14' }} />
        <span style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.35)' }}>VOID_OS</span>
        <span style={{ color: 'rgba(232,232,240,.15)' }}>/</span>
        <span style={{ fontSize: '8px', letterSpacing: '2px', color: '#00D4FF', textShadow: '0 0 8px rgba(0,212,255,.3)' }}>ABOUT.exe</span>
        <div style={{ marginLeft: 'auto', fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.2)' }}>PID: 1337 · RUNNING</div>
      </div>

      {/* ─── HERO SPLIT ─── */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div id="about-hero" style={{ display: 'grid', gridTemplateColumns: 'clamp(260px,38%,400px) 1fr', gap: 'clamp(30px,5vw,80px)', padding: 'clamp(40px,6vw,100px) clamp(20px,5vw,80px)', alignItems: 'start' }}>
          <style dangerouslySetInnerHTML={{ __html: '@media(max-width:768px){#about-hero{grid-template-columns:1fr!important;}}' }} />

          {/* ── LEFT: Photo + Identity + CV ── */}
          <div>
            <Reveal>
              <div
                style={{
                  position: 'relative', width: '100%', paddingBottom: '120%',
                  border: `1px solid ${photoHov ? '#00D4FF' : 'rgba(0,212,255,.15)'}`,
                  boxShadow: photoHov ? '0 0 40px rgba(0,212,255,.12)' : 'none',
                  transition: 'border-color .4s, box-shadow .4s', overflow: 'hidden',
                }}
                onMouseEnter={() => setPhotoHov(true)}
                onMouseLeave={() => setPhotoHov(false)}
              >
                <div style={{ position: 'absolute', inset: 0 }}><AsciiPhoto hovered={photoHov} /></div>
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2.5px', color: photoHov ? '#00D4FF' : 'rgba(232,232,240,.25)', transition: 'color .3s' }}>
                  {photoHov ? '← REAL HUMAN →' : 'HOVER TO REVEAL'}
                </div>
                {['tl', 'tr', 'bl', 'br'].map(p => <div key={p} style={{
                  position: 'absolute', width: 14, height: 14,
                  top: p[0] === 't' ? 8 : 'auto', bottom: p[0] === 'b' ? 8 : 'auto',
                  left: p[1] === 'l' ? 8 : 'auto', right: p[1] === 'r' ? 8 : 'auto',
                  borderTop: p[0] === 't' ? '1px solid #00D4FF' : 'none', borderBottom: p[0] === 'b' ? '1px solid #00D4FF' : 'none',
                  borderLeft: p[1] === 'l' ? '1px solid #00D4FF' : 'none', borderRight: p[1] === 'r' ? '1px solid #00D4FF' : 'none',
                  opacity: photoHov ? 1 : .4, transition: 'opacity .3s',
                }} />)}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <GlowCard style={{ marginTop: 20, padding: '20px 22px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: '#00D4FF', marginBottom: 8, textShadow: '0 0 6px rgba(0,212,255,.3)' }}>IDENTITY_CARD.json</div>
                {([
                  ['NAME', OWNER.name, '#E8E8F0'],
                  ['ROLE', OWNER.role, '#00D4FF'],
                  ['BASE', OWNER.location, '#E8E8F0'],
                  ['EDU', OWNER.degree, '#E8E8F0'],
                  ['STATUS', 'AVAILABLE FOR HIRE', '#39FF14'],
                ] as const).map(([k, v, c], i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 6, fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                    <span style={{ color: 'rgba(232,232,240,.3)', minWidth: 52 }}>{k}:</span>
                    <span style={{ color: c, textShadow: c === '#39FF14' ? '0 0 12px #39FF14' : 'none' }}>{v}</span>
                  </div>
                ))}
              </GlowCard>
            </Reveal>

            <Reveal delay={250}>
              <button onClick={downloadCV} style={{
                width: '100%', marginTop: 16, position: 'relative', overflow: 'hidden',
                background: cvState === 'done' ? 'rgba(57,255,20,.08)' : 'rgba(0,212,255,.06)',
                border: `1px solid ${cvState === 'done' ? 'rgba(57,255,20,.3)' : cvState === 'loading' ? 'rgba(255,184,0,.3)' : 'rgba(0,212,255,.3)'}`,
                color: cvState === 'done' ? '#39FF14' : cvState === 'loading' ? '#FFB800' : '#00D4FF',
                fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', padding: '13px 28px',
                cursor: cvState === 'idle' ? 'pointer' : 'default', transition: 'all .3s', minWidth: 220,
              }}>
                {cvState === 'loading' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${cvProg}%`, background: 'rgba(255,184,0,.1)', transition: 'width .08s' }} />}
                <span style={{ position: 'relative', zIndex: 1 }}>{cvState === 'idle' ? 'DOWNLOAD CV.pdf' : cvState === 'done' ? '✓ TRANSMITTED' : `COMPRESSING... ${Math.floor(cvProg)}%`}</span>
              </button>
            </Reveal>
          </div>

          {/* ── RIGHT: Manifesto + Bio + Stats + Globe ── */}
          <div>
            <Reveal delay={100}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3.5px', color: '#7B2FFF', textShadow: '0 0 8px rgba(123,47,255,.3)' }}>ABOUT.exe</div>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,#7B2FFF,transparent)' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(232,232,240,.2)' }}>v1.0.0</div>
              </div>
            </Reveal>

            {/* Kinetic manifesto */}
            <div ref={manifestoRef} style={{ marginBottom: 48 }}>
              <Reveal delay={200}>
                <KineticManifesto visible={manifestoVis} />
              </Reveal>
            </div>

            {/* Bio */}
            <Reveal delay={300}>
              <GlowCard color="#7B2FFF" style={{ padding: '18px 20px', marginBottom: 36, borderLeft: '2px solid rgba(0,212,255,.25)' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', lineHeight: 2, color: 'rgba(232,232,240,.5)' }}>{OWNER.bio}</p>
              </GlowCard>
            </Reveal>

            {/* Proficiency */}
            <div ref={statsRef} style={{ marginBottom: 48 }}>
              <Reveal delay={350}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.25)', marginBottom: 16 }}>PROFICIENCY_MATRIX.sys</div>
                <ProfBar label="JAVA / DSA / OOP" value={85} color="#00D4FF" delay={100} go={statsGo} />
                <ProfBar label="BACKEND / PHP / DATABASES" value={68} color="#7B2FFF" delay={200} go={statsGo} />
                <ProfBar label="FRONTEND / REACT / UI" value={50} color="#39FF14" delay={300} go={statsGo} />
                <ProfBar label="THREE.JS / WEBGL / GSAP" value={35} color="#FFB800" delay={400} go={statsGo} />
                <ProfBar label="GIT / TOOLS / DEPLOYMENT" value={62} color="#00D4FF" delay={500} go={statsGo} />
              </Reveal>
            </div>

            {/* Globe */}
            <Reveal delay={450}>
              <GlowCard color="#39FF14" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.25)', alignSelf: 'flex-start' }}>LOCATIONS.geojson</div>
                <Globe />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '2px', color: 'rgba(232,232,240,.2)' }}>DRAG TO ROTATE</div>
              </GlowCard>
            </Reveal>
          </div>
        </div>

        {/* ── TECH ARSENAL — full-width ── */}
        <div style={{ padding: '0 clamp(20px,5vw,80px) clamp(30px,3vw,50px)' }}>
          <Reveal>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: '#00D4FF', textShadow: '0 0 6px rgba(0,212,255,.2)', marginBottom: 16 }}>TECH_ARSENAL</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {OWNER.techArsenal.map((t, i) => (
                <span key={i} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '7px 16px',
                  border: '1px solid rgba(0,212,255,.12)', color: 'rgba(232,232,240,.6)',
                  letterSpacing: '.5px', cursor: 'default', borderRadius: 2,
                  transition: 'all .25s cubic-bezier(.16,1,.3,1)', background: 'rgba(0,212,255,.03)',
                }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,212,255,.5)'; el.style.color = '#00D4FF'; el.style.background = 'rgba(0,212,255,.1)'; el.style.transform = 'translateY(-3px) scale(1.05)'; el.style.textShadow = '0 0 10px rgba(0,212,255,.4)'; el.style.boxShadow = '0 0 12px rgba(0,212,255,.15)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,212,255,.12)'; el.style.color = 'rgba(232,232,240,.6)'; el.style.background = 'rgba(0,212,255,.03)'; el.style.transform = 'translateY(0) scale(1)'; el.style.textShadow = 'none'; el.style.boxShadow = 'none'; }}
                >{t}</span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── STATS + CORE VALUES ── */}
        <div style={{ padding: 'clamp(30px,4vw,60px) clamp(20px,5vw,80px)', borderTop: '1px solid rgba(0,212,255,.06)' }}>
          {/* Stats row */}
          <Reveal>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.25)', marginBottom: 16 }}>SYSTEM_METRICS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 40 }}>
              {OWNER.stats.map((s, i) => (
                <GlowCard key={i} style={{ padding: '18px 14px', textAlign: 'center', cursor: 'default', transition: 'transform .3s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 800, color: '#00D4FF', textShadow: '0 0 15px rgba(0,212,255,.4)', marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(232,232,240,.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{s.label}</div>
                </GlowCard>
              ))}
            </div>
          </Reveal>

          {/* Core values */}
          <Reveal delay={100}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3.5px', color: '#7B2FFF', textShadow: '0 0 8px rgba(123,47,255,.3)', marginBottom: 24 }}>CORE_VALUES.exe</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
              {([
                { icon: '⟡', label: 'OBSESSIVE GRIND', desc: "DSA at midnight. Coffee-fueled sprints. The grind never stops.", color: '#00D4FF' },
                { icon: '◈', label: 'SHIP IT', desc: "Ideas are worthless. Shipped projects are everything.", color: '#39FF14' },
                { icon: '◉', label: 'LEARN BY BUILDING', desc: "Textbooks are step 1. Building is the real education.", color: '#7B2FFF' },
                { icon: '⬡', label: 'PUSH LIMITS', desc: "If it's been done before, push it further.", color: '#FFB800' },
              ]).map(({ icon, label, desc, color }) => (
                <GlowCard key={label} color={color} style={{ padding: 20, cursor: 'default', transition: 'transform .3s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '22px', color, textShadow: `0 0 12px ${color}66`, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', marginBottom: 6, letterSpacing: '1px', color: '#E8E8F0' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', lineHeight: 1.7, color: 'rgba(232,232,240,.45)' }}>{desc}</div>
                </GlowCard>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px clamp(20px,5vw,80px)', borderTop: '1px solid rgba(0,212,255,.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,.2)' }}>ABOUT.exe — PROCESS COMPLETE</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['work', 'WORK.db →'], ['skills', 'SKILLS.sys →']].map(([section, label]) => (
              <button key={section} onClick={() => navigateTo(section as 'work' | 'skills')} style={{
                background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px',
                color: '#00D4FF', opacity: .5, cursor: 'pointer', transition: 'opacity .2s',
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

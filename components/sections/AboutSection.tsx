'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useVoidStore } from '@/lib/store';
import { OWNER, LOCATIONS } from '@/lib/portfolio-data';

export default function AboutSection() {
  const { setActiveSection } = useVoidStore();
  const [manifestoIndex, setManifestoIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { setTimeout(() => setShowContent(true), 100); }, []);

  // Manifesto word-by-word reveal
  useEffect(() => {
    if (!showContent) return;
    const timer = setInterval(() => {
      setManifestoIndex((prev) => {
        if (prev >= OWNER.manifesto.length - 1) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, [showContent]);

  // ASCII Portrait Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 300, H = 380;
    canvas.width = W; canvas.height = H;

    const chars = '01@#$%&*+=-:. ';
    const cellSize = 6;
    const cols = Math.floor(W / cellSize);
    const rows = Math.floor(H / cellSize);

    // Generate synthetic face pattern
    const drawASCII = () => {
      ctx.fillStyle = '#030306';
      ctx.fillRect(0, 0, W, H);
      ctx.font = `${cellSize}px "JetBrains Mono", monospace`;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellSize;
          const y = row * cellSize + cellSize;
          const cx = cols / 2, cy = rows / 2.5;
          const dx = (col - cx) / cx;
          const dy = (row - cy) / (rows * 0.6);
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Face shape (oval)
          let brightness = 0;
          if (dist < 0.6) {
            brightness = 1 - dist * 1.2;
            // Eyes
            const eyeY = cy - rows * 0.08;
            const leftEyeX = cx - cols * 0.12;
            const rightEyeX = cx + cols * 0.12;
            const eyeDistL = Math.sqrt(Math.pow(col - leftEyeX, 2) + Math.pow(row - eyeY, 2));
            const eyeDistR = Math.sqrt(Math.pow(col - rightEyeX, 2) + Math.pow(row - eyeY, 2));
            if (eyeDistL < 3 || eyeDistR < 3) brightness = 0.9;
            // Nose
            if (Math.abs(col - cx) < 1 && row > cy - rows * 0.02 && row < cy + rows * 0.08) brightness = 0.7;
            // Mouth
            const mouthY = cy + rows * 0.12;
            if (Math.abs(row - mouthY) < 1.5 && Math.abs(col - cx) < cols * 0.08) brightness = 0.6;
          }

          const charIndex = Math.floor((1 - brightness) * (chars.length - 1));
          const c = chars[Math.min(charIndex, chars.length - 1)];
          const alpha = brightness * 0.8 + 0.1;
          ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.fillText(c, x, y);
        }
      }
    };
    drawASCII();
  }, []);

  // Globe Canvas
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 200;
    canvas.width = size; canvas.height = size;
    let angle = 0;
    let animFrame: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2, cy = size / 2, r = size * 0.4;

      // Globe outline
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const y = cy - r * Math.sin(latRad);
        const xr = r * Math.cos(latRad);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.beginPath(); ctx.ellipse(cx, y, xr, xr * 0.1, 0, 0, Math.PI * 2); ctx.stroke();
      }

      // Longitude lines
      for (let lon = 0; lon < 180; lon += 30) {
        const lonRad = ((lon + angle) * Math.PI) / 180;
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(lonRad)), r, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Location dot (India)
      LOCATIONS.forEach((loc) => {
        const lonRad = ((loc.lng + angle) * Math.PI) / 180;
        const latRad = (loc.lat * Math.PI) / 180;
        const px = cx + r * Math.cos(latRad) * Math.sin(lonRad);
        const py = cy - r * Math.sin(latRad);
        const isVisible = Math.cos(lonRad) > -0.2;
        if (isVisible) {
          ctx.fillStyle = '#39FF14';
          ctx.shadowColor = '#39FF14';
          ctx.shadowBlur = 10;
          ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.font = '9px "JetBrains Mono"';
          ctx.fillStyle = 'rgba(57, 255, 20, 0.8)';
          ctx.fillText(loc.label, px + 8, py + 3);
        }
      });

      angle += 0.3;
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="section-container" style={{ background: 'var(--void-black)', position: 'relative' }}>
      {/* Back button */}
      <button className="back-button" onClick={() => setActiveSection('desktop')}>
        ← VOID DESKTOP
      </button>

      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '40px' }}>
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">// ABOUT.exe</span>
          <h1>About <span className="glow-text-blue">Me</span></h1>
        </div>

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '60px', alignItems: 'start' }}>
          {/* Left: ASCII Portrait */}
          <div style={{ position: 'relative', opacity: showContent ? 1 : 0, transition: 'opacity 0.8s ease', animation: showContent ? 'fadeInUp 0.8s ease' : 'none' }}>
            <canvas ref={canvasRef} style={{ borderRadius: '12px', border: '1px solid var(--glass-border)', width: '100%', height: 'auto' }} />
            <div style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', background: 'var(--void-black)', padding: '2px 8px' }}>
              PORTRAIT.ascii — 300×380
            </div>
          </div>

          {/* Right: Content */}
          <div style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.8s ease 0.2s' }}>
            {/* Manifesto */}
            <div style={{ marginBottom: '40px' }}>
              {OWNER.manifesto.map((line, i) => (
                <p key={i} style={{
                  fontFamily: i === 0 || i === 1 ? 'var(--font-display)' : 'var(--font-body)',
                  fontSize: i < 2 ? '28px' : '18px',
                  fontWeight: i < 2 ? 700 : 400,
                  lineHeight: 1.6,
                  color: i <= manifestoIndex ? 'var(--ghost-white)' : 'transparent',
                  transition: 'color 0.5s ease',
                  marginBottom: '4px',
                }}>
                  {line.includes('experiences') || line.includes('breathe') || line.includes('think') || line.includes('alive') || line.includes('coded')
                    ? <>{line.split(' ').map((word, wi) => (
                        ['experiences.', 'breathe.', 'think.', 'alive.', 'coded.'].some(k => word.includes(k))
                          ? <span key={wi} className="glow-text-blue">{word} </span>
                          : <span key={wi}>{word} </span>
                      ))}</>
                    : line
                  }
                </p>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
              {OWNER.stats.map((stat, i) => (
                <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center', animation: `fadeInUp 0.5s ease ${0.3 + i * 0.1}s both` }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800, color: 'var(--plasma-blue)', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Tech Arsenal */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '12px', textTransform: 'uppercase' }}>Tech Arsenal</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {OWNER.techArsenal.map((tech, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', padding: '4px 12px',
                    background: 'rgba(0, 212, 255, 0.06)', border: '1px solid rgba(0, 212, 255, 0.15)',
                    borderRadius: '4px', color: 'var(--plasma-blue)',
                    animation: `fadeIn 0.3s ease ${0.5 + i * 0.05}s both`,
                  }}>{tech}</span>
                ))}
              </div>
            </div>

            {/* Globe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <canvas ref={globeCanvasRef} style={{ width: '120px', height: '120px' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>LOCATION</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--ghost-white)' }}>{OWNER.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <span className="status-dot online" />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--acid-green)' }}>AVAILABLE FOR WORK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile responsive override */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '300px 1fr'"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="repeat(4, 1fr)"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

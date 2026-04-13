'use client';

import { useRef, useEffect } from 'react';

/* ═══════════════════════════════════════════
   SECTION AMBIENT BG — Highly Interactive
   - Click ripple shockwave
   - Strong mouse repulsion
   - Particle trail on fast mouse
   - Speed-reactive connections
   - Pulsing cursor glow
   ═══════════════════════════════════════════ */
export default function SectionAmbientBG({ color = '#00D4FF', particleCount = 90 }: {
  color?: string;
  particleCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999, px: -999, py: -999, speed: 0 });
  const clickRipples = useRef<Array<{ x: number; y: number; r: number; alpha: number; maxR: number }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      m.px = m.x; m.py = m.y;
      m.x = e.clientX; m.y = e.clientY;
      m.speed = Math.sqrt((m.x - m.px) ** 2 + (m.y - m.py) ** 2);
    };
    window.addEventListener('mousemove', onMouseMove);

    // Click → spawn ripple shockwave
    const onClick = (e: MouseEvent) => {
      clickRipples.current.push({
        x: e.clientX, y: e.clientY,
        r: 0, alpha: 1, maxR: 250 + Math.random() * 100,
      });
      // Also burst particles outward from click
      for (const p of particles) {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 0) {
          const force = (300 - dist) / 300 * 4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    };
    window.addEventListener('click', onClick);

    // Parse color
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Particles
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 2.5,
      alpha: 0.15 + Math.random() * 0.25,
      phase: Math.random() * Math.PI * 2,
    }));

    // Data rain columns — matrix-style falling characters
    const DATA_CHARS = '01アイウエオカキクケコ<>/{}[]|=+-*&^%$#@!';
    const rainCols = Math.floor(W / 50);
    const rainDrops = Array.from({ length: rainCols }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      speed: 0.3 + Math.random() * 0.8,
      char: DATA_CHARS[Math.floor(Math.random() * DATA_CHARS.length)],
      alpha: 0.03 + Math.random() * 0.04,
      tickCounter: 0,
    }));

    let t = 0;
    let frame: number;

    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, W, H);

      // Data rain
      ctx.font = '10px var(--font-mono)';
      for (const drop of rainDrops) {
        drop.y += drop.speed;
        drop.tickCounter++;
        if (drop.tickCounter % 8 === 0) {
          drop.char = DATA_CHARS[Math.floor(Math.random() * DATA_CHARS.length)];
        }
        if (drop.y > H) {
          drop.y = -10;
          drop.x = Math.random() * W;
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${drop.alpha})`;
        ctx.fillText(drop.char, drop.x, drop.y);
      }

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const speed = mouseRef.current.speed;

      // Radial atmosphere around mouse — size reactive to speed
      const glowR = 300 + Math.min(speed * 3, 200);
      const glowAlpha = 0.04 + Math.min(speed * 0.002, 0.08);
      const grd = ctx.createRadialGradient(mx, my, 0, mx, my, glowR);
      grd.addColorStop(0, `rgba(${r},${g},${b},${glowAlpha})`);
      grd.addColorStop(0.6, `rgba(${r},${g},${b},${glowAlpha * 0.3})`);
      grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = `rgba(${r},${g},${b},0.035)`;
      ctx.lineWidth = 0.5;
      const gridSize = 80;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Click ripple shockwaves
      const ripples = clickRipples.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 4 + rp.r * 0.03;
        rp.alpha = Math.max(0, 1 - rp.r / rp.maxR);

        if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }

        // Ring
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${rp.alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner glow
        const rGrd = ctx.createRadialGradient(rp.x, rp.y, rp.r * 0.8, rp.x, rp.y, rp.r);
        rGrd.addColorStop(0, 'rgba(0,0,0,0)');
        rGrd.addColorStop(1, `rgba(${r},${g},${b},${rp.alpha * 0.08})`);
        ctx.fillStyle = rGrd;
        ctx.fill();
      }

      // Particles with STRONG mouse interaction
      for (const p of particles) {
        // Mouse repulsion — stronger radius and force
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (200 - dist) / 200 * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Speed boost — particles react to fast mouse
        if (dist < 250 && speed > 5) {
          const pushForce = Math.min(speed * 0.05, 2);
          p.vx += (dx / dist) * pushForce * 0.3;
          p.vy += (dy / dist) * pushForce * 0.3;
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.012;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.phase));

        // Proximity boost — particles near mouse glow brighter
        const proxAlpha = dist < 200 ? a + (200 - dist) / 200 * 0.3 : a;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${proxAlpha})`;
        ctx.fill();

        // Glow halo
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${proxAlpha * 0.2})`;
          ctx.fill();
        }
      }

      // Connection lines — stronger when mouse is near
      ctx.lineWidth = 0.4;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mouseDist = Math.sqrt((midX - mx) ** 2 + (midY - my) ** 2);
            const mouseBoost = mouseDist < 200 ? 1 + (200 - mouseDist) / 200 * 2 : 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${0.06 * (1 - dist / 140) * mouseBoost})`;
            ctx.stroke();
          }
        }
      }

      // Cursor dot ring
      if (mx > 0 && my > 0) {
        const cursorPulse = 0.3 + Math.sin(t * 4) * 0.15;
        ctx.beginPath();
        ctx.arc(mx, my, 20 + speed * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},${cursorPulse * 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, [color, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

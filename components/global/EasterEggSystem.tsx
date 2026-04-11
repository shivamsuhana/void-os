'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';

export default function EasterEggSystem() {
  const { setLabUnlocked, addEasterEgg, labUnlocked } = useVoidStore();
  const konamiRef = useRef<string[]>([]);
  const typedRef = useRef<string>('');
  const toastRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  const showToast = useCallback((message: string, color: string) => {
    if (!toastRef.current) return;
    const toast = toastRef.current;
    toast.textContent = message;
    toast.style.borderColor = color;
    toast.style.color = color;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
  }, []);

  const fireConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; rotation: number; rotSpeed: number; life: number;
    }> = [];

    const colors = ['#00D4FF', '#7B2FFF', '#39FF14', '#FFB800', '#FF3366', '#E8E8F0'];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: Math.random() * -15 - 5,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.rotation += p.rotSpeed;
        p.life -= 0.008;
        p.vx *= 0.99;

        if (p.life <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.4);
        ctx.restore();
      }

      if (alive) {
        frame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Konami code detection
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > KONAMI.length) {
        konamiRef.current.shift();
      }
      if (konamiRef.current.join(',') === KONAMI.join(',')) {
        if (!labUnlocked) {
          setLabUnlocked(true);
          addEasterEgg('konami');
          showToast('↑↑↓↓←→←→BA — LAB.beta UNLOCKED', 'var(--acid-green)');
        }
        konamiRef.current = [];
      }

      // "hire me" detection
      if (e.key.length === 1) {
        typedRef.current += e.key.toLowerCase();
        if (typedRef.current.length > 10) {
          typedRef.current = typedRef.current.slice(-10);
        }
        if (typedRef.current.includes('hire me')) {
          addEasterEgg('hirme');
          showToast('🎉 CONFETTI MODE ACTIVATED!', 'var(--warning-amber)');
          fireConfetti();
          typedRef.current = '';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [labUnlocked, setLabUnlocked, addEasterEgg, showToast, fireConfetti]);

  return (
    <>
      {/* Toast notification */}
      <div
        ref={toastRef}
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%) translateY(20px)',
          zIndex: 99999,
          padding: '12px 24px',
          borderRadius: '8px',
          background: 'rgba(3, 3, 6, 0.95)',
          border: '1px solid var(--acid-green)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--acid-green)',
          letterSpacing: '1px',
          backdropFilter: 'blur(10px)',
          opacity: 0,
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      />

      {/* Confetti canvas */}
      <canvas
        ref={confettiCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

/* ============================================
   VOID OS — Boot Sequence
   BIOS → Diagnostics → Glitch → Particles → Tagline → Ready
   ============================================ */

const BIOS_LINES = [
  { text: 'VOID BIOS v2045.1 — Quantum Core Edition', delay: 0, color: 'var(--ghost-white)' },
  { text: 'Copyright (C) 2045 VOID Systems Inc.', delay: 100, color: 'var(--text-dim)' },
  { text: '', delay: 200, color: '' },
  { text: 'Quantum Core: 128 qubits @ 4.7 GHz............ OK', delay: 300, color: 'var(--acid-green)' },
  { text: 'Holographic RAM: 1 PB.......................... OK', delay: 500, color: 'var(--acid-green)' },
  { text: 'Neural Interface: v12.8........................ OK', delay: 700, color: 'var(--acid-green)' },
  { text: 'Subspace Network: Entanglement Active.......... OK', delay: 900, color: 'var(--acid-green)' },
  { text: '', delay: 1000, color: '' },
  { text: '> LOADING CONSCIOUSNESS............. 97%', delay: 1100, color: 'var(--plasma-blue)' },
  { text: '> MOUNTING CREATIVITY............... OK', delay: 1400, color: 'var(--acid-green)' },
  { text: '> SKILLS DETECTED................... OK', delay: 1600, color: 'var(--acid-green)' },
  { text: '> INITIALIZING EXPERIENCE........... OK', delay: 1800, color: 'var(--acid-green)' },
  { text: '', delay: 2000, color: '' },
  { text: '> WARNING: REALITY.EXE UNSTABLE', delay: 2100, color: 'var(--warning-amber)' },
  { text: '> LAUNCHING VOID_OS.................', delay: 2400, color: 'var(--plasma-blue)' },
];

const NAME_ASCII = `
██╗   ██╗ ██████╗ ██╗██████╗      ██████╗ ███████╗
██║   ██║██╔═══██╗██║██╔══██╗    ██╔═══██╗██╔════╝
██║   ██║██║   ██║██║██║  ██║    ██║   ██║███████╗
╚██╗ ██╔╝██║   ██║██║██║  ██║    ██║   ██║╚════██║
 ╚████╔╝ ╚██████╔╝██║██████╔╝    ╚██████╔╝███████║
  ╚═══╝   ╚═════╝ ╚═╝╚═════╝      ╚═════╝ ╚══════╝`;

export default function BootSequence() {
  const { setBootPhase, setBootComplete, setActiveSection, bootPhase } = useVoidStore();
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [showName, setShowName] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [taglineText, setTaglineText] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [biosComplete, setBiosComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // BIOS line reveal
  useEffect(() => {
    if (bootPhase !== 'bios') return;
    const timers: NodeJS.Timeout[] = [];

    BIOS_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay)
      );
    });

    timers.push(
      setTimeout(() => {
        setBootPhase('diagnostics');
        setBiosComplete(true);
      }, 2800)
    );

    return () => timers.forEach(clearTimeout);
  }, [bootPhase, setBootPhase]);

  // Diagnostics → Glitch → Name
  useEffect(() => {
    if (bootPhase !== 'diagnostics') return;
    const t1 = setTimeout(() => {
      setGlitchActive(true);
      setBootPhase('glitch');
    }, 300);

    return () => clearTimeout(t1);
  }, [bootPhase, setBootPhase]);

  useEffect(() => {
    if (bootPhase !== 'glitch') return;
    const t1 = setTimeout(() => {
      setGlitchActive(false);
      setShowParticles(true);
      setBootPhase('particles');
    }, 800);

    return () => clearTimeout(t1);
  }, [bootPhase, setBootPhase]);

  // Particles → Name reveal
  useEffect(() => {
    if (bootPhase !== 'particles') return;
    const t1 = setTimeout(() => {
      setShowName(true);
      setBootPhase('tagline');
    }, 1200);

    return () => clearTimeout(t1);
  }, [bootPhase, setBootPhase]);

  // Tagline typewriter
  useEffect(() => {
    if (bootPhase !== 'tagline') return;
    const fullText = OWNER.tagline;
    let i = 0;

    const t1 = setTimeout(() => {
      setShowTagline(true);
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setTaglineText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setShowPrompt(true);
            setBootPhase('ready');
          }, 500);
        }
      }, 40);

      return () => clearInterval(interval);
    }, 400);

    return () => clearTimeout(t1);
  }, [bootPhase, setBootPhase]);

  // Particle canvas animation
  useEffect(() => {
    if (!showParticles || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }> = [];

    const colors = ['#00D4FF', '#7B2FFF', '#39FF14', '#FFB800'];
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      // Draw connections
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [showParticles]);

  // Handle key press to enter
  const handleEnter = useCallback(() => {
    if (bootPhase !== 'ready') return;
    setBootComplete(true);
    setActiveSection('desktop');
  }, [bootPhase, setBootComplete, setActiveSection]);

  useEffect(() => {
    const handler = (e: KeyboardEvent | MouseEvent) => {
      e.preventDefault();
      handleEnter();
    };
    if (bootPhase === 'ready') {
      window.addEventListener('keydown', handler);
      window.addEventListener('click', handler);
    }
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
    };
  }, [bootPhase, handleEnter]);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'var(--void-black)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    }}>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', inset: 0,
          opacity: showParticles ? 1 : 0,
          transition: 'opacity 1s ease',
        }}
      />

      {/* CRT scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)',
        zIndex: 2,
      }} />

      {/* Glitch overlay */}
      {glitchActive && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'var(--void-black)',
          animation: 'glitch-screen 0.8s steps(4) forwards',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(transparent 50%, rgba(0,212,255,0.03) 50%)',
            backgroundSize: '100% 4px',
          }} />
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: 0, right: 0,
              height: `${Math.random() * 3 + 1}px`,
              background: `rgba(${Math.random() > 0.5 ? '0,212,255' : '123,47,255'},${Math.random() * 0.5 + 0.1})`,
              transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
            }} />
          ))}
        </div>
      )}

      {/* BIOS Content */}
      {!biosComplete && (
        <div style={{
          position: 'relative', zIndex: 5,
          fontFamily: 'var(--font-mono)', fontSize: '13px',
          lineHeight: '1.8', padding: '40px',
          maxWidth: '700px', width: '100%',
          animation: 'fadeIn 0.3s ease',
        }}>
          {BIOS_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} style={{
              color: line.color || 'var(--ghost-white)',
              opacity: line.text ? 1 : 0,
              minHeight: '24px',
            }}>
              {line.text}
            </div>
          ))}
          <div style={{
            display: 'inline-block', width: '8px', height: '16px',
            background: 'var(--plasma-blue)', animation: 'blink 1s infinite',
            marginTop: '4px',
          }} />
        </div>
      )}

      {/* Name + Tagline */}
      {showName && (
        <div style={{
          position: 'relative', zIndex: 5,
          textAlign: 'center',
          animation: 'fadeIn 1s ease',
        }}>
          {/* ASCII Name */}
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(4px, 1.2vw, 10px)',
            lineHeight: 1.2,
            color: 'var(--plasma-blue)',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.2)',
            whiteSpace: 'pre',
            letterSpacing: '0.02em',
            marginBottom: '20px',
          }}>
            {NAME_ASCII}
          </pre>

          {/* Name text fallback */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 10vw, 120px)',
            fontWeight: 800,
            letterSpacing: '-2px',
            lineHeight: 1,
            marginBottom: '8px',
            background: 'linear-gradient(135deg, var(--ghost-white) 0%, var(--plasma-blue) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {OWNER.name}
          </h1>

          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: 'var(--text-dim)',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            {OWNER.role}
          </p>

          {/* Tagline typewriter */}
          {showTagline && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 2vw, 22px)',
              color: 'var(--ghost-white)',
              opacity: 0.8,
              marginBottom: '48px',
              minHeight: '30px',
            }}>
              {taglineText}
              <span style={{
                display: 'inline-block', width: '2px', height: '1em',
                background: 'var(--plasma-blue)', marginLeft: '2px',
                animation: 'blink 1s infinite',
                verticalAlign: 'text-bottom',
              }} />
            </p>
          )}

          {/* Press any key prompt */}
          {showPrompt && (
            <div style={{
              animation: 'fadeIn 0.5s ease, pulse 2s infinite',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-dim)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              [ PRESS ANY KEY TO ENTER ]
            </div>
          )}
        </div>
      )}

      {/* Bottom system info */}
      <div style={{
        position: 'absolute', bottom: '20px', left: '20px',
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        color: 'var(--text-muted)', zIndex: 5,
      }}>
        VOID OS v2045.1 · Quantum Core · {new Date().getFullYear()}
      </div>

      <style jsx>{`
        @keyframes glitch-screen {
          0% { opacity: 1; transform: translate(0); }
          20% { opacity: 0.8; transform: translate(-5px, 2px); }
          40% { opacity: 0.6; transform: translate(5px, -3px); }
          60% { opacity: 0.4; transform: translate(-3px, 5px); }
          80% { opacity: 0.2; transform: translate(3px, -2px); }
          100% { opacity: 0; transform: translate(0); }
        }
      `}</style>
    </div>
  );
}

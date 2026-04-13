'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TERMINAL_COMMANDS, OWNER } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';
import OSWindowFrame from '@/components/global/OSWindowFrame';

type LabTab = 'music' | 'particles' | 'terminal';

/* ============================================
   MUSIC VISUALIZER — procedural audio bars
   ============================================ */
function MusicVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    const bars = 48;
    const barData = new Array(bars).fill(0);
    let frame: number;

    const animate = () => {
      const W = canvas.width / 2, H = canvas.height / 2;
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = 'rgba(0,212,255,0.02)';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      const barWidth = W / bars - 1.5;
      for (let i = 0; i < bars; i++) {
        const target = Math.sin(Date.now() * 0.002 + i * 0.3) * 0.3 + Math.sin(Date.now() * 0.005 + i * 0.1) * 0.2 + 0.3;
        barData[i] = barData[i] * 0.85 + target * 0.15 + Math.random() * 0.05;

        const h = barData[i] * (H - 20);
        const x = i * (barWidth + 1.5);
        const y = H - h;
        const hue = 190 + (i / bars) * 80;

        const grad = ctx.createLinearGradient(x, y, x, H);
        grad.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.85)`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.1)`);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, h);

        // Top cap glow
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
        ctx.fillRect(x, y, barWidth, 1.5);
      }

      // Reflection
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.scale(1, -1);
      ctx.translate(0, -H * 2);
      for (let i = 0; i < bars; i++) {
        const h = barData[i] * (H - 20);
        const x = i * (barWidth + 1.5);
        ctx.fillStyle = `hsla(${190 + (i / bars) * 80}, 100%, 50%, 0.3)`;
        ctx.fillRect(x, H, barWidth, h * 0.3);
      }
      ctx.restore();

      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '280px', display: 'block', borderRadius: '2px' }} />
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)',
        marginTop: '10px', textAlign: 'center', letterSpacing: '1px',
      }}>
        ♫ PROCEDURAL AUDIO VISUALIZATION · DEMO MODE
      </div>
    </div>
  );
}

/* ============================================
   PARTICLE EXPERIMENT — interactive force field
   ============================================ */
function ParticleExperiment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 300, y: 200 });
  const [mode, setMode] = useState<'attract' | 'repel'>('attract');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2; canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    const W = () => canvas.width / 2;
    const H = () => canvas.height / 2;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string }> = [];
    for (let i = 0; i < 250; i++) {
      particles.push({
        x: Math.random() * 600, y: Math.random() * 350,
        vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2.5 + 0.5,
        color: ['#00D4FF', '#7B2FFF', '#39FF14', '#FFB800'][Math.floor(Math.random() * 4)],
      });
    }

    let frame: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 3, 6, 0.12)';
      ctx.fillRect(0, 0, W(), H());

      const mx = mouseRef.current.x, my = mouseRef.current.y;
      const isRepel = mode === 'repel';

      for (const p of particles) {
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 150) {
          const force = isRepel ? -0.4 : 0.3;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.97; p.vy *= 0.97;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W(); if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H(); if (p.y > H()) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Lines between nearby
        for (const q of particles) {
          if (p === q) continue;
          const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
          if (d < 40) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,212,255,${(1 - d / 40) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      frame = requestAnimationFrame(animate);
    };
    animate();

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) * (W() / rect.width),
        y: (e.clientY - rect.top) * (H() / rect.height),
      };
    };
    canvas.addEventListener('mousemove', handleMove);
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener('mousemove', handleMove); };
  }, [mode]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '320px', display: 'block', borderRadius: '2px', cursor: 'crosshair' }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
        {(['attract', 'repel'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '6px 14px',
            borderRadius: '2px', letterSpacing: '1px', cursor: 'pointer',
            background: mode === m ? 'rgba(0,212,255,0.2)' : 'transparent',
            border: `1px solid ${mode === m ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: mode === m ? 'var(--blue)' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}>
            {m === 'attract' ? '⊕ ATTRACT' : '⊖ REPEL'}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================
   SECRET TERMINAL
   ============================================ */
function SecretTerminal() {
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    { type: 'output', text: '╔═══════════════════════════════════╗' },
    { type: 'output', text: '║   VOID OS · Secret Terminal       ║' },
    { type: 'output', text: '║   Access Level: ROOT              ║' },
    { type: 'output', text: '╚═══════════════════════════════════╝' },
    { type: 'output', text: '' },
    { type: 'output', text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [history]);

  const handleCommand = useCallback(() => {
    if (!input.trim()) return;
    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'input', text: `$ ${input}` }]);
    setInput('');

    if (cmd === 'clear') { setHistory([]); return; }
    if (cmd === 'exit') { setHistory(prev => [...prev, { type: 'output', text: 'Goodbye. 👋' }]); return; }

    const response = TERMINAL_COMMANDS[cmd];
    if (response) {
      response.split('\n').forEach(line => {
        setHistory(prev => [...prev, { type: 'output', text: line }]);
      });
    } else {
      setHistory(prev => [...prev, { type: 'output', text: `command not found: ${cmd}. Type "help" for available commands.` }]);
    }
  }, [input]);

  return (
    <div style={{
      maxWidth: '600px', margin: '0 auto', borderRadius: '2px',
      overflow: 'hidden', border: '1px solid rgba(0,212,255,0.2)',
      background: 'rgba(3,3,6,0.95)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3366' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB800' }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#39FF14' }} />
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          root@void-os ~
        </span>
      </div>
      <div ref={termRef} style={{ padding: '14px', height: '300px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.8 }} onClick={() => inputRef.current?.focus()}>
        {history.map((line, i) => (
          <div key={i} style={{
            color: line.type === 'input' ? 'var(--green)' : 'var(--text-dim)',
            whiteSpace: 'pre-wrap',
            textShadow: line.type === 'input' ? '0 0 8px rgba(57,255,20,0.4)' : 'none',
          }}>
            {line.text || '\u00A0'}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--green)' }}>$</span>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCommand(); }}
            style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--white)', caretColor: 'var(--blue)' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================
   LOCK SCREEN
   ============================================ */
function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const validCodes = ['konami', 'lab', 'unlock', 'void', 'secret'];

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (validCodes.includes(pass.toLowerCase())) {
      onUnlock();
    } else {
      setError(true); setShake(true);
      setTimeout(() => { setError(false); setShake(false); }, 800);
      setPass('');
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: '20px',
    }}>
      {/* Lock icon with pulse */}
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px',
        background: 'rgba(57,255,20,0.04)', border: '1px solid rgba(57,255,20,0.15)',
        animation: 'glowPulse 3s infinite',
      }}>
        🔒
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 800 }}>
        LAB<span style={{ color: 'var(--green)' }}>.beta</span>
      </h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
        CLASSIFIED — Enter passphrase to access
      </p>

      <div style={{
        display: 'flex', gap: '8px',
        animation: shake ? 'shake 0.3s ease' : 'none',
      }}>
        <input ref={inputRef} value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          type="password" placeholder="PASSPHRASE"
          style={{
            padding: '12px 20px', borderRadius: '2px', width: '220px',
            background: 'rgba(255,255,255,0.03)', fontFamily: 'var(--font-mono)', fontSize: '12px',
            color: 'var(--white)', caretColor: 'var(--green)', letterSpacing: '3px',
            border: `1px solid ${error ? 'var(--red)' : 'rgba(57,255,20,0.15)'}`,
            transition: 'border-color 0.2s',
          }}
        />
        <button onClick={handleSubmit} style={{
          padding: '12px 18px', borderRadius: '2px',
          background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)',
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green)',
          cursor: 'pointer', letterSpacing: '2px', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(57,255,20,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(57,255,20,0.06)'; }}
        >UNLOCK</button>
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '1px', animation: 'fadeIn 0.2s ease' }}>
          ✕ ACCESS DENIED
        </p>
      )}

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '12px', letterSpacing: '1px' }}>
        HINT: TRY "void" OR "lab"
      </p>

      <style>{`@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }`}</style>
    </div>
  );
}

/* ============================================
   LAB SECTION — Main
   ============================================ */
export default function LabSection() {
  const { navigateTo, labUnlocked, setLabUnlocked } = useVoidStore();
  const [activeTab, setActiveTab] = useState<LabTab>('music');
  const backRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // GSAP entrance
  useEffect(() => {
    if (!labUnlocked) return;
    const tl = gsap.timeline({ delay: 0.15 });
    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (headerRef.current) tl.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.1);
    if (tabsRef.current) {
      const buttons = tabsRef.current.children;
      tl.fromTo(buttons, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'back.out(1.5)' }, 0.35);
    }
    if (contentRef.current) tl.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.55);
    return () => { tl.kill(); };
  }, [labUnlocked]);

  const TABS: Array<{ id: LabTab; label: string; icon: string }> = [
    { id: 'music', label: 'AUDIO.viz', icon: '♫' },
    { id: 'particles', label: 'FORCE.exp', icon: '◎' },
    { id: 'terminal', label: 'ROOT.sh', icon: '▸' },
  ];

  if (!labUnlocked) {
    return (
      <OSWindowFrame name="LAB" ext=".beta" color="#39FF14">
      <div style={{ position: 'relative', background: 'var(--void)', height: '100%' }}>
        <LockScreen onUnlock={() => setLabUnlocked(true)} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
      </div>
      </OSWindowFrame>
    );
  }

  return (
    <OSWindowFrame name="LAB" ext=".beta" color="#39FF14">
    <div style={{ position: 'relative', background: 'var(--void)', overflow: 'auto', height: '100%' }}>
      <SectionAmbientBG color="#7B2FFF" particleCount={70} />

      {/* CLASSIFIED watermark */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-35deg)',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(60px, 12vw, 140px)',
        fontWeight: 800, letterSpacing: '20px',
        color: 'rgba(57,255,20,0.015)', pointerEvents: 'none', zIndex: 0,
        userSelect: 'none', whiteSpace: 'nowrap',
        animation: 'classified-fade 5s ease-in-out infinite',
      }}>
        CLASSIFIED
      </div>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes classified-fade { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }' }} />

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 30px 60px' }}>
        {/* Header */}
        <div ref={headerRef} style={{ marginBottom: '36px', opacity: 0 }}>
          <div className="section-label">06 // LAB.beta</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 800,
            fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '8px',
          }}>
            The <span className="glow-text-green">Experiments</span>
          </h2>
          <p style={{
            fontSize: '13px', color: 'var(--text-dim)', maxWidth: '420px', lineHeight: 1.8,
          }}>
            Playground for creative coding, generative art, and things that glow.
          </p>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} style={{
          display: 'flex', gap: '6px', marginBottom: '28px', justifyContent: 'center',
        }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '8px 18px', borderRadius: '2px',
                fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1px',
                background: activeTab === tab.id ? 'rgba(57,255,20,0.06)' : 'transparent',
                border: `1px solid ${activeTab === tab.id ? 'rgba(57,255,20,0.2)' : 'rgba(255,255,255,0.05)'}`,
                color: activeTab === tab.id ? 'var(--green)' : 'var(--text-muted)',
                transition: 'all 0.2s', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Active experiment */}
        <div ref={contentRef} style={{ opacity: 0, position: 'relative' }}>
          {/* Static noise overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
            opacity: 0.02,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            mixBlendMode: 'overlay',
          }} />
          {activeTab === 'music' && <MusicVisualizer />}
          {activeTab === 'particles' && <ParticleExperiment />}
          {activeTab === 'terminal' && <SecretTerminal />}
        </div>
      </div>

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
    </OSWindowFrame>
  );
}

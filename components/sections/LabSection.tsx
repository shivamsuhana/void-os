'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { TERMINAL_COMMANDS, OWNER } from '@/lib/portfolio-data';

type LabTab = 'music' | 'particles' | 'ai' | 'terminal';

/* ── Music Visualizer ── */
function MusicVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600; canvas.height = 300;

    const bars = 64;
    const barData = new Array(bars).fill(0);

    const animate = () => {
      ctx.clearRect(0, 0, 600, 300);
      const barWidth = 600 / bars - 2;

      // Simulate audio data (demo mode)
      for (let i = 0; i < bars; i++) {
        const target = Math.sin(Date.now() * 0.002 + i * 0.3) * 0.3 + Math.sin(Date.now() * 0.005 + i * 0.1) * 0.2 + 0.3;
        barData[i] = barData[i] * 0.85 + target * 0.15 + Math.random() * 0.05;
      }

      for (let i = 0; i < bars; i++) {
        const h = barData[i] * 250;
        const x = i * (barWidth + 2);
        const y = 300 - h;
        const hue = 190 + (i / bars) * 80;
        const gradient = ctx.createLinearGradient(x, y, x, 300);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.9)`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.2)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, h);

        // Glow
        ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, y, barWidth, 2);
        ctx.shadowBlur = 0;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '8px' }} />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
        ♫ DEMO MODE — Connect microphone for live input
      </p>
    </div>
  );
}

/* ── Particle Experiment ── */
function ParticleExperiment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 300, y: 200 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 600; canvas.height = 400;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; color: string; life: number }> = [];
    for (let i = 0; i < 300; i++) {
      particles.push({
        x: Math.random() * 600, y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: ['#00D4FF', '#7B2FFF', '#39FF14', '#FFB800'][Math.floor(Math.random() * 4)],
        life: 1,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(3, 3, 6, 0.15)';
      ctx.fillRect(0, 0, 600, 400);

      const mx = mouseRef.current.x, my = mouseRef.current.y;

      for (const p of particles) {
        // Attract to mouse
        const dx = mx - p.x, dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 150) {
          p.vx += dx / dist * 0.3;
          p.vy += dy / dist * 0.3;
        }

        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;

        // Bounds wrap
        if (p.x < 0) p.x = 600; if (p.x > 600) p.x = 0;
        if (p.y < 0) p.y = 400; if (p.y > 400) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby particles
        for (const q of particles) {
          if (p === q) continue;
          const d = Math.sqrt(Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2));
          if (d < 50) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - d / 50) * 0.15})`;
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
        x: (e.clientX - rect.left) * (600 / rect.width),
        y: (e.clientY - rect.top) * (400 / rect.height),
      };
    };
    canvas.addEventListener('mousemove', handleMove);

    return () => { cancelAnimationFrame(frame); canvas.removeEventListener('mousemove', handleMove); };
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '8px', cursor: 'crosshair' }} />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
        Move cursor to attract particles
      </p>
    </div>
  );
}

/* ── AI Twin Chat ── */
function AITwin() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: `Hey! I'm ${OWNER.name}'s AI twin. Ask me anything about my experience, skills, or projects.` },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    // Smart fallback responses (keyword-based)
    const lower = userMsg.toLowerCase();
    let response = '';

    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      response = `My core stack includes ${OWNER.techArsenal.slice(0, 6).join(', ')}, and more. I'm especially passionate about Three.js, WebGL, and building immersive 3D experiences on the web.`;
    } else if (lower.includes('project') || lower.includes('work') || lower.includes('built')) {
      response = `I've shipped 20+ projects ranging from this VOID OS portfolio (Three.js + GSAP + custom shaders) to real-time ML platforms and encrypted messaging apps. Each one pushes the boundary of what's possible in a browser.`;
    } else if (lower.includes('experience') || lower.includes('job') || lower.includes('company')) {
      response = `I started coding in 2022, worked as a Junior Developer at a startup, then moved to a Frontend Engineer role building SaaS products for 50K+ users. Now I'm freelancing and building open-source tools.`;
    } else if (lower.includes('hire') || lower.includes('available') || lower.includes('freelance')) {
      response = `Yes! I'm currently available for freelance work and full-time opportunities. I'm especially interested in roles involving creative dev, 3D web, or AI-integrated products. Let's talk!`;
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      response = `Hey there! 👋 Great to meet you. Feel free to ask me about my skills, projects, experience, or anything else. I'm an open book!`;
    } else if (lower.includes('who') && lower.includes('you')) {
      response = `I'm ${OWNER.name} — ${OWNER.role}. ${OWNER.tagline} I specialize in building immersive, beautiful web experiences that make people go "wow".`;
    } else {
      response = `Great question! While I'm running in demo mode right now (no API key configured), I'm designed to answer as ${OWNER.name} using the Claude API. In production, I'd give you a detailed, personalized answer based on my full resume and experience.`;
    }

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsTyping(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div ref={chatRef} style={{
        height: '350px', overflowY: 'auto', padding: '16px',
        background: 'rgba(3,3,6,0.5)', borderRadius: '12px',
        border: '1px solid var(--glass-border)', marginBottom: '12px',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: '12px',
              background: msg.role === 'user' ? 'rgba(0, 212, 255, 0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${msg.role === 'user' ? 'rgba(0, 212, 255, 0.2)' : 'var(--glass-border)'}`,
              fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.6,
              color: 'var(--ghost-white)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', animation: 'pulse 1s infinite' }}>
            AI Twin is thinking...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          placeholder="Ask me anything..."
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ghost-white)',
          }}
        />
        <button onClick={handleSend} style={{
          padding: '12px 20px', borderRadius: '8px',
          background: 'rgba(0, 212, 255, 0.15)', border: '1px solid rgba(0, 212, 255, 0.3)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--plasma-blue)',
          cursor: 'pointer', transition: 'all 0.2s',
        }}>SEND</button>
      </div>
    </div>
  );
}

/* ── Secret Terminal ── */
function SecretTerminal() {
  const [history, setHistory] = useState<Array<{ type: 'input' | 'output'; text: string }>>([
    { type: 'output', text: 'VOID OS Secret Terminal v2045.1' },
    { type: 'output', text: 'Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, [history]);

  const handleCommand = () => {
    if (!input.trim()) return;
    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, { type: 'input', text: `$ ${input}` }]);
    setInput('');

    if (cmd === 'clear') {
      setHistory([]);
      return;
    }

    const response = TERMINAL_COMMANDS[cmd];
    if (response) {
      response.split('\n').forEach(line => {
        setHistory(prev => [...prev, { type: 'output', text: line }]);
      });
    } else {
      setHistory(prev => [...prev, { type: 'output', text: `command not found: ${cmd}. Type "help" for available commands.` }]);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', background: 'rgba(3,3,6,0.9)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F' }} />
        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>terminal.sh</span>
      </div>
      <div ref={termRef} style={{ padding: '16px', height: '350px', overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.8 }}>
        {history.map((line, i) => (
          <div key={i} style={{ color: line.type === 'input' ? 'var(--acid-green)' : 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>
            {line.text}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--acid-green)' }}>$</span>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCommand(); }}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--ghost-white)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Lab Lock Screen ── */
function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const validCodes = ['konami', 'lab', 'unlock', 'void', 'secret'];

  const handleSubmit = () => {
    if (validCodes.includes(pass.toLowerCase())) {
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
      setPass('');
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: '24px',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔒</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700 }}>
        LAB<span style={{ color: 'var(--acid-green)' }}>.beta</span>
      </h2>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
        CLASSIFIED — Enter passphrase to continue
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={pass} onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          type="password" placeholder="PASSPHRASE"
          style={{
            padding: '12px 20px', borderRadius: '8px', width: '250px',
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${error ? 'var(--error-red)' : 'var(--glass-border)'}`,
            fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--ghost-white)',
            transition: 'border-color 0.3s',
          }}
        />
        <button onClick={handleSubmit} style={{
          padding: '12px 20px', borderRadius: '8px',
          background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--acid-green)',
          cursor: 'pointer',
        }}>UNLOCK</button>
      </div>
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--error-red)', animation: 'fadeIn 0.2s ease' }}>
          ACCESS DENIED — Invalid passphrase
        </p>
      )}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '20px' }}>
        Hint: Try the Konami code easter egg to auto-unlock
      </p>
    </div>
  );
}

/* ── Main Lab Section ── */
export default function LabSection() {
  const { setActiveSection, labUnlocked, setLabUnlocked } = useVoidStore();
  const [activeTab, setActiveTab] = useState<LabTab>('music');

  const TABS: Array<{ id: LabTab; label: string; icon: string }> = [
    { id: 'music', label: 'MUSIC.viz', icon: '🎵' },
    { id: 'particles', label: 'PARTICLE.exp', icon: '✨' },
    { id: 'ai', label: 'AI.twin', icon: '🤖' },
    { id: 'terminal', label: 'TERMINAL.sh', icon: '💀' },
  ];

  if (!labUnlocked) {
    return (
      <div className="section-container" style={{ background: 'var(--void-black)' }}>
        <button className="back-button" onClick={() => setActiveSection('desktop')}>← VOID DESKTOP</button>
        <LockScreen onUnlock={() => setLabUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="section-container" style={{ background: 'var(--void-black)' }}>
      <button className="back-button" onClick={() => setActiveSection('desktop')}>← VOID DESKTOP</button>

      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}>
        <div className="section-header">
          <span className="section-tag">// LAB.beta</span>
          <h1>The <span className="glow-text-green">Experiments</span></h1>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px', borderRadius: '8px',
                fontFamily: 'var(--font-mono)', fontSize: '12px',
                background: activeTab === tab.id ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${activeTab === tab.id ? 'rgba(57, 255, 20, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: activeTab === tab.id ? 'var(--acid-green)' : 'var(--text-dim)',
                transition: 'all 0.2s', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Active Experiment */}
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {activeTab === 'music' && <MusicVisualizer />}
          {activeTab === 'particles' && <ParticleExperiment />}
          {activeTab === 'ai' && <AITwin />}
          {activeTab === 'terminal' && <SecretTerminal />}
        </div>
      </div>
    </div>
  );
}

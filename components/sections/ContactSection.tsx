'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

/* ═══════════════════════════════════════════
   COLORS
   ═══════════════════════════════════════════ */
const C = {
  void: '#030306', blue: '#00D4FF', white: '#E8E8F0',
  amber: '#FFB800', green: '#39FF14', purple: '#7B2FFF', red: '#FF3B5C',
};

/* ═══════════════════════════════════════════
   BOOT SEQUENCE LINES
   ═══════════════════════════════════════════ */
const BOOT_SEQ = [
  { text: 'CONTACT.net v2045.1 — INITIALIZING...', color: C.blue, delay: 0 },
  { text: 'Establishing secure channel...', color: 'rgba(232,232,240,0.5)', delay: 280 },
  { text: 'Encrypting transmission route (AES-256)...', color: 'rgba(232,232,240,0.5)', delay: 560 },
  { text: `Signal locked. Target: UTC+5:30`, color: C.green, delay: 840 },
  { text: 'Status: AVAILABLE FOR NEW PROJECTS', color: C.green, delay: 1100 },
  { text: '────────────────────────────────────────', color: 'rgba(232,232,240,0.1)', delay: 1350 },
  { text: 'READY. Begin transmission.', color: C.white, delay: 1600 },
];

const ANALYZE = [
  'Scanning identity signature...',
  'Cross-referencing signal origin...',
  'Verifying transmission protocol...',
  'Identity confirmed. Proceeding.',
];

const SEND_SEQ = [
  'Compressing payload...',
  'Routing through secure nodes...',
  'Establishing handshake...',
  'Transmitting to shivamsuhana649@gmail.com...',
  'Awaiting confirmation...',
  '✓ SIGNAL RECEIVED',
];

/* ═══════════════════════════════════════════
   RADAR CANVAS
   ═══════════════════════════════════════════ */
function RadarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const size = 160;
    c.width = size; c.height = size;
    let t = 0;
    let frame: number;

    const draw = () => {
      t += 0.015;
      const cx = size / 2, cy = size / 2, r = size / 2 - 8;
      ctx.clearRect(0, 0, size, size);

      // Rings
      [0.3, 0.6, 0.9].forEach(s => {
        ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.12)'; ctx.lineWidth = 0.5; ctx.stroke();
      });

      // Cross lines
      ctx.strokeStyle = 'rgba(0,212,255,0.08)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();

      // Sweep
      const sweepAngle = t % (Math.PI * 2);
      {
        // Fallback sweep line
        const sx = cx + Math.cos(sweepAngle) * r;
        const sy = cy + Math.sin(sweepAngle) * r;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
        ctx.strokeStyle = 'rgba(0,212,255,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();

        // Sweep glow
        const g = ctx.createRadialGradient(sx * 0.5 + cx * 0.5, sy * 0.5 + cy * 0.5, 0, cx, cy, r);
        g.addColorStop(0, 'rgba(0,212,255,0.08)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, sweepAngle - 0.4, sweepAngle);
        ctx.closePath(); ctx.fill();
      }

      // Blips
      const blips = [
        { angle: t * 0.3 + 1, dist: 0.45 },
        { angle: t * 0.2 + 3, dist: 0.7 },
        { angle: t * 0.15 + 5, dist: 0.55 },
      ];
      blips.forEach(b => {
        const bx = cx + Math.cos(b.angle) * r * b.dist;
        const by = cy + Math.sin(b.angle) * r * b.dist;
        const angleDiff = ((sweepAngle - b.angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const alpha = angleDiff < 1 ? (1 - angleDiff) * 0.8 : 0.1;
        ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${alpha})`; ctx.fill();
        if (alpha > 0.3) {
          ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,212,255,${alpha * 0.2})`; ctx.fill();
        }
      });

      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${0.5 + Math.sin(t * 3) * 0.3})`;
      ctx.fill();

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={ref} style={{ width: 160, height: 160, display: 'block' }} />;
}

/* ═══════════════════════════════════════════
   PARTICLE BURST
   ═══════════════════════════════════════════ */
function Burst({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const cx = c.width / 2, cy = c.height / 2;
    const colors = [C.green, C.blue, C.white, C.purple];
    const pts = Array.from({ length: 80 }, () => {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
      return { x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, alpha: 1, size: Math.random() * 3 + 1, color: colors[Math.floor(Math.random() * 4)] };
    });
    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = false;
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.alpha -= 0.022; p.vx *= 0.97;
        if (p.alpha <= 0) return; alive = true;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (alive) frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }} />;
}

/* ═══════════════════════════════════════════
   FORM FIELD
   ═══════════════════════════════════════════ */
function Field({ label, value, onChange, multiline, placeholder, focused, onFocus, onBlur, disabled }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; placeholder: string;
  focused: boolean; onFocus: () => void; onBlur: () => void; disabled: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex', gap: 10, alignItems: 'flex-start',
        padding: '10px 14px',
        border: `1px solid ${focused ? C.blue : 'rgba(0,212,255,0.12)'}`,
        background: focused ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.2s, background 0.2s',
        boxShadow: focused ? '0 0 20px rgba(0,212,255,0.08)' : 'none',
      }}>
        <span style={{ color: C.blue, fontSize: '12px', flexShrink: 0, paddingTop: multiline ? 2 : 0 }}>{'>'}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.4)', marginBottom: 4 }}>{label}</div>
          {multiline
            ? <textarea value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur}
                disabled={disabled} placeholder={placeholder} rows={3}
                style={{ background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.white, width: '100%', resize: 'none', lineHeight: 1.7, caretColor: C.blue }} />
            : <input type="text" value={value} onChange={e => onChange(e.target.value)} onFocus={onFocus} onBlur={onBlur}
                disabled={disabled} placeholder={placeholder}
                style={{ background: 'none', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.white, width: '100%', caretColor: C.blue }} />
          }
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TERMINAL LINE
   ═══════════════════════════════════════════ */
function TLine({ text, color, prompt, isNew }: { text: string; color: string; prompt: boolean; isNew: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 2, animation: isNew ? 'fadeIn 0.15s ease' : 'none' }}>
      <span style={{ color: prompt ? C.blue : 'rgba(232,232,240,0.15)', flexShrink: 0, fontSize: '12px', userSelect: 'none' }}>
        {prompt ? '>' : '  '}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.75, color: color || 'rgba(232,232,240,0.55)', wordBreak: 'break-word' }}>{text}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONTACT SECTION — Main
   ═══════════════════════════════════════════ */
export default function ContactSection() {
  const { navigateTo } = useVoidStore();
  type LineData = { text: string; color: string; prompt: boolean; id: number };
  const [lines, setLines] = useState<LineData[]>([]);
  const [phase, setPhase] = useState<'booting' | 'namePrompt' | 'analyzing' | 'form' | 'sending' | 'sent'>('booting');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [focused, setFocused] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [burst, setBurst] = useState(false);
  const [headerIn, setHeaderIn] = useState(false);
  const [clock, setClock] = useState(new Date());
  const termRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const addLine = useCallback((text: string, color: string, prompt = false) => {
    setLines(p => [...p, { text, color, prompt, id: Date.now() + Math.random() }]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 40);
  }, []);

  // Boot sequence
  useEffect(() => {
    setTimeout(() => setHeaderIn(true), 100);
    BOOT_SEQ.forEach(({ text, color, delay }) => setTimeout(() => addLine(text, color), delay + 300));
    setTimeout(() => { setPhase('namePrompt'); setTimeout(() => nameRef.current?.focus(), 80); }, 2100);
    const ti = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(ti);
  }, [addLine]);

  const submitName = useCallback(() => {
    if (!nameInput.trim() || nameSubmitted) return;
    setNameSubmitted(true);
    addLine(nameInput, C.white, true);
    setPhase('analyzing');
    addLine('', '');
    ANALYZE.forEach((l, i) => {
      setTimeout(() => {
        addLine(l, i === ANALYZE.length - 1 ? C.green : 'rgba(232,232,240,0.5)');
        if (i === ANALYZE.length - 1) setTimeout(() => {
          addLine('', '');
          addLine(`Welcome, ${nameInput.trim()}. Fill the transmission form.`, C.blue);
          addLine('────────────────────────────────────────', 'rgba(232,232,240,0.1)');
          setForm(f => ({ ...f, name: nameInput.trim() }));
          setPhase('form');
        }, 300);
      }, i * 300 + 200);
    });
  }, [nameInput, nameSubmitted, addLine]);

  const handleSend = useCallback(async () => {
    if (!form.email || !form.message) { addLine('ERROR: Email and message required.', C.red); return; }
    setPhase('sending');
    addLine('', ''); addLine('INITIATING TRANSMISSION...', C.amber);

    // Actually send via API
    setTimeout(async () => {
      try {
        const res = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, message: `${form.subject ? `[${form.subject}] ` : ''}${form.message}` }),
        });
        const data = await res.json();
        if (data.fallback && data.mailto) window.open(data.mailto, '_blank');
      } catch {
        window.open(`mailto:shivamsuhana649@gmail.com?subject=VOID OS: ${encodeURIComponent(form.name)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`, '_blank');
      }
    }, 1500);

    SEND_SEQ.forEach((l, i) => {
      setTimeout(() => {
        addLine(l, i === SEND_SEQ.length - 1 ? C.green : 'rgba(232,232,240,0.5)');
        if (i === SEND_SEQ.length - 1) {
          setBurst(true); setTimeout(() => setBurst(false), 2000);
          setTimeout(() => {
            addLine('', '');
            addLine(`MESSAGE FROM ${form.name.toUpperCase()} — RECEIVED.`, C.green);
            addLine('Response ETA: < 24 hours', C.blue);
            setPhase('sent');
          }, 400);
        }
      }, i * 380 + 200);
    });
  }, [form, addLine]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.void, overflow: 'hidden', zIndex: 50, fontFamily: 'var(--font-mono)', color: C.white }}>
      <style dangerouslySetInnerHTML={{ __html: `
        input::placeholder,textarea::placeholder{color:rgba(232,232,240,0.25);}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.25)}
      `}} />

      {/* CRT + grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(3,3,6,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '13px clamp(16px,3vw,40px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        opacity: headerIn ? 1 : 0, transition: 'opacity 0.8s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigateTo('desktop')} style={{
            background: 'none', border: '1px solid rgba(0,212,255,0.2)', padding: '5px 14px',
            fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: C.blue,
            cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.background = 'none'; }}
          >← DESKTOP</button>
          <div style={{ width: 1, height: 14, background: 'rgba(0,212,255,0.15)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', border: `1px solid ${C.green}`, animation: 'pulseRing 2s ease infinite' }} />
          </div>
          <span style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(232,232,240,0.45)' }}>VOID_OS</span>
          <span style={{ color: 'rgba(232,232,240,0.2)' }}>/</span>
          <span style={{ fontSize: '9px', letterSpacing: '2px', color: C.blue, textShadow: `0 0 8px ${C.blue}40` }}>CONTACT.net</span>
        </div>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
            <span style={{ fontSize: '8px', letterSpacing: '1.5px', color: C.green }}>AVAILABLE</span>
          </div>
          <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.3)', letterSpacing: '1.5px' }}>
            {clock.toLocaleTimeString('en-US', { hour12: false })} UTC+5:30
          </span>
        </div>
      </div>

      {/* Body grid — Terminal LEFT, Form RIGHT */}
      <div id="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr clamp(280px,35%,400px)', height: '100%', paddingTop: 50, overflow: 'hidden' }}>
        <style dangerouslySetInnerHTML={{ __html: '@media(max-width:768px){#contact-grid{grid-template-columns:1fr!important;}}' }} />

        {/* LEFT — Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(0,212,255,0.08)', overflow: 'hidden', position: 'relative' }}>
          <Burst active={burst} />

          {/* Tab bar */}
          <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.015)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {['#FF3B5C', '#FFB800', '#39FF14'].map((c, i) => (
              <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.65 }} />
            ))}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px', color: 'rgba(232,232,240,0.35)', marginLeft: 6 }}>
              VOID_SHELL — CONTACT.net v2045.1
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
              {['ENC: AES-256', 'PROTO: VOID/3', 'LAYER: 7'].map(s => (
                <span key={s} style={{ fontSize: '7px', color: 'rgba(232,232,240,0.2)', letterSpacing: '1px' }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Terminal output */}
          <div ref={termRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {lines.map((l, i) => (
              <TLine key={l.id} text={l.text} color={l.color} prompt={l.prompt} isNew={i === lines.length - 1} />
            ))}

            {/* Name prompt */}
            {phase === 'namePrompt' && !nameSubmitted && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                <span style={{ color: C.blue, fontSize: '12px' }}>{'>'}</span>
                <span style={{ color: 'rgba(232,232,240,0.5)', fontSize: '12px', whiteSpace: 'nowrap' }}>WHO ARE YOU?</span>
                <input ref={nameRef} value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitName()}
                  style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.white, outline: 'none', flex: 1, caretColor: C.blue }}
                  autoFocus placeholder="Type your name and press Enter..." />
                <span style={{ color: C.blue, fontSize: '12px', animation: 'blink 0.85s step-end infinite' }}>█</span>
              </div>
            )}

            {/* Analyzing dots */}
            {phase === 'analyzing' && (
              <div style={{ display: 'flex', gap: 5, padding: '6px 0 4px 20px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.blue, animation: `blink 1s step-end infinite ${i * 0.28}s` }} />
                ))}
              </div>
            )}

            {/* Idle cursor */}
            {['form', 'sent'].includes(phase) && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4, opacity: 0.3 }}>
                <span style={{ color: C.blue, fontSize: '12px' }}>{'>'}</span>
                <span style={{ color: C.blue, fontSize: '12px', animation: 'blink 1.1s step-end infinite' }}>█</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Form + info panels */}
        <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 'clamp(16px,2.5vw,28px)', gap: 14, background: 'rgba(0,212,255,0.01)' }}>

          {/* Transmission Form */}
          <div style={{
            border: '1px solid rgba(0,212,255,0.12)', background: 'rgba(255,255,255,0.02)',
            padding: 'clamp(14px,2vw,24px)',
            opacity: ['form', 'sending', 'sent'].includes(phase) ? 1 : 0.2,
            transition: 'opacity 0.9s ease',
          }}>
            <div style={{ fontSize: '8px', letterSpacing: '3px', color: C.blue, marginBottom: 14, textShadow: `0 0 8px ${C.blue}30` }}>
              TRANSMISSION_FORM.net
            </div>

            {phase === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>✓</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', color: C.green, marginBottom: 8 }}>SIGNAL RECEIVED</div>
                <div style={{ fontSize: '11px', color: 'rgba(232,232,240,0.5)', lineHeight: 1.8 }}>
                  Transmission from {form.name} confirmed.<br />Response ETA: {'< 24 hours'}
                </div>
              </div>
            ) : (
              <>
                <Field label="NAME.string" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))}
                  focused={focused === 'name'} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
                  placeholder="Your name..." disabled={phase !== 'form'} />
                <Field label="EMAIL.string" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))}
                  focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="your@email.com" disabled={phase !== 'form'} />
                <Field label="SUBJECT.string" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))}
                  focused={focused === 'subject'} onFocus={() => setFocused('subject')} onBlur={() => setFocused(null)}
                  placeholder="What's this about..." disabled={phase !== 'form'} />
                <Field label="MESSAGE.string" value={form.message} onChange={v => setForm(f => ({ ...f, message: v }))}
                  focused={focused === 'message'} onFocus={() => setFocused('message')} onBlur={() => setFocused(null)}
                  placeholder="Your transmission..." multiline disabled={phase !== 'form'} />

                <button onClick={handleSend} disabled={phase !== 'form'} style={{
                  width: '100%', padding: '13px',
                  background: phase === 'form' ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${phase === 'form' ? C.blue + '66' : 'rgba(255,255,255,0.06)'}`,
                  color: phase === 'form' ? C.blue : 'rgba(232,232,240,0.2)',
                  fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2.5px',
                  cursor: phase === 'form' ? 'pointer' : 'default', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { if (phase === 'form') { e.currentTarget.style.background = 'rgba(0,212,255,0.15)'; e.currentTarget.style.boxShadow = `0 0 20px rgba(0,212,255,0.15)`; } }}
                  onMouseLeave={e => { e.currentTarget.style.background = phase === 'form' ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)'; e.currentTarget.style.boxShadow = 'none'; }}
                >{phase === 'sending' ? 'TRANSMITTING...' : 'SEND TRANSMISSION →'}</button>
              </>
            )}
          </div>

          {/* Radar + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: 16, border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '7px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.4)', marginBottom: 8 }}>SIGNAL DETECTION</div>
              <RadarCanvas />
              <div style={{ fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,0.45)', marginTop: 8 }}>VISITOR DETECTED</div>
            </div>

            <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: '7px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.35)', marginBottom: 10 }}>AVAILABILITY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, boxShadow: `0 0 10px ${C.green}` }} />
                <span style={{ fontSize: '9px', color: C.green, letterSpacing: '1px' }}>AVAILABLE</span>
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(232,232,240,0.45)', lineHeight: 2 }}>
                Response: <span style={{ color: C.white }}>{'< 24hrs'}</span><br />
                Timezone: <span style={{ color: C.white }}>UTC+5:30</span><br />
                Location: <span style={{ color: C.white }}>{OWNER.location}</span>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '7px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.35)', marginBottom: 10 }}>SIGNAL CHANNELS</div>
            {[
              { label: 'EMAIL', value: OWNER.email, href: `mailto:${OWNER.email}`, color: C.green },
              { label: 'GITHUB', value: '@shivamsuhana', href: OWNER.github, color: C.white },
              { label: 'LINKEDIN', value: '/in/shivamsuhana', href: OWNER.linkedin, color: C.blue },
            ].map(link => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingLeft = '6px'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingLeft = '0'; }}
              >
                <span style={{ fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,0.4)' }}>{link.label}</span>
                <span style={{ fontSize: '10px', color: link.color, letterSpacing: '0.5px' }}>{link.value}</span>
              </a>
            ))}
          </div>

          <div style={{ fontSize: '7px', color: 'rgba(232,232,240,0.15)', letterSpacing: '1.5px', lineHeight: 2, paddingTop: 2 }}>
            CONTACT.net — SECURE CHANNEL<br />ALL TRANSMISSIONS ENCRYPTED<br />VOID OS v3.0.1
          </div>
        </div>
      </div>
    </div>
  );
}

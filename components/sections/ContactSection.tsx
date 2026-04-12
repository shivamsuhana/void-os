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
   SOUND ENGINE — Alien 2045 sound effects
   ═══════════════════════════════════════════ */
function playSound(type: 'key' | 'send' | 'success' | 'error') {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'key') {
      // Subtle keypress tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.05);
    }

    if (type === 'send') {
      // Deep transmission whoosh — multi-layered
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner();
        osc.type = i < 2 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(200 + i * 300, now + i * 0.15);
        osc.frequency.exponentialRampToValueAtTime(80 + i * 100, now + 0.8 + i * 0.15);
        gain.gain.setValueAtTime(0.06, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + i * 0.15);
        pan.pan.setValueAtTime(-0.5 + i * 0.33, now);
        osc.connect(gain).connect(pan).connect(ctx.destination);
        osc.start(now + i * 0.15); osc.stop(now + 1.5 + i * 0.15);
      }
      // White noise burst
      const bufferSize = ctx.sampleRate * 1.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.08, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass'; filter.frequency.value = 1500; filter.Q.value = 3;
      noise.connect(filter).connect(nGain).connect(ctx.destination);
      noise.start(now); noise.stop(now + 1.2);
    }

    if (type === 'success') {
      // Triumphant ascending chord
      [440, 554, 659, 880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.5, now + i * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.3 + i * 0.08);
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + i * 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.08); osc.stop(now + 1.6);
      });
      // Shimmer
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(4000, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(8000, now + 1.2);
      g2.gain.setValueAtTime(0.015, now + 0.5);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc2.connect(g2).connect(ctx.destination);
      osc2.start(now + 0.5); osc2.stop(now + 1.5);
    }

    if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.setValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.2);
    }

    setTimeout(() => ctx.close(), 3000);
  } catch { /* Audio not supported */ }
}

/* ═══════════════════════════════════════════
   RADAR CANVAS
   ═══════════════════════════════════════════ */
function RadarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const size = 140;
    c.width = size; c.height = size;
    let t = 0;
    let frame: number;

    const draw = () => {
      t += 0.018;
      const cx = size / 2, cy = size / 2, r = size / 2 - 8;
      ctx.clearRect(0, 0, size, size);

      // Rings
      [0.3, 0.6, 0.9].forEach(s => {
        ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,212,255,0.15)'; ctx.lineWidth = 0.5; ctx.stroke();
      });

      // Cross
      ctx.strokeStyle = 'rgba(0,212,255,0.1)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();

      // Sweep
      const sweepAngle = t % (Math.PI * 2);
      const sx = cx + Math.cos(sweepAngle) * r;
      const sy = cy + Math.sin(sweepAngle) * r;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
      ctx.strokeStyle = 'rgba(0,212,255,0.6)'; ctx.lineWidth = 1.5; ctx.stroke();

      // Sweep trail
      const g = ctx.createRadialGradient(sx * 0.5 + cx * 0.5, sy * 0.5 + cy * 0.5, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(0,212,255,0.1)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, sweepAngle - 0.5, sweepAngle);
      ctx.closePath(); ctx.fill();

      // Blips
      [{ a: t * 0.3 + 1, d: 0.45 }, { a: t * 0.2 + 3, d: 0.7 }, { a: t * 0.15 + 5, d: 0.55 }].forEach(b => {
        const bx = cx + Math.cos(b.a) * r * b.d;
        const by = cy + Math.sin(b.a) * r * b.d;
        const diff = ((sweepAngle - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const alpha = diff < 1 ? (1 - diff) * 0.8 : 0.1;
        ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${alpha})`; ctx.fill();
        if (alpha > 0.3) {
          ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,212,255,${alpha * 0.2})`; ctx.fill();
        }
      });

      // Center
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${0.5 + Math.sin(t * 3) * 0.3})`; ctx.fill();

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={ref} style={{ width: 140, height: 140, display: 'block' }} />;
}

/* ═══════════════════════════════════════════
   SUCCESS POPUP — Alien tech achievement
   ═══════════════════════════════════════════ */
function SuccessPopup({ name, onBack }: { name: string; onBack: () => void }) {
  const [vis, setVis] = useState(false);
  const [ring1, setRing1] = useState(false);
  const [ring2, setRing2] = useState(false);
  const [textIn, setTextIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setVis(true), 50);
    setTimeout(() => setRing1(true), 200);
    setTimeout(() => setRing2(true), 400);
    setTimeout(() => setTextIn(true), 600);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: vis ? 'rgba(0,0,0,0.85)' : 'transparent',
      backdropFilter: vis ? 'blur(20px)' : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
      opacity: vis ? 1 : 0,
    }}>
      <div style={{
        textAlign: 'center', maxWidth: 420,
        transform: vis ? 'scale(1)' : 'scale(0.8)',
        transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Concentric rings */}
        <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 30px' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: `2px solid ${C.green}`,
            transform: ring1 ? 'scale(1)' : 'scale(0)',
            opacity: ring1 ? 0.3 : 0,
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
            boxShadow: `0 0 30px ${C.green}40`,
          }} />
          <div style={{
            position: 'absolute', inset: 15, borderRadius: '50%',
            border: `2px solid ${C.blue}`,
            transform: ring2 ? 'scale(1)' : 'scale(0)',
            opacity: ring2 ? 0.5 : 0,
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1) 0.15s',
            boxShadow: `0 0 20px ${C.blue}40`,
          }} />
          <div style={{
            position: 'absolute', inset: 30, borderRadius: '50%',
            background: `radial-gradient(circle, ${C.green}33, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: textIn ? 'scale(1)' : 'scale(0)',
            transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}>
            <span style={{ fontSize: '36px', filter: `drop-shadow(0 0 20px ${C.green})` }}>✓</span>
          </div>
        </div>

        {/* Text */}
        <div style={{
          opacity: textIn ? 1 : 0,
          transform: textIn ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.5s ease 0.4s',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: C.green, marginBottom: 8, textShadow: `0 0 20px ${C.green}60`, letterSpacing: '2px' }}>
            TRANSMISSION COMPLETE
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,232,240,0.6)', lineHeight: 2, marginBottom: 6 }}>
            Signal from <span style={{ color: C.blue, fontWeight: 600 }}>{name.toUpperCase()}</span> received.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(232,232,240,0.4)', marginBottom: 30, letterSpacing: '1px' }}>
            Response ETA: {'< 24 hours'} · Delivered to {OWNER.email}
          </div>

          <button onClick={onBack} style={{
            fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2.5px',
            color: C.blue, padding: '12px 30px', cursor: 'pointer',
            border: `1px solid ${C.blue}55`, background: `${C.blue}10`,
            transition: 'all 0.2s',
            boxShadow: `0 0 20px ${C.blue}15`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.blue}22`; e.currentTarget.style.boxShadow = `0 0 30px ${C.blue}30`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${C.blue}10`; e.currentTarget.style.boxShadow = `0 0 20px ${C.blue}15`; }}
          >← SEND ANOTHER</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONTACT SECTION — All-in-terminal flow
   ═══════════════════════════════════════════ */
type TStep = 'booting' | 'name' | 'email' | 'subject' | 'message' | 'confirm' | 'sending' | 'sent';
type LineData = { text: string; color: string; prompt: boolean; id: number };

export default function ContactSection() {
  const { navigateTo } = useVoidStore();
  const [lines, setLines] = useState<LineData[]>([]);
  const [step, setStep] = useState<TStep>('booting');
  const [input, setInput] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [headerIn, setHeaderIn] = useState(false);
  const [clock, setClock] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const addLine = useCallback((text: string, color: string, prompt = false) => {
    setLines(p => [...p, { text, color, prompt, id: Date.now() + Math.random() }]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 40);
  }, []);

  // Boot sequence
  useEffect(() => {
    setTimeout(() => setHeaderIn(true), 100);
    const bootLines = [
      { text: 'CONTACT.net v2045.1 — INITIALIZING...', color: C.blue, delay: 0 },
      { text: 'Establishing secure channel...', color: 'rgba(232,232,240,0.5)', delay: 280 },
      { text: 'Encrypting transmission route (AES-256)...', color: 'rgba(232,232,240,0.5)', delay: 560 },
      { text: `Signal locked. Timezone: UTC+5:30`, color: C.green, delay: 840 },
      { text: 'Status: AVAILABLE FOR NEW PROJECTS', color: C.green, delay: 1100 },
      { text: '────────────────────────────────────────', color: 'rgba(232,232,240,0.1)', delay: 1350 },
      { text: 'READY. Begin transmission.', color: C.white, delay: 1600 },
      { text: '', color: '', delay: 1700 },
      { text: '> IDENTIFY YOURSELF — Enter your name:', color: C.amber, delay: 1900 },
    ];
    bootLines.forEach(({ text, color, delay }) => setTimeout(() => addLine(text, color), delay + 300));
    setTimeout(() => { setStep('name'); setTimeout(() => inputRef.current?.focus(), 80); }, 2400);
    const ti = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(ti);
  }, [addLine]);

  // Focus management
  useEffect(() => {
    if (step === 'message') textareaRef.current?.focus();
    else if (!['booting', 'sending', 'sent'].includes(step)) inputRef.current?.focus();
  }, [step]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && step !== 'confirm') return;

    playSound('key');

    if (step === 'name') {
      addLine(`  ${input}`, C.blue, true);
      setForm(f => ({ ...f, name: input.trim() }));
      setInput('');
      // Analyze
      addLine('', '');
      const analyze = ['Scanning identity...', 'Verifying protocol...', 'Identity confirmed.'];
      analyze.forEach((l, i) => {
        setTimeout(() => addLine(l, i === analyze.length - 1 ? C.green : 'rgba(232,232,240,0.45)'), i * 300 + 200);
      });
      setTimeout(() => {
        addLine('', '');
        addLine(`> Hello, ${input.trim()}. Your email address:`, C.amber);
        setStep('email');
      }, 1200);
    }

    else if (step === 'email') {
      if (!input.includes('@') || !input.includes('.')) {
        playSound('error');
        addLine('  ERROR: Invalid email format. Try again.', C.red);
        return;
      }
      addLine(`  ${input}`, C.blue, true);
      setForm(f => ({ ...f, email: input.trim() }));
      setInput('');
      addLine('', '');
      addLine('> Subject of transmission:', C.amber);
      setStep('subject');
    }

    else if (step === 'subject') {
      addLine(`  ${input}`, C.blue, true);
      setForm(f => ({ ...f, subject: input.trim() }));
      setInput('');
      addLine('', '');
      addLine('> Type your message (Shift+Enter for new line, Enter to submit):', C.amber);
      setStep('message');
    }

    else if (step === 'message') {
      addLine(`  "${input.slice(0, 80)}${input.length > 80 ? '...' : ''}"`, C.blue, true);
      setForm(f => ({ ...f, message: input.trim() }));
      setInput('');
      addLine('', '');
      addLine('────────────────────────────────────────', 'rgba(232,232,240,0.1)');
      addLine('> CONFIRM TRANSMISSION? [Y/N]', C.amber);
      setStep('confirm');
    }

    else if (step === 'confirm') {
      const val = input.trim().toLowerCase();
      if (val === 'y' || val === 'yes' || val === '') {
        addLine('  Y', C.green, true);
        setInput('');
        setStep('sending');
        addLine('', '');
        addLine('INITIATING QUANTUM TRANSMISSION...', C.amber);

        playSound('send');

        // Progress bar
        let prog = 0;
        const iv = setInterval(() => { prog += 1.5; setSendProgress(Math.min(prog, 100)); if (prog >= 100) clearInterval(iv); }, 50);

        // Send sequence
        const seq = [
          'Compressing payload...',
          'Routing through quantum nodes...',
          'Establishing handshake...',
          `Transmitting to ${OWNER.email}...`,
          'Awaiting confirmation...',
        ];
        seq.forEach((l, i) => {
          setTimeout(() => addLine(l, 'rgba(232,232,240,0.5)'), i * 400 + 300);
        });

        // Actually send — build mailto with all form data pre-filled
        const subjectLine = form.subject || `Message from ${form.name}`;
        const bodyText = `From: ${form.name}\nEmail: ${form.email}\nSubject: ${subjectLine}\n\n${form.message}`;
        const mailtoUrl = `mailto:${OWNER.email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyText)}`;

        setTimeout(async () => {
          try {
            const res = await fetch('/api/contact', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: form.name, email: form.email, message: `[${subjectLine}] ${form.message}` }),
            });
            const data = await res.json();
            if (data.fallback) window.location.href = mailtoUrl;
          } catch {
            window.location.href = mailtoUrl;
          }
        }, 1500);

        // Success
        setTimeout(() => {
          addLine('', '');
          addLine('✓ TRANSMISSION SUCCESSFUL', C.green);
          addLine(`  Delivered to: ${OWNER.email}`, C.blue);
          addLine('  Status: RECEIVED ✓', C.green);
          playSound('success');
          setStep('sent');
          setTimeout(() => setShowSuccess(true), 600);
        }, seq.length * 400 + 600);

      } else {
        addLine('  N — Transmission cancelled.', C.red);
        setInput('');
        addLine('', '');
        addLine('> IDENTIFY YOURSELF — Enter your name:', C.amber);
        setForm({ name: '', email: '', subject: '', message: '' });
        setStep('name');
      }
    }
  }, [step, input, form, addLine]);

  const promptLabels: Record<string, string> = { name: 'NAME', email: 'EMAIL', subject: 'SUBJECT', message: 'MESSAGE', confirm: 'Y/N' };
  const promptLabel = promptLabels[step] || '';

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.void, overflow: 'hidden', zIndex: 50, fontFamily: 'var(--font-mono)', color: C.white }}>
      <style dangerouslySetInnerHTML={{ __html: `
        input::placeholder,textarea::placeholder{color:rgba(232,232,240,0.25);}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}
        @keyframes glow{0%,100%{box-shadow:0 0 10px rgba(0,212,255,0.15)}50%{box-shadow:0 0 25px rgba(0,212,255,0.3)}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.25)}
      `}} />

      {/* BG layers */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(0,212,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

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
            <span style={{ fontSize: '8px', letterSpacing: '1.5px', color: C.green }}>ONLINE</span>
          </div>
          <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.3)', letterSpacing: '1.5px' }}>
            {clock.toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </div>

      {/* BODY: Centered floating layout */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 20, padding: '60px 30px 20px' }}>
        <style dangerouslySetInnerHTML={{ __html: '@media(max-width:900px){#contact-right{display:none!important;}}' }} />

        {/* Terminal card */}
        <div style={{
          width: '100%', maxWidth: 560,
          display: 'flex', flexDirection: 'column',
          border: '1px solid rgba(0,212,255,0.15)',
          background: 'rgba(5,5,16,0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: 8,
          boxShadow: '0 0 40px rgba(0,212,255,0.06), 0 20px 60px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          marginTop: 'auto', marginBottom: 'auto',
          maxHeight: '80vh',
        }}>
          {/* Tab bar */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.02)', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            {['#FF3B5C', '#FFB800', '#39FF14'].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />
            ))}
            <span style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'rgba(232,232,240,0.5)', marginLeft: 6 }}>CONTACT.net</span>
          </div>

          {/* Terminal output */}
          <div ref={termRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', minHeight: 0 }}>
            {lines.map((l, i) => (
              <div key={l.id} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 1,
                animation: i === lines.length - 1 ? 'fadeIn 0.15s ease' : 'none',
              }}>
                <span style={{ color: l.prompt ? C.blue : 'rgba(232,232,240,0.2)', flexShrink: 0, fontSize: '11px', userSelect: 'none' }}>
                  {l.prompt ? '>' : ' '}
                </span>
                <span style={{ fontSize: '11px', lineHeight: 1.55, color: l.color || 'rgba(232,232,240,0.7)', wordBreak: 'break-word', fontWeight: l.color === C.green ? 600 : 400 }}>{l.text || '\u00A0'}</span>
              </div>
            ))}
            {step === 'sending' && sendProgress < 100 && (
              <div style={{ marginTop: 6, marginLeft: 16 }}>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', maxWidth: 280 }}>
                  <div style={{ height: '100%', width: `${sendProgress}%`, background: `linear-gradient(90deg, ${C.blue}, ${C.green})`, transition: 'width 0.05s', boxShadow: `0 0 10px ${C.blue}60` }} />
                </div>
                <div style={{ fontSize: '8px', color: 'rgba(232,232,240,0.6)', marginTop: 3, letterSpacing: '1px' }}>TRANSMITTING... {Math.floor(sendProgress)}%</div>
              </div>
            )}
          </div>

          {/* Input */}
          {!['booting', 'sending', 'sent'].includes(step) && (
            <div style={{ borderTop: '1px solid rgba(0,212,255,0.12)', background: 'rgba(0,212,255,0.03)', flexShrink: 0 }}>
              <div style={{ padding: '6px 16px 0', fontSize: '9px', letterSpacing: '2px', color: C.amber, textShadow: `0 0 8px ${C.amber}30` }}>
                {step === 'name' && '> ENTER YOUR NAME'}
                {step === 'email' && '> ENTER YOUR EMAIL'}
                {step === 'subject' && '> SUBJECT OF TRANSMISSION'}
                {step === 'message' && '> YOUR MESSAGE (Shift+Enter for newline)'}
                {step === 'confirm' && '> CONFIRM? [Y / N]'}
              </div>
              <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: C.blue, fontSize: '12px', flexShrink: 0 }}>❯</span>
                {step === 'message' ? (
                  <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder="Type your message..." rows={3}
                    style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.white, caretColor: C.blue, resize: 'none', lineHeight: 1.6, background: 'transparent', border: 'none', outline: 'none' }} />
                ) : (
                  <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder={step === 'confirm' ? 'Y or N...' : 'Type here...'}
                    style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.white, caretColor: C.blue, background: 'transparent', border: 'none', outline: 'none' }} />
                )}
                <button onClick={handleSubmit} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.blue, cursor: 'pointer', padding: '5px 12px',
                  border: `1px solid ${C.blue}44`, background: `${C.blue}10`, transition: 'all 0.2s', borderRadius: 3,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.blue}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${C.blue}10`; }}
                >ENTER ↵</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT panels */}
        <div id="contact-right" style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, marginTop: 'auto', marginBottom: 'auto' }}>
          <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(5,5,16,0.7)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,0.7)', marginBottom: 6 }}>SIGNAL DETECTION</div>
            <RadarCanvas />
            <div style={{ fontSize: '8px', color: C.green, marginTop: 6, textShadow: `0 0 8px ${C.green}50` }}>● VISITOR DETECTED</div>
          </div>

          <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(5,5,16,0.7)', borderRadius: 8 }}>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: C.purple, marginBottom: 10, textShadow: `0 0 8px ${C.purple}55` }}>TRANSMISSION DATA</div>
            {[
              { label: 'SENDER', value: form.name, s: 'name' },
              { label: 'EMAIL', value: form.email, s: 'email' },
              { label: 'SUBJECT', value: form.subject, s: 'subject' },
              { label: 'MESSAGE', value: form.message ? `"${form.message.slice(0, 30)}..."` : '', s: 'message' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.55)', letterSpacing: '1px' }}>{f.label}</span>
                <span style={{ fontSize: '9px', color: f.value ? C.blue : 'rgba(232,232,240,0.2)', maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: f.value ? `0 0 6px ${C.blue}30` : 'none' }}>
                  {f.value || (step === f.s ? '▍' : '—')}
                </span>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(5,5,16,0.7)', borderRadius: 8 }}>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,0.65)', marginBottom: 8 }}>CONNECTION STATUS</div>
            {[
              { l: 'STATUS', v: 'AVAILABLE', c: C.green },
              { l: 'RESPONSE', v: '< 24 HOURS', c: C.amber },
              { l: 'CHANNEL', v: 'ENCRYPTED', c: C.blue },
              { l: 'PROTOCOL', v: 'VOID/3', c: C.purple },
              { l: 'TIMEZONE', v: 'UTC+5:30', c: C.white },
            ].map(s => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.5)', letterSpacing: '1px' }}>{s.l}</span>
                <span style={{ fontSize: '9px', color: s.c, fontWeight: 600, textShadow: `0 0 6px ${s.c}30` }}>{s.v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(5,5,16,0.7)', borderRadius: 8 }}>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,0.65)', marginBottom: 8 }}>SIGNAL CHANNELS</div>
            {[
              { l: 'EMAIL', v: OWNER.email, h: `mailto:${OWNER.email}`, c: C.green },
              { l: 'GITHUB', v: '@shivamsuhana', h: OWNER.github, c: C.white },
              { l: 'LINKEDIN', v: 'in/shivamsuhana', h: OWNER.linkedin, c: C.blue },
            ].map(lk => (
              <a key={lk.l} href={lk.h} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', justifyContent: 'space-between', padding: '4px 0',
                textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.03)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.paddingLeft = '4px'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.paddingLeft = '0'; }}
              >
                <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.5)', letterSpacing: '1px' }}>{lk.l}</span>
                <span style={{ fontSize: '9px', color: lk.c, textShadow: `0 0 6px ${lk.c}30` }}>{lk.v}</span>
              </a>
            ))}
          </div>

          <div style={{ padding: '8px 14px', fontSize: '7px', color: 'rgba(232,232,240,0.2)', letterSpacing: '1.5px', lineHeight: 1.8 }}>
            SECURE CHANNEL · AES-256<br />VOID OS v3.0.1
          </div>
        </div>
      </div>

      {showSuccess && <SuccessPopup name={form.name} onBack={() => { setShowSuccess(false); setStep('name'); setLines([]); setForm({ name: '', email: '', subject: '', message: '' }); setInput(''); setSendProgress(0); setTimeout(() => { addLine('VOID OS CONTACT TERMINAL v3.0.1', C.cyan); addLine('Secure channel established.', 'rgba(232,232,240,0.5)'); addLine('', ''); addLine('> IDENTIFY YOURSELF — Enter your name:', C.amber); }, 100); }} />}
    </div>
  );
}

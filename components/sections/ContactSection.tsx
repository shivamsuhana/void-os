'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';
import OSWindowFrame from '@/components/global/OSWindowFrame';

const C = {
  void: '#030306', blue: '#00D4FF', white: '#E8E8F0',
  amber: '#FFB800', green: '#39FF14', purple: '#7B2FFF', red: '#FF3B5C',
};

/* ═══════════════════════════════════════════
   SOUND ENGINE
   ═══════════════════════════════════════════ */
function playSound(type: 'key' | 'send' | 'success' | 'error') {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    if (type === 'key') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(2800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
      gain.gain.setValueAtTime(0.03, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.05);
    }
    if (type === 'send') {
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); const pan = ctx.createStereoPanner();
        osc.type = i < 2 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(200 + i * 300, now + i * 0.15);
        osc.frequency.exponentialRampToValueAtTime(80 + i * 100, now + 0.8 + i * 0.15);
        gain.gain.setValueAtTime(0.06, now + i * 0.15); gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + i * 0.15);
        pan.pan.setValueAtTime(-0.5 + i * 0.33, now);
        osc.connect(gain).connect(pan).connect(ctx.destination);
        osc.start(now + i * 0.15); osc.stop(now + 1.5 + i * 0.15);
      }
    }
    if (type === 'success') {
      [440, 554, 659, 880, 1100].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.setValueAtTime(freq * 0.5, now + i * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.3 + i * 0.08);
        gain.gain.setValueAtTime(0.08, now + i * 0.08); gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + i * 0.08);
        osc.connect(gain).connect(ctx.destination); osc.start(now + i * 0.08); osc.stop(now + 1.6);
      });
    }
    if (type === 'error') {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'square'; osc.frequency.setValueAtTime(200, now); osc.frequency.setValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.06, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain).connect(ctx.destination); osc.start(now); osc.stop(now + 0.2);
    }
    setTimeout(() => ctx.close(), 3000);
  } catch { /* */ }
}

/* ═══════════════════════════════════════════
   RADAR CANVAS — upgraded
   ═══════════════════════════════════════════ */
function RadarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const size = 140; c.width = size; c.height = size;
    let t = 0; let frame: number;
    const draw = () => {
      t += 0.018;
      const cx = size / 2, cy = size / 2, r = size / 2 - 8;
      ctx.clearRect(0, 0, size, size);
      // BG glow
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      bg.addColorStop(0, 'rgba(255,51,102,0.04)'); bg.addColorStop(1, 'transparent');
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      // Rings
      [0.3, 0.6, 0.9].forEach((s, i) => {
        ctx.beginPath(); ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,51,102,${0.08 + i * 0.04})`; ctx.lineWidth = 0.5; ctx.stroke();
      });
      // Crosshair
      ctx.strokeStyle = 'rgba(255,51,102,0.08)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke();
      // Sweep
      const sweepAngle = t % (Math.PI * 2);
      const sx = cx + Math.cos(sweepAngle) * r, sy = cy + Math.sin(sweepAngle) * r;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(sx, sy);
      ctx.strokeStyle = 'rgba(255,51,102,0.8)'; ctx.lineWidth = 1.5; ctx.stroke();
      // Sweep arc glow
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, sweepAngle - 0.7, sweepAngle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      sweepGrad.addColorStop(0, 'rgba(255,51,102,0.15)'); sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad; ctx.fill();
      // Blips
      [{ a: t * 0.3 + 1, d: 0.45 }, { a: t * 0.2 + 3, d: 0.7 }, { a: t * 0.15 + 5, d: 0.55 }].forEach(b => {
        const bx = cx + Math.cos(b.a) * r * b.d, by = cy + Math.sin(b.a) * r * b.d;
        const diff = ((sweepAngle - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const alpha = diff < 1 ? (1 - diff) * 0.9 : 0.1;
        ctx.beginPath(); ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,51,102,${alpha})`; ctx.fill();
        if (alpha > 0.5) {
          ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,51,102,${alpha * 0.2})`; ctx.fill();
        }
      });
      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,51,102,0.8)'; ctx.fill();
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);
  return <canvas ref={ref} style={{ width: 140, height: 140 }} />;
}

/* ═══════════════════════════════════════════
   HOLOGRAPHIC SOCIAL CARD
   ═══════════════════════════════════════════ */
function SocialCard({ icon, label, handle, href, color, description }: {
  icon: string; label: string; handle: string; href: string; color: string; description: string;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        padding: '12px 14px', position: 'relative', overflow: 'hidden',
        background: hov
          ? `linear-gradient(135deg, rgba(${rgb},0.12), rgba(8,8,22,0.95))`
          : 'linear-gradient(135deg, rgba(8,8,22,0.9), rgba(5,5,16,0.85))',
        border: `1px solid ${hov ? color + '55' : color + '1a'}`,
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: hov ? 'translateX(4px)' : 'translateX(0)',
        boxShadow: hov ? `0 0 20px rgba(${rgb},0.15), inset 0 0 20px rgba(${rgb},0.04)` : 'none',
        cursor: 'pointer',
      }}>
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}${hov ? '88' : '33'}, transparent)`, transition: 'all 0.3s' }} />
        {/* Left accent bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: hov ? 2 : 1, background: color, opacity: hov ? 1 : 0.3, transition: 'all 0.3s', boxShadow: hov ? `0 0 8px ${color}` : 'none' }} />
        {/* Corner mark */}
        {hov && <div style={{ position: 'absolute', top: 5, right: 5, width: 8, height: 8, borderTop: `1px solid ${color}88`, borderRight: `1px solid ${color}88` }} />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
          {/* Icon badge */}
          <div style={{
            width: 32, height: 32, borderRadius: 4, flexShrink: 0,
            background: `rgba(${rgb},${hov ? 0.2 : 0.08})`,
            border: `1px solid ${color}${hov ? '55' : '22'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', transition: 'all 0.3s',
            boxShadow: hov ? `0 0 12px rgba(${rgb},0.3)` : 'none',
          }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: color, textShadow: hov ? `0 0 10px ${color}` : 'none', transition: 'all 0.3s' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: hov ? `rgba(${rgb},0.8)` : 'rgba(232,232,240,0.2)', transition: 'color 0.3s' }}>↗</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: hov ? '#E8E8F0' : 'rgba(232,232,240,0.7)', transition: 'color 0.3s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,0.3)', marginTop: 2, opacity: hov ? 1 : 0.6, transition: 'opacity 0.3s' }}>{description}</div>
          </div>
        </div>
      </div>
    </a>
  );
}

/* ═══════════════════════════════════════════
   SUCCESS POPUP
   ═══════════════════════════════════════════ */
function SuccessPopup({ name, onBack }: { name: string; onBack: () => void }) {
  const [textIn, setTextIn] = useState(false);
  useEffect(() => { setTimeout(() => setTextIn(true), 200); }, []);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,3,6,0.96)', backdropFilter: 'blur(20px)' }}>
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 30 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${C.green}`, opacity: 0, animation: `pulseRing 2s ease-out ${i * 0.4}s infinite` }} />
        ))}
        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: `1px solid ${C.green}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 15, borderRadius: '50%', background: `radial-gradient(circle, ${C.green}22, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: textIn ? 'scale(1)' : 'scale(0)', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1) 0.3s' }}>
            <span style={{ fontSize: '32px', filter: `drop-shadow(0 0 20px ${C.green})` }}>✓</span>
          </div>
        </div>
      </div>
      <div style={{ opacity: textIn ? 1 : 0, transform: textIn ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.5s ease 0.4s', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', color: C.green, marginBottom: 8, textShadow: `0 0 20px ${C.green}60`, letterSpacing: '2px' }}>TRANSMISSION COMPLETE</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,232,240,0.6)', lineHeight: 2, marginBottom: 6 }}>Signal from <span style={{ color: C.blue }}>{name.toUpperCase()}</span> received.</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(232,232,240,0.4)', marginBottom: 30, letterSpacing: '1px' }}>Response ETA: {'< 24 hours'} · Delivered to {OWNER.email}</div>
        <button onClick={onBack} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2.5px', color: C.blue, padding: '12px 30px', cursor: 'pointer', border: `1px solid ${C.blue}55`, background: `${C.blue}10`, transition: 'all 0.2s', boxShadow: `0 0 20px ${C.blue}15` }}
          onMouseEnter={e => { e.currentTarget.style.background = `${C.blue}22`; e.currentTarget.style.boxShadow = `0 0 30px ${C.blue}30`; }}
          onMouseLeave={e => { e.currentTarget.style.background = `${C.blue}10`; e.currentTarget.style.boxShadow = `0 0 20px ${C.blue}15`; }}
        >← SEND ANOTHER</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONTACT SECTION
   ═══════════════════════════════════════════ */
type TStep = 'booting' | 'name' | 'email' | 'subject' | 'message' | 'confirm' | 'sending' | 'sent';
type LineData = { text: string; color: string; prompt: boolean; id: number };

export default function ContactSection() {
  const { navigateTo } = useVoidStore();
  const [lines, setLines] = useState<LineData[]>([]);
  const [step, setStep] = useState<TStep>('booting');
  const [input, setInput] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
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

  useEffect(() => {
    const bootLines = [
      { text: '> CONTACT.net v2045.1 — INITIALIZING...', color: C.blue, delay: 0 },
      { text: '  Establishing secure channel...', color: 'rgba(232,232,240,0.45)', delay: 280 },
      { text: '  Encrypting route (AES-256)...', color: 'rgba(232,232,240,0.45)', delay: 560 },
      { text: '  [OK] Signal locked. Timezone: UTC+5:30', color: C.green, delay: 840 },
      { text: '  [OK] AVAILABLE FOR NEW PROJECTS', color: C.green, delay: 1100 },
      { text: '────────────────────────────────────────', color: 'rgba(232,232,240,0.08)', delay: 1350 },
      { text: '  READY. Begin transmission.', color: C.white, delay: 1600 },
      { text: '', color: '', delay: 1700 },
      { text: '> IDENTIFY YOURSELF — Enter your name:', color: C.amber, delay: 1900 },
    ];
    bootLines.forEach(({ text, color, delay }) => setTimeout(() => addLine(text, color), delay + 300));
    setTimeout(() => { setStep('name'); setTimeout(() => inputRef.current?.focus(), 80); }, 2400);
    const ti = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(ti);
  }, [addLine]);

  useEffect(() => {
    if (step === 'message') textareaRef.current?.focus();
    else if (!['booting', 'sending', 'sent'].includes(step)) inputRef.current?.focus();
  }, [step]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() && step !== 'confirm') return;
    playSound('key');

    if (step === 'name') {
      addLine(`  ${input}`, C.blue, true); setForm(f => ({ ...f, name: input.trim() })); setInput('');
      const analyze = ['  Scanning identity...', '  Verifying handshake...', '  Identity confirmed.'];
      analyze.forEach((l, i) => setTimeout(() => addLine(l, i === analyze.length - 1 ? C.green : 'rgba(232,232,240,0.4)'), i * 300 + 200));
      setTimeout(() => { addLine('', ''); addLine(`> Hello, ${input.trim()}. Your email address:`, C.amber); setStep('email'); }, 1200);
    }
    else if (step === 'email') {
      if (!input.includes('@') || !input.includes('.')) { playSound('error'); addLine('  ✕ ERROR: Invalid email format.', C.red); return; }
      addLine(`  ${input}`, C.blue, true); setForm(f => ({ ...f, email: input.trim() })); setInput('');
      addLine('', ''); addLine('> Subject of transmission:', C.amber); setStep('subject');
    }
    else if (step === 'subject') {
      addLine(`  ${input}`, C.blue, true); setForm(f => ({ ...f, subject: input.trim() })); setInput('');
      addLine('', ''); addLine('> Your message (Shift+Enter ↵ for newline, Enter to submit):', C.amber); setStep('message');
    }
    else if (step === 'message') {
      addLine(`  "${input.slice(0, 80)}${input.length > 80 ? '...' : ''}"`, C.blue, true);
      setForm(f => ({ ...f, message: input.trim() })); setInput('');
      addLine('', ''); addLine('────────────────────────────────────────', 'rgba(232,232,240,0.08)');
      addLine('> CONFIRM TRANSMISSION? [Y / N]', C.amber); setStep('confirm');
    }
    else if (step === 'confirm') {
      const val = input.trim().toLowerCase();
      if (val === 'y' || val === 'yes' || val === '') {
        addLine('  Y', C.green, true); setInput(''); setStep('sending');
        addLine('', ''); addLine('  INITIATING QUANTUM TRANSMISSION...', C.amber); playSound('send');
        let prog = 0;
        const iv = setInterval(() => { prog += 1.5; setSendProgress(Math.min(prog, 100)); if (prog >= 100) clearInterval(iv); }, 50);
        const seq = ['  Compressing payload...', '  Routing through quantum nodes...', '  Establishing handshake...', `  Transmitting to ${OWNER.email}...`, '  Awaiting confirmation...'];
        seq.forEach((l, i) => setTimeout(() => addLine(l, 'rgba(232,232,240,0.4)'), i * 400 + 300));
        const subjectLine = form.subject || `Message from ${form.name}`;
        const bodyText = `From: ${form.name}\nEmail: ${form.email}\nSubject: ${subjectLine}\n\n${form.message}`;
        const mailtoUrl = `mailto:${OWNER.email}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyText)}`;
        setTimeout(async () => {
          try {
            const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, message: `[${subjectLine}] ${form.message}`, _honeypot: '' }) });
            const data = await res.json();
            if (data.fallback) window.location.href = mailtoUrl;
          } catch { window.location.href = mailtoUrl; }
        }, 1500);
        setTimeout(() => { addLine('', ''); addLine('  ✓ TRANSMISSION SUCCESSFUL', C.green); addLine(`  Delivered to: ${OWNER.email}`, C.blue); playSound('success'); setStep('sent'); setTimeout(() => setShowSuccess(true), 600); }, seq.length * 400 + 600);
      } else {
        addLine('  N — Transmission cancelled.', C.red); setInput(''); addLine('', '');
        addLine('> IDENTIFY YOURSELF — Enter your name:', C.amber);
        setForm({ name: '', email: '', subject: '', message: '' }); setStep('name');
      }
    }
  }, [step, input, form, addLine]);

  return (
    <OSWindowFrame name="CONTACT" ext=".net" color="#FF3366">
    <div style={{ position: 'relative', background: C.void, overflow: 'hidden', height: '100%', fontFamily: 'var(--font-mono)', color: C.white }}>
      <style dangerouslySetInnerHTML={{ __html: `
        input::placeholder,textarea::placeholder{color:rgba(232,232,240,0.2);}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes pulseRing{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.2);opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateX(-5px)}to{opacity:1;transform:none}}
        @keyframes contact-scan{0%{top:-2px}100%{top:100vh}}
        @keyframes social-pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,51,102,0.2)}
      `}} />

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(255,51,102,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,51,102,1) 1px,transparent 1px)', backgroundSize: '80px 80px' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at 30% 50%, rgba(255,51,102,0.04) 0%, transparent 60%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />
      <div style={{ position: 'fixed', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(255,51,102,0.15), transparent)', pointerEvents: 'none', zIndex: 56, animation: 'contact-scan 5s linear infinite' }} />

      {/* BODY — full-height two-column flex */}
      <div style={{
        position: 'absolute', inset: 0, top: 0,
        display: 'flex', flexDirection: 'column',
        padding: '60px 24px 16px',
        gap: 0,
      }}>
        <style dangerouslySetInnerHTML={{ __html: '@media(max-width:900px){#contact-right{display:none!important;}}' }} />
        <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 18, alignItems: 'stretch', justifyContent: 'center' }}>

          {/* Terminal card */}
          <div style={{
            flex: '1 1 0', minWidth: 0, maxWidth: 580, display: 'flex', flexDirection: 'column',
            border: '1px solid rgba(255,51,102,0.22)', borderRadius: 4,
            background: 'linear-gradient(160deg, rgba(10,8,24,0.98), rgba(6,5,18,0.96))',
            boxShadow: '0 0 80px rgba(255,51,102,0.08), 0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden', position: 'relative',
          }}>
            {/* Top neon bar */}
            <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,51,102,0.6), transparent)', zIndex: 10 }} />
            {/* Bottom neon bar */}
            <div style={{ position: 'absolute', bottom: 0, left: '5%', right: '5%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,51,102,0.3), transparent)', zIndex: 10 }} />
            {/* Scanlines */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.006) 2px, rgba(255,255,255,0.006) 4px)', zIndex: 1 }} />
            {/* Corner accents */}
            {[
              { top: 8, left: 8, borderTop: '1px solid rgba(255,51,102,0.5)', borderLeft: '1px solid rgba(255,51,102,0.5)' },
              { top: 8, right: 8, borderTop: '1px solid rgba(255,51,102,0.5)', borderRight: '1px solid rgba(255,51,102,0.5)' },
              { bottom: 8, left: 8, borderBottom: '1px solid rgba(255,51,102,0.5)', borderLeft: '1px solid rgba(255,51,102,0.5)' },
              { bottom: 8, right: 8, borderBottom: '1px solid rgba(255,51,102,0.5)', borderRight: '1px solid rgba(255,51,102,0.5)' },
            ].map((s, i) => <div key={i} style={{ position: 'absolute', width: 12, height: 12, pointerEvents: 'none', zIndex: 10, ...s }} />)}

            {/* Tab bar */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,51,102,0.12)', background: 'rgba(255,51,102,0.04)', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, position: 'relative', zIndex: 2 }}>
              {['#FF3B5C', '#FFB800', '#39FF14'].map((col, i) => (
                <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: col, boxShadow: `0 0 8px ${col}` }} />
              ))}
              <span style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(232,232,240,0.5)', marginLeft: 8 }}>CONTACT.net — ENCRYPTED CHANNEL</span>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'social-pulse 2s infinite' }} />
                <span style={{ fontSize: '8px', color: 'rgba(57,255,20,0.5)', letterSpacing: '1px' }}>LIVE</span>
              </div>
            </div>

            {/* Terminal output — scrolls internally */}
            <div ref={termRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', minHeight: 0, position: 'relative', zIndex: 2 }}>
              {lines.map((l, i) => (
                <div key={l.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 1, animation: i === lines.length - 1 ? 'fadeIn 0.15s ease' : 'none' }}>
                  <span style={{ color: l.prompt ? C.blue : 'rgba(232,232,240,0.15)', flexShrink: 0, fontSize: '11px', userSelect: 'none' }}>{l.prompt ? '>' : ' '}</span>
                  <span style={{ fontSize: '11px', lineHeight: 1.6, color: l.color || 'rgba(232,232,240,0.7)', wordBreak: 'break-word', fontWeight: l.color === C.green ? 600 : 400 }}>{l.text || '\u00A0'}</span>
                </div>
              ))}
              {step === 'sending' && sendProgress < 100 && (
                <div style={{ marginTop: 6, marginLeft: 16 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', maxWidth: 280 }}>
                    <div style={{ height: '100%', width: `${sendProgress}%`, background: `linear-gradient(90deg, ${C.red}, ${C.blue})`, transition: 'width 0.05s', boxShadow: `0 0 10px ${C.red}60` }} />
                  </div>
                  <div style={{ fontSize: '8px', color: 'rgba(232,232,240,0.5)', marginTop: 3, letterSpacing: '1px' }}>TRANSMITTING... {Math.floor(sendProgress)}%</div>
                </div>
              )}
            </div>

            {/* Input row — fixed at bottom */}
            {!['booting', 'sending', 'sent'].includes(step) && (
              <div style={{ borderTop: '1px solid rgba(255,51,102,0.12)', background: 'rgba(255,51,102,0.03)', flexShrink: 0, position: 'relative', zIndex: 2 }}>
                <div style={{ padding: '6px 16px 0', fontSize: '9px', letterSpacing: '2px', color: C.amber, textShadow: `0 0 8px ${C.amber}30` }}>
                  {step === 'name' && '> ENTER YOUR NAME'}
                  {step === 'email' && '> ENTER YOUR EMAIL'}
                  {step === 'subject' && '> SUBJECT OF TRANSMISSION'}
                  {step === 'message' && '> YOUR MESSAGE (Shift+Enter ↵ for newline)'}
                  {step === 'confirm' && '> CONFIRM? [Y / N]'}
                </div>
                <div style={{ padding: '6px 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: C.red, fontSize: '14px', flexShrink: 0 }}>❯</span>
                  {step === 'message' ? (
                    <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                      placeholder="Type your message..." rows={3}
                      style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.white, caretColor: C.red, resize: 'none', lineHeight: 1.6, background: 'transparent', border: 'none', outline: 'none' }} />
                  ) : (
                    <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                      placeholder={step === 'confirm' ? 'Y or N...' : 'Type here...'}
                      style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: C.white, caretColor: C.red, background: 'transparent', border: 'none', outline: 'none' }} />
                  )}
                  <button onClick={handleSubmit}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: C.red, cursor: 'pointer', padding: '5px 12px', border: `1px solid ${C.red}44`, background: `${C.red}10`, transition: 'all 0.2s', borderRadius: 3 }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${C.red}22`; e.currentTarget.style.boxShadow = `0 0 12px ${C.red}40`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${C.red}10`; e.currentTarget.style.boxShadow = 'none'; }}
                  >ENTER ↵</button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANELS — fixed column, scrolls on its own */}
          <div id="contact-right" style={{
            width: 255, flexShrink: 0, display: 'flex', flexDirection: 'column',
            gap: 8, overflowY: 'auto', paddingBottom: 4,
          }} className="hide-scrollbar">

            {/* Radar */}
            <div style={{ padding: 14, border: '1px solid rgba(255,51,102,0.2)', background: 'linear-gradient(135deg, rgba(10,8,24,0.96), rgba(6,5,18,0.9))', borderRadius: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,51,102,0.5), transparent)' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)' }} />
              <div style={{ fontSize: '8px', letterSpacing: '2.5px', color: '#FF3366', marginBottom: 10, textShadow: '0 0 10px rgba(255,51,102,0.6)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, boxShadow: `0 0 6px ${C.red}`, display: 'inline-block', animation: 'social-pulse 1.5s infinite' }} />
                SIGNAL DETECTION
              </div>
              <RadarCanvas />
              <div style={{ fontSize: '8px', color: C.green, marginTop: 10, textShadow: `0 0 10px ${C.green}70`, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, display: 'inline-block', animation: 'social-pulse 2s infinite' }} />
                VISITOR DETECTED
              </div>
            </div>

            {/* Connection status */}
            <div style={{ padding: 14, border: '1px solid rgba(0,212,255,0.15)', background: 'linear-gradient(135deg, rgba(10,8,24,0.96), rgba(6,5,18,0.9))', borderRadius: 4, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)' }} />
              <div style={{ fontSize: '8px', letterSpacing: '2.5px', color: C.blue, marginBottom: 10, textShadow: `0 0 10px ${C.blue}60`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue, boxShadow: `0 0 6px ${C.blue}`, display: 'inline-block' }} />
                CONNECTION STATUS
              </div>
              {[
                { l: 'STATUS', v: 'AVAILABLE', c: C.green },
                { l: 'RESPONSE', v: '< 24 HOURS', c: C.amber },
                { l: 'CHANNEL', v: 'ENCRYPTED', c: C.blue },
                { l: 'PROTOCOL', v: 'VOID/3', c: C.purple },
                { l: 'TIMEZONE', v: 'UTC+5:30', c: C.white },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.4)', letterSpacing: '1px' }}>{s.l}</span>
                  <span style={{ fontSize: '9px', color: s.c, fontWeight: 600, textShadow: `0 0 8px ${s.c}40` }}>{s.v}</span>
                </div>
              ))}
            </div>

            {/* SIGNAL CHANNELS */}
            <div style={{ padding: 14, border: '1px solid rgba(57,255,20,0.15)', background: 'linear-gradient(135deg, rgba(10,8,24,0.96), rgba(6,5,18,0.9))', borderRadius: 4, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(57,255,20,0.4), transparent)' }} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 4px)' }} />
              <div style={{ fontSize: '8px', letterSpacing: '2.5px', color: C.green, marginBottom: 12, textShadow: `0 0 10px ${C.green}60`, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, display: 'inline-block', animation: 'social-pulse 2.5s infinite' }} />
                SIGNAL CHANNELS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SocialCard icon="⬡" label="GITHUB" handle="@shivamsuhana" href={OWNER.github} color={C.white} description="Source code & projects" />
                <SocialCard icon="◈" label="LINKEDIN" handle="in/shivamsuhana" href={OWNER.linkedin} color={C.blue} description="Professional network" />
                <SocialCard icon="◎" label="LEETCODE" handle="/shivamsuhana" href={`https://leetcode.com/shivamsuhana`} color={C.amber} description="Algorithm practice" />
                <SocialCard icon="✦" label="EMAIL" handle={OWNER.email} href={`mailto:${OWNER.email}`} color={C.green} description="Direct transmission" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {showSuccess && <SuccessPopup name={form.name} onBack={() => {
        setShowSuccess(false); setStep('name'); setLines([]); setForm({ name: '', email: '', subject: '', message: '' }); setInput(''); setSendProgress(0);
        setTimeout(() => { addLine('> CONTACT.net v2045.1 — READY', C.blue); addLine('> IDENTIFY YOURSELF — Enter your name:', C.amber); }, 100);
      }} />}
    </div>
    </OSWindowFrame>
  );
}

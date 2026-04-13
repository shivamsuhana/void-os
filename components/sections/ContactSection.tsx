'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';
import OSWindowFrame from '@/components/global/OSWindowFrame';

/* ─── palette ─────────────────────────────── */
const C = { void: '#030306', cyan: '#00D4FF', white: '#E8E8F0', amber: '#FFB800', green: '#39FF14', purple: '#7B2FFF', red: '#FF3B5C', pink: '#FF3366' };

/* ─── tiny helpers ─────────────────────────── */
function playClick() {
  try { const a = new AudioContext(), o = a.createOscillator(), g = a.createGain(); o.type='sine'; o.frequency.value=3000; o.frequency.exponentialRampToValueAtTime(600,a.currentTime+.05); g.gain.setValueAtTime(.03,a.currentTime); g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.06); o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime+.07); setTimeout(()=>a.close(),500); } catch{}
}
function playSend() {
  try { const a=new AudioContext(),now=a.currentTime; [200,400,700,1100].forEach((f,i)=>{ const o=a.createOscillator(),g=a.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(f,now+i*.12); g.gain.setValueAtTime(.05,now+i*.12); g.gain.exponentialRampToValueAtTime(.001,now+.9+i*.12); o.connect(g).connect(a.destination); o.start(now+i*.12); o.stop(now+1.2+i*.12); }); setTimeout(()=>a.close(),3000); } catch{}
}

/* ══════════════════════════════════════════════════
   DEEP SPACE BACKGROUND CANVAS
   ══════════════════════════════════════════════════ */
function SpaceBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let t = 0; let frame: number;
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Stars
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      s: Math.random() * 0.003 + 0.001,
      a: Math.random(),
    }));

    const draw = () => {
      t += 0.008;
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);

      // Deep BG
      ctx.fillStyle = '#030306';
      ctx.fillRect(0, 0, W, H);

      // Perspective grid — converging to horizon
      const horizon = H * 0.52;
      const vp = W / 2;
      ctx.strokeStyle = 'rgba(255,51,102,0.06)';
      ctx.lineWidth = 1;
      // Vertical lines
      for (let i = -14; i <= 14; i++) {
        const dx = (i / 14) * W * 0.9;
        ctx.beginPath();
        ctx.moveTo(vp + dx, horizon);
        ctx.lineTo(vp + dx * 5, H + 200);
        ctx.stroke();
      }
      // Horizontal lines
      for (let i = 0; i < 10; i++) {
        const pct = (i / 10) ** 1.4;
        const y = horizon + (H - horizon + 200) * pct;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // Top ceiling grid
      ctx.strokeStyle = 'rgba(0,212,255,0.025)';
      for (let i = -8; i <= 8; i++) {
        const dx = (i / 8) * W * 0.6;
        ctx.beginPath(); ctx.moveTo(vp + dx, horizon); ctx.lineTo(vp + dx * 4, -200); ctx.stroke();
      }
      for (let i = 0; i < 6; i++) {
        const pct = (i / 6) ** 1.4;
        const y = horizon - (horizon + 200) * pct;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Stars
      stars.forEach(s => {
        s.a += s.s;
        const alpha = (Math.sin(s.a) + 1) * 0.4 + 0.1;
        ctx.beginPath(); ctx.arc(s.x * W, s.y * H * 0.9, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,232,240,${alpha})`; ctx.fill();
      });

      // Ambient nebula
      const neb = ctx.createRadialGradient(vp, horizon, 0, vp, horizon, W * 0.6);
      neb.addColorStop(0, `rgba(255,51,102,${0.04 + Math.sin(t * 0.4) * 0.02})`);
      neb.addColorStop(0.5, `rgba(0,212,255,${0.015})`);
      neb.addColorStop(1, 'transparent');
      ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

/* ══════════════════════════════════════════════════
   TRANSMISSION BEAM — central animated circle
   ══════════════════════════════════════════════════ */
function TransmissionBeam({ active, sending, size = 200 }: { active: boolean; sending: boolean; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const S = size; c.width = S; c.height = S;
    const cx = S / 2, cy = S / 2;
    let t = 0; let frame: number;

    const draw = () => {
      t += 0.03;
      ctx.clearRect(0, 0, S, S);

      // Outer rings
      [80, 70, 60].forEach((r, i) => {
        const alpha = sending ? (0.3 + Math.sin(t * 4 + i) * 0.25) : (active ? 0.12 + i * 0.04 : 0.04 + i * 0.02);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,51,102,${alpha})`; ctx.lineWidth = 1;
        ctx.shadowColor = C.pink; ctx.shadowBlur = sending ? 20 : 4;
        ctx.stroke(); ctx.shadowBlur = 0;
      });

      // Rotating dash segments
      const segs = 24;
      for (let i = 0; i < segs; i++) {
        const a1 = (i / segs) * Math.PI * 2 + t * (sending ? 2 : 0.5);
        const a2 = a1 + (Math.PI * 2 / segs) * 0.4;
        const r = 75 + (sending ? Math.sin(t * 8 + i * 0.3) * 6 : 0);
        ctx.beginPath();
        ctx.arc(cx, cy, r, a1, a2);
        const alpha = sending ? 0.8 : (active ? 0.35 : 0.12);
        ctx.strokeStyle = `rgba(255,51,102,${alpha})`; ctx.lineWidth = sending ? 2 : 1;
        ctx.shadowColor = C.pink; ctx.shadowBlur = sending ? 12 : 2;
        ctx.stroke(); ctx.shadowBlur = 0;
      }

      // Radar sweep when active
      if (active || sending) {
        const sweepA = t * (sending ? 3 : 1.5);
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sweepA);
        const sweep = ctx.createLinearGradient(0, 0, 60, 0);
        sweep.addColorStop(0, `rgba(255,51,102,${sending ? 0.6 : 0.3})`);
        sweep.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.moveTo(0, 0);
        ctx.arc(0, 0, 70, -0.3, 0.3);
        ctx.closePath();
        ctx.fillStyle = sweep; ctx.fill();
        ctx.restore();
      }

      // Core
      const coreR = sending ? 22 + Math.sin(t * 8) * 3 : 18;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, sending ? 'rgba(255,51,102,0.9)' : (active ? 'rgba(255,51,102,0.5)' : 'rgba(255,51,102,0.15)'));
      coreGrad.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, S * 0.03, 0, Math.PI * 2);
      ctx.fillStyle = sending ? C.pink : (active ? 'rgba(255,51,102,0.7)' : 'rgba(255,51,102,0.3)');
      ctx.shadowColor = C.pink; ctx.shadowBlur = sending ? 20 : 8;
      ctx.fill(); ctx.shadowBlur = 0;

      // Sending particles
      if (sending) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 2;
          const r = S * 0.15 + Math.sin(t * 6 + i) * S * 0.075;
          const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
          ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,212,255,${0.6 + Math.sin(t * 4 + i) * 0.4})`; ctx.fill();
        }
      }

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [active, sending, size]);

  return <canvas ref={ref} style={{ width: size, height: size, display: 'block' }} />;
}

/* ══════════════════════════════════════════════════
   ALIEN SOCIAL NODE
   ══════════════════════════════════════════════════ */
function SocialNode({ icon, label, handle, href, color, index }: {
  icon: string; label: string; handle: string; href: string; color: string; index: number;
}) {
  const [hov, setHov] = useState(false);
  const rgb = `${parseInt(color.slice(1,3),16)},${parseInt(color.slice(3,5),16)},${parseInt(color.slice(5,7),16)}`;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: hov ? `linear-gradient(135deg, rgba(${rgb},0.15), rgba(3,3,6,0.95))` : 'rgba(5,4,16,0.7)',
        border: `1px solid ${hov ? color + '66' : color + '1a'}`,
        transform: hov ? 'translateX(6px) scale(1.02)' : 'translateX(0) scale(1)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: hov ? `0 0 24px rgba(${rgb},0.2), inset 0 0 20px rgba(${rgb},0.05)` : 'none',
        cursor: 'pointer', position: 'relative', overflow: 'hidden',
        animationDelay: `${index * 0.1}s`,
      }}>
        {/* Left pulse bar */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: hov ? 3 : 1, background: color, opacity: hov ? 1 : 0.25, boxShadow: hov ? `0 0 10px ${color}` : 'none', transition: 'all 0.3s' }} />
        {/* Top glow line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}${hov ? '77' : '1a'}, transparent)`, transition: 'all 0.3s' }} />

        {/* Icon hex */}
        <div style={{
          width: 36, height: 36, flexShrink: 0, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `rgba(${rgb},${hov ? 0.2 : 0.07})`,
          border: `1px solid ${color}${hov ? '55' : '1a'}`,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          transition: 'all 0.3s',
          boxShadow: hov ? `0 0 16px rgba(${rgb},0.4)` : 'none',
        }}>
          <span style={{ fontSize: '15px' }}>{icon}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2.5px', color, textShadow: hov ? `0 0 10px ${color}` : 'none', transition: 'all 0.3s' }}>{label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: hov ? color : 'rgba(232,232,240,0.15)', transition: 'color 0.3s' }}>↗</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: hov ? '#E8E8F0' : 'rgba(232,232,240,0.55)', transition: 'color 0.3s', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{handle}</span>
        </div>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════
   SUCCESS SCREEN
   ══════════════════════════════════════════════════ */
function SuccessScreen({ name, onBack }: { name: string; onBack: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 100); }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,3,6,0.97)', backdropFilter: 'blur(20px)' }}>
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ position: 'absolute', inset: -i * 20, borderRadius: '50%', border: `1px solid rgba(57,255,20,${0.5 - i * 0.1})`, opacity: 0, animation: `success-ring 2s ease-out ${i * 0.3}s infinite` }} />
        ))}
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(57,255,20,0.2), transparent)', border: '1px solid rgba(57,255,20,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: show ? 'scale(1)' : 'scale(0)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 40px rgba(57,255,20,0.3)' }}>
          <span style={{ fontSize: '40px', filter: 'drop-shadow(0 0 20px #39FF14)' }}>✓</span>
        </div>
      </div>
      <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease 0.3s', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '28px', color: C.green, textShadow: '0 0 30px rgba(57,255,20,0.6)', letterSpacing: '3px', marginBottom: 12 }}>TRANSMISSION DELIVERED</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,232,240,0.5)', lineHeight: 2, marginBottom: 6 }}>
          Signal from <span style={{ color: C.cyan }}>{name.toUpperCase()}</span> received and logged.
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(232,232,240,0.3)', letterSpacing: '1.5px', marginBottom: 32 }}>
          ETA: {'<'} 24h · Routed to {OWNER.email}
        </div>
        <button onClick={onBack} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: C.cyan, padding: '12px 36px', border: `1px solid ${C.cyan}44`, background: `${C.cyan}0d`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: `0 0 20px ${C.cyan}15` }}
          onMouseEnter={e => { e.currentTarget.style.background=`${C.cyan}22`; e.currentTarget.style.boxShadow=`0 0 30px ${C.cyan}30`; }}
          onMouseLeave={e => { e.currentTarget.style.background=`${C.cyan}0d`; e.currentTarget.style.boxShadow=`0 0 20px ${C.cyan}15`; }}>
          ← NEW TRANSMISSION
        </button>
      </div>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes success-ring{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2);opacity:0}}' }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN CONTACT SECTION
   ══════════════════════════════════════════════════ */
type Step = 'boot' | 'name' | 'email' | 'subject' | 'message' | 'confirm' | 'sending' | 'sent';
type Line = { text: string; color: string; prompt: boolean; id: number };

export default function ContactSection() {
  const { navigateTo } = useVoidStore();
  const [lines, setLines] = useState<Line[]>([]);
  const [step, setStep] = useState<Step>('boot');
  const [input, setInput] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [clock, setClock] = useState(new Date());
  const termRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const push = useCallback((text: string, color = 'rgba(232,232,240,0.65)', prompt = false) => {
    setLines(p => [...p, { text, color, prompt, id: Date.now() + Math.random() }]);
    setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 30);
  }, []);

  useEffect(() => {
    const seq = [
      { t: '> CONTACT.net v2045 — INITIALIZING NEURAL CHANNEL', c: C.cyan, d: 0 },
      { t: '  Establishing quantum-encrypted tunnel...', c: 'rgba(232,232,240,0.4)', d: 280 },
      { t: '  [OK] Route secured · AES-256-Q handshake complete', c: C.green, d: 560 },
      { t: '  [OK] STATUS: AVAILABLE FOR NEW PROJECTS', c: C.green, d: 840 },
      { t: '  [OK] LOAD: LOW · ETA: < 24 HOURS', c: C.green, d: 1100 },
      { t: '──────────────────────────────────', c: 'rgba(232,232,240,0.07)', d: 1350 },
      { t: '', c: '', d: 1500 },
      { t: '> IDENTIFY YOURSELF — Enter your name:', c: C.amber, d: 1700 },
    ];
    seq.forEach(({ t, c, d }) => setTimeout(() => push(t, c), d + 200));
    setTimeout(() => { setStep('name'); setTimeout(() => inputRef.current?.focus(), 80); }, 2100);
    const ti = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(ti);
  }, [push]);

  useEffect(() => {
    if (step === 'message') textareaRef.current?.focus();
    else if (!['boot', 'sending', 'sent'].includes(step)) { setTimeout(() => inputRef.current?.focus(), 40); }
  }, [step]);

  const submit = useCallback(() => {
    if (!input.trim() && step !== 'confirm') return;
    playClick();

    if (step === 'name') {
      push(`  ${input}`, C.cyan, true); setForm(f => ({ ...f, name: input.trim() })); setInput('');
      ['  Verifying identity...', '  Running deep-scan...', '  Identity confirmed. Proceed.'].forEach((l, i) => setTimeout(() => push(l, i === 2 ? C.green : 'rgba(232,232,240,0.35)'), i * 300 + 200));
      setTimeout(() => { push(''); push(`> Hello, ${input.trim()}. Your email address:`, C.amber); setStep('email'); }, 1200);
    }
    else if (step === 'email') {
      if (!input.includes('@') || !input.includes('.')) { push('  ✕ Invalid email format. Try again.', C.red); return; }
      push(`  ${input}`, C.cyan, true); setForm(f => ({ ...f, email: input.trim() })); setInput('');
      push(''); push('> Subject of transmission:', C.amber); setStep('subject');
    }
    else if (step === 'subject') {
      push(`  ${input}`, C.cyan, true); setForm(f => ({ ...f, subject: input.trim() })); setInput('');
      push(''); push('> Message (Shift+Enter for newline):', C.amber); setStep('message');
    }
    else if (step === 'message') {
      push(`  "${input.length > 80 ? input.slice(0, 80) + '…' : input}"`, C.cyan, true);
      setForm(f => ({ ...f, message: input.trim() })); setInput('');
      push(''); push('──────────────────────────────────', 'rgba(232,232,240,0.07)');
      push('> CONFIRM TRANSMISSION? [Y / N]', C.amber); setStep('confirm');
    }
    else if (step === 'confirm') {
      const v = input.trim().toLowerCase();
      if (v === 'n' || v === 'no') {
        push('  N — Aborting. Resetting form.', C.red); setInput('');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => { push(''); push('> IDENTIFY YOURSELF — Enter your name:', C.amber); setStep('name'); }, 600);
        return;
      }
      push('  Y — TRANSMITTING', C.green, true); setInput(''); setStep('sending');
      push(''); push('  INITIATING QUANTUM BURST...', C.amber); playSend();
      let prog = 0;
      const iv = setInterval(() => { prog += 1.2; setSendProgress(Math.min(prog, 100)); if (prog >= 100) clearInterval(iv); }, 40);
      const steps2 = ['  Compressing payload...', '  Routing via quantum nodes...', '  Establishing endpoint handshake...', `  Transmitting to ${OWNER.email}...`, '  Awaiting delivery confirmation...'];
      steps2.forEach((l, i) => setTimeout(() => push(l, 'rgba(232,232,240,0.35)'), i * 380 + 200));

      const subj = form.subject || `Message from ${form.name}`;
      const body = `From: ${form.name}\nEmail: ${form.email}\nSubject: ${subj}\n\n${form.message}`;
      const mailto = `mailto:${OWNER.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;

      setTimeout(async () => {
        try {
          const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, email: form.email, message: `[${subj}] ${form.message}`, _honeypot: '' }) });
          const d = await r.json(); if (d.fallback) window.location.href = mailto;
        } catch { window.location.href = mailto; }
      }, 1400);

      setTimeout(() => {
        push(''); push('  ✓ TRANSMISSION SUCCESSFUL — SIGNAL DELIVERED', C.green);
        push(`  Delivered to: ${OWNER.email}`, C.cyan);
        setStep('sent'); setTimeout(() => setShowSuccess(true), 800);
      }, steps2.length * 380 + 500);
    }
  }, [step, input, form, push]);

  const isSending = step === 'sending';

  return (
    <OSWindowFrame name="CONTACT" ext=".net" color="#FF3366">
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: C.void, fontFamily: 'var(--font-mono)', color: C.white }}>
      <style>{`
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,51,102,0.18)}
        input,textarea{font-family:var(--font-mono)!important;} input::placeholder,textarea::placeholder{color:rgba(232,232,240,0.18);}
        @keyframes contact-scan{0%{top:-2px}100%{top:calc(100% + 2px)}}
        @keyframes node-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      `}</style>

      {/* Deep space background */}
      <SpaceBackground />

      {/* CRT scanlines overlay */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 60, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)' }} />

      {/* Scan line animation */}
      <div style={{ position: 'absolute', left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent,rgba(255,51,102,0.18),transparent)', pointerEvents: 'none', zIndex: 61, animation: 'contact-scan 6s linear infinite' }} />

      {/* ── MAIN LAYOUT ── */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'stretch', gap: 12, padding: '44px 10px 10px', zIndex: 2 }}>

        {/* ══ LEFT: TERMINAL ══ */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Terminal header */}
          <div style={{
            padding: '9px 14px', flexShrink: 0,
            background: 'linear-gradient(90deg, rgba(255,51,102,0.08), rgba(3,3,6,0.9))',
            border: '1px solid rgba(255,51,102,0.2)', borderBottom: 'none',
            display: 'flex', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,51,102,0.7),transparent)' }} />
            {['#FF3B5C','#FFB800','#39FF14'].map((col, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: col, boxShadow: `0 0 6px ${col}` }} />
            ))}
            <span style={{ flex: 1, fontSize: '9px', letterSpacing: '2px', color: 'rgba(232,232,240,0.45)', marginLeft: 6 }}>CONTACT.net — NEURAL TERMINAL</span>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, boxShadow: `0 0 6px ${C.green}`, animation: 'blink 2s infinite' }} />
              <span style={{ fontSize: '7px', color: 'rgba(57,255,20,0.5)', letterSpacing: '1px' }}>LIVE</span>
              <span style={{ fontSize: '7px', color: 'rgba(232,232,240,0.2)', marginLeft: 4 }}>{clock.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Terminal glass body */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0,
            background: 'linear-gradient(160deg, rgba(8,6,22,0.97), rgba(4,3,14,0.95))',
            border: '1px solid rgba(255,51,102,0.18)',
            boxShadow: '0 0 60px rgba(255,51,102,0.07), 0 20px 60px rgba(0,0,0,0.6)',
            position: 'relative', overflow: 'hidden',
          }}>
            {[{top:6,left:6,borderTop:'1px solid rgba(255,51,102,0.5)',borderLeft:'1px solid rgba(255,51,102,0.5)'},{top:6,right:6,borderTop:'1px solid rgba(255,51,102,0.5)',borderRight:'1px solid rgba(255,51,102,0.5)'},{bottom:6,left:6,borderBottom:'1px solid rgba(255,51,102,0.5)',borderLeft:'1px solid rgba(255,51,102,0.5)'},{bottom:6,right:6,borderBottom:'1px solid rgba(255,51,102,0.5)',borderRight:'1px solid rgba(255,51,102,0.5)'}].map((s,i)=>(
              <div key={i} style={{position:'absolute',width:10,height:10,pointerEvents:'none',zIndex:5,...s}} />
            ))}
            <div style={{position:'absolute',inset:0,pointerEvents:'none',background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.007) 2px,rgba(255,255,255,0.007) 4px)',zIndex:1}} />

            {/* Output lines */}
            <div ref={termRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', minHeight: 0, position: 'relative', zIndex: 2 }}>
              {lines.map((l, i) => (
                <div key={l.id} style={{ display: 'flex', gap: 8, marginBottom: 1, animation: i >= lines.length - 2 ? 'fadeUp 0.2s ease' : 'none' }}>
                  <span style={{ color: l.prompt ? C.pink : 'rgba(255,255,255,0.1)', flexShrink: 0, fontSize: '11px' }}>{l.prompt ? '❯' : ' '}</span>
                  <span style={{ fontSize: '11px', lineHeight: 1.65, color: l.color, wordBreak: 'break-word' }}>{l.text || '\u00A0'}</span>
                </div>
              ))}
              {isSending && sendProgress < 100 && (
                <div style={{ marginTop: 10, paddingLeft: 16 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2, maxWidth: 280, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${sendProgress}%`, background: `linear-gradient(90deg,${C.pink},${C.cyan})`, transition: 'width 0.04s', boxShadow: `0 0 10px ${C.pink}60` }} />
                  </div>
                  <div style={{ fontSize: '8px', color: 'rgba(232,232,240,0.4)', marginTop: 3, letterSpacing: '1px' }}>QUANTUM BURST {Math.floor(sendProgress)}%</div>
                </div>
              )}
            </div>

            {/* Input zone */}
            {!['boot','sending','sent'].includes(step) && (
              <div style={{ borderTop: '1px solid rgba(255,51,102,0.1)', background: 'rgba(255,51,102,0.03)', flexShrink: 0, zIndex: 2 }}>
                <div style={{ padding: '5px 16px 0', fontSize: '8px', letterSpacing: '2.5px', color: C.amber, opacity: 0.8 }}>
                  {step==='name'?'> YOUR NAME':step==='email'?'> YOUR EMAIL':step==='subject'?'> SUBJECT':step==='message'?'> MESSAGE':'> CONFIRM [Y/N]'}
                </div>
                <div style={{ padding: '5px 16px 10px', display: 'flex', alignItems: step==='message'?'flex-start':'center', gap: 8 }}>
                  <span style={{ color: C.pink, fontSize: '16px', flexShrink: 0, marginTop: step==='message'?2:0 }}>›</span>
                  {step === 'message' ? (
                    <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}}}
                      placeholder="Your message..." rows={3}
                      style={{ flex:1, fontSize:'11px', color:C.white, caretColor:C.pink, resize:'none', lineHeight:1.65, background:'transparent', border:'none', outline:'none' }} />
                  ) : (
                    <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter')submit();}}
                      placeholder={step==='confirm'?'Y or N...':'Type here...'}
                      style={{ flex:1, fontSize:'11px', color:C.white, caretColor:C.pink, background:'transparent', border:'none', outline:'none' }} />
                  )}
                  <button onClick={submit} style={{ fontSize:'8px', letterSpacing:'2px', color:C.pink, padding:'5px 14px', border:`1px solid ${C.pink}44`, background:`${C.pink}0d`, cursor:'pointer', transition:'all 0.2s', flexShrink:0 }}
                    onMouseEnter={e=>{e.currentTarget.style.background=`${C.pink}22`;e.currentTarget.style.boxShadow=`0 0 14px ${C.pink}40`;}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`${C.pink}0d`;e.currentTarget.style.boxShadow='none';}}>
                    SEND ↵
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT: SCANNER + CHANNELS ══ */}
        <div style={{ width: 218, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* SCANNER PANEL — top */}
          <div style={{ padding: '12px 12px 10px', border: '1px solid rgba(255,51,102,0.2)', background: 'linear-gradient(135deg,rgba(10,6,22,0.97),rgba(4,3,14,0.95))', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(255,51,102,0.6),transparent)' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.005) 2px,rgba(255,255,255,0.005) 4px)' }} />
            {/* Corner accents */}
            {[{top:4,left:4,borderTop:'1px solid rgba(255,51,102,0.5)',borderLeft:'1px solid rgba(255,51,102,0.5)'},{top:4,right:4,borderTop:'1px solid rgba(255,51,102,0.5)',borderRight:'1px solid rgba(255,51,102,0.5)'},{bottom:4,left:4,borderBottom:'1px solid rgba(255,51,102,0.5)',borderLeft:'1px solid rgba(255,51,102,0.5)'},{bottom:4,right:4,borderBottom:'1px solid rgba(255,51,102,0.5)',borderRight:'1px solid rgba(255,51,102,0.5)'}].map((s,i)=>(
              <div key={i} style={{position:'absolute',width:8,height:8,pointerEvents:'none',zIndex:5,...s}} />
            ))}

            <div style={{ fontSize: '7px', letterSpacing: '3px', color: 'rgba(255,51,102,0.6)', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.pink, boxShadow: `0 0 5px ${C.pink}`, animation: 'blink 1.5s infinite' }} />
              SIGNAL SCANNER
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <TransmissionBeam active={!['boot'].includes(step)} sending={isSending} size={130} />
            </div>

            <div style={{ fontSize: '7px', letterSpacing: '2px', color: isSending ? C.amber : step !== 'boot' ? C.green : 'rgba(232,232,240,0.2)', textAlign: 'center', animation: isSending ? 'blink 0.5s infinite' : 'none', transition: 'color 0.4s', textShadow: step !== 'boot' ? `0 0 8px ${isSending ? C.amber : C.green}60` : 'none', position: 'relative', zIndex: 2 }}>
              {isSending ? '◉ TRANSMITTING...' : step !== 'boot' ? '◉ CHANNEL OPEN' : '○ CONNECTING...'}
            </div>

            {/* Signal strength bars */}
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 18, position: 'relative', zIndex: 2 }}>
              {[3,5,8,12,8,5,3].map((h, i) => (
                <div key={i} style={{ width: 4, height: h, background: step !== 'boot' ? `rgba(255,51,102,${0.3 + i * 0.06})` : 'rgba(255,255,255,0.06)', borderRadius: 1, transition: 'all 0.5s', boxShadow: step !== 'boot' ? `0 0 4px rgba(255,51,102,0.3)` : 'none' }} />
              ))}
            </div>
          </div>

          {/* SIGNAL CHANNELS — below scanner */}
          <div style={{ flex: 1, padding: '12px 10px', border: '1px solid rgba(57,255,20,0.14)', background: 'linear-gradient(135deg,rgba(8,6,22,0.95),rgba(4,3,14,0.9))', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg,transparent,rgba(57,255,20,0.45),transparent)' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.004) 2px,rgba(255,255,255,0.004) 4px)' }} />
            {[{top:4,left:4,borderTop:'1px solid rgba(57,255,20,0.4)',borderLeft:'1px solid rgba(57,255,20,0.4)'},{top:4,right:4,borderTop:'1px solid rgba(57,255,20,0.4)',borderRight:'1px solid rgba(57,255,20,0.4)'},{bottom:4,left:4,borderBottom:'1px solid rgba(57,255,20,0.4)',borderLeft:'1px solid rgba(57,255,20,0.4)'},{bottom:4,right:4,borderBottom:'1px solid rgba(57,255,20,0.4)',borderRight:'1px solid rgba(57,255,20,0.4)'}].map((s,i)=>(
              <div key={i} style={{position:'absolute',width:8,height:8,pointerEvents:'none',zIndex:5,...s}} />
            ))}

            <div style={{ fontSize: '7px', letterSpacing: '3px', color: C.green, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5, position: 'relative', zIndex: 2 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.green, boxShadow: `0 0 5px ${C.green}`, animation: 'blink 2.5s infinite' }} />
              SIGNAL CHANNELS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', zIndex: 2 }}>
              <SocialNode icon="⬡" label="GITHUB" handle="@shivamsuhana" href={OWNER.github} color="#E8E8F0" index={0} />
              <SocialNode icon="◈" label="LINKEDIN" handle="in/shivamsuhana" href={OWNER.linkedin} color={C.cyan} index={1} />
              <SocialNode icon="◎" label="LEETCODE" handle="/shivamsuhana" href="https://leetcode.com/shivamsuhana" color={C.amber} index={2} />
              <SocialNode icon="✦" label="EMAIL" handle={OWNER.email} href={`mailto:${OWNER.email}`} color={C.green} index={3} />
            </div>

            {/* Status strip */}
            <div style={{ marginTop: 'auto', paddingTop: 10, position: 'relative', zIndex: 2 }}>
              <div style={{ borderTop: '1px solid rgba(57,255,20,0.07)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { k: 'STATUS', v: 'AVAILABLE', c: C.green },
                  { k: 'RESPONSE', v: '< 24 HRS', c: C.amber },
                  { k: 'TIMEZONE', v: 'UTC+5:30', c: 'rgba(232,232,240,0.45)' },
                ].map(({ k, v, c }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '7px', color: 'rgba(232,232,240,0.28)', letterSpacing: '0.5px' }}>{k}</span>
                    <span style={{ fontSize: '8px', color: c, fontWeight: 600, textShadow: `0 0 6px ${c}40` }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>



      {showSuccess && (
        <SuccessScreen name={form.name} onBack={() => {
          setShowSuccess(false); setLines([]); setForm({ name: '', email: '', subject: '', message: '' }); setInput(''); setSendProgress(0);
          setTimeout(() => { setStep('name'); push('> CONTACT.net — READY FOR NEW TRANSMISSION', C.cyan); push('> IDENTIFY YOURSELF:', C.amber); }, 100);
        }} />
      )}
    </div>
    </OSWindowFrame>
  );
}

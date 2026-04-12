'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

/* ═══════════════════════════════════════════
   RADAR ANIMATION
   ═══════════════════════════════════════════ */
function RadarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const SIZE = 260; c.width = SIZE; c.height = SIZE;
    const cx = SIZE / 2, cy = SIZE / 2, R = SIZE * 0.42;
    let t = 0, frame: number;

    // Blips — detected visitors
    const blips = [
      { angle: 0.8, dist: 0.6, alpha: 0 },
      { angle: 2.1, dist: 0.3, alpha: 0 },
      { angle: 4.2, dist: 0.8, alpha: 0 },
      { angle: 5.5, dist: 0.5, alpha: 0 },
    ];

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, SIZE, SIZE);

      // Rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, R * (i / 4), 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${0.06 + (i === 4 ? 0.02 : 0)})`;
        ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Cross lines
      ctx.strokeStyle = 'rgba(0,212,255,0.04)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      // Sweep
      const sweepAngle = t * 1.5;
      const sweepGrad = ctx.createConicGradient(sweepAngle, cx, cy);
      sweepGrad.addColorStop(0, 'rgba(0,212,255,0.12)');
      sweepGrad.addColorStop(0.15, 'rgba(0,212,255,0)');
      sweepGrad.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, sweepAngle, sweepAngle + Math.PI * 0.3);
      ctx.closePath(); ctx.fillStyle = sweepGrad; ctx.fill();

      // Sweep line
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * R, cy + Math.sin(sweepAngle) * R);
      ctx.strokeStyle = 'rgba(0,212,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();

      // Blips
      blips.forEach(b => {
        const angleDiff = ((sweepAngle % (Math.PI * 2)) - b.angle + Math.PI * 4) % (Math.PI * 2);
        if (angleDiff < 0.3) b.alpha = Math.min(1, b.alpha + 0.1);
        else b.alpha = Math.max(0, b.alpha - 0.006);

        if (b.alpha > 0.01) {
          const bx = cx + Math.cos(b.angle) * (R * b.dist);
          const by = cy + Math.sin(b.angle) * (R * b.dist);
          // Glow
          const g = ctx.createRadialGradient(bx, by, 0, bx, by, 8);
          g.addColorStop(0, `rgba(57,255,20,${b.alpha * 0.5})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2);
          ctx.fillStyle = g; ctx.fill();
          // Dot
          ctx.beginPath(); ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(57,255,20,${b.alpha * 0.8})`; ctx.fill();
        }
      });

      // Center dot
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.5)'; ctx.fill();
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
      cg.addColorStop(0, 'rgba(0,212,255,0.15)'); cg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={ref} style={{ width: 220, height: 220, display: 'block', margin: '0 auto' }} />;
}

/* ═══════════════════════════════════════════
   MATRIX RAIN (kept but simplified)
   ═══════════════════════════════════════════ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const chars = 'アイウエオカキクケコ0123456789ABCDEF'; const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(0).map(() => Math.random() * -100);
    let frame: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(3,3,6,0.06)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = Math.random() > 0.97 ? 'rgba(0,212,255,0.4)' : 'rgba(0,212,255,0.04)';
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) drops[i] = 0;
        drops[i] += 0.3 + Math.random() * 0.2;
      }
      frame = requestAnimationFrame(draw);
    }; draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, opacity: 0.3, zIndex: 0 }} />;
}

/* ═══════════════════════════════════════════
   CONTACT SECTION
   ═══════════════════════════════════════════ */
export default function ContactSection() {
  const { navigateTo } = useVoidStore();
  const [step, setStep] = useState<'name' | 'email' | 'message' | 'sending' | 'sent'>('name');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [terminalLines, setTerminalLines] = useState<Array<{ text: string; type: 'system' | 'input' | 'success' | 'error' | 'info' }>>([
    { text: '╔══════════════════════════════════════╗', type: 'system' },
    { text: '║   VOID OS — CONTACT.net v3.0.1        ║', type: 'system' },
    { text: '║   Secure Transmission Protocol       ║', type: 'system' },
    { text: '╚══════════════════════════════════════╝', type: 'system' },
    { text: '', type: 'system' },
    { text: 'Establishing secure channel...', type: 'info' },
    { text: 'Connection established.', type: 'success' },
    { text: '', type: 'system' },
    { text: '> WHO ARE YOU? (Enter your name)', type: 'system' },
  ]);
  const [sendProgress, setSendProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [terminalLines]);
  useEffect(() => { if (step === 'message') textareaRef.current?.focus(); else if (step !== 'sending' && step !== 'sent') inputRef.current?.focus(); }, [step]);

  const addLine = useCallback((text: string, type: 'system' | 'input' | 'success' | 'error' | 'info') => {
    setTerminalLines(prev => [...prev, { text, type }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (step === 'name' && name.trim()) {
      addLine(`  ${name}`, 'input'); addLine('', 'system');
      addLine(`> Hello, ${name}. Your email address?`, 'system'); setStep('email');
    } else if (step === 'email' && email.trim()) {
      if (!email.includes('@')) { addLine('  ERROR: Invalid email format', 'error'); return; }
      addLine(`  ${email}`, 'input'); addLine('', 'system');
      addLine('> Your transmission message:', 'system'); setStep('message');
    } else if (step === 'message' && message.trim()) {
      addLine(`  "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`, 'input');
      addLine('', 'system'); setStep('sending');
      [
        { text: 'Encrypting payload...', type: 'info' as const, delay: 400 },
        { text: 'Routing through subspace relay...', type: 'info' as const, delay: 800 },
        { text: 'Quantum handshake initiated...', type: 'info' as const, delay: 1200 },
        { text: 'Signal locked.', type: 'info' as const, delay: 1800 },
        { text: '', type: 'system' as const, delay: 2000 },
        { text: '✓ TRANSMISSION SUCCESSFUL', type: 'success' as const, delay: 2200 },
        { text: `  Recipient: ${OWNER.name}`, type: 'info' as const, delay: 2400 },
        { text: '  Status: DELIVERED', type: 'success' as const, delay: 2600 },
        { text: '', type: 'system' as const, delay: 2800 },
        { text: `> Thank you, ${name}. I'll respond soon.`, type: 'system' as const, delay: 3000 },
      ].forEach(({ text, type, delay }) => { setTimeout(() => addLine(text, type), delay); });
      let prog = 0;
      const iv = setInterval(() => { prog += 2; setSendProgress(prog); if (prog >= 100) { clearInterval(iv); setTimeout(() => setStep('sent'), 500); } }, 50);
    }
  }, [step, name, email, message, addLine]);

  const lineColor: Record<string, string> = {
    system: 'rgba(232,232,240,0.5)', input: '#00D4FF', success: '#39FF14', error: '#FF3366', info: 'rgba(232,232,240,0.3)',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#030306', overflow: 'hidden', zIndex: 50 }}>
      <MatrixRain />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />

      {/* Process bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(3,3,6,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,51,102,0.08)', padding: '12px 40px', display: 'flex', alignItems: 'center', gap: 16, fontFamily: 'var(--font-mono)' }}>
        <button onClick={() => navigateTo('desktop')} style={{
          background: 'none', border: '1px solid rgba(0,212,255,.15)', padding: '5px 14px',
          fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: '#00D4FF',
          cursor: 'pointer', transition: 'all .2s', borderRadius: 2,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.5)'; e.currentTarget.style.background = 'rgba(0,212,255,.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.15)'; e.currentTarget.style.background = 'none'; }}
        >← DESKTOP</button>
        <div style={{ width: 1, height: 14, background: 'rgba(255,51,102,.12)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF3366', boxShadow: '0 0 8px #FF3366' }} />
        <span style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.35)' }}>VOID_OS</span>
        <span style={{ color: 'rgba(232,232,240,.15)' }}>/</span>
        <span style={{ fontSize: '8px', letterSpacing: '2px', color: '#FF3366', textShadow: '0 0 8px rgba(255,51,102,.3)' }}>CONTACT.net</span>
        <div style={{ marginLeft: 'auto', fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.2)' }}>
          {step === 'sent' ? '✓ TRANSMITTED' : step === 'sending' ? 'TRANSMITTING...' : 'CHANNEL OPEN'}
        </div>
      </div>

      {/* Main layout — split */}
      <div style={{
        position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'center', height: '100vh', padding: '60px 20px 20px',
      }}>
        <div id="contact-split" style={{
          maxWidth: 900, width: '100%',
          display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'center',
        }}>
          <style dangerouslySetInnerHTML={{ __html: '@media(max-width:768px){#contact-split{grid-template-columns:1fr!important;gap:20px!important;}}' }} />

          {/* LEFT — Radar + Info */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            {/* Radar */}
            <div style={{
              padding: 16, border: '1px solid rgba(0,212,255,.08)', background: 'rgba(0,0,0,.2)',
              position: 'relative',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'rgba(232,232,240,.2)', marginBottom: 8, textAlign: 'center' }}>SIGNAL DETECTION</div>
              <RadarCanvas />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.15)', marginTop: 8, textAlign: 'center' }}>VISITOR DETECTED — SECTOR 7G</div>
            </div>

            {/* Quick stats */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'STATUS', value: 'AVAILABLE', color: '#39FF14' },
                { label: 'RESPONSE', value: '< 24 HRS', color: '#FFB800' },
                { label: 'CHANNEL', value: 'ENCRYPTED', color: '#00D4FF' },
              ].map(s => (
                <div key={s.label} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,.04)', background: 'rgba(255,255,255,.015)',
                  fontFamily: 'var(--font-mono)', fontSize: '8px',
                }}>
                  <span style={{ color: 'rgba(232,232,240,.25)', letterSpacing: '1.5px' }}>{s.label}</span>
                  <span style={{ color: s.color, textShadow: `0 0 6px ${s.color}44` }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              {[
                { label: 'EMAIL', href: `mailto:${OWNER.email}` },
                { label: 'GITHUB', href: OWNER.github },
                { label: 'LINKEDIN', href: OWNER.linkedin },
              ].map((link, i) => (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                  flex: 1, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '7px',
                  letterSpacing: '1.5px', color: 'rgba(232,232,240,.3)', padding: '8px 6px',
                  border: '1px solid rgba(255,255,255,.05)', transition: 'all .2s', textDecoration: 'none',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,.3)'; e.currentTarget.style.color = '#00D4FF'; e.currentTarget.style.background = 'rgba(0,212,255,.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(232,232,240,.3)'; e.currentTarget.style.background = 'transparent'; }}
                >{link.label}</a>
              ))}
            </div>
          </div>

          {/* RIGHT — Terminal */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', color: '#FF3366', textShadow: '0 0 10px rgba(255,51,102,.3)', marginBottom: 8 }}>05 // CONTACT.net</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(24px,3vw,36px)', color: '#E8E8F0', marginBottom: 4 }}>
                Send a <span style={{ color: '#00D4FF', textShadow: '0 0 15px rgba(0,212,255,.3)' }}>Transmission</span>
              </h2>
            </div>

            {/* Terminal */}
            <div style={{
              background: 'rgba(3,3,6,0.95)', border: '1px solid rgba(0,212,255,0.12)',
              overflow: 'hidden', backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(0,212,255,0.03), inset 0 0 30px rgba(0,0,0,0.3)',
            }}>
              {/* Title bar */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3366' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFB800' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#39FF14' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,.3)', letterSpacing: '1px', flex: 1 }}>CONTACT.net — Secure Terminal</span>
                {/* Signal bars + availability dot */}
                <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', marginRight: 8 }}>
                  {[6, 9, 12, 15, 12].map((h, i) => (
                    <div key={i} style={{ width: 2, height: h, background: i < 4 ? 'rgba(57,255,20,0.4)' : 'rgba(255,255,255,0.1)', borderRadius: 1 }} />
                  ))}
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 6px rgba(57,255,20,0.5)' }} />
                </div>
              </div>

              {/* Output */}
              <div ref={scrollRef} style={{ padding: 16, fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.9, maxHeight: 300, overflowY: 'auto' }}>
                {terminalLines.map((line, i) => (
                  <div key={i} style={{ color: lineColor[line.type] || 'rgba(232,232,240,.3)', animation: 'fadeIn 0.15s ease', fontWeight: line.type === 'success' ? 600 : 400 }}>
                    {line.text || '\u00A0'}
                  </div>
                ))}
                {step === 'sending' && sendProgress < 100 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${sendProgress}%`, background: 'linear-gradient(90deg, #00D4FF, #39FF14)', transition: 'width 0.05s', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }} />
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,.3)', marginTop: 4 }}>TRANSMITTING... {sendProgress}%</div>
                  </div>
                )}
              </div>

              {/* Input */}
              {step !== 'sending' && step !== 'sent' && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#39FF14' }}>❯</span>
                  {step === 'message' ? (
                    <textarea
                      ref={textareaRef} value={message} onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                      placeholder="Type your message..." rows={2}
                      style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#E8E8F0', caretColor: '#00D4FF', resize: 'none', lineHeight: 1.6, background: 'transparent', border: 'none', outline: 'none' }}
                    />
                  ) : (
                    <input
                      ref={inputRef} value={step === 'name' ? name : email}
                      onChange={e => step === 'name' ? setName(e.target.value) : setEmail(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                      placeholder={step === 'name' ? 'Your name...' : 'your@email.com'}
                      style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#E8E8F0', caretColor: '#00D4FF', background: 'transparent', border: 'none', outline: 'none' }}
                    />
                  )}
                  <button onClick={handleSubmit} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#00D4FF', cursor: 'pointer', padding: '6px 14px',
                    border: '1px solid rgba(0,212,255,0.15)', background: 'transparent', transition: 'all 0.2s', letterSpacing: '1px',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; }}
                  >ENTER</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

/* ============================================
   MATRIX RAIN — canvas background
   ============================================ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array(columns).fill(0).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(3, 3, 6, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const isHead = Math.random() > 0.97;
        ctx.fillStyle = isHead ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 212, 255, 0.06)';
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.3 + Math.random() * 0.3;
      }
    };

    const interval = setInterval(draw, 50);
    return () => { clearInterval(interval); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />;
}

/* ============================================
   CONTACT SECTION
   ============================================ */
export default function ContactSection() {
  const { navigateTo } = useVoidStore();
  const [step, setStep] = useState<'name' | 'email' | 'message' | 'sending' | 'sent'>('name');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [terminalLines, setTerminalLines] = useState<Array<{ text: string; type: 'system' | 'input' | 'success' | 'error' | 'info' }>>([
    { text: '╔══════════════════════════════════════╗', type: 'system' },
    { text: '║   VOID OS — CONTACT.net v2045.1      ║', type: 'system' },
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
  const backRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (headerRef.current) tl.fromTo(headerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.1);
    if (terminalRef.current) tl.fromTo(terminalRef.current, { opacity: 0, y: 30, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }, 0.25);
    if (linksRef.current) tl.fromTo(linksRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.6);
    return () => { tl.kill(); };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [terminalLines]);

  // Auto-focus
  useEffect(() => {
    if (step === 'message') textareaRef.current?.focus();
    else if (step !== 'sending' && step !== 'sent') inputRef.current?.focus();
  }, [step]);

  const addLine = useCallback((text: string, type: 'system' | 'input' | 'success' | 'error' | 'info') => {
    setTerminalLines(prev => [...prev, { text, type }]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (step === 'name' && name.trim()) {
      addLine(`  ${name}`, 'input');
      addLine('', 'system');
      addLine(`> Hello, ${name}. Your email address?`, 'system');
      setStep('email');
    } else if (step === 'email' && email.trim()) {
      if (!email.includes('@')) { addLine('  ERROR: Invalid email format', 'error'); return; }
      addLine(`  ${email}`, 'input');
      addLine('', 'system');
      addLine('> Your transmission message:', 'system');
      setStep('message');
    } else if (step === 'message' && message.trim()) {
      addLine(`  "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`, 'input');
      addLine('', 'system');
      setStep('sending');

      // Transmission animation
      const stages = [
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
      ];

      stages.forEach(({ text, type, delay }) => {
        setTimeout(() => addLine(text, type), delay);
      });

      // Progress bar
      let prog = 0;
      const interval = setInterval(() => {
        prog += 2;
        setSendProgress(prog);
        if (prog >= 100) { clearInterval(interval); setTimeout(() => setStep('sent'), 500); }
      }, 50);
    }
  }, [step, name, email, message, addLine]);

  const getLineColor = (type: string) => {
    switch (type) {
      case 'system': return 'rgba(232,232,240,0.5)';
      case 'input': return '#00D4FF';
      case 'success': return '#39FF14';
      case 'error': return '#FF3366';
      case 'info': return 'rgba(232,232,240,0.3)';
      default: return 'var(--text-dim)';
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#030306',
      overflow: 'hidden', zIndex: 50,
    }}>
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      {/* Matrix rain background */}
      <MatrixRain />

      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', padding: '20px',
      }}>
        <div style={{
          maxWidth: '700px', width: '100%',
        }}>
          {/* Header */}
          <div ref={headerRef} style={{ marginBottom: '20px', opacity: 0 }}>
            <div className="section-label">05 // CONTACT.net</div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: '4px',
            }}>
              Send a <span className="glow-text-blue">Transmission</span>
            </h2>
          </div>

          {/* Terminal Window */}
          <div ref={terminalRef} style={{
            background: 'rgba(3,3,6,0.95)',
            border: '1px solid rgba(0,212,255,0.1)',
            borderRadius: '4px', overflow: 'hidden',
            backdropFilter: 'blur(20px)', opacity: 0,
          }}>
            {/* Title bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.02)',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3366' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FFB800' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#39FF14' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                CONTACT.net — Secure Terminal
              </span>
            </div>

            {/* Terminal output */}
            <div ref={scrollRef} style={{
              padding: '16px', fontFamily: 'var(--font-mono)', fontSize: '12px',
              lineHeight: 1.9, maxHeight: '340px', overflowY: 'auto',
            }}>
              {terminalLines.map((line, i) => (
                <div key={i} style={{
                  color: getLineColor(line.type),
                  animation: 'fadeIn 0.15s ease',
                  fontWeight: line.type === 'success' ? 600 : 400,
                }}>
                  {line.text || '\u00A0'}
                </div>
              ))}

              {/* Sending progress bar */}
              {step === 'sending' && sendProgress < 100 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{
                    height: '3px', background: 'rgba(255,255,255,0.04)',
                    borderRadius: '1px', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', width: `${sendProgress}%`,
                      background: 'linear-gradient(90deg, #00D4FF, #39FF14)',
                      transition: 'width 0.05s linear',
                      boxShadow: '0 0 8px rgba(0,212,255,0.4)',
                    }} />
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px',
                    color: 'var(--text-muted)', marginTop: '4px',
                  }}>
                    TRANSMITTING... {sendProgress}%
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            {step !== 'sending' && step !== 'sent' && (
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--green)' }}>❯</span>
                {step === 'message' ? (
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                    placeholder="Type your message..."
                    rows={2}
                    style={{
                      flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px',
                      color: 'var(--white)', caretColor: 'var(--blue)',
                      resize: 'none', lineHeight: 1.6,
                    }}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    value={step === 'name' ? name : email}
                    onChange={e => step === 'name' ? setName(e.target.value) : setEmail(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder={step === 'name' ? 'Your name...' : 'your@email.com'}
                    style={{
                      flex: 1, fontFamily: 'var(--font-mono)', fontSize: '12px',
                      color: 'var(--white)', caretColor: 'var(--blue)',
                    }}
                  />
                )}
                <button onClick={handleSubmit} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px',
                  color: 'var(--blue)', cursor: 'pointer', padding: '6px 12px',
                  borderRadius: '2px', border: '1px solid rgba(0,212,255,0.15)',
                  background: 'transparent', transition: 'all 0.2s',
                  letterSpacing: '1px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  ENTER
                </button>
              </div>
            )}
          </div>

          {/* Direct contact links */}
          <div ref={linksRef} style={{
            display: 'flex', gap: '16px', marginTop: '20px', justifyContent: 'center', opacity: 0,
          }}>
            {[
              { label: 'EMAIL', value: OWNER.email, href: `mailto:${OWNER.email}` },
              { label: 'GITHUB', value: 'GitHub', href: OWNER.github },
              { label: 'LINKEDIN', value: 'LinkedIn', href: OWNER.linkedin },
            ].map((link, i) => (
              <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                color: 'var(--text-muted)', letterSpacing: '1px',
                padding: '6px 12px', borderRadius: '2px',
                border: '1px solid rgba(255,255,255,0.04)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.color = 'var(--blue)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />
    </div>
  );
}

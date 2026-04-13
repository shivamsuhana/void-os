'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TERMINAL_COMMANDS, OWNER } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';
import OSWindowFrame from '@/components/global/OSWindowFrame';

type LabTab = 'music' | 'particles' | 'terminal';

/* ============================================
   VOICE-REACTIVE CIRCULAR SPECTRUM ANALYZER
   Real microphone input via Web Audio API
   128 radial bars, center orb, particles, waveform ring
   ============================================ */
function MusicVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [micState, setMicState] = useState<'idle' | 'listening' | 'denied'>('idle');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const activateMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicState('listening');
    } catch { setMicState('denied'); }
  }, []);

  const deactivateMic = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setMicState('idle');
  }, []);

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  // Speech recognition
  useEffect(() => {
    if (micState !== 'listening') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SR as any)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      try {
        const last = e.results[e.results.length - 1];
        if (last?.isFinal && last[0]?.transcript) {
          const text = last[0].transcript.trim();
          if (text) setTranscript(prev => [...prev.slice(-8), text]);
        }
      } catch {}
    };
    recognition.onerror = () => {};
    recognition.onend = () => {
      if (micState === 'listening') try { recognition.start(); } catch {}
    };
    try { recognition.start(); } catch {}
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch {} };
  }, [micState]);


  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth * 2; canvas.height = canvas.offsetHeight * 2; };
    resize(); window.addEventListener('resize', resize);

    const BARS = 128;
    const smoothed = new Float32Array(BARS);
    const particles: { a: number; r: number; speed: number; life: number; maxLife: number; hue: number; size: number }[] = [];
    let t = 0; let frame: number;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height };
    };
    canvas.addEventListener('mousemove', onMove);

    const animate = () => {
      t += 0.012;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.4;

      // Trail fade
      ctx.fillStyle = 'rgba(3,3,6,0.12)'; ctx.fillRect(0, 0, W, H);

      // Get frequency data
      const freqData = new Uint8Array(BARS);
      const timeData = new Uint8Array(BARS);
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(freqData);
        analyserRef.current.getByteTimeDomainData(timeData);
      } else {
        // Procedural fallback
        for (let i = 0; i < BARS; i++) {
          const f = i / BARS;
          freqData[i] = Math.floor(
            (Math.sin(t * 1.8 + i * 0.15) * 0.3 + Math.sin(t * 3.2 + i * 0.08) * 0.2 + 0.35 +
             (f < 0.2 ? Math.sin(t * 2.5) * 0.25 : 0) + Math.random() * 0.06) * 255
          );
          timeData[i] = 128 + Math.sin(t * 4 + i * 0.2) * 40;
        }
      }

      // Smooth the data
      for (let i = 0; i < BARS; i++) {
        const target = freqData[i] / 255;
        smoothed[i] = smoothed[i] * 0.7 + target * 0.3;
      }

      // Bass / mid / high energy
      let bass = 0, mid = 0, high = 0;
      for (let i = 0; i < BARS; i++) {
        if (i < BARS * 0.15) bass += smoothed[i];
        else if (i < BARS * 0.5) mid += smoothed[i];
        else high += smoothed[i];
      }
      bass /= BARS * 0.15; mid /= BARS * 0.35; high /= BARS * 0.5;

      // Spawn particles on bass hits
      if (bass > 0.45 && Math.random() > 0.4 && particles.length < 60) {
        particles.push({
          a: Math.random() * Math.PI * 2, r: 0.3 + Math.random() * 0.2,
          speed: 0.002 + Math.random() * 0.004, life: 1, maxLife: 1,
          hue: 180 + Math.random() * 140, size: 1 + Math.random() * 2.5,
        });
      }

      // ── CONCENTRIC GUIDE RINGS ──
      [0.25, 0.5, 0.75, 1.0].forEach((s, ri) => {
        ctx.beginPath(); ctx.arc(cx, cy, maxR * s, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,212,255,${0.03 + ri * 0.008 + bass * 0.02})`;
        ctx.lineWidth = 0.6; ctx.stroke();
      });

      // ── RADIAL SPECTRUM BARS ──
      for (let i = 0; i < BARS; i++) {
        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const val = smoothed[i];
        const innerR = maxR * 0.22;
        const outerR = innerR + val * maxR * 0.7;
        const hue = 180 + (i / BARS) * 150;

        const x1 = cx + Math.cos(angle) * innerR, y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR, y2 = cy + Math.sin(angle) * outerR;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `hsla(${hue},100%,50%,0.05)`);
        grad.addColorStop(0.4, `hsla(${hue},100%,60%,${0.4 + val * 0.5})`);
        grad.addColorStop(1, `hsla(${hue},90%,70%,${0.2 + val * 0.6})`);

        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.max(1.5, (W / BARS) * 0.35);
        ctx.lineCap = 'round';
        if (val > 0.5) { ctx.shadowColor = `hsla(${hue},100%,60%,0.6)`; ctx.shadowBlur = 8; }
        ctx.stroke(); ctx.shadowBlur = 0;

        // Tip glow dot
        if (val > 0.35) {
          ctx.beginPath(); ctx.arc(x2, y2, 1.5 + val * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue},100%,80%,${val * 0.5})`; ctx.fill();
        }
      }

      // ── WAVEFORM RING (time-domain) ──
      ctx.beginPath();
      for (let i = 0; i <= BARS; i++) {
        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const wave = ((timeData[i % BARS] - 128) / 128) * maxR * 0.1;
        const r = maxR * 0.92 + wave;
        const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(123,47,255,${0.12 + bass * 0.2})`;
      ctx.lineWidth = 1.5; ctx.shadowColor = '#7B2FFF'; ctx.shadowBlur = 6;
      ctx.stroke(); ctx.shadowBlur = 0;

      // ── ORBITING PARTICLES ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.a += p.speed * (1 + bass * 3);
        p.life -= 0.004;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const alpha = p.life / p.maxLife;
        const px = cx + Math.cos(p.a) * maxR * p.r;
        const py = cy + Math.sin(p.a) * maxR * p.r;
        ctx.beginPath(); ctx.arc(px, py, p.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,65%,${alpha * 0.55})`;
        ctx.shadowColor = `hsla(${p.hue},100%,65%,0.4)`; ctx.shadowBlur = 5;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      // ── CENTER PULSE ORB ──
      const pulseR = maxR * 0.17 + bass * maxR * 0.08;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
      coreGrad.addColorStop(0, `rgba(123,47,255,${0.35 + bass * 0.4})`);
      coreGrad.addColorStop(0.6, `rgba(0,212,255,${0.12 + mid * 0.15})`);
      coreGrad.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad; ctx.fill();

      // Core dot
      ctx.beginPath(); ctx.arc(cx, cy, 3 + bass * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,232,240,${0.5 + bass * 0.4})`;
      ctx.shadowColor = '#7B2FFF'; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;

      // ── EXPANDING BEAT RINGS (multiple) ──
      if (bass > 0.45) {
        const ringColors = ['rgba(0,212,255,', 'rgba(123,47,255,', 'rgba(57,255,20,'];
        const speeds = [2.5, 3.2, 1.8];
        for (let r = 0; r < 3; r++) {
          const ringPhase = (t * speeds[r] + r * 0.3) % 1;
          const ringR = maxR * (0.2 + ringPhase * 0.85);
          ctx.beginPath(); ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `${ringColors[r]}${((1 - ringPhase) * 0.15).toFixed(3)})`;
          ctx.lineWidth = 2 - ringPhase * 1.5; ctx.stroke();
        }
      }

      // ── ROTATING DASH RING ──
      const segs = 32;
      for (let i = 0; i < segs; i++) {
        const a1 = (i / segs) * Math.PI * 2 + t * (micState === 'listening' ? 1.2 : 0.3);
        const a2 = a1 + (Math.PI * 2 / segs) * 0.35;
        ctx.beginPath(); ctx.arc(cx, cy, maxR * 0.97, a1, a2);
        ctx.strokeStyle = `rgba(0,212,255,${0.06 + high * 0.12})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      // ── FREQUENCY LABEL at center ──
      const dominant = bass > mid && bass > high ? 'BASS' : mid > high ? 'MIDS' : high > 0.3 ? 'TREBLE' : 'HIGH';
      const domColor = dominant === 'BASS' ? '#FF3366' : dominant === 'MIDS' ? '#7B2FFF' : dominant === 'TREBLE' ? '#FFB800' : '#00D4FF';
      ctx.font = `bold ${10}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = `${domColor}66`;
      ctx.fillText(dominant, cx, cy + pulseR + 18);

      // ── MOUSE REACTIVE GLOW ──
      const mx = mouseRef.current.x * W, my = mouseRef.current.y * H;
      const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, maxR * 0.35);
      mouseGrad.addColorStop(0, 'rgba(0,212,255,0.04)');
      mouseGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGrad; ctx.fillRect(0, 0, W, H);

      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(frame); canvas.removeEventListener('mousemove', onMove); window.removeEventListener('resize', resize); };
  }, [micState]);



  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '360px', display: 'block', cursor: 'crosshair' }} />

      {/* Speech transcript display */}
      {transcript.length > 0 && (
        <div style={{
          margin: '8px 0', padding: '8px 12px', maxHeight: 60, overflowY: 'auto',
          background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)',
          borderLeft: '2px solid rgba(0,212,255,0.3)',
        }}>
          {transcript.map((line, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: '9px', color: `rgba(0,212,255,${0.3 + (i / transcript.length) * 0.5})`,
              letterSpacing: '1px', lineHeight: 1.8,
              textShadow: i === transcript.length - 1 ? '0 0 6px rgba(0,212,255,0.3)' : 'none',
            }}>
              <span style={{ color: 'rgba(232,232,240,0.2)', marginRight: 6 }}>{'>'}</span>
              {line.toUpperCase()}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, padding: '0 4px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
          ♫ {micState === 'listening' ? 'LIVE MICROPHONE · 128 BANDS' : 'PROCEDURAL MODE · 128 BANDS'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {micState === 'listening' && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#FF3366', animation: 'glowPulse 1s infinite', boxShadow: '0 0 8px #FF3366' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: '#FF3366', letterSpacing: '1px' }}>REC</span>
            </div>
          )}
          {micState === 'listening' ? (
            <button onClick={deactivateMic} style={{
              fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px',
              padding: '5px 12px', cursor: 'pointer',
              background: 'rgba(255,51,102,0.08)',
              border: '1px solid rgba(255,51,102,0.3)',
              color: '#FF3366', transition: 'all 0.3s',
            }}>■ STOP MIC</button>
          ) : (
            <button onClick={activateMic} disabled={micState === 'denied'} style={{
              fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px',
              padding: '5px 12px', cursor: micState === 'denied' ? 'default' : 'pointer',
              background: micState === 'denied' ? 'rgba(255,51,102,0.08)' : 'rgba(0,212,255,0.08)',
              border: `1px solid ${micState === 'denied' ? 'rgba(255,51,102,0.25)' : 'rgba(0,212,255,0.25)'}`,
              color: micState === 'denied' ? '#FF3366' : '#00D4FF',
              transition: 'all 0.3s',
            }}>
              {micState === 'idle' ? '🎙 ACTIVATE MIC' : '✕ MIC DENIED'}
            </button>
          )}
        </div>
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
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', color: '#39FF14', textShadow: '0 0 10px rgba(57,255,20,.4)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            06 // LAB.beta
            <span style={{ fontSize: '7px', padding: '2px 8px', border: '1px solid rgba(57,255,20,0.2)', color: 'rgba(57,255,20,0.6)', letterSpacing: '1.5px' }}>EXPERIMENTAL</span>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '10px', lineHeight: 1.1,
          }}>
            The <span style={{ color: '#39FF14', textShadow: '0 0 25px rgba(57,255,20,.4), 0 0 50px rgba(57,255,20,.15)' }}>Experiments</span>
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(232,232,240,0.5)', maxWidth: '420px', lineHeight: 1.8,
          }}>
            Playground for creative coding, generative art, and things that glow.
          </p>
        </div>

        {/* Tabs */}
        <div ref={tabsRef} style={{
          display: 'flex', gap: '6px', marginBottom: '28px', justifyContent: 'center',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '9px 18px', borderRadius: '0px',
                  fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1.5px',
                  background: isActive ? 'rgba(57,255,20,0.06)' : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${isActive ? 'rgba(57,255,20,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderLeft: isActive ? '2px solid #39FF14' : '1px solid rgba(255,255,255,0.06)',
                  color: isActive ? '#39FF14' : 'rgba(232,232,240,0.4)',
                  transition: 'all 0.25s', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  boxShadow: isActive ? '0 0 12px rgba(57,255,20,0.08)' : 'none',
                  textShadow: isActive ? '0 0 8px rgba(57,255,20,0.3)' : 'none',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(57,255,20,0.15)'; e.currentTarget.style.color = 'rgba(232,232,240,0.65)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(232,232,240,0.4)'; }}}
              >
                <span style={{ fontSize: '11px' }}>{tab.icon}</span> {tab.label}
              </button>
            );
          })}
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

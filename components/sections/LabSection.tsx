'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { TERMINAL_COMMANDS, OWNER } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';
import OSWindowFrame from '@/components/global/OSWindowFrame';

type LabTab = 'music' | 'particles' | 'terminal' | 'voice' | 'matrix';


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
   VOICE RECOGNITION — Web Speech API + real waveform
   ============================================ */
function VoiceRecognition() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'matched' | 'error'>('idle');
  const [commandLog, setCommandLog] = useState<Array<{ text: string; color: string; time: string }>>([
    { text: '> VOICE.sys v2045.1 — NEURAL INTERFACE READY', color: '#39FF14', time: new Date().toLocaleTimeString() },
    { text: '  Say a command to navigate the OS...', color: 'rgba(232,232,240,0.35)', time: '' },
  ]);
  const [volume, setVolume] = useState(0);

  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const ringCanvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const waveAnimRef = useRef<number>(0);
  const ringAnimRef = useRef<number>(0);
  const volRef = useRef(0);
  const listeningRef = useRef(false); // avoid stale closure
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const { navigateTo } = useVoidStore();

  const VOC_COMMANDS: Record<string, { action: () => void; label: string; color: string }> = {
    work: { action: () => navigateTo('work'), label: '→ Navigating to WORK.db', color: '#7B2FFF' },
    skills: { action: () => navigateTo('skills'), label: '→ Navigating to SKILLS.sys', color: '#FFB800' },
    about: { action: () => navigateTo('about'), label: '→ Navigating to ABOUT.exe', color: '#00D4FF' },
    contact: { action: () => navigateTo('contact'), label: '→ Navigating to CONTACT.net', color: '#FF3B5C' },
    timeline: { action: () => navigateTo('timeline'), label: '→ Navigating to TIME.log', color: '#39FF14' },
    time: { action: () => navigateTo('timeline'), label: '→ Navigating to TIME.log', color: '#39FF14' },
    desktop: { action: () => navigateTo('desktop'), label: '→ Returning to Desktop', color: '#00D4FF' },
    home: { action: () => navigateTo('desktop'), label: '→ Returning to Desktop', color: '#00D4FF' },
    lab: { action: () => {}, label: '⬡ Already in LAB.beta', color: '#39FF14' },
  };

  const addLog = useCallback((text: string, color: string) => {
    setCommandLog(prev => [...prev.slice(-10), { text, color, time: new Date().toLocaleTimeString() }]);
  }, []);

  // ==== WAVEFORM CANVAS ====
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = 70 * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const W = () => canvas.getBoundingClientRect().width;
    const H = 70;
    const histLen = 80;
    const history = new Array(histLen).fill(0);
    let t = 0;

    const draw = () => {
      t += 0.05;
      const vol = volRef.current;
      const isListening = listeningRef.current;

      // Get real analyser data if available
      let rmsVol = vol;
      if (analyserRef.current && isListening) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += ((data[i] - 128) / 128) ** 2;
        rmsVol = Math.sqrt(sum / data.length);
      }

      history.shift();
      history.push(isListening ? rmsVol + Math.random() * 0.05 : 0);

      const w = W();
      ctx.clearRect(0, 0, w, H);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(57,255,20,0.04)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += w / 8) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(w, H / 2); ctx.stroke();

      if (isListening) {
        // Multi-layer waveform — 3 waves at different frequencies
        const layers = [
          { freq: 1.0, amp: 1.0, color: 'rgba(57,255,20,0.8)', width: 2 },
          { freq: 2.3, amp: 0.5, color: 'rgba(57,255,20,0.4)', width: 1 },
          { freq: 0.5, amp: 0.3, color: 'rgba(0,212,255,0.3)', width: 1 },
        ];

        layers.forEach(layer => {
          ctx.beginPath();
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = layer.width;
          ctx.shadowColor = '#39FF14';
          ctx.shadowBlur = rmsVol * 15;

          for (let i = 0; i < histLen; i++) {
            const x = (i / histLen) * w;
            const h = history[i];
            const sin = Math.sin(t * layer.freq * 3 + i * 0.3) * h * 25 * layer.amp;
            const y = H / 2 + sin;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Frequency bars at bottom
        ctx.shadowBlur = 0;
        const barCount = 24;
        const barW = (w - barCount) / barCount;
        for (let i = 0; i < barCount; i++) {
          const barH = (Math.sin(t * 2 + i * 0.4) * 0.5 + 0.5) * rmsVol * 18 + Math.random() * rmsVol * 8;
          const x = i * (barW + 1);
          const hue = 110 + i * 3;
          ctx.fillStyle = `hsla(${hue}, 100%, 55%, 0.6)`;
          ctx.fillRect(x, H - barH - 2, barW, barH);
        }

      } else {
        // Idle — pulsing flat line
        const pulse = (Math.sin(t * 0.6) * 0.5 + 0.5) * 0.15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(57,255,20,${0.1 + pulse})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.moveTo(0, H / 2); ctx.lineTo(w, H / 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Center label
        ctx.fillStyle = `rgba(57,255,20,${0.2 + pulse})`;
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('— AWAITING VOICE INPUT —', w / 2, H / 2 - 8);
        ctx.textAlign = 'left';
      }

      waveAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(waveAnimRef.current);
  }, []); // runs once, reads from refs

  // ==== RING CANVAS (mic circle visualizer) ====
  useEffect(() => {
    const canvas = ringCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const S = 160;
    canvas.width = S; canvas.height = S;
    let t = 0;

    const draw = () => {
      t += 0.04;
      const vol = volRef.current;
      const isListening = listeningRef.current;
      const cx = S / 2, cy = S / 2;

      ctx.clearRect(0, 0, S, S);

      if (isListening) {
        // Outer pulsing rings
        [3, 2, 1].forEach(i => {
          const r = 55 + i * 15 + Math.sin(t * 2 + i) * vol * 12;
          const alpha = (0.3 - i * 0.08) * (0.5 + vol * 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(57,255,20,${alpha})`;
          ctx.lineWidth = 1;
          ctx.shadowColor = '#39FF14';
          ctx.shadowBlur = vol * 20;
          ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Frequency arc segments
        const segs = 32;
        for (let i = 0; i < segs; i++) {
          const angle = (i / segs) * Math.PI * 2 - Math.PI / 2;
          const r1 = 42;
          const r2 = r1 + 8 + Math.sin(t * 3 + i * 0.4) * vol * 20 + Math.random() * vol * 10;
          const x1 = cx + Math.cos(angle) * r1;
          const y1 = cy + Math.sin(angle) * r1;
          const x2 = cx + Math.cos(angle) * r2;
          const y2 = cy + Math.sin(angle) * r2;
          ctx.beginPath();
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(57,255,20,${0.5 + vol * 0.5})`;
          ctx.lineWidth = 2;
          ctx.shadowColor = '#39FF14'; ctx.shadowBlur = vol * 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      } else {
        // Idle rings
        [1, 2].forEach(i => {
          const r = 45 + i * 12 + Math.sin(t * 0.8 + i) * 3;
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(57,255,20,${0.1 - i * 0.03})`;
          ctx.lineWidth = 1; ctx.stroke();
        });
      }

      // Core circle
      const coreR = 36;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      grad.addColorStop(0, isListening ? `rgba(57,255,20,${0.3 + vol * 0.4})` : 'rgba(57,255,20,0.06)');
      grad.addColorStop(1, 'rgba(57,255,20,0.02)');
      ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.strokeStyle = isListening ? `rgba(57,255,20,${0.6 + vol * 0.4})` : 'rgba(57,255,20,0.2)';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#39FF14';
      ctx.shadowBlur = isListening ? 10 + vol * 20 : 4;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ringAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(ringAnimRef.current);
  }, []);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setStatus('error');
      addLog('✕ Use Chrome — Web Speech API required', '#FF3B5C');
      return;
    }

    // Try to get real mic audio for visualizer
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const ac = new AudioContext();
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        const src = ac.createMediaStreamSource(stream);
        src.connect(analyser);
        audioCtxRef.current = ac;
        analyserRef.current = analyser;
      }).catch(() => {
        // fallback to simulated
      });
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      listeningRef.current = true;
      setListening(true); setStatus('listening');
      setTranscript(''); setInterimText('');
      addLog('● Microphone ACTIVE — speak a command', '#39FF14');
      // Simulated vol for fallback
      const iv = setInterval(() => {
        const v = 0.3 + Math.random() * 0.7;
        volRef.current = v; setVolume(v);
      }, 80);
      (recognition as any)._iv = iv;
    };

    recognition.onresult = (e: any) => {
      const result = e.results[e.results.length - 1];
      const text = result[0].transcript.toLowerCase().trim();
      if (result.isFinal) {
        setTranscript(text); setInterimText('');
        setStatus('processing');
        addLog(`◉ Heard: "${text}"`, '#00D4FF');
        const matched = Object.keys(VOC_COMMANDS).find(cmd => text.includes(cmd));
        if (matched) {
          setTimeout(() => {
            addLog(VOC_COMMANDS[matched].label, VOC_COMMANDS[matched].color);
            setStatus('matched');
            if (matched !== 'lab') VOC_COMMANDS[matched].action();
          }, 500);
        } else {
          addLog(`◌ Unrecognized: "${text}"`, 'rgba(232,232,240,0.35)');
          setStatus('idle');
        }
      } else {
        setInterimText(text);
      }
    };

    recognition.onerror = (e: any) => {
      clearInterval((recognition as any)._iv);
      listeningRef.current = false; volRef.current = 0;
      setListening(false); setStatus('error');
      addLog(`✕ ${e.error === 'not-allowed' ? 'Mic permission denied' : `Error: ${e.error}`}`, '#FF3B5C');
    };

    recognition.onend = () => {
      clearInterval((recognition as any)._iv);
      listeningRef.current = false; volRef.current = 0; setVolume(0);
      setListening(false);
      setInterimText('');
      if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; analyserRef.current = null; }
      setStatus(prev => prev === 'processing' || prev === 'matched' ? prev : 'idle');
    };

    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    listeningRef.current = false; volRef.current = 0;
  };

  const stColor = { idle: '#39FF14', listening: '#39FF14', processing: '#FFB800', matched: '#00D4FF', error: '#FF3B5C' }[status];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Top section: ring + status */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>

        {/* Ring visualizer */}
        <div style={{ position: 'relative', width: 160, height: 160, cursor: 'pointer', flexShrink: 0 }}
          onClick={listening ? stopListening : startListening}>
          <canvas ref={ringCanvasRef} style={{ width: 160, height: 160, display: 'block' }} />
          {/* Center mic icon */}
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: 2,
          }}>
            <span style={{
              fontSize: '28px', lineHeight: 1,
              filter: `drop-shadow(0 0 ${listening ? 16 : 6}px rgba(57,255,20,${listening ? 0.9 : 0.4}))`,
              transition: 'filter 0.3s',
            }}>{listening ? '🎙️' : '🎤'}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: stColor, letterSpacing: '1.5px', textShadow: `0 0 8px ${stColor}80` }}>
              {listening ? 'ACTIVE' : 'CLICK'}
            </span>
          </div>
        </div>

        {/* Status panel */}
        <div style={{ flex: 1, maxWidth: 260 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '3px', color: stColor, textShadow: `0 0 12px ${stColor}`, marginBottom: 6 }}>
            ◈ [{status.toUpperCase().padEnd(10)}]
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '20px', marginBottom: 6, color: listening ? '#39FF14' : '#E8E8F0', textShadow: listening ? '0 0 20px rgba(57,255,20,0.5)' : 'none', transition: 'all 0.4s' }}>
            {listening ? 'LISTENING...' : status === 'processing' ? 'PROCESSING...' : status === 'matched' ? 'MATCHED!' : 'VOICE CTRL'}
          </div>
          {(transcript || interimText) && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: 8, padding: '6px 10px', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.05)' }}>
              <span style={{ color: '#00D4FF' }}>"{transcript || interimText}"</span>
              {interimText && !transcript && <span style={{ color: 'rgba(232,232,240,0.3)', fontSize: '9px', marginLeft: 6 }}>interim...</span>}
            </div>
          )}
          <button onClick={listening ? stopListening : startListening} style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px',
            padding: '8px 20px', cursor: 'pointer', transition: 'all 0.3s',
            background: listening ? 'rgba(255,51,102,0.15)' : 'rgba(57,255,20,0.1)',
            border: `1px solid ${listening ? 'rgba(255,51,102,0.5)' : 'rgba(57,255,20,0.4)'}`,
            color: listening ? '#FF3B5C' : '#39FF14',
            boxShadow: listening ? '0 0 16px rgba(255,51,102,0.3)' : '0 0 12px rgba(57,255,20,0.2)',
          }}>
            {listening ? '⬛ STOP LISTENING' : '⬤ START LISTENING'}
          </button>

          {/* Volume bar */}
          {listening && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: '7px', color: 'rgba(57,255,20,0.4)', letterSpacing: '2px', marginBottom: 4 }}>INPUT LEVEL</div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(volume * 100, 100)}%`, background: 'linear-gradient(90deg, #39FF14, #00D4FF)', transition: 'width 0.08s', boxShadow: '0 0 8px rgba(57,255,20,0.8)' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Waveform */}
      <div style={{ background: 'rgba(3,3,6,0.6)', border: '1px solid rgba(57,255,20,0.12)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ padding: '6px 12px 4px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(57,255,20,0.06)' }}>
          <span style={{ fontSize: '7px', letterSpacing: '2px', color: 'rgba(57,255,20,0.4)' }}>NEURAL AUDIO WAVEFORM</span>
          <span style={{ fontSize: '7px', color: stColor, letterSpacing: '1px' }}>{listening ? `${Math.round(volume * 100)}% INPUT` : 'STANDBY'}</span>
        </div>
        <canvas ref={waveCanvasRef} style={{ width: '100%', height: '70px', display: 'block' }} />
      </div>

      {/* Command log */}
      <div style={{ background: 'rgba(3,3,6,0.7)', border: '1px solid rgba(57,255,20,0.1)', padding: '10px 14px', borderRadius: 2, maxHeight: 120, overflowY: 'auto' }}>
        <div style={{ fontSize: '7px', letterSpacing: '2.5px', color: 'rgba(57,255,20,0.4)', marginBottom: 8 }}>COMMAND LOG</div>
        {commandLog.map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 3, animation: i === commandLog.length - 1 ? 'fadeIn 0.2s ease' : 'none' }}>
            {l.time && <span style={{ fontSize: '8px', color: 'rgba(232,232,240,0.2)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>{l.time}</span>}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: l.color, lineHeight: 1.5 }}>{l.text}</span>
          </div>
        ))}
      </div>

      {/* Commands ref */}
      <div style={{ padding: '10px 14px', border: '1px solid rgba(57,255,20,0.07)', background: 'rgba(3,3,6,0.4)', borderRadius: 2 }}>
        <div style={{ fontSize: '7px', letterSpacing: '2px', color: 'rgba(57,255,20,0.3)', marginBottom: 8 }}>AVAILABLE COMMANDS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 12px' }}>
          {Object.keys(VOC_COMMANDS).map(cmd => (
            <span key={cmd} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '2px 8px', border: '1px solid rgba(57,255,20,0.12)', color: 'rgba(57,255,20,0.6)', background: 'rgba(57,255,20,0.03)' }}>"{cmd}"</span>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: '@keyframes voice-pulse{0%{transform:scale(1);opacity:0.8}100%{transform:scale(1.5);opacity:0}} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}' }} />
    </div>
  );
}


/* ============================================
   MATRIX RAIN — CSS + Canvas
   ============================================ */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const speedRef = useRef(speed);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width; canvas.height = rect.height;
    };
    resize();

    const cols = Math.floor(canvas.width / 14);
    const drops = new Array(cols).fill(1).map(() => Math.random() * -50);
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%'.split('');

    let frame: number;
    const draw = () => {
      const spd = { slow: 4, normal: 2, fast: 1 }[speedRef.current];
      ctx.fillStyle = 'rgba(3,3,6,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 14;
        const y = drops[i] * 14;

        // Lead char bright
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#39FF14'; ctx.shadowBlur = 6;
        ctx.font = '12px "JetBrains Mono",monospace';
        ctx.fillText(char, x, y);

        // Trail
        ctx.fillStyle = `rgba(57,255,20,${0.6 + Math.random() * 0.3})`;
        ctx.shadowColor = '#39FF14'; ctx.shadowBlur = 2;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 14);
        ctx.fillStyle = 'rgba(57,255,20,0.3)';
        ctx.shadowBlur = 0;
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y - 28);

        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += spd / 14;
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '320px', display: 'block', borderRadius: 2, background: '#030306' }} />
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
        {(['slow', 'normal', 'fast'] as const).map(s => (
          <button key={s} onClick={() => setSpeed(s)} style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '6px 14px', letterSpacing: '1px', cursor: 'pointer',
            background: speed === s ? 'rgba(57,255,20,0.15)' : 'transparent',
            border: `1px solid ${speed === s ? 'rgba(57,255,20,0.4)' : 'rgba(255,255,255,0.07)'}`,
            color: speed === s ? '#39FF14' : 'rgba(232,232,240,0.4)',
            transition: 'all 0.2s',
          }}>{s.toUpperCase()}</button>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.25)', marginTop: 10, textAlign: 'center', letterSpacing: '1px' }}>
        ⬛ MATRIX RAIN · KATAKANA + ASCII GLYPHS · REAL-TIME
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
    { id: 'voice', label: 'VOICE.sys', icon: '🎤' },
    { id: 'matrix', label: 'MATRIX.sh', icon: '⬡' },
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
          {activeTab === 'voice' && <VoiceRecognition />}
          {activeTab === 'matrix' && <MatrixRain />}
        </div>
      </div>

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
    </OSWindowFrame>
  );
}

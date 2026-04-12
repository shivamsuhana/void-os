'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { OWNER, LOCATIONS } from '@/lib/portfolio-data';
import { enableMagneticHover } from '@/lib/animations';

/* ═══════════════════════════════════════════
   HEX GRID BACKGROUND — full canvas
   Creates a floating hexagonal grid + particles
   ═══════════════════════════════════════════ */
function HexGridBG() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
    const resize = () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; };
    window.addEventListener('resize', resize);

    // floating particles
    const particles: { x:number; y:number; vx:number; vy:number; size:number; alpha:number }[] = [];
    for (let i = 0; i < 60; i++) particles.push({ x: Math.random()*W, y: Math.random()*H, vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3, size: Math.random()*2+.5, alpha: Math.random()*.3+.05 });

    let t = 0, frame: number;
    const draw = () => {
      t += .005;
      ctx.fillStyle = 'rgba(3,3,6,.15)';
      ctx.fillRect(0, 0, W, H);

      // hex grid
      const hexR = 40, hexH = hexR * Math.sqrt(3);
      ctx.strokeStyle = `rgba(0,212,255,${.02 + Math.sin(t)*.01})`;
      ctx.lineWidth = .5;
      for (let gy = -1; gy < H / hexH + 1; gy++) {
        for (let gx = -1; gx < W / (hexR * 1.5) + 1; gx++) {
          const cx = gx * hexR * 1.5;
          const cy = gy * hexH + (gx % 2 ? hexH / 2 : 0);
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const angle = Math.PI / 3 * a + Math.PI / 6;
            const px = cx + hexR * .4 * Math.cos(angle);
            const py = cy + hexR * .4 * Math.sin(angle);
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
        }
      }

      // particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.alpha * (.7 + .3 * Math.sin(t * 3 + p.x * .01))})`;
        ctx.fill();
      }

      // occasional horizontal scan line
      const scanY = (t * 200) % (H + 200) - 100;
      if (scanY > 0 && scanY < H) {
        const sg = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
        sg.addColorStop(0, 'transparent'); sg.addColorStop(.5, 'rgba(0,212,255,.06)'); sg.addColorStop(1, 'transparent');
        ctx.fillStyle = sg; ctx.fillRect(0, scanY - 1, W, 2);
      }

      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ═══════════════════════════════════════════
   GLOWING CARD — animated border glow
   ═══════════════════════════════════════════ */
function GlowCard({ children, color = '#00D4FF', style = {}, ...props }: { children: React.ReactNode; color?: string; style?: React.CSSProperties; [k: string]: unknown }) {
  const id = useRef(`gc-${Math.random().toString(36).slice(2,8)}`);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes border-travel-${id.current} {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .${id.current} {
          position: relative;
          background: rgba(255,255,255,.02);
          overflow: hidden;
        }
        .${id.current}::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 1px solid rgba(255,255,255,.05);
          transition: border-color .3s;
          pointer-events: none;
        }
        .${id.current}::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: linear-gradient(90deg, transparent, ${color}33, transparent, ${color}22, transparent);
          background-size: 200% 100%;
          animation: border-travel-${id.current} 4s linear infinite;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: xor;
          padding: 1px;
          pointer-events: none;
          opacity: .6;
        }
        .${id.current}:hover::before { border-color: ${color}44; }
        .${id.current}:hover::after { opacity: 1; }
      `}} />
      <div className={id.current} style={{ ...style }} {...props}>{children}</div>
    </>
  );
}

/* ═══════════════════════════════════════════
   ASCII PHOTO — devilish smirk, neon morph
   ═══════════════════════════════════════════ */
const ASCII_CHARS = '█▓▒░ ·:;+=xX$&@#';
function AsciiPhoto({ hovered }: { hovered: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const progress = useRef(0);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d')!;
    const W = c.width = 300, H = c.height = 360;

    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const o = off.getContext('2d')!;
    o.fillStyle = '#080810'; o.fillRect(0, 0, W, H);
    const skin = o.createRadialGradient(W*.5, H*.4, 0, W*.5, H*.4, W*.38);
    skin.addColorStop(0, '#d4a574'); skin.addColorStop(.7, '#9e7150'); skin.addColorStop(1, '#6b4530');
    o.fillStyle = skin; o.beginPath(); o.ellipse(W*.5, H*.4, W*.32, H*.36, 0, 0, Math.PI*2); o.fill();
    const jaw = o.createLinearGradient(0, H*.55, 0, H*.7);
    jaw.addColorStop(0, 'transparent'); jaw.addColorStop(1, 'rgba(0,0,0,.25)');
    o.fillStyle = jaw; o.beginPath(); o.ellipse(W*.5, H*.4, W*.32, H*.36, 0, 0, Math.PI*2); o.fill();
    o.fillStyle = '#0a0505';
    o.beginPath(); o.ellipse(W*.5, H*.17, W*.35, H*.2, 0, 0, Math.PI*2); o.fill();
    o.beginPath(); o.ellipse(W*.3, H*.22, W*.12, H*.14, -.3, 0, Math.PI*2); o.fill();
    o.beginPath(); o.ellipse(W*.72, H*.24, W*.1, H*.12, .2, 0, Math.PI*2); o.fill();
    // eyes
    o.fillStyle='#fff'; o.beginPath(); o.ellipse(W*.36,H*.37,W*.065,H*.035,0,0,Math.PI*2); o.fill();
    o.fillStyle='#1a2a4b'; o.beginPath(); o.arc(W*.365,H*.37,W*.035,0,Math.PI*2); o.fill();
    o.fillStyle='#000'; o.beginPath(); o.arc(W*.365,H*.37,W*.02,0,Math.PI*2); o.fill();
    o.fillStyle='#fff'; o.beginPath(); o.arc(W*.375,H*.362,W*.008,0,Math.PI*2); o.fill();
    o.fillStyle='#fff'; o.beginPath(); o.ellipse(W*.64,H*.375,W*.06,H*.028,.1,0,Math.PI*2); o.fill();
    o.fillStyle='#1a2a4b'; o.beginPath(); o.arc(W*.635,H*.375,W*.032,0,Math.PI*2); o.fill();
    o.fillStyle='#000'; o.beginPath(); o.arc(W*.635,H*.375,W*.018,0,Math.PI*2); o.fill();
    o.fillStyle='#fff'; o.beginPath(); o.arc(W*.645,H*.368,W*.007,0,Math.PI*2); o.fill();
    // brows
    o.strokeStyle='#0a0505'; o.lineWidth=3.5; o.lineCap='round';
    o.beginPath(); o.moveTo(W*.27,H*.34); o.quadraticCurveTo(W*.36,H*.28,W*.44,H*.33); o.stroke();
    o.lineWidth=3; o.beginPath(); o.moveTo(W*.56,H*.34); o.quadraticCurveTo(W*.64,H*.31,W*.73,H*.345); o.stroke();
    // nose
    o.strokeStyle='#8B6040'; o.lineWidth=1.8;
    o.beginPath(); o.moveTo(W*.5,H*.39); o.quadraticCurveTo(W*.47,H*.48,W*.45,H*.49); o.stroke();
    o.beginPath(); o.moveTo(W*.45,H*.49); o.lineTo(W*.54,H*.49); o.stroke();
    // devilish smirk
    o.strokeStyle='#6a3020'; o.lineWidth=2.5; o.lineCap='round';
    o.beginPath(); o.moveTo(W*.36,H*.555); o.quadraticCurveTo(W*.45,H*.585,W*.5,H*.575); o.quadraticCurveTo(W*.58,H*.565,W*.65,H*.54); o.stroke();
    o.lineWidth=1.5; o.beginPath(); o.moveTo(W*.65,H*.54); o.quadraticCurveTo(W*.67,H*.535,W*.66,H*.525); o.stroke();
    // hoodie
    o.fillStyle='#6b4530'; o.fillRect(W*.38,H*.7,W*.24,H*.1);
    const sh=o.createLinearGradient(0,H*.76,0,H); sh.addColorStop(0,'#0c0c1e'); sh.addColorStop(1,'#161630');
    o.fillStyle=sh; o.fillRect(0,H*.76,W,H*.24);
    o.strokeStyle='rgba(0,212,255,.12)'; o.lineWidth=1;
    o.beginPath(); o.moveTo(W*.3,H*.77); o.quadraticCurveTo(W*.5,H*.85,W*.7,H*.77); o.stroke();

    const data = o.getImageData(0,0,W,H).data;
    const COLS=45,ROWS=54,cw=W/COLS,ch_=H/ROWS;
    const cells:{b:number;r:number;g:number;bl:number}[]=[];
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){const px=Math.floor(c*cw+cw/2),py=Math.floor(r*ch_+ch_/2),i=(py*W+px)*4;cells.push({b:(data[i]*.299+data[i+1]*.587+data[i+2]*.114)/255,r:data[i],g:data[i+1],bl:data[i+2]});}

    let t=0;
    const draw=()=>{
      t+=.02; const p=progress.current;
      ctx.clearRect(0,0,W,H);
      if(p>0){ctx.globalAlpha=p;ctx.drawImage(off,0,0);ctx.globalAlpha=1;}
      if(p<1){
        ctx.globalAlpha=1-p; ctx.font=`bold ${Math.max(5,cw*.82)}px "JetBrains Mono",monospace`; ctx.textBaseline='middle';
        for(let i=0;i<cells.length;i++){
          const cell=cells[i],col=i%COLS,row=Math.floor(i/COLS);
          const ch2=ASCII_CHARS[Math.floor((1-cell.b)*(ASCII_CHARS.length-1))]; if(!ch2.trim()) continue;
          const fl=.75+.25*Math.sin(t*2.5+col*.5+row*.4);
          ctx.fillStyle=p<.3?(cell.b>.7?'#00D4FF':cell.b>.4?'#E8E8F0':cell.b>.15?'#7B2FFF':'#39FF14'):`rgb(${cell.r},${cell.g},${cell.bl})`;
          ctx.globalAlpha=(1-p)*Math.min(1,cell.b*2.8)*fl;
          ctx.fillText(ch2,col*cw,row*ch_+ch_/2);
        }
        ctx.globalAlpha=1;
      }
      if(p<.6){const sy=(t*60)%H; const sg=ctx.createLinearGradient(0,sy-3,0,sy+3); sg.addColorStop(0,'transparent');sg.addColorStop(.5,`rgba(0,212,255,${(1-p)*.2})`);sg.addColorStop(1,'transparent'); ctx.fillStyle=sg;ctx.globalAlpha=1;ctx.fillRect(0,sy-3,W,6);}
      raf.current=requestAnimationFrame(draw);
    };draw();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  useEffect(()=>{let r:number;const tgt=hovered?1:0;const go=()=>{const d=tgt-progress.current;if(Math.abs(d)<.001){progress.current=tgt;return;}progress.current+=d*.05;r=requestAnimationFrame(go);};go();return()=>cancelAnimationFrame(r);},[hovered]);
  return <canvas ref={ref} style={{width:'100%',height:'100%',display:'block',imageRendering:'pixelated'}}/>;
}

/* ═══════════════════════════════════════════
   DRAGGABLE GLOBE
   ═══════════════════════════════════════════ */
function Globe() {
  const ref=useRef<HTMLCanvasElement>(null);
  const dragging=useRef(false),lx=useRef(0),vel=useRef(.3);
  useEffect(()=>{
    const c=ref.current; if(!c) return;
    const ctx=c.getContext('2d')!; const S=280; c.width=S;c.height=S;
    let angle=0,frame:number; const cx=S/2,cy=S/2,r=S*.42;
    const draw=()=>{
      if(!dragging.current){angle+=vel.current;vel.current+=(.2-vel.current)*.02;}
      ctx.clearRect(0,0,S,S);
      const a=ctx.createRadialGradient(cx,cy,r*.85,cx,cy,r*1.15);
      a.addColorStop(0,'rgba(0,212,255,.06)');a.addColorStop(1,'transparent');
      ctx.fillStyle=a;ctx.beginPath();ctx.arc(cx,cy,r*1.15,0,Math.PI*2);ctx.fill();
      const g=ctx.createRadialGradient(cx-r*.2,cy-r*.2,0,cx,cy,r);
      g.addColorStop(0,'rgba(10,20,40,.6)');g.addColorStop(1,'rgba(3,3,6,.9)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(0,212,255,.2)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
      for(let l=-60;l<=60;l+=30){const lr=(l*Math.PI)/180;ctx.strokeStyle='rgba(0,212,255,.05)';ctx.beginPath();ctx.ellipse(cx,cy-r*Math.sin(lr),r*Math.cos(lr),r*Math.cos(lr)*.06,0,0,Math.PI*2);ctx.stroke();}
      for(let l=0;l<180;l+=20){const lr=((l+angle)*Math.PI)/180;ctx.strokeStyle='rgba(0,212,255,.05)';ctx.beginPath();ctx.ellipse(cx,cy,r*Math.abs(Math.cos(lr)),r,0,0,Math.PI*2);ctx.stroke();}
      LOCATIONS.forEach(loc=>{
        const lr=((loc.lng+angle)*Math.PI)/180,la=(loc.lat*Math.PI)/180;
        const px=cx+r*Math.cos(la)*Math.sin(lr),py=cy-r*Math.sin(la);
        if(Math.cos(lr)>-.2){
          const ping=(Date.now()*.002)%1;
          ctx.beginPath();ctx.arc(px,py,3+ping*12,0,Math.PI*2);ctx.strokeStyle=`rgba(57,255,20,${.5-ping*.5})`;ctx.lineWidth=1;ctx.stroke();
          ctx.fillStyle='#39FF14';ctx.shadowColor='#39FF14';ctx.shadowBlur=10;
          ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
          ctx.font='9px "JetBrains Mono"';ctx.fillStyle='rgba(57,255,20,.7)';ctx.fillText(loc.label,px+7,py+3);
        }
      });
      frame=requestAnimationFrame(draw);
    };draw();
    const dn=(e:MouseEvent)=>{dragging.current=true;lx.current=e.clientX;vel.current=0;c.style.cursor='grabbing';};
    const mv=(e:MouseEvent)=>{if(!dragging.current)return;const dx=e.clientX-lx.current;angle+=dx*.4;vel.current=dx*.3;lx.current=e.clientX;};
    const up=()=>{dragging.current=false;c.style.cursor='grab';};
    c.addEventListener('mousedown',dn);window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);
    return()=>{cancelAnimationFrame(frame);c.removeEventListener('mousedown',dn);window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);};
  },[]);
  return <canvas ref={ref} style={{width:'140px',height:'140px',cursor:'grab'}}/>;
}

/* ═══════════════════════════════════════════
   PROFICIENCY BAR — glowing
   ═══════════════════════════════════════════ */
function ProfBar({label,value,color,delay,go}:{label:string;value:number;color:string;delay:number;go:boolean}) {
  const [w,setW]=useState(0);
  useEffect(()=>{if(go) setTimeout(()=>setW(value),delay);},[go,value,delay]);
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'9px',letterSpacing:'1.5px',color:'rgba(232,232,240,.55)'}}>{label}</span>
        <span style={{fontFamily:'var(--font-mono)',fontSize:'9px',color,textShadow:`0 0 8px ${color}66`}}>{value}%</span>
      </div>
      <div style={{height:4,background:'rgba(255,255,255,.06)',borderRadius:2,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${w}%`,background:`linear-gradient(90deg,${color}66,${color})`,boxShadow:`0 0 12px ${color}44, inset 0 0 4px ${color}33`,borderRadius:2,transition:'width 1.4s cubic-bezier(.16,1,.3,1)'}}/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVEAL — scroll triggered
   ═══════════════════════════════════════════ */
function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}) {
  const ref=useRef<HTMLDivElement>(null);
  const [v,setV]=useState(false);
  useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);obs.disconnect();}},{threshold:.1});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();},[]);
  return <div ref={ref} style={{opacity:v?1:0,transform:v?'translateY(0)':'translateY(28px)',transition:`opacity .8s ease ${delay}ms, transform .8s cubic-bezier(.16,1,.3,1) ${delay}ms`}}>{children}</div>;
}

/* ═══════════════════════════════════════════
   GLITCH TEXT
   ═══════════════════════════════════════════ */
function GlitchText({ text, style = {} }: { text: string; style?: React.CSSProperties }) {
  const id = `gt-${text.replace(/\s/g,'').slice(0,6)}`;
  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes glitch-${id} {
          0%,90%,100%{transform:translate(0);opacity:1;}
          92%{transform:translate(-2px,1px);opacity:.8;}
          94%{transform:translate(2px,-1px);opacity:.9;}
          96%{transform:translate(-1px,-1px);opacity:.7;}
          98%{transform:translate(1px,1px);}
        }
        .${id}{animation:glitch-${id} 5s ease-in-out infinite;position:relative;}
        .${id}::after{content:'${text}';position:absolute;left:2px;top:0;color:#7B2FFF;clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%);opacity:0;animation:glitch-${id} 5s ease-in-out infinite reverse;}
      `}}/>
      <span className={id} style={style}>{text}</span>
    </>
  );
}

/* ═══════════════════════════════════════════
   ABOUT SECTION — ALIEN TECH 2045
   ═══════════════════════════════════════════ */
export default function AboutSection() {
  const { navigateTo } = useVoidStore();
  const [photoHov, setPhotoHov] = useState(false);
  const [hovLine, setHovLine] = useState<number|null>(null);
  const [statsGo, setStatsGo] = useState(false);
  const [cvState, setCvState] = useState<'idle'|'loading'|'done'>('idle');
  const [cvProg, setCvProg] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsGo(true); }, { threshold: .2 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const downloadCV = () => {
    if (cvState !== 'idle') return;
    setCvState('loading');
    const iv = setInterval(() => {
      setCvProg(p => {
        if (p >= 100) { clearInterval(iv); setCvState('done'); window.open('/resume', '_blank'); setTimeout(() => { setCvState('idle'); setCvProg(0); }, 2500); return 100; }
        return Math.min(100, p + Math.random() * 8 + 2);
      });
    }, 60);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#030306', overflowY: 'auto', zIndex: 50 }}>

      {/* Animated hex grid background */}
      <HexGridBG />

      {/* CRT scanlines */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.5) 100%)' }} />

      {/* Back */}
      <button className="back-button" onClick={() => navigateTo('desktop')} style={{ zIndex: 60 }}>← VOID DESKTOP</button>

      {/* ─── Sticky Process Bar ─── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(3,3,6,.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,212,255,.1)', padding: '10px 40px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--font-mono)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 8px #39FF14, 0 0 20px rgba(57,255,20,.3)', animation: 'pulse 2s infinite' }} />
        <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}' }} />
        <span style={{ fontSize: '8px', letterSpacing: '3px', color: 'rgba(232,232,240,.35)' }}>VOID_OS</span>
        <span style={{ color: 'rgba(0,212,255,.3)' }}>/</span>
        <span style={{ fontSize: '8px', letterSpacing: '2px', color: '#00D4FF', textShadow: '0 0 8px rgba(0,212,255,.3)' }}>ABOUT.exe</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.2)' }}>PID:1337</span>
        <div style={{ width: 1, height: 10, background: 'rgba(0,212,255,.15)' }} />
        <span style={{ fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,.2)' }}>MEM:42MB</span>
        <div style={{ width: 1, height: 10, background: 'rgba(0,212,255,.15)' }} />
        <span style={{ fontSize: '7px', letterSpacing: '1.5px', color: '#39FF14', textShadow: '0 0 6px rgba(57,255,20,.3)' }}>● RUNNING</span>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,60px) 0' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '4px', color: '#7B2FFF', textShadow: '0 0 10px rgba(123,47,255,.3)' }}>01 // ABOUT.exe</div>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #7B2FFF44, transparent)' }} />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, marginBottom: 8 }}>
              The Human Behind{' '}
              <GlitchText text="The Machine" style={{ color: '#00D4FF', textShadow: '0 0 20px rgba(0,212,255,.4), 0 0 40px rgba(0,212,255,.1)' }} />
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,232,240,.3)', maxWidth: 500, letterSpacing: '.5px' }}>{OWNER.tagline}</p>
          </Reveal>
        </div>

        {/* ═══ HERO SPLIT ═══ */}
        <div id="about-hero" style={{ display: 'grid', gridTemplateColumns: 'clamp(280px,35%,360px) 1fr', gap: 'clamp(32px,5vw,72px)', padding: 'clamp(40px,4vw,60px) clamp(20px,5vw,60px)', alignItems: 'start' }}>
          <style dangerouslySetInnerHTML={{ __html: '@media(max-width:768px){#about-hero{grid-template-columns:1fr!important;}}' }} />

          {/* ── LEFT: Photo + Identity ── */}
          <div>
            <Reveal>
              <div
                onMouseEnter={() => setPhotoHov(true)} onMouseLeave={() => setPhotoHov(false)}
                style={{
                  position: 'relative', width: '100%', aspectRatio: '5/6', marginBottom: 20,
                  border: `1px solid ${photoHov ? 'rgba(0,212,255,.6)' : 'rgba(0,212,255,.12)'}`,
                  boxShadow: photoHov ? '0 0 50px rgba(0,212,255,.12), 0 0 100px rgba(0,212,255,.05), inset 0 0 30px rgba(0,212,255,.03)' : '0 0 20px rgba(0,212,255,.03)',
                  transition: 'all .6s cubic-bezier(.16,1,.3,1)', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', inset: 0 }}><AsciiPhoto hovered={photoHov} /></div>
                {/* Holographic shimmer overlay */}
                <div style={{
                  position: 'absolute', inset: 0, pointerEvents: 'none',
                  background: photoHov ? 'linear-gradient(135deg, transparent 30%, rgba(0,212,255,.05) 50%, transparent 70%)' : 'none',
                  transition: 'background .5s',
                }} />
                {/* HUD elements */}
                <div style={{ position: 'absolute', top: 10, left: 12, fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'rgba(0,212,255,.35)' }}>SCAN_ID:0x4B52</div>
                <div style={{ position: 'absolute', top: 10, right: 12, fontFamily: 'var(--font-mono)', fontSize: '7px', color: photoHov ? '#39FF14' : 'rgba(57,255,20,.3)', transition: 'color .3s', textShadow: photoHov ? '0 0 6px #39FF14' : 'none' }}>
                  {photoHov ? '● IDENTIFIED' : '○ SCANNING'}
                </div>
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2.5px', color: photoHov ? '#00D4FF' : 'rgba(232,232,240,.15)', transition: 'color .3s' }}>
                  {photoHov ? '← IDENTITY CONFIRMED →' : 'HOVER TO DECRYPT'}
                </div>
                {/* Corner brackets */}
                {['tl', 'tr', 'bl', 'br'].map(p => <div key={p} style={{
                  position: 'absolute', width: 16, height: 16,
                  top: p[0] === 't' ? 6 : 'auto', bottom: p[0] === 'b' ? 6 : 'auto',
                  left: p[1] === 'l' ? 6 : 'auto', right: p[1] === 'r' ? 6 : 'auto',
                  borderTop: p[0] === 't' ? `1px solid ${photoHov ? 'rgba(0,212,255,.7)' : 'rgba(0,212,255,.3)'}` : 'none',
                  borderBottom: p[0] === 'b' ? `1px solid ${photoHov ? 'rgba(0,212,255,.7)' : 'rgba(0,212,255,.3)'}` : 'none',
                  borderLeft: p[1] === 'l' ? `1px solid ${photoHov ? 'rgba(0,212,255,.7)' : 'rgba(0,212,255,.3)'}` : 'none',
                  borderRight: p[1] === 'r' ? `1px solid ${photoHov ? 'rgba(0,212,255,.7)' : 'rgba(0,212,255,.3)'}` : 'none',
                  transition: 'border-color .4s',
                }} />)}
              </div>
            </Reveal>

            {/* Identity card */}
            <Reveal delay={120}>
              <GlowCard style={{ padding: '18px 22px', marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: '#00D4FF', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, textShadow: '0 0 6px rgba(0,212,255,.3)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 6px #39FF14', display: 'inline-block' }} />
                  IDENTITY_CARD.json
                </div>
                {([
                  ['NAME', OWNER.name, '#E8E8F0'], ['ROLE', OWNER.role, '#00D4FF'],
                  ['EDU', OWNER.degree, '#E8E8F0'], ['BASE', OWNER.location, '#E8E8F0'],
                  ['STATUS', 'AVAILABLE', '#39FF14'],
                ] as const).map(([k, v, c], i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, padding: '5px 0', fontSize: '10px', fontFamily: 'var(--font-mono)',
                    borderBottom: i < 4 ? '1px solid rgba(0,212,255,.04)' : 'none',
                    transition: 'background .2s', cursor: 'default',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: 'rgba(232,232,240,.25)', minWidth: 55 }}>{k}:</span>
                    <span style={{ color: c as string, textShadow: c === '#39FF14' ? '0 0 10px rgba(57,255,20,.5)' : c === '#00D4FF' ? '0 0 8px rgba(0,212,255,.3)' : 'none' }}>{v}</span>
                  </div>
                ))}
              </GlowCard>
            </Reveal>

            {/* CV download */}
            <Reveal delay={200}>
              <button onClick={downloadCV} style={{
                width: '100%', padding: '14px 24px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px',
                border: `1px solid ${cvState === 'done' ? 'rgba(57,255,20,.3)' : 'rgba(0,212,255,.15)'}`,
                background: cvState === 'done' ? 'rgba(57,255,20,.04)' : 'rgba(0,212,255,.04)',
                color: cvState === 'done' ? '#39FF14' : cvState === 'loading' ? '#FFB800' : '#00D4FF',
                textShadow: cvState === 'done' ? '0 0 8px rgba(57,255,20,.4)' : '0 0 8px rgba(0,212,255,.2)',
                cursor: cvState === 'idle' ? 'pointer' : 'default', overflow: 'hidden', position: 'relative', transition: 'all .3s',
              }}>
                {cvState === 'loading' && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${cvProg}%`, background: 'rgba(255,184,0,.08)', transition: 'width .08s' }} />}
                <span style={{ position: 'relative', zIndex: 1 }}>{cvState === 'idle' ? '↓ DOWNLOAD RESUME.pdf' : cvState === 'done' ? '✓ TRANSMITTED' : `COMPRESSING... ${Math.floor(cvProg)}%`}</span>
              </button>
            </Reveal>
          </div>

          {/* ── RIGHT: Manifesto + Bio + Proficiency ── */}
          <div>
            <Reveal delay={80}>
              <div style={{ marginBottom: 36 }}>
                {OWNER.manifesto.map((line, i) => {
                  const big = i < 2; const hov = hovLine === i;
                  return (
                    <p key={i} onMouseEnter={() => setHovLine(i)} onMouseLeave={() => setHovLine(null)}
                      style={{
                        fontFamily: big ? 'var(--font-display)' : 'var(--font-body)',
                        fontSize: big ? '24px' : '14px', fontWeight: big ? 800 : 400,
                        lineHeight: big ? 1.3 : 1.9,
                        color: hov ? '#00D4FF' : big ? '#E8E8F0' : 'rgba(232,232,240,.45)',
                        textShadow: hov ? '0 0 20px rgba(0,212,255,.3)' : 'none',
                        marginBottom: big ? 4 : 1, paddingLeft: hov ? 10 : 0,
                        borderLeft: hov ? '2px solid #00D4FF' : '2px solid transparent',
                        transition: 'all .3s cubic-bezier(.16,1,.3,1)', cursor: 'default',
                      }}
                    >{line}</p>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <GlowCard color="#7B2FFF" style={{ padding: '20px 22px', marginBottom: 32 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(232,232,240,.25)', marginBottom: 10 }}>BIO.md</div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(232,232,240,.5)', lineHeight: 2 }}>{OWNER.bio}</p>
              </GlowCard>
            </Reveal>

            <div ref={statsRef}>
              <Reveal delay={240}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color: '#00D4FF', marginBottom: 16, textShadow: '0 0 6px rgba(0,212,255,.2)' }}>PROFICIENCY_MATRIX.sys</div>
                <ProfBar label="JAVA / DSA / OOP" value={85} color="#00D4FF" delay={100} go={statsGo} />
                <ProfBar label="BACKEND / PHP / DATABASES" value={68} color="#7B2FFF" delay={200} go={statsGo} />
                <ProfBar label="FRONTEND / REACT / UI" value={50} color="#39FF14" delay={300} go={statsGo} />
                <ProfBar label="THREE.JS / WEBGL / GSAP" value={35} color="#FFB800" delay={400} go={statsGo} />
                <ProfBar label="GIT / TOOLS / DEPLOYMENT" value={62} color="#FF3B5C" delay={500} go={statsGo} />
              </Reveal>
            </div>
          </div>
        </div>

        {/* ═══ METRICS + GLOBE + TECH ═══ */}
        <div style={{ padding: '0 clamp(20px,5vw,60px) clamp(40px,4vw,60px)' }}>
          <div id="about-btm" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'start' }}>
            <style dangerouslySetInnerHTML={{ __html: '@media(max-width:768px){#about-btm{grid-template-columns:1fr!important;}}' }} />

            {/* Stats */}
            <Reveal>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(232,232,240,.25)', marginBottom: 12 }}>SYSTEM_METRICS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {OWNER.stats.map((s, i) => (
                  <GlowCard key={i} style={{ padding: '16px 14px', textAlign: 'center', cursor: 'default', transition: 'transform .3s' }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#00D4FF', textShadow: '0 0 15px rgba(0,212,255,.4)', marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', color: 'rgba(232,232,240,.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{s.label}</div>
                  </GlowCard>
                ))}
              </div>
            </Reveal>

            {/* Globe */}
            <Reveal delay={100}>
              <GlowCard color="#39FF14" style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'rgba(232,232,240,.2)', alignSelf: 'flex-start' }}>ORIGIN.geo</div>
                <Globe />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '6px', letterSpacing: '2px', color: 'rgba(232,232,240,.15)' }}>DRAG TO ROTATE</div>
              </GlowCard>
            </Reveal>

            {/* Tech */}
            <Reveal delay={200}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(232,232,240,.25)', marginBottom: 12 }}>TECH_ARSENAL</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {OWNER.techArsenal.map((t, i) => (
                  <span key={i} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '6px 14px',
                    border: '1px solid rgba(0,212,255,.08)', color: 'rgba(232,232,240,.4)',
                    letterSpacing: '.5px', cursor: 'default', borderRadius: 2,
                    transition: 'all .25s cubic-bezier(.16,1,.3,1)',
                  }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,212,255,.5)'; el.style.color = '#00D4FF'; el.style.background = 'rgba(0,212,255,.08)'; el.style.transform = 'translateY(-3px) scale(1.05)'; el.style.textShadow = '0 0 10px rgba(0,212,255,.4)'; el.style.boxShadow = '0 0 15px rgba(0,212,255,.1)'; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'rgba(0,212,255,.08)'; el.style.color = 'rgba(232,232,240,.4)'; el.style.background = 'transparent'; el.style.transform = 'translateY(0) scale(1)'; el.style.textShadow = 'none'; el.style.boxShadow = 'none'; }}
                  >{t}</span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* ═══ CORE VALUES ═══ */}
        <div style={{ borderTop: '1px solid rgba(0,212,255,.06)', padding: 'clamp(40px,5vw,60px) clamp(20px,5vw,60px)' }}>
          <Reveal>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3.5px', color: '#7B2FFF', textShadow: '0 0 8px rgba(123,47,255,.3)', marginBottom: 24 }}>CORE_VALUES.exe</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {([
                { icon: '⟡', label: 'OBSESSIVE GRIND', desc: "DSA at midnight. Coffee-fueled sprints. The grind never stops.", color: '#00D4FF' },
                { icon: '◈', label: 'SHIP IT', desc: "Ideas are worthless. Shipped projects are everything.", color: '#39FF14' },
                { icon: '◉', label: 'LEARN BY BUILDING', desc: "Textbooks are step 1. Building is the real education.", color: '#7B2FFF' },
                { icon: '⬡', label: 'PUSH LIMITS', desc: "If it's been done before, push it further.", color: '#FFB800' },
              ]).map(({ icon, label, desc, color }) => (
                <GlowCard key={label} color={color} style={{ padding: 20, cursor: 'default', transition: 'transform .3s' }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontSize: '22px', color, textShadow: `0 0 12px ${color}66`, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '11px', marginBottom: 6, letterSpacing: '1px', color: '#E8E8F0' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', lineHeight: 1.7, color: 'rgba(232,232,240,.4)' }}>{desc}</div>
                </GlowCard>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Footer */}
        <div style={{ padding: '24px clamp(20px,5vw,60px)', borderTop: '1px solid rgba(0,212,255,.04)', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,.12)' }}>ABOUT.exe — PROCESS COMPLETE</span>
        </div>
      </div>
    </div>
  );
}

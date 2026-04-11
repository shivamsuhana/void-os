'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { SKILLS, SKILL_CATEGORIES, Skill } from '@/lib/portfolio-data';

interface Node {
  id: string; name: string; category: string; proficiency: number;
  x: number; y: number; vx: number; vy: number;
  connections: string[]; glowing: boolean; glowIntensity: number;
}

export default function SkillsSection() {
  const { navigateTo } = useVoidStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const backRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const catColorMap: Record<string, string> = {};
  SKILL_CATEGORIES.forEach(c => { catColorMap[c.name] = c.color; });

  // GSAP entrance
  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (labelRef.current) tl.fromTo(labelRef.current, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.1);
    if (titleRef.current) tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.2);
    if (subtitleRef.current) tl.fromTo(subtitleRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.3);
    if (graphRef.current) tl.fromTo(graphRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.4);
    if (sidebarRef.current) {
      const cards = sidebarRef.current.children;
      tl.fromTo(cards, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0.5);
    }
    return () => { tl.kill(); };
  }, []);

  // Force Graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    // Create nodes
    const nodes: Node[] = SKILLS.map((s) => ({
      ...s,
      x: W / 2 + (Math.random() - 0.5) * W * 0.5,
      y: H / 2 + (Math.random() - 0.5) * H * 0.5,
      vx: 0, vy: 0, glowing: false, glowIntensity: 0,
    }));
    nodesRef.current = nodes;
    const nodeMap: Record<string, Node> = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    // Parse hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const simulate = () => {
      const cx = W / 2, cy = H / 2;
      for (const node of nodes) {
        // Center gravity
        node.vx += (cx - node.x) * 0.0004;
        node.vy += (cy - node.y) * 0.0004;

        // Repulsion
        for (const other of nodes) {
          if (node === other) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 100) {
            const force = (100 - dist) / dist * 0.6;
            node.vx += dx * force * 0.008;
            node.vy += dy * force * 0.008;
          }
        }

        // Attraction to connected
        for (const connId of node.connections) {
          const other = nodeMap[connId];
          if (!other) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 80) * 0.002;
          node.vx += dx / dist * force;
          node.vy += dy / dist * force;
        }

        // Mouse repulsion
        const mdx = node.x - mouseRef.current.x;
        const mdy = node.y - mouseRef.current.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
        if (mDist < 100) {
          node.vx += mdx / mDist * 2;
          node.vy += mdy / mDist * 2;
        }

        node.vx *= 0.91; node.vy *= 0.91;
        node.x += node.vx; node.y += node.vy;
        node.x = Math.max(40, Math.min(W - 40, node.x));
        node.y = Math.max(40, Math.min(H - 40, node.y));

        if (node.glowing) {
          node.glowIntensity = Math.max(0, node.glowIntensity - 0.008);
          if (node.glowIntensity <= 0) node.glowing = false;
        }
      }
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw background grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.02)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < rect.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, rect.height); ctx.stroke();
      }
      for (let y = 0; y < rect.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(rect.width, y); ctx.stroke();
      }

      // Edges
      for (const node of nodes) {
        for (const connId of node.connections) {
          const other = nodeMap[connId];
          if (!other || node.id > other.id) continue; // avoid duplicate lines
          const isGlowing = node.glowing && other.glowing;
          const color = catColorMap[node.category] || '#00D4FF';
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = isGlowing
            ? hexToRgba(color, 0.3 + node.glowIntensity * 0.5)
            : 'rgba(255,255,255,0.04)';
          ctx.lineWidth = isGlowing ? 1.5 : 0.5;
          ctx.stroke();
        }
      }

      // Nodes
      const time = Date.now();
      for (const node of nodes) {
        const color = catColorMap[node.category] || '#00D4FF';
        const baseR = 3 + (node.proficiency / 100) * 12;
        const pulseR = baseR + Math.sin(time * 0.003 + nodes.indexOf(node)) * 1;

        // Outer glow
        if (node.glowing && node.glowIntensity > 0) {
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseR + 16);
          grad.addColorStop(0, hexToRgba(color, node.glowIntensity * 0.25));
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(node.x, node.y, pulseR + 16, 0, Math.PI * 2);
          ctx.fillStyle = grad; ctx.fill();
        }

        // Node body
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseR);
        grad.addColorStop(0, hexToRgba(color, 0.9));
        grad.addColorStop(0.6, hexToRgba(color, 0.4));
        grad.addColorStop(1, hexToRgba(color, 0.1));
        ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        // Ring
        ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = node.glowing ? hexToRgba(color, 0.8) : hexToRgba(color, 0.2);
        ctx.lineWidth = node.glowing ? 2 : 0.8;
        ctx.stroke();

        // Label
        ctx.font = '9px "JetBrains Mono", "Space Mono", monospace';
        ctx.fillStyle = 'rgba(232,232,240,0.5)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + pulseR + 14);
      }
    };

    const loop = () => { simulate(); render(); animRef.current = requestAnimationFrame(loop); };
    loop();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      let found: Node | null = null;
      for (const node of nodes) {
        const r = 3 + (node.proficiency / 100) * 12;
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < r + 8) { found = node; break; }
      }
      if (found) {
        setHoveredSkill(SKILLS.find(s => s.id === found!.id) || null);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = 'pointer';
      } else {
        setHoveredSkill(null);
        canvas.style.cursor = 'crosshair';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      for (const node of nodes) {
        const r = 3 + (node.proficiency / 100) * 12;
        if (Math.sqrt(Math.pow(mx - node.x, 2) + Math.pow(my - node.y, 2)) < r + 8) {
          // BFS ripple
          const visited = new Set<string>();
          const queue: Array<{ id: string; depth: number }> = [{ id: node.id, depth: 0 }];
          visited.add(node.id);
          const processQueue = () => {
            if (queue.length === 0) return;
            const batch = queue.splice(0, queue.length);
            for (const item of batch) {
              const n = nodeMap[item.id];
              if (!n) continue;
              n.glowing = true;
              n.glowIntensity = Math.max(0.3, 1 - item.depth * 0.2);
              for (const connId of n.connections) {
                if (!visited.has(connId) && item.depth < 5) {
                  visited.add(connId);
                  queue.push({ id: connId, depth: item.depth + 1 });
                }
              }
            }
            if (queue.length > 0) setTimeout(processQueue, 150);
          };
          processQueue();
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--void)', overflow: 'auto', zIndex: 50 }}>
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', paddingTop: '30px' }}>
        <div ref={labelRef} className="section-label" style={{ opacity: 0 }}>
          03 // SKILLS.sys
        </div>
        <h2 ref={titleRef} style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)',
          marginBottom: '8px', opacity: 0,
        }}>
          Neural <span className="glow-text-amber">Network</span>
        </h2>
        <p ref={subtitleRef} style={{
          fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px', maxWidth: '420px', lineHeight: 1.8, opacity: 0,
        }}>
          Skills rendered as a living neural network. Click a node to send ripples through connected skills.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '20px', minHeight: '500px' }}>
          {/* Canvas */}
          <div ref={graphRef} className="glass-card" style={{ overflow: 'hidden', padding: 0, opacity: 0 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '500px', display: 'block', cursor: 'crosshair' }} />
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '4px' }}>
              CATEGORIES
            </div>
            {SKILL_CATEGORIES.map(cat => {
              const catSkills = SKILLS.filter(s => s.category === cat.name);
              const avg = Math.round(catSkills.reduce((a, s) => a + s.proficiency, 0) / catSkills.length);
              return (
                <div key={cat.name} className="glass-card" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: cat.color }}>{cat.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)' }}>{avg}%</span>
                  </div>
                  <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{
                      height: '100%', borderRadius: '1px', background: cat.color,
                      width: `${avg}%`, transition: 'width 1.5s ease',
                      boxShadow: `0 0 6px ${cat.color}33`,
                    }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {catSkills.length} skills
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSkill && (
        <div style={{
          position: 'fixed', left: tooltipPos.x + 14, top: tooltipPos.y - 8,
          zIndex: 100, padding: '10px 14px', borderRadius: '2px',
          background: 'rgba(3,3,6,0.95)', border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(8px)', pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>{hoveredSkill.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: catColorMap[hoveredSkill.category], marginBottom: '6px' }}>{hoveredSkill.category}</div>
          <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.04)', width: '100px' }}>
            <div style={{ height: '100%', borderRadius: '1px', background: catColorMap[hoveredSkill.category], width: `${hoveredSkill.proficiency}%` }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px' }}>{hoveredSkill.proficiency}%</div>
        </div>
      )}

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
  );
}

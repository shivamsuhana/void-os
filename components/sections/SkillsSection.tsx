'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { SKILLS, SKILL_CATEGORIES, Skill } from '@/lib/portfolio-data';

interface Node {
  id: string; name: string; category: string; proficiency: number;
  x: number; y: number; vx: number; vy: number;
  connections: string[]; glowing: boolean; glowIntensity: number;
}

export default function SkillsSection() {
  const { setActiveSection } = useVoidStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Category color map
  const catColorMap: Record<string, string> = {};
  SKILL_CATEGORIES.forEach((c) => { catColorMap[c.name] = c.color; });

  // Initialize force graph
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
      ctx.scale(dpr, dpr);
    };
    resize();

    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    // Create nodes
    const nodes: Node[] = SKILLS.map((s, i) => ({
      ...s,
      x: W / 2 + (Math.random() - 0.5) * W * 0.6,
      y: H / 2 + (Math.random() - 0.5) * H * 0.6,
      vx: 0, vy: 0,
      glowing: false, glowIntensity: 0,
    }));
    nodesRef.current = nodes;

    const nodeMap: Record<string, Node> = {};
    nodes.forEach((n) => { nodeMap[n.id] = n; });

    // Physics simulation
    const simulate = () => {
      const centerX = W / 2, centerY = H / 2;

      for (const node of nodes) {
        // Center gravity
        node.vx += (centerX - node.x) * 0.0003;
        node.vy += (centerY - node.y) * 0.0003;

        // Repulsion from all other nodes
        for (const other of nodes) {
          if (node === other) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 120) {
            const force = (120 - dist) / dist * 0.5;
            node.vx += dx * force * 0.01;
            node.vy += dy * force * 0.01;
          }
        }

        // Attraction to connected nodes
        for (const connId of node.connections) {
          const other = nodeMap[connId];
          if (!other) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = 100;
          const force = (dist - targetDist) * 0.002;
          node.vx += dx / dist * force;
          node.vy += dy / dist * force;
        }

        // Mouse repulsion
        const mdx = node.x - mouseRef.current.x;
        const mdy = node.y - mouseRef.current.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
        if (mDist < 80) {
          node.vx += mdx / mDist * 1.5;
          node.vy += mdy / mDist * 1.5;
        }

        // Damping
        node.vx *= 0.92; node.vy *= 0.92;
        node.x += node.vx; node.y += node.vy;

        // Bounds
        node.x = Math.max(30, Math.min(W - 30, node.x));
        node.y = Math.max(30, Math.min(H - 30, node.y));

        // Glow decay
        if (node.glowing) node.glowIntensity = Math.max(0, node.glowIntensity - 0.01);
        if (node.glowIntensity <= 0) node.glowing = false;
      }
    };

    // Render
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw edges
      for (const node of nodes) {
        for (const connId of node.connections) {
          const other = nodeMap[connId];
          if (!other) continue;
          const isGlowing = node.glowing && other.glowing;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = isGlowing
            ? `rgba(0, 212, 255, ${0.3 + node.glowIntensity * 0.5})`
            : 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = isGlowing ? 1.5 : 0.5;
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const color = catColorMap[node.category] || '#00D4FF';
        const r = 4 + (node.proficiency / 100) * 14;
        const pulseR = r + Math.sin(Date.now() * 0.003 + nodes.indexOf(node)) * 1.5;

        // Glow
        if (node.glowing && node.glowIntensity > 0) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, pulseR + 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 212, 255, ${node.glowIntensity * 0.2})`;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseR);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}44`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Border
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = node.glowing ? 'rgba(0, 212, 255, 0.8)' : `${color}66`;
        ctx.lineWidth = node.glowing ? 2 : 1;
        ctx.stroke();

        // Label
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(232, 232, 240, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + pulseR + 14);
      }
    };

    const loop = () => {
      simulate();
      render();
      animRef.current = requestAnimationFrame(loop);
    };
    loop();

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      // Find hovered node
      let found: Node | null = null;
      for (const node of nodes) {
        const r = 4 + (node.proficiency / 100) * 14;
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < r + 5) {
          found = node;
          break;
        }
      }

      if (found) {
        const skill = SKILLS.find((s) => s.id === found!.id) || null;
        setHoveredSkill(skill);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = 'pointer';
      } else {
        setHoveredSkill(null);
        canvas.style.cursor = 'default';
      }
    };

    // BFS ripple on click
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;

      for (const node of nodes) {
        const r = 4 + (node.proficiency / 100) * 14;
        const dx = mx - node.x, dy = my - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < r + 5) {
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
              n.glowIntensity = 1 - item.depth * 0.2;
              for (const connId of n.connections) {
                if (!visited.has(connId) && item.depth < 4) {
                  visited.add(connId);
                  queue.push({ id: connId, depth: item.depth + 1 });
                }
              }
            }
            if (queue.length > 0) setTimeout(processQueue, 200);
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

  // Liquid metal background shader (canvas-based)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 400; canvas.height = 400;
    let frame: number;

    // Simplex-like noise via sin combinations
    const noise = (x: number, y: number, t: number) => {
      return (Math.sin(x * 0.02 + t) + Math.sin(y * 0.03 + t * 0.7) + Math.sin((x + y) * 0.01 + t * 0.5)) / 3;
    };

    const draw = () => {
      const t = Date.now() * 0.001;
      const imgData = ctx.createImageData(400, 400);
      for (let y = 0; y < 400; y++) {
        for (let x = 0; x < 400; x++) {
          const n = noise(x, y, t) * 0.5 + 0.5;
          const i = (y * 400 + x) * 4;
          imgData.data[i] = n * 8;      // R
          imgData.data[i + 1] = n * 15;  // G
          imgData.data[i + 2] = n * 25;  // B
          imgData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="section-container" style={{ background: 'var(--void-black)', position: 'relative' }}>
      <button className="back-button" onClick={() => setActiveSection('desktop')}>← VOID DESKTOP</button>

      {/* Liquid metal background */}
      <canvas ref={bgCanvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3, objectFit: 'cover' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', paddingTop: '40px' }}>
        <div className="section-header">
          <span className="section-tag">// SKILLS.sys</span>
          <h1>Neural <span className="glow-text-amber">Network</span></h1>
          <p className="section-desc">Click a node to send a ripple through connected skills.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '24px', minHeight: '500px' }}>
          {/* Force Graph Canvas */}
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '500px', display: 'block' }} />
          </div>

          {/* Category Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px' }}>
              CATEGORIES
            </div>
            {SKILL_CATEGORIES.map((cat) => {
              const catSkills = SKILLS.filter((s) => s.category === cat.name);
              const avgProf = Math.round(catSkills.reduce((a, s) => a + s.proficiency, 0) / catSkills.length);
              return (
                <div key={cat.name} className="glass-card" style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: cat.color }}>{cat.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{avgProf}%</span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: cat.color, width: `${avgProf}%`, transition: 'width 1s ease', boxShadow: `0 0 8px ${cat.color}44` }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px' }}>
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
          position: 'fixed', left: tooltipPos.x + 16, top: tooltipPos.y - 10,
          zIndex: 100, padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(10,10,18,0.95)', border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(8px)', pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{hoveredSkill.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: catColorMap[hoveredSkill.category], marginBottom: '8px' }}>{hoveredSkill.category}</div>
          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', width: '120px' }}>
            <div style={{ height: '100%', borderRadius: '2px', background: 'var(--plasma-blue)', width: `${hoveredSkill.proficiency}%` }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{hoveredSkill.proficiency}% proficiency</div>
        </div>
      )}
    </div>
  );
}

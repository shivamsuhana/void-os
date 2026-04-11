'use client';

import { useEffect, useRef, useState } from 'react';
import { useVoidStore } from '@/lib/store';

/**
 * Screensaver — Pipe-style screensaver after 3 minutes idle
 */
export default function Screensaver() {
  const { showScreensaver, setShowScreensaver, activeSection } = useVoidStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animRef = useRef<number>(0);

  const IDLE_TIMEOUT = 180000; // 3 minutes

  // Reset idle timer on any interaction
  useEffect(() => {
    const resetTimer = () => {
      if (showScreensaver) {
        setShowScreensaver(false);
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        if (activeSection !== 'boot') {
          setShowScreensaver(true);
        }
      }, IDLE_TIMEOUT);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [showScreensaver, setShowScreensaver, activeSection]);

  // Pipe animation
  useEffect(() => {
    if (!showScreensaver || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#00D4FF', '#7B2FFF', '#39FF14', '#FFB800', '#FF3366'];
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let dir = 0; // 0=right, 1=down, 2=left, 3=up
    let color = colors[0];
    let steps = 0;

    ctx.fillStyle = 'rgba(3, 3, 6, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const step = () => {
      const segmentLength = 3;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.lineCap = 'round';

      const prevX = x, prevY = y;

      switch (dir) {
        case 0: x += segmentLength; break;
        case 1: y += segmentLength; break;
        case 2: x -= segmentLength; break;
        case 3: y -= segmentLength; break;
      }

      ctx.moveTo(prevX, prevY);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      steps++;

      // Random direction change
      if (Math.random() < 0.04) {
        dir = Math.floor(Math.random() * 4);
        color = colors[Math.floor(Math.random() * colors.length)];
      }

      // Bounds check
      if (x < 10 || x > canvas.width - 10 || y < 10 || y > canvas.height - 10) {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
        dir = Math.floor(Math.random() * 4);
      }

      // Slow fade of older pipes
      if (steps % 500 === 0) {
        ctx.fillStyle = 'rgba(3, 3, 6, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animRef.current = requestAnimationFrame(step);
    };

    step();
    return () => cancelAnimationFrame(animRef.current);
  }, [showScreensaver]);

  if (!showScreensaver) return null;

  return (
    <div
      onClick={() => setShowScreensaver(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99997,
        cursor: 'none',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        animation: 'pulse 2s infinite',
      }}>
        PRESS ANY KEY OR CLICK TO EXIT SCREENSAVER
      </div>
    </div>
  );
}

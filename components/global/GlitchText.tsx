'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * GlitchText — Cyber-decode heading effect
 *
 * On hover: text cycles through random characters for ~400ms
 * then resolves back to the actual text.
 * Also applies a subtle RGB split text-shadow.
 */
const GLITCH_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}|/\\';

interface GlitchTextProps {
  children: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
  style?: React.CSSProperties;
  className?: string;
  color?: string;
}

export default function GlitchText({
  children,
  as: Tag = 'h2',
  style,
  className,
  color = '#00D4FF',
}: GlitchTextProps) {
  const [display, setDisplay] = useState(children);
  const [isGlitching, setIsGlitching] = useState(false);
  const frameRef = useRef<number>(0);
  const originalText = children;

  // Update display when children change
  useEffect(() => {
    setDisplay(children);
  }, [children]);

  const startGlitch = useCallback(() => {
    if (isGlitching) return;
    setIsGlitching(true);

    const text = originalText;
    const totalDuration = 400; // ms
    const startTime = Date.now();
    const charDelay = totalDuration / text.length; // stagger resolve per character

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const resolvedCount = Math.floor(elapsed / charDelay);

      let result = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < resolvedCount) {
          result += text[i]; // resolved
        } else {
          result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }

      setDisplay(result);

      if (resolvedCount < text.length) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
        setIsGlitching(false);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  }, [isGlitching, originalText]);

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <Tag
      className={className}
      onMouseEnter={startGlitch}
      style={{
        ...style,
        cursor: 'default',
        transition: 'text-shadow 0.3s',
        textShadow: isGlitching
          ? `2px 0 ${color}44, -2px 0 #FF336644, 0 0 12px ${color}33`
          : `0 0 8px ${color}22`,
      }}
    >
      {display}
    </Tag>
  );
}

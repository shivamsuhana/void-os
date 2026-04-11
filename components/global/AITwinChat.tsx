'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';
import { getKeywordResponse } from '@/lib/ai-prompts';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function AITwinChat() {
  const { activeSection } = useVoidStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: "VOID AI TWIN v2045 — Ask me anything about Krishu's skills, projects, or DSA journey." },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Periodic pulse animation on the bubble
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) setPulseCount(p => p + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    // Try API first, fall back to keyword
    try {
      const res = await fetch('/api/ai-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: messages
            .filter(m => m.role !== 'system')
            .slice(-8)
            .map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.content })),
        }),
      });

      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 800));

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch {
      // Keyword fallback
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));
      const response = getKeywordResponse(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }

    setIsTyping(false);
  }, [input, isTyping, activeSection, messages]);

  return (
    <>
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '20px', right: '108px', zIndex: 9998,
            width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
            backdropFilter: 'blur(8px)', cursor: 'pointer',
            fontSize: '18px', transition: 'all 0.3s ease',
            animation: pulseCount > 0 ? 'pulse 2s ease' : 'none',
            boxShadow: '0 0 15px rgba(0,212,255,0.1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.15)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.08)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          title="Talk to AI Twin"
        >
          🤖
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 9998,
          width: '360px', maxHeight: '500px',
          display: 'flex', flexDirection: 'column',
          borderRadius: '4px', overflow: 'hidden',
          background: 'rgba(3,3,6,0.97)', border: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(20px)',
          animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 1px rgba(0,212,255,0.2)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(0,212,255,0.08)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#39FF14', boxShadow: '0 0 6px rgba(57,255,20,0.5)',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '10px',
                color: 'var(--blue)', letterSpacing: '1.5px',
              }}>
                AI TWIN · ONLINE
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--text-muted)', cursor: 'pointer',
                width: '24px', height: '24px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '2px', border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)'; e.currentTarget.style.color = 'var(--blue)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >✕</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '14px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            maxHeight: '350px', minHeight: '200px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '85%',
                  padding: msg.role === 'system' ? '8px 12px' : '10px 14px',
                  borderRadius: '2px',
                  fontFamily: msg.role === 'system' ? 'var(--font-mono)' : 'var(--font-body)',
                  fontSize: msg.role === 'system' ? '9px' : '12px',
                  lineHeight: 1.7,
                  color: msg.role === 'system' ? 'var(--text-muted)'
                    : msg.role === 'user' ? 'var(--white)'
                    : 'var(--text-dim)',
                  background: msg.role === 'user' ? 'rgba(0,212,255,0.1)'
                    : msg.role === 'system' ? 'transparent'
                    : 'rgba(255,255,255,0.03)',
                  border: msg.role === 'user' ? '1px solid rgba(0,212,255,0.15)'
                    : msg.role === 'system' ? 'none'
                    : '1px solid rgba(255,255,255,0.04)',
                  letterSpacing: msg.role === 'system' ? '1px' : '0',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{
                padding: '10px 14px', borderRadius: '2px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
                maxWidth: '85%',
              }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '4px', height: '4px', borderRadius: '50%',
                      background: 'var(--blue)', opacity: 0.5,
                      animation: `pulse 1.2s ease ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px',
            borderTop: '1px solid rgba(0,212,255,0.08)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)' }}>❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              placeholder="Ask me anything..."
              style={{
                flex: 1, background: 'transparent',
                fontFamily: 'var(--font-mono)', fontSize: '11px',
                color: 'var(--white)', caretColor: 'var(--blue)',
              }}
            />
            <button onClick={sendMessage} style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: 'var(--blue)', cursor: 'pointer', padding: '4px 8px',
              borderRadius: '2px', border: '1px solid rgba(0,212,255,0.15)',
              background: 'transparent', transition: 'all 0.2s',
              opacity: input.trim() ? 1 : 0.3,
            }}
              onMouseEnter={e => { if (input.trim()) { e.currentTarget.style.background = 'rgba(0,212,255,0.1)'; } }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >SEND</button>
          </div>

          {/* Context indicator */}
          <div style={{
            padding: '4px 14px 6px',
            fontFamily: 'var(--font-mono)', fontSize: '8px',
            color: 'var(--text-muted)', letterSpacing: '1px',
            borderTop: '1px solid rgba(255,255,255,0.02)',
          }}>
            CONTEXT: {activeSection.toUpperCase()} · GEMINI AI
          </div>
        </div>
      )}
    </>
  );
}

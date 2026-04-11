'use client';

import { useState, useRef, useEffect } from 'react';
import { useVoidStore } from '@/lib/store';
import { OWNER } from '@/lib/portfolio-data';

type Step = 'name' | 'email' | 'subject' | 'message' | 'confirm' | 'sending' | 'sent';

const PROMPTS: Record<string, string> = {
  name: 'WHO ARE YOU?',
  email: 'YOUR TRANSMISSION FREQUENCY (EMAIL):',
  subject: 'SIGNAL CLASSIFICATION (SUBJECT):',
  message: 'ENCODE YOUR MESSAGE:',
  confirm: 'TRANSMIT? [Y/N]',
};

export default function ContactSection() {
  const { setActiveSection } = useVoidStore();
  const [step, setStep] = useState<Step>('name');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'system' | 'user' | 'error'; text: string }>>([
    { type: 'system', text: 'VOID OS COMMUNICATION TERMINAL v2045.1' },
    { type: 'system', text: '──────────────────────────────────────' },
    { type: 'system', text: `Connecting to ${OWNER.name}...` },
    { type: 'system', text: 'Connection established. Secure channel active.' },
    { type: 'system', text: '' },
  ]);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Add initial prompt
  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory(prev => [...prev, { type: 'system', text: `> ${PROMPTS[step]}` }]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const value = input.trim();

    // Add user input to history
    setHistory(prev => [...prev, { type: 'user', text: `  ${value}` }]);
    setInput('');

    if (step === 'name') {
      setFormData(prev => ({ ...prev, name: value }));
      setTimeout(() => {
        setHistory(prev => [...prev,
          { type: 'system', text: `Identity verified: ${value}` },
          { type: 'system', text: '' },
          { type: 'system', text: `> ${PROMPTS.email}` },
        ]);
        setStep('email');
      }, 300);
    } else if (step === 'email') {
      if (!validateEmail(value)) {
        setHistory(prev => [...prev,
          { type: 'error', text: 'ERROR: Invalid frequency format. Try again.' },
          { type: 'system', text: `> ${PROMPTS.email}` },
        ]);
        return;
      }
      setFormData(prev => ({ ...prev, email: value }));
      setTimeout(() => {
        setHistory(prev => [...prev,
          { type: 'system', text: `Frequency locked: ${value}` },
          { type: 'system', text: '' },
          { type: 'system', text: `> ${PROMPTS.subject}` },
        ]);
        setStep('subject');
      }, 300);
    } else if (step === 'subject') {
      setFormData(prev => ({ ...prev, subject: value }));
      setTimeout(() => {
        setHistory(prev => [...prev,
          { type: 'system', text: `Classification: ${value}` },
          { type: 'system', text: '' },
          { type: 'system', text: `> ${PROMPTS.message}` },
        ]);
        setStep('message');
      }, 300);
    } else if (step === 'message') {
      setFormData(prev => ({ ...prev, message: value }));
      setTimeout(() => {
        setHistory(prev => [...prev,
          { type: 'system', text: 'Message encoded.' },
          { type: 'system', text: '' },
          { type: 'system', text: '──── TRANSMISSION SUMMARY ────' },
          { type: 'system', text: `FROM: ${formData.name} <${formData.email}>` },
          { type: 'system', text: `SUBJ: ${formData.subject}` },
          { type: 'system', text: `BODY: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}` },
          { type: 'system', text: '──────────────────────────────' },
          { type: 'system', text: '' },
          { type: 'system', text: `> ${PROMPTS.confirm}` },
        ]);
        setStep('confirm');
      }, 300);
    } else if (step === 'confirm') {
      if (value.toLowerCase() === 'y' || value.toLowerCase() === 'yes') {
        setStep('sending');
        const sendingMessages = [
          'Encoding quantum packets...',
          'Establishing subspace link...',
          'Routing through neural mesh...',
          'Transmitting.......',
        ];
        let i = 0;
        const interval = setInterval(() => {
          if (i < sendingMessages.length) {
            setHistory(prev => [...prev, { type: 'system', text: sendingMessages[i] }]);
            i++;
          } else {
            clearInterval(interval);
            setHistory(prev => [...prev,
              { type: 'system', text: '' },
              { type: 'system', text: '✓ SIGNAL SENT SUCCESSFULLY' },
              { type: 'system', text: `${OWNER.name} will receive your transmission shortly.` },
              { type: 'system', text: '' },
              { type: 'system', text: `Or reach out directly: ${OWNER.email}` },
            ]);
            setStep('sent');
          }
        }, 600);
      } else {
        setHistory(prev => [...prev,
          { type: 'system', text: 'Transmission aborted. Data purged.' },
          { type: 'system', text: '' },
          { type: 'system', text: `> ${PROMPTS.name}` },
        ]);
        setStep('name');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    }
  };

  return (
    <div className="section-container" style={{ background: 'var(--void-black)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <button className="back-button" onClick={() => setActiveSection('desktop')}>← VOID DESKTOP</button>

      <div style={{ maxWidth: '700px', width: '100%', padding: '40px 20px' }}>
        <div className="section-header">
          <span className="section-tag">// CONTACT.net</span>
          <h1>Say <span className="glow-text-blue">Hello.</span></h1>
        </div>

        {/* Terminal Window */}
        <div style={{
          borderRadius: '12px', overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          background: 'rgba(10, 10, 18, 0.9)',
        }}>
          {/* Title bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27C93F' }} />
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
              contact.net — secure terminal
            </span>
          </div>

          {/* Terminal body */}
          <div ref={terminalRef} style={{
            padding: '20px', minHeight: '350px', maxHeight: '450px',
            overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: 1.8,
          }}>
            {history.map((line, i) => (
              <div key={i} style={{
                color: line.type === 'error' ? 'var(--error-red)' : line.type === 'user' ? 'var(--plasma-blue)' : 'var(--text-dim)',
                minHeight: line.text ? 'auto' : '20px',
                fontWeight: line.type === 'user' ? 500 : 400,
              }}>
                {line.type === 'user' && <span style={{ color: 'var(--acid-green)' }}>❯ </span>}
                {line.text}
              </div>
            ))}

            {/* Input line */}
            {step !== 'sending' && step !== 'sent' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ color: 'var(--acid-green)' }}>❯</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder={step === 'message' ? 'Type your message...' : ''}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    color: 'var(--ghost-white)', fontFamily: 'var(--font-mono)', fontSize: '13px',
                    caretColor: 'var(--plasma-blue)',
                  }}
                />
                <span style={{ width: '8px', height: '16px', background: 'var(--plasma-blue)', animation: 'blink 1s infinite' }} />
              </div>
            )}
          </div>
        </div>

        {/* Status + Direct Contact */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot online" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--acid-green)' }}>
              ONLINE — OPEN TO WORK
            </span>
          </div>
          <a href={`mailto:${OWNER.email}`} style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)',
            transition: 'color 0.2s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--plasma-blue)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            {OWNER.email}
          </a>
        </div>
      </div>
    </div>
  );
}

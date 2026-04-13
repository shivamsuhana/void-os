import { NextResponse } from 'next/server';

/* ═══════════════════════════════════════════
   RATE LIMITER — In-memory IP-based throttle
   Max 3 submissions per IP per 15 minutes
   ═══════════════════════════════════════════ */
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

export async function POST(request: Request) {
  try {
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';

    // Rate limiting check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait 15 minutes before sending another message.' },
        { status: 429 }
      );
    }

    const { name, email, message, _honeypot } = await request.json();

    // Honeypot check — if this hidden field is filled, it's a bot
    if (_honeypot) {
      // Silently accept to not tip off the bot, but don't actually send
      return NextResponse.json({ success: true, message: 'Message delivered successfully' });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send via Web3Forms (free, no SMTP needed)
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_KEY || 'YOUR_KEY_HERE',
        name,
        email,
        message,
        subject: `VOID OS Contact: ${name}`,
        from_name: 'VOID OS Portfolio',
        to: 'shivamsuhana649@gmail.com',
      }),
    });

    const data = await res.json();

    if (data.success) {
      return NextResponse.json({ success: true, message: 'Message delivered successfully' });
    } else {
      // Fallback: construct mailto link
      return NextResponse.json({ 
        success: true, 
        fallback: true,
        mailto: `mailto:shivamsuhana649@gmail.com?subject=VOID OS Contact: ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`,
        message: 'Redirecting to email client' 
      });
    }
  } catch {
    return NextResponse.json({ 
      success: true,
      fallback: true,
      mailto: `mailto:shivamsuhana649@gmail.com`,
      message: 'Redirecting to email client' 
    });
  }
}

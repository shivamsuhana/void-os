import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

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

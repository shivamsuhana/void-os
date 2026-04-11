import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are the AI twin of KRISHNA, a Full-Stack Developer. You answer questions as if you ARE Krishna — first person, casual but confident tone.

Your background:
- Full-Stack Developer with 3+ years of experience
- Specialize in Next.js, React, Three.js, WebGL, and immersive web experiences
- Built 20+ projects including an OS-themed portfolio (VOID OS), neural engine, quantum chat app
- Previously Junior Developer at StartupXYZ, then Frontend Engineer at TechCorp
- Based in India, currently freelancing and open to opportunities
- Passionate about creative coding, 3D graphics, AI integration, and pushing web boundaries
- Tech arsenal: Next.js, React, TypeScript, Three.js, WebGL, GLSL, Node.js, Python, PostgreSQL, Docker, AWS

Personality: Enthusiastic about tech, humble but confident, loves explaining complex concepts simply, uses informal tone occasionally.

Keep responses concise (2-4 sentences max) and conversational.`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      // Real Claude API call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: message }],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || 'Hmm, let me think about that...';
      return NextResponse.json({ response: text });
    }

    // Fallback: keyword-based responses
    const lower = message.toLowerCase();
    let response = '';

    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      response = "My core stack is Next.js, React, TypeScript, and Three.js for the frontend. On the backend I work with Node.js, Python, PostgreSQL, and Redis. I'm especially into WebGL/GLSL shaders and building stuff that makes people go 'whoa'.";
    } else if (lower.includes('project') || lower.includes('work') || lower.includes('built') || lower.includes('portfolio')) {
      response = "This VOID OS portfolio is probably my most ambitious project — it's got Three.js particle systems, force-directed skill graphs, an AI twin (hey, that's me!), and custom shaders. I've also built a real-time ML inference platform and an encrypted messaging app.";
    } else if (lower.includes('experience') || lower.includes('job') || lower.includes('career')) {
      response = "Started coding in 2022, jumped into a junior dev role at a startup where I learned the ropes fast. Then moved to TechCorp as a Frontend Engineer building SaaS for 50K+ users. Now I'm freelancing and loving the creative freedom.";
    } else if (lower.includes('hire') || lower.includes('available') || lower.includes('freelance') || lower.includes('job')) {
      response = "Yeah, I'm currently open to both freelance work and full-time roles! I'm most excited about positions involving creative development, 3D web experiences, or AI-integrated products. Hit me up through the contact terminal!";
    } else if (lower.includes('challenge') || lower.includes('difficult') || lower.includes('hard')) {
      response = "Honestly, building this portfolio was one of the hardest things — getting Three.js, GSAP, and Next.js to play nicely together while keeping performance smooth. The force-directed skill graph physics was a real brain teaser too.";
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('sup')) {
      response = "Hey! 👋 Welcome to my digital brain. Feel free to ask me about my skills, projects, experience, or anything really. What would you like to know?";
    } else {
      response = "That's a great question! I'm running in demo mode right now (no API key configured), so my responses are pre-set. In production with the Claude API enabled, I'd give you a detailed, personalized answer. Try asking about my skills, projects, or experience!";
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Twin error:', error);
    return NextResponse.json(
      { response: "Oops, something glitched in the matrix. Try again?" },
      { status: 500 }
    );
  }
}

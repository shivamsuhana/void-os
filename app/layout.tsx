import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VOID OS — Krishu\'s Portfolio',
  description: 'A portfolio disguised as a next-generation operating system. Boot in, explore, and discover — every section is an app, every interaction is a moment of awe.',
  keywords: ['developer', 'portfolio', 'java', 'dsa', 'backend', 'three.js', 'react', 'next.js', 'creative coding', 'krishu', 'void os'],
  authors: [{ name: 'Krishu (Shiv Charan)' }],
  metadataBase: new URL('https://portfolio-void-os.vercel.app'),
  openGraph: {
    title: 'VOID OS — Krishu\'s Portfolio',
    description: 'A 3D holographic OS portfolio with cinematic boot sequence, AI twin chatbot, force-directed skill graph, and fly-through project tunnel. Built with Next.js, Three.js, and GSAP.',
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolio-void-os.vercel.app',
    siteName: 'VOID OS',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 1024,
        alt: 'VOID OS — 3D Holographic Desktop Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOID OS — Krishu\'s Portfolio',
    description: 'A 3D holographic OS portfolio — cinematic boot, AI twin, force-directed skill graph, project tunnel.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#030306" />
        <meta name="color-scheme" content="dark" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Krishu (Shiv Charan)',
              url: 'https://portfolio-void-os.vercel.app',
              jobTitle: 'Software Developer',
              knowsAbout: ['Java', 'Data Structures', 'React', 'Next.js', 'Three.js', 'Backend Development'],
              sameAs: [
                'https://github.com/shivamsuhana',
                'https://linkedin.com/in/shivamsuhana',
                'https://leetcode.com/shivamsuhana',
              ],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

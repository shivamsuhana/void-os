import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VOID OS — Krishu\'s Portfolio',
  description: 'A portfolio disguised as an alien operating system from 2045. Boot in, explore, and discover — every section is an app, every interaction is a moment of awe.',
  keywords: ['developer', 'portfolio', 'java', 'dsa', 'backend', 'three.js', 'react', 'next.js', 'creative coding'],
  authors: [{ name: 'Krishu' }],
  openGraph: {
    title: 'VOID OS — Krishu\'s Portfolio',
    description: 'A portfolio that feels like booting into an alien operating system from 2045.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VOID OS — Krishu\'s Portfolio',
    description: 'A portfolio that feels like booting into an alien operating system from 2045.',
  },
  robots: { index: true, follow: true },
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
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}

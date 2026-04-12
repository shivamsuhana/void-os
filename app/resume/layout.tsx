import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume — Krishu (Shiv Charan)',
  description: 'Auto-generated resume of Krishu — Java Developer & Backend Enthusiast. B.Tech CSE, Jain University.',
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

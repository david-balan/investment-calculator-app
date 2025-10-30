import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Investment & Retirement Calculator',
  description: 'Plan your financial future with compound interest projections',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
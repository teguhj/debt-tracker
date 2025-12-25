import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '자유로의 여정',
  description: '부채 상환 추적 애플리케이션',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

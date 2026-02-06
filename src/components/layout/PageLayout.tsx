import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="safe-bottom">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

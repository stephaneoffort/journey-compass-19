import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { AppSidebar } from './AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: ReactNode;
}

const DESKTOP_BREAKPOINT = 1024;

function useIsDesktop() {
  // useIsMobile uses 768 breakpoint; we need 1024
  const isMobile = useIsMobile();
  // For SSR-safety, also check window directly
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= DESKTOP_BREAKPOINT;
}

export function PageLayout({ children }: PageLayoutProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-12 flex items-center border-b border-border px-4 shrink-0">
              <SidebarTrigger />
            </header>
            <main className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto w-full">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="safe-bottom max-w-2xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

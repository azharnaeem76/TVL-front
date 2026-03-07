'use client';

import { useEffect } from 'react';
import { useKeyboardShortcuts, CommandPalette } from '@/components/KeyboardShortcuts';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';
import { ToastProvider } from '@/components/Toast';
import { OnboardingTour } from '@/components/OnboardingTour';
import AppSidebar from '@/components/AppSidebar';
import { useSidebarMargin } from '@/components/AppSidebar';

function MainContent({ children }: { children: React.ReactNode }) {
  const marginClass = useSidebarMargin();
  return (
    <div className={`transition-all duration-300 ${marginClass}`}>
      {children}
    </div>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { showSearch, setShowSearch } = useKeyboardShortcuts();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AppSidebar />
          <MainContent>{children}</MainContent>
          <CommandPalette open={showSearch} onClose={() => setShowSearch(false)} />
          <OnboardingTour />
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

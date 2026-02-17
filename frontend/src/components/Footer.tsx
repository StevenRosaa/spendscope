'use client';

import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/signin' || pathname === '/signup' || pathname === '/dashboard' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/reports' || pathname === '/ai-insights') return null;

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            {/* Adjusted logo size to match the typography scale */}
            <Logo withText animated className="w-16 h-16" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} SpendScope Inc. All rights reserved.
          </p>
        </div>
      </footer>
  );
}
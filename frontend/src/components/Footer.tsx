'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Nascondiamo il footer nelle app-view o nelle pagine di auth per un look più pulito
  if (pathname === '/signin' || pathname === '/signup' || pathname === '/dashboard' || pathname === '/forgot-password' || pathname === '/reset-password') return null;

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">SpendScope</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">© 2026 All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
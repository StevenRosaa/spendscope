'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogOut, Settings, User as UserIcon, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Evitiamo l'header nelle pagine di Auth per un look "Focus Mode"
  if (pathname === '/signin' || pathname === '/signup') return null;

  const mockAvatar = "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&rounded=true&bold=true";

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.div whileHover={{ rotate: 15 }} className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="text-white w-5 h-5" />
          </motion.div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            SpendScope
          </span>
        </Link>

        {/* Navigation Logic */}
        <div className="flex items-center space-x-8">
          {isLoading ? (
            /* Skeleton / Placeholder per evitare lo "spasmo" */
            <div className="w-20 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
          ) : !isAuthenticated ? (
            /* --- PUBLIC HEADER (Non loggato) --- */
            <>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
                <Link href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/signin" className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(139, 92, 246, 0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl transition-all"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            </>
          ) : (
            /* --- PRIVATE HEADER (Loggato) --- */
            <div className="flex items-center space-x-6" ref={dropdownRef}>
              <Link href="/dashboard" className={`hidden sm:flex items-center text-sm font-semibold transition-colors ${pathname === '/dashboard' ? 'text-violet-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 group focus:outline-none"
                >
                  <div className="relative">
                    <img src={mockAvatar} alt="Avatar" className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-violet-500/50 transition-all" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-950 rounded-full" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold">Giacomo</p>
                        <p className="text-xs text-slate-500 truncate">giacomo@example.com</p>
                      </div>
                      <div className="p-2">
                        <button className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition-colors">
                          <UserIcon className="w-4 h-4 mr-3" /> Profile Settings
                        </button>
                        <button 
                          onClick={logout}
                          className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
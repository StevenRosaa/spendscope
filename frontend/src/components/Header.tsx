'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, LogOut, Settings, User as UserIcon, LayoutDashboard, ChevronDown, PieChart, Sparkles } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import SettingsModal from '@/components/SettingsModal';
import {Logo} from './Logo';

export default function Header() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  if (
    pathname === '/signin' || 
    pathname === '/signup' || 
    pathname === '/forgot-password' || 
    pathname === '/reset-password'
  ) return null;

  const avatarName = user?.full_name ? encodeURIComponent(user.full_name) : 'User';
  const dynamicAvatar = `https://ui-avatars.com/api/?name=${avatarName}&background=6366f1&color=fff&rounded=true&bold=true`;

  return (
    <>
      <nav className="fixed w-full top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo Section - Modified for a cleaner look with smooth gradient hover */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Logo className="w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
            
            {/* Trucco Cross-Fade per il Gradiente sul Testo */}
            <div className="relative text-xl font-bold tracking-tight">
              {/* Testo Base (Visibile di default, sparisce in hover) */}
              <span className="text-slate-900 dark:text-white transition-opacity duration-300 group-hover:opacity-0">
                SpendScope
              </span>
              {/* Testo Gradiente (Invisibile di default, appare in hover) */}
              <span className="absolute left-0 top-0 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                SpendScope
              </span>
            </div>
          </Link>

          {/* Navigation Logic */}
          <div className="flex items-center space-x-6">
            {isLoading ? (
              <div className="w-20 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : !isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-8">
                  <ThemeToggle />
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
              <div className="flex items-center space-x-6" ref={dropdownRef}>
                <div className="hidden md:flex items-center space-x-1">
                  <Link href="/dashboard" className={`flex items-center px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${pathname === '/dashboard' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                  <Link href="/reports" className={`flex items-center px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${pathname === '/reports' ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
                    <PieChart className="w-4 h-4 mr-2" /> Reports
                  </Link>
                  <Link href="/ai-insights" className={`flex items-center px-3 py-2 rounded-xl text-sm font-semibold transition-colors group ${pathname === '/ai-insights' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
                    <Sparkles className={`w-4 h-4 mr-2 transition-transform ${pathname !== '/ai-insights' && 'group-hover:rotate-12 group-hover:text-indigo-500'}`} /> 
                    AI Insights
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-md">BETA</span>
                  </Link>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 group focus:outline-none"
                  >
                    <div className="relative">
                      <img src={dynamicAvatar} alt="Avatar" className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-violet-500/50 transition-all" />
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
                          <p className="text-sm font-bold">{user?.full_name || 'Utente'}</p>
                          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                        
                        <div className="p-2 space-y-1">
                          <button 
                            onClick={() => {
                              setIsDropdownOpen(false);
                              setIsSettingsOpen(true);
                            }}
                            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 rounded-xl transition-colors"
                          >
                            <UserIcon className="w-4 h-4 mr-3" /> Profile Settings
                          </button>
                          <button 
                            onClick={logout}
                            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" /> Sign Out
                          </button>
                        </div>

                        <div className="p-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-3 py-3">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Appearance</span>
                          <ThemeToggle />
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

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
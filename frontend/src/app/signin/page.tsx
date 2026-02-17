'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Loader2, Zap, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle per la password
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token); // Salviamo anche questo!
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Login failed:', err);
      // Catturiamo anche l'errore 429 del Rate Limiter (Scudo Anti-Hacker)
      if (err.response?.status === 429) {
        setError('Too many login attempts. Please try again in a minute.');
      } else {
        setError(err.response?.data?.detail || 'Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 dark:bg-violet-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md p-8 space-y-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="text-center flex flex-col items-center">
          <Link href="/">
            <motion.div whileHover={{ rotate: 15 }} className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-6 cursor-pointer">
              <Zap className="text-white w-6 h-6" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Sign in to your SpendScope account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all duration-200 placeholder:text-slate-400"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              {/* Link Forgot Password */}
              <Link href="/forgot-password" className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all duration-200 placeholder:text-slate-400 pr-12"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={isLoading}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/25 text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all duration-200"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </motion.button>

          <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-4">
            Don't have an account?{' '}
            <Link href="/signup" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
              Sign up for free
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
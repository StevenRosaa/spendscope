'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Wallet, Plane, Coffee, ShoppingCart, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo'; // Assicurati che il percorso sia corretto

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      localStorage.setItem('refresh_token', response.data.refresh_token);
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Login failed:', err);
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
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* SEZIONE SINISTRA: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-28 z-10">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-10 text-center lg:text-left"
          >
            <Link href="/" className="inline-block mb-6">
              <Logo className="w-12 h-12" animated />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Please enter your details to sign in.</p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleLogin} className="space-y-6"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all duration-200 placeholder:text-slate-400"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all duration-200 placeholder:text-slate-400 pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none rounded"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0, y: -10 }} animate={{ opacity: 1, height: 'auto', y: 0 }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/20 text-white bg-slate-900 hover:bg-slate-800 dark:bg-violet-600 dark:hover:bg-violet-500 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 group active:scale-[0.98]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Sign In <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>

            <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">
              Don't have an account?{' '}
              <Link href="/signup" className="text-slate-900 dark:text-white hover:underline transition-all font-semibold">
                Sign up for free
              </Link>
            </div>
          </motion.form>
        </div>
      </div>

      {/* SEZIONE DESTRA: Mini-Dashboard Animata (Solo Desktop) */}
      <div className="hidden lg:flex lg:flex-1 relative bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 items-center justify-center overflow-hidden">
        
        {/* Glow Effects Background */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/20 dark:bg-violet-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        
        {/* Interactive UI Mockup */}
        <div className="relative w-full max-w-md mx-auto z-10 perspective-1000">
          
          {/* Main Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Expenses</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">$4,850.00</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shadow-inner">
                <Wallet className="w-7 h-7 text-violet-600 dark:text-violet-400" />
              </div>
            </div>

            <div className="space-y-4">
              <MockupTransaction icon={<Plane />} bg="bg-sky-100 dark:bg-sky-900/30" color="text-sky-600 dark:text-sky-400" title="Delta Airlines" date="Travel • Today" amount="$850.00" delay={0} />
              <MockupTransaction icon={<ShoppingCart />} bg="bg-indigo-100 dark:bg-indigo-900/30" color="text-indigo-600 dark:text-indigo-400" title="Apple Store" date="Electronics • Yesterday" amount="$3,995.00" delay={0.2} />
              <MockupTransaction icon={<Coffee />} bg="bg-amber-100 dark:bg-amber-900/30" color="text-amber-600 dark:text-amber-400" title="Starbucks" date="Food • Mar 12" amount="$5.00" delay={0.4} />
            </div>
          </motion.div>

          {/* Floating Success Notification */}
          <motion.div 
            animate={{ y: [0, 15, 0], opacity: [0.9, 1, 0.9] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-12 -bottom-8 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Receipt Processed</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Data categorized by AI</p>
            </div>
          </motion.div>

        </div>
      </div>
      
    </div>
  );
}

// Sub-componente per le transazioni animate
function MockupTransaction({ icon, bg, color, title, date, amount, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{date}</p>
        </div>
      </div>
      <p className="font-bold text-slate-900 dark:text-white">{amount}</p>
    </motion.div>
  );
}
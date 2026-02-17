'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Loader2, Eye, EyeOff, Check, X, Sparkles, PieChart, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) router.push('/dashboard');
  }, [router]);

  const hasForbiddenChars = password.length > 0 && /[^a-zA-Z0-9!@#$%^&*?]/.test(password);

  const passwordRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*?]/.test(password) },
    { label: 'No invalid characters', met: password.length > 0 && !hasForbiddenChars },
  ];

  const allRulesMet = passwordRules.every(rule => rule.met);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  const isFormValid = fullName.trim() !== '' && email.trim() !== '' && allRulesMet && passwordsMatch;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/register', {
        email: email,
        password: password,
        full_name: fullName,
      });

      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('access_token', loginResponse.data.access_token);
      localStorage.setItem('refresh_token', loginResponse.data.refresh_token);
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Signup failed:', err);
      if (err.response?.status === 429) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* SEZIONE SINISTRA: Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-28 z-10 py-12">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="mb-8 text-center lg:text-left"
          >
            <Link href="/" className="inline-block mb-6">
              <Logo className="w-12 h-12" animated />
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create an account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Start automating your expenses today.</p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleSignup} className="space-y-5"
          >
            <div className="space-y-2">
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-slate-400"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-slate-400"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-slate-400 pr-12"
                  placeholder="••••••••"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Checklist Regole Password */}
              {password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {passwordRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center text-xs font-medium">
                        {rule.met ? <Check className="w-3.5 h-3.5 mr-2 text-emerald-500" /> : <X className="w-3.5 h-3.5 mr-2 text-slate-300 dark:text-slate-600" />}
                        <span className={rule.met ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl text-slate-900 dark:text-white focus:ring-2 outline-none transition-all duration-200 placeholder:text-slate-400 pr-12
                    ${confirmPassword.length > 0 && !passwordsMatch 
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-900/50' 
                      : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500 focus:border-indigo-500'}`}
                  placeholder="••••••••"
                />
                <button 
                  type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <AnimatePresence>
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="text-xs text-red-500 font-medium mt-1">
                    Passwords do not match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/20 text-white bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group active:scale-[0.98] mt-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Create Account <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" /></>
              )}
            </button>

            <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">
              Already have an account?{' '}
              <Link href="/signin" className="text-slate-900 dark:text-white hover:underline transition-all font-semibold">
                Sign in here
              </Link>
            </div>
          </motion.form>
        </div>
      </div>

      {/* SEZIONE DESTRA: Mini-Dashboard Analitica Animata (Solo Desktop) */}
      <div className="hidden lg:flex lg:flex-1 relative bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 items-center justify-center overflow-hidden">
        
        {/* Glow Effects Background */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 dark:bg-indigo-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/20 dark:bg-cyan-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen pointer-events-none" />
        
        {/* Interactive Analytics Mockup */}
        <div className="relative w-full max-w-md mx-auto z-10 perspective-1000">
          
          {/* Main Analytics Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Overview</p>
                <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">$3,240.50</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shadow-inner">
                <PieChart className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            {/* Categorie e Grafici a barre animati */}
            <div className="space-y-6">
              <MockupCategory title="Food & Groceries" amount="$1,250.00" color="bg-emerald-500" width="85%" delay={0.2} />
              <MockupCategory title="Software & Tools" amount="$840.00" color="bg-violet-500" width="60%" delay={0.4} />
              <MockupCategory title="Travel & Transport" amount="$450.00" color="bg-sky-500" width="35%" delay={0.6} />
            </div>
          </motion.div>

          {/* Floating AI Insight Notification */}
          <motion.div 
            animate={{ y: [0, 15, 0], opacity: [0.95, 1, 0.95] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -left-12 -bottom-8 z-20 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4"
          >
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <TrendingDown className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">AI Insight</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Spending down 12% this week</p>
            </div>
          </motion.div>

        </div>
      </div>
      
    </div>
  );
}

// Sub-componente per le categorie analitiche
function MockupCategory({ title, amount, color, width, delay }: any) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-slate-700 dark:text-slate-300">{title}</span>
        <span className="font-bold text-slate-900 dark:text-white">{amount}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: width }}
          transition={{ duration: 1.5, delay: delay, ease: "easeOut" }}
          className={`h-full ${color} rounded-full shadow-inner`}
        />
      </div>
    </div>
  );
}
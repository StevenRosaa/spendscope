'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Loader2, Zap, Eye, EyeOff, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // --- Password Validation Rules ---
  const hasForbiddenChars = password.length > 0 && /[^a-zA-Z0-9!@#$%^&*?]/.test(password);

  const passwordRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special character (!@#$%^&*)', met: /[!@#$%^&*?]/.test(password) },
    { label: 'No invalid characters (like - or _)', met: password.length > 0 && !hasForbiddenChars },
  ];

  const allRulesMet = passwordRules.every(rule => rule.met);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  
  // Il bottone è disabilitato finché tutte le regole non sono rispettate
  const isFormValid = fullName.trim() !== '' && email.trim() !== '' && allRulesMet && passwordsMatch;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return; // Doppia sicurezza
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Invia la registrazione includendo il Full Name
      await apiClient.post('/auth/register', {
        email: email,
        password: password,
        full_name: fullName,
      });

      // 2. Auto-Login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('access_token', loginResponse.data.access_token);
      localStorage.setItem('refresh_token', loginResponse.data.refresh_token); // Aggiungi questa riga!
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
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden py-12">
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md p-8 space-y-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="text-center flex flex-col items-center">
          <Link href="/">
            <motion.div whileHover={{ rotate: -15 }} className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 cursor-pointer">
              <Zap className="text-white w-6 h-6" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create an account</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Start automating your expenses</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-slate-400"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-slate-400"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 placeholder:text-slate-400 pr-12"
                placeholder="••••••••"
              />
              <button 
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Real-time Password Rules Checklist */}
            <div className="mt-3 space-y-1.5 bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
              {passwordRules.map((rule, idx) => (
                <div key={idx} className="flex items-center text-xs font-medium">
                  {rule.met ? (
                    <Check className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                  ) : (
                    <X className="w-3.5 h-3.5 mr-2 text-slate-300 dark:text-slate-600" />
                  )}
                  <span className={rule.met ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white focus:ring-2 outline-none transition-all duration-200 placeholder:text-slate-400 pr-12
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
            {/* Errore visuale se non combaciano */}
            <AnimatePresence>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="text-xs text-red-500 font-medium mt-1">
                  Passwords do not match
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={isFormValid ? { scale: 1.01 } : {}}
            whileTap={isFormValid ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-6"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
          </motion.button>

          <div className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 pt-4">
            Already have an account?{' '}
            <Link href="/signin" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
              Sign in here
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Loader2, ShieldCheck, Eye, EyeOff, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Componente interno che gestisce il form (deve essere wrappato in Suspense)
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Password Rules ---
  const hasForbiddenChars = password.length > 0 && /[^a-zA-Z0-9!@#$%^&*?]/.test(password);
  const passwordRules = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /[0-9]/.test(password) },
    { label: 'Contains special char (!@#$%^&*)', met: /[!@#$%^&*?]/.test(password) },
    { label: 'No invalid characters', met: password.length > 0 && !hasForbiddenChars },
  ];

  const allRulesMet = passwordRules.every(rule => rule.met);
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = allRulesMet && passwordsMatch && token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post('/auth/reset-password', {
        token: token,
        new_password: password
      });
      setSuccess(true);
      setTimeout(() => router.push('/signin'), 3000); // Reindirizza dopo 3 secondi
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link might be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  // Se l'utente arriva sulla pagina senza il token nell'URL
  if (!token) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/50">
        <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Invalid Link</h3>
        <p className="text-sm text-red-500 mt-2">The password reset link is missing or invalid.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-bold text-slate-700 dark:text-slate-300 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Password Updated!</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Your password has been reset successfully.<br/>Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all duration-200 pr-12"
            placeholder="••••••••"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Rules Checklist */}
        <div className="mt-3 bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50 space-y-1.5">
          {passwordRules.map((rule, idx) => (
            <div key={idx} className="flex items-center text-xs font-medium">
              {rule.met ? <Check className="w-3.5 h-3.5 mr-2 text-emerald-500" /> : <X className="w-3.5 h-3.5 mr-2 text-slate-400" />}
              <span className={rule.met ? "text-slate-700 dark:text-slate-300" : "text-slate-400"}>{rule.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm New Password</label>
        <input
          type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
          className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl outline-none transition-all duration-200 
            ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800 focus:ring-sky-500'}`}
          placeholder="••••••••"
        />
        <AnimatePresence>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-xs text-red-500 font-medium mt-1">
              Passwords do not match
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl border border-red-100 dark:border-red-900/50">
          {error}
        </div>
      )}

      <button
        type="submit" disabled={isLoading || !isFormValid}
        className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-sky-500/25 text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-4"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
      </button>
    </form>
  );
}

// Export principale con Suspense boundary per Next.js App Router
export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-800/50"
      >
        <div className="text-center flex flex-col items-center mb-6">
          <Link href="/">
            <motion.div whileHover={{ rotate: 15 }} className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4 cursor-pointer">
              <ShieldCheck className="text-white w-6 h-6" />
            </motion.div>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Set New Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Please enter your new secure password.</p>
        </div>

        <Suspense fallback={<div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
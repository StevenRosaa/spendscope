'use client';

import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, TrendingDown, BellRing } from 'lucide-react';
import Link from 'next/link';

export default function AIInsightsPage() {
  return (
    <div className="pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 relative overflow-hidden flex flex-col">
      
      {/* Sfondo Astratto Animato */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-violet-500/20 dark:bg-violet-500/10 blur-[80px] rounded-full pointer-events-none -z-10" 
      />

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-4 text-center z-10">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20 }}
          className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex items-center justify-center mb-8 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-3xl animate-pulse" />
          <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400 relative z-10" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight mb-6"
        >
          Talk to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">finances.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mb-12"
        >
          We are training a custom AI model on your categorized receipts. Soon, you will be able to ask questions, get tax deduction alerts, and receive proactive saving tips.
        </motion.p>

        {/* Preview Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid sm:grid-cols-3 gap-6 w-full max-w-3xl mb-12"
        >
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 text-left">
            <MessageSquare className="w-6 h-6 text-indigo-500 mb-4" />
            <h3 className="font-bold mb-1">Receipt Chat</h3>
            <p className="text-sm text-slate-500">"How much did I spend on Uber in London last month?"</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 text-left">
            <TrendingDown className="w-6 h-6 text-emerald-500 mb-4" />
            <h3 className="font-bold mb-1">Smart Savings</h3>
            <p className="text-sm text-slate-500">Identifies duplicate subscriptions and price hikes.</p>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 text-left">
            <BellRing className="w-6 h-6 text-amber-500 mb-4" />
            <h3 className="font-bold mb-1">Tax Assistant</h3>
            <p className="text-sm text-slate-500">Flags potential tax-deductible expenses automatically.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-105 transition-transform">
              Back to Dashboard
            </button>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { 
  ArrowRight, Receipt, PieChart, Shield, 
  Zap, Sparkles, Globe, Download, CheckCircle2, 
  Loader2
} from 'lucide-react';
import {Logo} from '@/components/Logo';

export default function LandingPage() {
  // Animazioni
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 selection:bg-violet-200 dark:selection:bg-violet-900 overflow-hidden">

      {/* --- HERO SECTION --- */}
      <main className="relative pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        <motion.div 
          className="max-w-7xl mx-auto px-6 text-center z-10 relative"
          variants={containerVariants} initial="hidden" animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold tracking-wide bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span>SpendScope 2.0 is live</span>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter max-w-5xl mx-auto leading-[1.1]"
          >
            Never type an expense <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              ever again.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Drop your receipts and let our AI instantly extract merchants, currencies, and totals. The smartest way to track your global spending.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-lg font-bold rounded-2xl shadow-xl flex items-center justify-center group transition-all active:scale-95">
                Start for free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/signin">
              <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-lg font-bold rounded-2xl shadow-sm flex items-center justify-center transition-all active:scale-95">
                Sign In
              </button>
            </Link>
          </motion.div>

          {/* MOCKUP VISIVO FLUTTUANTE */}
          <motion.div variants={itemVariants} className="mt-20 relative max-w-4xl mx-auto">
            <div className="relative rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="h-12 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center px-4 gap-2 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px] bg-gradient-to-b from-transparent to-slate-50 dark:to-slate-950/50">
                
                {/* Simulated AI Extraction Cards */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full max-w-sm p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between mb-4 z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-xl"><Receipt size={20} /></div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Apple Store</p>
                      <p className="text-xs text-slate-500">San Francisco, US</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">$1,299.00</p>
                    <p className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full inline-block mt-1">EXTRACTED</p>
                  </div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="w-full max-w-sm p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between opacity-80 scale-95 -mt-6 z-10"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl"><Zap size={20} /></div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Uber Trip</p>
                      <p className="text-xs text-slate-500">Analyzing image...</p>
                    </div>
                  </div>
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                </motion.div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* --- WHY SPENDSCOPE (Problema vs Soluzione) --- */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
          className="max-w-7xl mx-auto px-6"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">Built for the modern professional</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Manual data entry is dead. SpendScope uses state-of-the-art vision models to read your receipts exactly like a human accountant would, but in milliseconds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-500" />}
              title="Instant OCR Processing"
              description="Drop a photo or PDF. Our Gemini-powered AI extracts the merchant name, date, and exact amount instantly."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-blue-500" />}
              title="Multi-Currency & Geo"
              description="Traveled to Europe? We automatically detect the € symbol and the country of origin, organizing your global spend."
            />
            <FeatureCard 
              icon={<Download className="w-6 h-6 text-emerald-500" />}
              title="One-Click Export"
              description="Generate pristine CSV reports of your expenses in a single click. Ready to be sent to your accountant or imported to Excel."
            />
          </div>
        </motion.div>
      </section>

      {/* --- HOW IT WORKS (Gli step logici) --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">How it works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Linea di connessione desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-violet-200 dark:via-violet-800 to-transparent z-0" />
            
            <StepCard number="1" title="Upload" description="Take a picture of your receipt or drag a PDF into your secure dashboard." />
            <StepCard number="2" title="AI Extraction" description="Our AI reads the items, taxes, currency, and categorizes the expense for you." />
            <StepCard number="3" title="Track & Relax" description="View your financial insights, filter by country, and export data anytime." />
          </div>
        </div>
      </section>

      {/* --- BOTTOM CTA --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-violet-600 dark:bg-violet-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to automate your accounting?</h2>
          <p className="text-violet-100 text-lg mb-10 max-w-2xl mx-auto">
            Join the professionals who save hours every month by letting AI handle their receipts.
          </p>
          <Link href="/signup">
            <button className="px-10 py-5 bg-white text-violet-600 hover:bg-slate-50 text-xl font-bold rounded-2xl shadow-2xl transition-transform hover:scale-105 active:scale-95">
              Create your free account
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -8 }}
      className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 group"
    >
      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-4 border-slate-50 dark:border-slate-950 shadow-xl flex items-center justify-center mb-6 shadow-violet-500/20">
        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-indigo-600">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  );
}
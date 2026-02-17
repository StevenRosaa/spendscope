'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Receipt, PieChart, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  // Animation variants for staggered entrance
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
    <div className="pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300 selection:bg-violet-200 dark:selection:bg-violet-900">

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <motion.div 
          className="max-w-7xl mx-auto px-6 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6 flex justify-center">
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/50">
              Introducing SpendScope 2.0
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl mx-auto leading-tight"
          >
            Automate your expenses with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              AI precision.
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your receipts and let our intelligent engine extract data, categorize spending, and generate real-time financial insights.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-lg font-medium rounded-2xl shadow-xl shadow-violet-500/25 flex items-center justify-center group"
              >
                Start free trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 dark:bg-violet-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      </main>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <motion.div 
          className="max-w-7xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Receipt className="w-6 h-6 text-violet-600 dark:text-violet-400" />}
              title="Instant Extraction"
              description="Drop any receipt. Our vision model identifies stores, dates, and total amounts accurately in seconds."
            />
            <FeatureCard 
              icon={<PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
              title="Smart Categorization"
              description="Expenses are automatically assigned to categories, providing you with an organized financial overview."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />}
              title="Enterprise Security"
              description="Your financial data is encrypted and securely stored. Access your documents whenever you need them."
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}

// Sub-component for Feature Cards
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -8 }}
      className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10"
    >
      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
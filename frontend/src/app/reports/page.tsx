'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, Download, Calendar, ArrowUpRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportsPage() {
  const { isAuthorized, isLoading } = useAuthGuard(); // Usa la tua logica di protezione rotta

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  if (!isAuthorized) return null;

  return (
    <div className="pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Monthly Reports</h1>
            <p className="text-slate-500 mt-1 font-medium">Analyze your spending habits over time.</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              This Month
            </button>
            <button className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </header>

        {/* Skeleton dei Grafici (Placeholder per sviluppi futuri) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg">Spending Overview</h3>
              <BarChart3 className="text-slate-400 w-5 h-5" />
            </div>
            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
              <div className="text-center">
                <p className="text-slate-500 font-medium">Interactive Charts Coming Soon</p>
                <p className="text-sm text-slate-400 mt-1">We are connecting the data to the visualizations.</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <h3 className="font-bold text-lg mb-6">Top Categories</h3>
            <div className="space-y-4">
              {['Food & Dining', 'Transportation', 'Software Subscriptions', 'Office Supplies'].map((cat, i) => (
                <div key={cat} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>{cat}</span>
                    <span className="flex items-center text-slate-500"><ArrowUpRight className="w-3 h-3 mr-1" /> {80 - (i * 15)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${80 - (i * 15)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Hook di utilità (puoi metterlo in un file separato se preferisci)
function useAuthGuard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) router.push('/signin');
    else setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  return { isAuthorized, isLoading };
}
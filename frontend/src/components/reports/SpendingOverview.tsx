'use client';

import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import { ChartDataPoint } from '@/hooks/useAnalytics';

interface SpendingOverviewProps {
  data?: ChartDataPoint[];
  totalSpent?: number;
  isLoading: boolean;
}

export default function SpendingOverview({ data, totalSpent, isLoading }: SpendingOverviewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col"
    >
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-bold text-lg">Spending Overview</h3>
          {!isLoading && totalSpent !== undefined && (
            <p className="text-2xl font-extrabold text-violet-600 mt-1">€{totalSpent.toFixed(2)}</p>
          )}
        </div>
        <BarChart3 className="text-slate-400 w-5 h-5" />
      </div>
      
      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        ) : (
          <div className="text-center">
            {/* Qui in futuro inserirai un grafico reale come Recharts o Chart.js */}
            <p className="text-slate-500 font-medium">Dati ricevuti con successo!</p>
            <p className="text-sm text-slate-400 mt-1">Trovati {data?.length || 0} giorni con transazioni.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
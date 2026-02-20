'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { CategoryDataPoint } from '@/hooks/useAnalytics';

interface TopCategoriesProps {
  categories?: CategoryDataPoint[];
  isLoading: boolean;
}

export default function TopCategories({ categories, isLoading }: TopCategoriesProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px]"
    >
      <h3 className="font-bold text-lg mb-6">Top Categories</h3>
      
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : !categories || categories.length === 0 ? (
        <p className="text-slate-500 text-sm text-center mt-10">Nessuna spesa in questo periodo.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={cat.label} className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{cat.label}</span>
                <span className="flex items-center text-slate-500">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> 
                  €{cat.value.toFixed(2)} ({cat.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${cat.percentage}%` }} transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="h-full bg-violet-500 rounded-full" 
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import DateRangePicker from '@/components/reports/DataRangePicker';
import SpendingOverview from '@/components/reports/SpendingOverview';
import TopCategories from '@/components/reports/TopCategories';
import { useAnalytics } from '@/hooks/useAnalytics';
import { DateRange } from '@/types';

// Helper per formattare la data per l'API (YYYY-MM-DD) locale
const toLocalISODate = (date: Date) => {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - (offset * 60 * 1000));
  return adjusted.toISOString().split('T')[0];
};

export default function ReportsPage() {
  // 1. Stato del filtro data
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  // 2. Chiamata API tramite l'hook
  const { data, isLoading, error } = useAnalytics(
    toLocalISODate(dateRange.from),
    toLocalISODate(dateRange.to)
  );

  return (
    <div className="pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Monthly Reports</h1>
            <p className="text-slate-500 mt-1 font-medium">Analyze your spending habits over time.</p>
          </div>
          
          <div className="flex gap-3">
            <DateRangePicker dateRange={dateRange} onChange={setDateRange} />
            <button className="flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* 3. Rendering dei moduli separati */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SpendingOverview 
            data={data?.spending_over_time} 
            totalSpent={data?.total_spent} 
            isLoading={isLoading} 
          />
          <TopCategories 
            categories={data?.top_categories} 
            isLoading={isLoading} 
          />
        </div>

      </main>
    </div>
  );
}
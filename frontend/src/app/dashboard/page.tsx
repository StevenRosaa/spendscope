'use client';

import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';
import ReceiptList from '@/components/ReceiptList';
import ReceiptModal from '@/components/ReceiptModal';
import { Loader2, Wallet, TrendingUp, Clock, Zap, ReceiptIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  
  // Riferimento per gestire l'intervallo di polling in modo pulito
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // --- Security Guard ---
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/signin');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  // --- Polling Logic ---
  const fetchReceipts = async () => {
    try {
      const response = await apiClient.get('/receipts');
      setReceipts(response.data);
    } catch (error) {
      console.error('Failed to fetch receipts', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchReceipts();
      // Avviamo il polling ogni 3 secondi
      pollingRef.current = setInterval(fetchReceipts, 3000);
    }

    // Cleanup quando il componente viene smontato
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthorized]);

  // --- Elegant Logout Cleanup ---
  // Se l'utente clicca logout (dall'header), fermiamo immediatamente il timer qui
  useEffect(() => {
    if (!isAuthenticated && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [isAuthenticated]);

  // --- Dynamic Calculations ---
  const totalSpent = receipts
    .filter(r => r.status === 'completed' && r.total_amount !== null && r.total_amount !== undefined)
    .reduce((sum, r) => sum + Number(r.total_amount), 0);
  
  const completedCount = receipts.filter(r => r.status === 'completed').length;
  const pendingCount = receipts.filter(r => r.status === 'pending' || r.status === 'processing').length;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 relative">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none -z-10" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 relative">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Here is the overview of your recent expenses.</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Spent</p>
              <p className="text-2xl font-bold tracking-tight">${totalSpent.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Processed</p>
              <p className="text-2xl font-bold tracking-tight">{completedCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">In Queue</p>
              <p className="text-2xl font-bold tracking-tight">{pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold">Upload Document</h2>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <FileUpload onUploadSuccess={fetchReceipts} />
            </div>
          </section>

          <section className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold">Recent Uploads</h2>
              {isLoading && <Loader2 className="animate-spin text-violet-600 w-5 h-5" />}
            </div>
            
            {!isLoading && receipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl border-dashed">
                <ReceiptIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                <p className="font-semibold text-slate-900 dark:text-white">No receipts found</p>
                <p className="text-sm text-slate-500 mt-1">Start by uploading your first receipt.</p>
              </div>
            ) : (
              <ReceiptList receipts={receipts} onSelectReceipt={setSelectedReceipt} />
            )}
          </section>
        </div>
      </main>

      <AnimatePresence>
        {selectedReceipt && (
          <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
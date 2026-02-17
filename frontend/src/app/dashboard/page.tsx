'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import FileUpload from '@/components/FileUpload';
import ReceiptList from '@/components/ReceiptList';
import ReceiptModal from '@/components/ReceiptModal';
import { Loader2, Wallet, TrendingUp, Clock, Zap, ReceiptIcon, Search, Filter, ArrowUpDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  
  // --- NUOVI STATI PER FILTRI E RICERCA ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

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
      pollingRef.current = setInterval(fetchReceipts, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthorized]);

  useEffect(() => {
    if (!isAuthenticated && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [isAuthenticated]);

  // --- AGGIORNATO: Calcoli Multi-Valuta ---
  const totalsByCurrency = receipts
    .filter(r => r.status === 'completed' && r.total_amount)
    .reduce((acc, r) => {
      const curr = r.currency || 'USD';
      acc[curr] = (acc[curr] || 0) + Number(r.total_amount);
      return acc;
    }, {} as Record<string, number>);
  
  const completedCount = receipts.filter(r => r.status === 'completed').length;
  const pendingCount = receipts.filter(r => r.status === 'pending' || r.status === 'processing').length;

  // --- MOTORE DI RICERCA E FILTRAGGIO (useMemo per performance) ---
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((r) => {
        // 1. Filtro Ricerca (Cerca nel nome del negozio)
        const storeName = (r.store_name || '').toLowerCase();
        const matchesSearch = storeName.includes(searchTerm.toLowerCase());
        
        // 2. Filtro Stato
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // 3. Ordinamento
        const dateA = new Date(a.receipt_date || a.created_at).getTime();
        const dateB = new Date(b.receipt_date || b.created_at).getTime();
        const amountA = Number(a.total_amount || 0);
        const amountB = Number(b.total_amount || 0);

        switch (sortBy) {
          case 'date_desc': return dateB - dateA;
          case 'date_asc': return dateA - dateB;
          case 'amount_desc': return amountB - amountA;
          case 'amount_asc': return amountA - amountB;
          default: return 0;
        }
      });
  }, [receipts, searchTerm, statusFilter, sortBy]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300 relative">
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none -z-10" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 z-10 relative">
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 font-medium">Here is the overview of your recent expenses.</p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* AGGIORNATO: Card Multi-Valuta */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all">
            <div className="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Spent</p>
              {/* NUOVO CODICE CORRETTO */}
              {Object.keys(totalsByCurrency).length === 0 ? (
                <p className="text-2xl font-bold tracking-tight">$0.00</p>
              ) : (
                <div className="flex flex-col">
                  {Object.entries(totalsByCurrency).map(([currency, amount]) => (
                    <p key={currency} className="text-2xl font-bold tracking-tight">
                      {/* Abbiamo aggiunto Number(amount) qui sotto! */}
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(Number(amount))}
                    </p>
                  ))}
                </div>
              )}
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
          
          {/* Colonna Sinistra: Upload */}
          <section className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold">Upload Document</h2>
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <FileUpload onUploadSuccess={fetchReceipts} />
            </div>
          </section>

          {/* Colonna Destra: Lista e Filtri */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold">Recent Uploads</h2>
              {isLoading && <Loader2 className="animate-spin text-violet-600 w-5 h-5" />}
            </div>

            {/* BARRA DEGLI STRUMENTI (Search & Filters) */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by store name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                />
              </div>
              
              {/* Dropdowns */}
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div className="relative">
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all cursor-pointer"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="amount_desc">Highest Amount</option>
                    <option value="amount_asc">Lowest Amount</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Lista Scontrini con Barra di Scorrimento */}
            <div className="max-h-[250px] overflow-y-auto overflow-x-hidden pr-2 custom-scrollbar rounded-xl">
              {!isLoading && receipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl border-dashed">
                  <ReceiptIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="font-semibold text-slate-900 dark:text-white">No receipts found</p>
                  <p className="text-sm text-slate-500 mt-1">Start by uploading your first receipt.</p>
                </div>
              ) : !isLoading && filteredReceipts.length === 0 ? (
                 <div className="flex flex-col items-center justify-center p-12 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Search className="w-8 h-8 text-slate-400 mb-3" />
                  <p className="font-semibold text-slate-900 dark:text-white">No matches found</p>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search term.</p>
                </div>
              ) : (
                <ReceiptList receipts={filteredReceipts} onSelectReceipt={setSelectedReceipt} />
              )}
            </div>
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
import { motion } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ReceiptModal({ receipt, onClose }: { receipt: any, onClose: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSecureDownload = async () => {
    try {
      setIsDownloading(true);
      // Chiediamo al backend il pass VIP per il Cloudflare R2
      const res = await apiClient.get(`/receipts/${receipt.id}/download`);
      window.open(res.data.url, '_blank'); // Apre l'immagine in una nuova scheda
    } catch (error) {
      console.error("Failed to get download link", error);
      alert("Failed to load image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{receipt.store_name}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{new Date(receipt.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Purchased Items</h3>
          <div className="space-y-3">
            {receipt.items && receipt.items.length > 0 ? (
              receipt.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.description}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-1 inline-block">
                      {item.category.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">${item.amount.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 italic py-4">No specific items extracted.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</span>
            <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">${(receipt.total_amount || 0).toFixed(2)}</span>
          </div>
          <button 
            onClick={handleSecureDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            View Original Image
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
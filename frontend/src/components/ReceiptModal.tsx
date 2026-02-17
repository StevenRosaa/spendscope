import { motion } from 'framer-motion';
import { X, Download, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ReceiptModal({ receipt, onClose }: { receipt: any, onClose: () => void }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSecureDownload = async () => {
    try {
      setIsDownloading(true);
      const res = await apiClient.get(`/receipts/${receipt.id}/download`);
      window.open(res.data.url, '_blank');
    } catch (error) {
      console.error("Failed to get download link", error);
      alert("Failed to load image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const displayDate = receipt.receipt_date 
    ? new Date(receipt.receipt_date).toLocaleDateString() 
    : new Date(receipt.created_at).toLocaleDateString();

  // Formattatore Valuta
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: receipt.currency || 'USD',
    }).format(amount);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50 dark:bg-slate-950/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {receipt.store_name || 'Unknown Store'}
            </h2>
            <div className="flex items-center text-slate-500 dark:text-slate-400 mt-1 space-x-2">
              <span>{displayDate}</span>
              {receipt.country && receipt.country !== 'Unknown' && (
                <>
                  <span>•</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {receipt.country}</span>
                </>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-slate-900">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Purchased Items</h3>
          <div className="space-y-4">
            {receipt.items && receipt.items.length > 0 ? (
              receipt.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-100 dark:border-slate-800/50 border-dashed last:border-0">
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">{item.description}</p>
                    {item.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mt-1.5 inline-block">
                        {item.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  {/* Valuta sugli Item */}
                  <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-slate-500 italic">No specific items extracted.</p>
                <p className="text-xs text-slate-400 mt-1">Only the total amount was captured.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-violet-50 dark:bg-slate-950 border-t border-violet-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col w-full sm:w-auto text-center sm:text-left">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</span>
            {/* Valuta sul Totale */}
            <span className="text-4xl font-black tracking-tight text-violet-600 dark:text-violet-400">
              {formatCurrency(receipt.total_amount || 0)}
            </span>
          </div>
          <button onClick={handleSecureDownload} disabled={isDownloading} className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:hover:scale-100">
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />} View Original
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import { ReceiptIcon, Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

export default function ReceiptList({ receipts, onSelectReceipt }: { receipts: any[], onSelectReceipt: (r: any) => void }) {
  
  // Funzione magica per formattare la valuta
  const formatCurrency = (amount: number, currencyCode: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {receipts.map((receipt) => (
          <motion.div 
            layout
            key={receipt.id}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
            onClick={() => receipt.status === 'completed' ? onSelectReceipt(receipt) : null}
            className={`group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-200 ${
              receipt.status === 'completed' 
                ? 'cursor-pointer hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700/50' 
                : 'opacity-80'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl transition-colors ${
                receipt.status === 'completed' 
                  ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-500 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                <ReceiptIcon size={24} />
              </div>
              
              <div>
                {receipt.status === 'completed' ? (
                  <>
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs flex items-center gap-2">
                      {receipt.store_name || 'Unknown Store'}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
                      <span>{receipt.receipt_date ? new Date(receipt.receipt_date).toLocaleDateString() : new Date(receipt.created_at).toLocaleDateString()}</span>
                      
                      {/* Mostriamo la nazione se esiste e non è Unknown */}
                      {receipt.country && receipt.country !== 'Unknown' && (
                        <>
                          <span>•</span>
                          <span className="flex items-center"><MapPin className="w-3 h-3 mr-0.5" /> {receipt.country}</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-semibold text-slate-500 dark:text-slate-400 italic">Processing...</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">AI is analyzing document</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              {receipt.status === 'completed' && receipt.total_amount !== null && receipt.total_amount !== undefined && (
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {/* Usa la valuta reale! */}
                  {formatCurrency(receipt.total_amount, receipt.currency)}
                </span>
              )}
              
              {(receipt.status === 'pending' || receipt.status === 'processing') && (
                <span className="flex items-center text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1 rounded-full">
                  <Loader2 size={12} className="animate-spin mr-1.5" /> Analyzing
                </span>
              )}
              
              {receipt.status === 'completed' && (
                <span className="flex items-center text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1 rounded-full">
                  <CheckCircle size={12} className="mr-1.5" /> Extracted
                </span>
              )}

              {receipt.status === 'failed' && (
                <span className="flex items-center text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 px-2.5 py-1 rounded-full">
                  <AlertCircle size={12} className="mr-1.5" /> Failed
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
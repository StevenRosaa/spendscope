import { motion } from 'framer-motion';
import { ReceiptIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ReceiptList({ receipts, onSelectReceipt }: { receipts: any[], onSelectReceipt: (r: any) => void }) {
  return (
    <div className="space-y-3">
      {receipts.map((receipt, index) => (
        <motion.div 
          key={receipt.id}
          // Animazione semplificata e a prova di bomba contro il polling
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          onClick={() => receipt.status === 'completed' ? onSelectReceipt(receipt) : null}
          className={`group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all duration-200 ${receipt.status === 'completed' ? 'cursor-pointer hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700' : 'opacity-80'}`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl transition-colors ${receipt.status === 'completed' ? 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/50 group-hover:text-violet-600 dark:group-hover:text-violet-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <ReceiptIcon size={24} />
            </div>
            
            <div>
              {receipt.status === 'completed' ? (
                <>
                  <h3 className="font-semibold">{receipt.store_name || 'Unknown Store'}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(receipt.created_at).toLocaleDateString()}
                  </p>
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
              <span className="text-lg font-bold tracking-tight">
                ${Number(receipt.total_amount).toFixed(2)}
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
    </div>
  );
}
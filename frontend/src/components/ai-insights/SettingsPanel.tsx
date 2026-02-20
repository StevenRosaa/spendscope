import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Zap, BrainCircuit, MessageSquare, List, Table, User, Smile, Flame } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: 'gemini-3-flash' | 'gemini-3-pro';
  setSelectedModel: (val: 'gemini-3-flash' | 'gemini-3-pro') => void;
  aiTone: string;
  setAiTone: (val: any) => void;
  aiFormat: string;
  setAiFormat: (val: any) => void;
}

export default function SettingsPanel({
  isOpen, onClose, selectedModel, setSelectedModel, aiTone, setAiTone, aiFormat, setAiFormat
}: SettingsPanelProps) {
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
          <motion.div 
            initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }} 
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                <SlidersHorizontal className="w-5 h-5 text-violet-500" /> AI Configuration
              </div>
              <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              
              {/* Intelligence Engine */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intelligence Engine</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedModel('gemini-3-flash')} 
                    className={`p-4 rounded-2xl border-2 text-sm font-semibold flex flex-col items-center gap-2 transition-all ${selectedModel === 'gemini-3-flash' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                  >
                    <Zap className={`w-6 h-6 ${selectedModel === 'gemini-3-flash' ? 'text-violet-500' : 'text-slate-400'}`} /> 
                    <span>Flash <span className="block text-[10px] font-normal opacity-70 mt-0.5">Fastest responses</span></span>
                  </button>
                  <button 
                    onClick={() => setSelectedModel('gemini-3-pro')} 
                    className={`p-4 rounded-2xl border-2 text-sm font-semibold flex flex-col items-center gap-2 transition-all ${selectedModel === 'gemini-3-pro' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 shadow-sm' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                  >
                    <BrainCircuit className={`w-6 h-6 ${selectedModel === 'gemini-3-pro' ? 'text-violet-500' : 'text-slate-400'}`} /> 
                    <span>Pro <span className="block text-[10px] font-normal opacity-70 mt-0.5">Deep reasoning</span></span>
                  </button>
                </div>
              </div>

              {/* AI Persona (Custom UI instead of Select) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Persona</label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setAiTone('professional')} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${aiTone === 'professional' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <User className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Strict Accountant</p>
                      <p className="text-xs opacity-70">Direct, numbers-focused.</p>
                    </div>
                  </button>
                  
                  <button onClick={() => setAiTone('friendly')} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${aiTone === 'friendly' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <Smile className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Friendly Advisor</p>
                      <p className="text-xs opacity-70">Encouraging and simple.</p>
                    </div>
                  </button>

                  <button onClick={() => setAiTone('roast')} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${aiTone === 'roast' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'border-transparent bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    <Flame className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Brutally Honest (Roast)</p>
                      <p className="text-xs opacity-70">Sarcastic spending critic.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Output Format (Custom UI instead of Select) */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Output Format</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button onClick={() => setAiFormat('text')} className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all ${aiFormat === 'text' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <MessageSquare className="w-4 h-4" /> Text
                  </button>
                  <button onClick={() => setAiFormat('bullet')} className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all ${aiFormat === 'bullet' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <List className="w-4 h-4" /> Bullets
                  </button>
                  <button onClick={() => setAiFormat('table')} className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg text-xs font-semibold transition-all ${aiFormat === 'table' ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <Table className="w-4 h-4" /> Table
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
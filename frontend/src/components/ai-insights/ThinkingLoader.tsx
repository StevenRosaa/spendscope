import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const thoughts = [
  "Analyzing your request...",
  "Querying receipt database...",
  "Cross-referencing transaction dates...",
  "Categorizing expenses...",
  "Calculating financial totals...",
  "Formulating insights...",
  "Finalizing response..."
];

export default function ThinkingLoader() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Cambia frase ogni 1.5 secondi, fermandosi all'ultima se ci mette tanto
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1 < thoughts.length ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm shadow-sm w-fit pr-6">
      <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
        <BrainCircuit className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-pulse" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-medium text-slate-600 dark:text-slate-400"
        >
          {thoughts[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
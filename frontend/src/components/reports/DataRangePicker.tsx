'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
// Assicurati di avere questo tipo definito nel tuo file types, ad esempio:
// export interface DateRange { from: Date; to: Date; }
import { DateRange } from '@/types'; 

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ dateRange, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Chiudi il popover se si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formattazione data (es. "Feb 20, 2026")
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  // Fix per il Timezone: Estrae YYYY-MM-DD mantenendo l'orario locale
  const toLocalISODate = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
  };

  // Funzioni per i preset veloci
  const setPreset = (daysToSubtract: number, startOfCurrentMonth: boolean = false) => {
    const today = new Date();
    let from = new Date();
    
    if (startOfCurrentMonth) {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      from.setDate(today.getDate() - daysToSubtract);
    }
    
    onChange({ from, to: today });
    setIsOpen(false);
  };

  // Gestione sicura del cambio data manuale
  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (!value) return;
    // Aggiungiamo T00:00:00 per forzare il parsing nel fuso orario locale
    const newDate = new Date(`${value}T00:00:00`);
    onChange({ ...dateRange, [type]: newDate });
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      >
        <CalendarIcon className="w-4 h-4 mr-2 text-violet-500" />
        <span className="mr-2">
          {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Animato */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 flex flex-col sm:flex-row gap-4">
              
              {/* Presets Sidebar */}
              <div className="flex flex-col gap-2 sm:w-1/3 border-b sm:border-b-0 sm:border-r border-slate-100 dark:border-slate-800 pb-4 sm:pb-0 sm:pr-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Presets</span>
                <button onClick={() => setPreset(0, true)} className="text-left text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">This Month</button>
                <button onClick={() => setPreset(30)} className="text-left text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Last 30 Days</button>
                <button onClick={() => setPreset(90)} className="text-left text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Last 90 Days</button>
              </div>

              {/* Custom Date Inputs */}
              <div className="flex-1 flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Range</span>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From</label>
                  <input 
                    type="date" 
                    value={toLocalISODate(dateRange.from)}
                    onChange={(e) => handleDateChange('from', e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To</label>
                  <input 
                    type="date" 
                    value={toLocalISODate(dateRange.to)}
                    onChange={(e) => handleDateChange('to', e.target.value)}
                    className="w-full text-sm p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
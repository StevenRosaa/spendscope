'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // Nuovo stato per il feedback di successo

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
    // 1. Gestione errori del Dropzone (es. file troppo grande o formato errato)
    if (fileRejections.length > 0) {
      setError('Invalid file. Please upload a JPG, PNG, or PDF under 5MB.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post('/receipts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSuccess(true);
      onUploadSuccess(); // Chiede alla dashboard di fare il refresh
      
      // Nascondiamo il messaggio di successo dopo 3 secondi
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload receipt. Try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 5242880, // 5MB limit
  });

  return (
    <div className="w-full">
      {/* IL WRAPPER HTML NORMALE PER DROPZONE (Nessun conflitto TS) */}
      <div {...getRootProps()} className="focus:outline-none">
        <input {...getInputProps()} disabled={isUploading} />
        
        {/* IL WRAPPER ANIMATO PER LA GRAFICA */}
        <motion.div 
          animate={isDragActive ? { scale: 1.02, backgroundColor: 'rgba(139, 92, 246, 0.05)' } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`relative overflow-hidden p-8 sm:p-12 border-2 border-dashed rounded-2xl text-center transition-colors
            ${isDragActive 
              ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/10' 
              : error 
                ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }
            ${isUploading ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
          `}
        >
          {/* Cerchio di sfondo decorativo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col items-center justify-center space-y-4 z-10">
            
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                  <Loader2 className="w-8 h-8 text-violet-600 dark:text-violet-400 animate-spin" />
                </motion.div>
              ) : success ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-full shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className={`p-4 rounded-full shadow-sm border transition-colors ${
                  isDragActive ? 'bg-violet-100 dark:bg-violet-900/50 border-violet-200 dark:border-violet-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                }`}>
                  <UploadCloud className={`w-8 h-8 transition-colors ${isDragActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`} />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-1">
              <AnimatePresence mode="wait">
                {isUploading ? (
                  <motion.p key="text-loading" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-slate-700 dark:text-slate-200 font-semibold text-lg">
                    Uploading to secure vault...
                  </motion.p>
                ) : success ? (
                  <motion.p key="text-success" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-emerald-700 dark:text-emerald-400 font-semibold text-lg">
                    Receipt uploaded!
                  </motion.p>
                ) : (
                  <motion.div key="text-idle" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <p className="text-slate-700 dark:text-slate-200 font-semibold text-lg">
                      {isDragActive ? 'Drop receipt here' : 'Click or drag receipt here'}
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
                      <FileText className="w-4 h-4" />
                      <span>Supports JPG, PNG, PDF (Max 5MB)</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Messaggio di Errore Esterno */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }} 
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="flex items-center gap-2 p-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
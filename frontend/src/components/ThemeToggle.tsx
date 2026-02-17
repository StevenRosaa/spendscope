'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Aspettiamo che il componente sia montato per leggere il tema dal browser
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Placeholder invisibile per mantenere lo spazio ed evitare salti di layout
    return <div className="w-10 h-10 rounded-xl" />;
  }

  // resolvedTheme ci dice se attualmente è attivo 'light' o 'dark', anche se il setting è 'system'
  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      {/* L'animazione del Sole */}
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? -90 : 0,
          scale: isDark ? 0 : 1,
          opacity: isDark ? 0 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute"
      >
        <Sun className="w-5 h-5" />
      </motion.div>

      {/* L'animazione della Luna */}
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 90,
          scale: isDark ? 1 : 0,
          opacity: isDark ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="absolute"
      >
        <Moon className="w-5 h-5" />
      </motion.div>
    </motion.button>
  );
}
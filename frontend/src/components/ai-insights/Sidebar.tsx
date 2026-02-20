import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

type ChatSession = { id: string; title: string; created_at: string; };

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  isSidebarOpen: boolean;
  onNewChat: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onCloseSidebar: () => void;
}

export default function Sidebar({
  sessions, activeSessionId, isSidebarOpen, onNewChat, onLoadSession, onDeleteSession, onCloseSidebar
}: SidebarProps) {
  return (
    <>
      <div className={`fixed inset-y-0 left-0 pt-20 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-40 w-64 bg-slate-100/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 flex flex-col shrink-0 h-[calc(100vh-5rem)] backdrop-blur-xl`}>
        <div className="p-4">
          <button onClick={onNewChat} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-md shadow-violet-500/20 transition-all group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> New Analysis
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-1">
          <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">History</p>
          {sessions.map((session, index) => (
            <motion.div 
              key={session.id} 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <button onClick={() => onLoadSession(session.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left pr-10 ${activeSessionId === session.id ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 font-semibold shadow-sm border border-slate-200/50 dark:border-slate-700/50' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}>
                <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-violet-500' : 'text-slate-400'}`} />
                <span className="truncate">{session.title}</span>
              </button>
              <button onClick={(e) => onDeleteSession(e, session.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm" onClick={onCloseSidebar} />}
    </>
  );
}
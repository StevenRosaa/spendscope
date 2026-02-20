'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Bot, User as UserIcon, Loader2, 
  Menu, SlidersHorizontal, Edit2, RefreshCw, BrainCircuit
} from 'lucide-react';
import { apiClient } from '@/lib/api';

// Components
import Sidebar from '@/components/ai-insights/Sidebar';
import SettingsPanel from '@/components/ai-insights/SettingsPanel';
import TypewriterMessage from '@/components/ai-insights/TypeWriterMessage';
import ThinkingLoader from '@/components/ai-insights/ThinkingLoader';


type Message = { id: string; role: 'user' | 'assistant'; content: string; };
type ChatSession = { id: string; title: string; created_at: string; };

export default function AIInsightsChat() {
  // --- STATI ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null); // Traccia quale messaggio sta "scrivendo"
  
  // Settings AI
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3-flash' | 'gemini-3-pro'>('gemini-3-flash');
  const [aiTone, setAiTone] = useState<'professional' | 'friendly' | 'roast'>('professional');
  const [aiFormat, setAiFormat] = useState<'text' | 'bullet' | 'table'>('text');
  
  // Edit
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- EFFETTI ---
  useEffect(() => { fetchSessions(); }, []);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // --- API FUNZIONI ---
  const fetchSessions = async () => {
    try {
      const res = await apiClient.get('/ai/sessions');
      setSessions(res.data);
    } catch (error) { console.error(error); }
  };

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    try {
      const res = await apiClient.get(`/ai/sessions/${sessionId}`);
      setMessages(res.data);
    } catch (error) { console.error(error); }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    try {
      await apiClient.delete(`/ai/sessions/${sessionId}`);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      fetchSessions();
    } catch (error) { console.error("Error deleting session", error); }
  };

  const handleSendMessage = async (textToSend: string = input, isEdit: boolean = false, msgIdToEdit?: string) => {
    if (!textToSend.trim() || isLoading) return;

    if (isEdit && msgIdToEdit) {
      // Modifica in-place: aggiorniamo il testo del messaggio e rimuoviamo la risposta dell'IA
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === msgIdToEdit);
        if (idx === -1) return prev;
        const updatedMessages = [...prev];
        updatedMessages[idx] = { ...updatedMessages[idx], content: textToSend };
        // Restituiamo l'array tagliando via la vecchia risposta dell'IA (tutto ciò che viene dopo)
        return updatedMessages.slice(0, idx + 1); 
      });
      setEditingMsgId(null);
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: textToSend }]);
      setInput('');
    }
    
    setIsLoading(true);
    setStreamingMessageId(null);

    try {
      const response = await apiClient.post('/ai/chat', {
        message: textToSend,
        model: selectedModel,
        session_id: activeSessionId,
        tone: aiTone,
        format: aiFormat,
        edit_message_id: isEdit ? msgIdToEdit : undefined
      });

      const newMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: newMsgId, role: 'assistant', content: response.data.reply }]);
      setStreamingMessageId(newMsgId);

      if (!activeSessionId && response.data.session_id) {
        setActiveSessionId(response.data.session_id);
        fetchSessions(); 
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "An error occurred. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (isLoading || messages.length === 0) return;
    
    const newMessages = [...messages];
    if (newMessages[newMessages.length - 1].role === 'assistant') {
      newMessages.pop();
      setMessages(newMessages);
    }
    
    setIsLoading(true);
    setStreamingMessageId(null);

    try {
      const response = await apiClient.post('/ai/chat', {
        message: "",
        model: selectedModel,
        session_id: activeSessionId,
        tone: aiTone,
        format: aiFormat,
        regenerate: true
      });
      
      const newMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: newMsgId, role: 'assistant', content: response.data.reply }]);
      setStreamingMessageId(newMsgId); // Attiva l'effetto typewriter

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "An error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastUserMsgId = [...messages].reverse().find(m => m.role === 'user')?.id;

  // Funzione che separa la CoT dal messaggio finale
  const renderMessageContent = (msg: Message, isStreaming: boolean) => {
    // Regex per estrarre il contenuto tra <thinking> e </thinking>
    const thinkingMatch = msg.content.match(/<thinking>([\s\S]*?)<\/thinking>/i);
    const thinkingText = thinkingMatch ? thinkingMatch[1].trim() : null;
    
    // Rimuoviamo il blocco thinking per ottenere il messaggio finale pulito
    const cleanContent = msg.content.replace(/<thinking>[\s\S]*?<\/thinking>/i, '').trim();

    return (
      <div className="flex flex-col gap-3">
        {thinkingText && (
          <details className="group rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <summary className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer p-2.5 select-none flex items-center gap-2 transition-colors">
              <BrainCircuit className="w-3.5 h-3.5" /> 
              <span className="group-open:hidden">View thought process</span>
              <span className="hidden group-open:inline">Hide thought process</span>
            </summary>
            <div className="p-3 pt-1 text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap">
              {thinkingText}
            </div>
          </details>
        )}
        
        <div className="w-full">
          {/* Usiamo IL NOSTRO componente per TUTTI i messaggi dell'IA. 
              Se isStreaming è false, mostrerà subito tutto il Markdown formattato! */}
          <TypewriterMessage content={cleanContent} isStreaming={isStreaming} />
        </div>
      </div>
    );
  };

  return (
    <div className="pt-20 min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 overflow-hidden relative">
      
      {/* 1. COMPONENTE SIDEBAR */}
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        isSidebarOpen={isSidebarOpen} 
        onNewChat={handleNewChat} 
        onLoadSession={loadSession} 
        onDeleteSession={handleDeleteSession} 
        onCloseSidebar={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-5rem)] relative">
        <header className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-slate-500" onClick={() => setIsSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg hidden sm:block"><Sparkles className="w-4 h-4 text-white" /></div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white leading-none">SpendScope AI</h1>
                <p className="text-[10px] sm:text-xs text-violet-600 dark:text-violet-400 font-semibold mt-0.5">
                  {selectedModel === 'gemini-3-pro' ? 'Pro Engine' : 'Flash Engine'}
                </p>
              </div>
            </motion.div>
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-xl transition-all bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </header>

        {/* MESSAGGI */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            
            <AnimatePresence>
              {messages.length === 0 && !isLoading && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full flex flex-col items-center justify-center text-center mt-12 sm:mt-20">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 border border-violet-100 dark:border-violet-800/30 shadow-inner">
                    <Sparkles className="w-10 h-10 text-violet-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your Financial Co-Pilot</h2>
                  <p className="text-slate-500 max-w-md text-sm mb-8">Ask any question about your expenses, look for anomalies, or generate reports in seconds.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 sm:gap-4 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                {editingMsgId === msg.id ? (
                  <div className="w-full max-w-[85%] bg-white dark:bg-slate-900 border border-violet-500 rounded-2xl p-3 shadow-md">
                    <textarea value={editInput} onChange={(e) => setEditInput(e.target.value)} className="w-full bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none resize-none mb-2" rows={3} />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingMsgId(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                      <button onClick={() => handleSendMessage(editInput, true, msg.id)} className="px-3 py-1.5 text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 rounded-lg shadow-sm">Save & Send</button>
                    </div>
                  </div>
                ) : (
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 relative ${msg.role === 'user' ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-tr-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-sm overflow-hidden'}`}>
                    
                    {msg.role === 'assistant' ? (
                      renderMessageContent(msg, streamingMessageId === msg.id)
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}

                    {msg.role === 'user' && msg.id === lastUserMsgId && !isLoading && (
                      <button onClick={() => { setEditingMsgId(msg.id); setEditInput(msg.content); }} className="absolute -left-10 top-2 p-1.5 text-slate-400 hover:text-violet-500 bg-white dark:bg-slate-800 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )} 
                  </div>
                )}

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </motion.div>
            ))}

            {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start ml-12">
                <button onClick={handleRegenerate} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate Response
                </button>
              </motion.div>
            )}

            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 sm:gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <ThinkingLoader />
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <footer className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 shrink-0 z-20">
          <div className="max-w-3xl mx-auto relative">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Ask SpendScope AI..."
                className="w-full max-h-32 min-h-[52px] resize-none bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-violet-500/50 rounded-2xl pl-4 pr-14 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all custom-scrollbar shadow-inner"
                rows={1}
              />
              <button
                type="submit" disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-md disabled:shadow-none"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </footer>
      </div>

      {/* 3. COMPONENTE SETTINGS */}
      <SettingsPanel 
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel} setSelectedModel={setSelectedModel}
        aiTone={aiTone} setAiTone={setAiTone} aiFormat={aiFormat} setAiFormat={setAiFormat}
      />

    </div>
  );
}
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User as UserIcon, Shield, CreditCard, 
  AlertTriangle, Palette, MonitorSmartphone, Mail, 
  Download, Trash2, KeyRound, LucideIcon, Loader2, Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { apiClient } from '@/lib/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'preferences' | 'security' | 'billing' | 'danger';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isLoggingOutDevices, setIsLoggingOutDevices] = useState(false);
  const [logoutDevicesSuccess, setLogoutDevicesSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen || !user) return null;

  // --- MENU DELLA SIDEBAR ---
  const tabs: { id: TabType; label: string; icon: LucideIcon; isDanger?: boolean }[] = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, isDanger: true },
  ] as const;

  const handleLogoutOtherDevices = async () => {
    setIsLoggingOutDevices(true);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      // Importa apiClient in cima al file se non c'è: import { apiClient } from '@/lib/api';
      await apiClient.post('/auth/logout-other-devices', { refresh_token: refreshToken });
      
      setLogoutDevicesSuccess(true);
      // Rimettiamo il bottone normale dopo 3 secondi
      setTimeout(() => setLogoutDevicesSuccess(false), 3000); 
    } catch (error) {
      console.error("Failed to logout other devices", error);
    } finally {
      setIsLoggingOutDevices(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Il trucco è { responseType: 'blob' }, dice ad Axios di non provare a leggere il file come JSON
      const response = await apiClient.get('/receipts/export', { responseType: 'blob' });
      
      // 1. Creiamo un oggetto URL dal file binario ricevuto
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      // 2. Creiamo un link invisibile e lo clicchiamo con JavaScript
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'spendscope_export.csv'); // Il nome del file
      document.body.appendChild(link);
      link.click();
      
      // 3. Puliamo la memoria
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // --- CONTENUTO DELLE SEZIONI ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-5 mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-violet-500/30">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{user.full_name || 'SpendScope User'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text" disabled value={user.full_name || ''}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email" disabled value={user.email}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">App Preferences</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Theme</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Choose your interface style.</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${theme === t ? 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between opacity-60 pointer-events-none">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Currency</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Default currency for expenses (Coming soon).</p>
                </div>
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-950 rounded-lg text-sm font-semibold">
                  USD ($)
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Security Settings</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg"><KeyRound className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Change Password</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive an email to reset your password.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold rounded-xl transition-colors">
                  Request Link
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><MonitorSmartphone className="w-5 h-5" /></div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Device Management</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Log out from all other active sessions.</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogoutOtherDevices}
                  disabled={isLoggingOutDevices || logoutDevicesSuccess}
                  className={`flex items-center px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    logoutDevicesSuccess 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  }`}
                >
                  {isLoggingOutDevices ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : logoutDevicesSuccess ? (
                    <><Check className="w-4 h-4 mr-2" /> All Devices Logged Out</>
                  ) : (
                    'Log out devices'
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="flex flex-col items-center justify-center text-center py-8 h-full">
            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">SpendScope Pro</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              You are currently on the Free plan. Pro features including advanced AI insights and unlimited receipts are coming soon!
            </p>
            <button className="mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl opacity-50 cursor-not-allowed">
              Upgrade to Pro (Soon)
            </button>
          </div>
        );

      case 'danger':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Export Data</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Download all your receipts and data as CSV.</p>
                </div>
                <button 
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin text-slate-500" /> : <Download className="w-4 h-4 mr-2" />}
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>

              <div className="p-4 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-200">Delete Account</h4>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">Permanently remove your account and all data.</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-red-500/20">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl h-[600px] max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row overflow-hidden"
        >
          {/* Close Button (Absolute for mobile/desktop) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* SIDEBAR (Navigazione) */}
          <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-950/50 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-6 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar shrink-0">
            <h2 className="hidden md:block text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 px-2">Settings</h2>
            
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center flex-shrink-0 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive 
                      ? tab.isDanger 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' 
                        : 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 transition-colors ${
                    isActive 
                      ? tab.isDanger ? 'text-red-600 dark:text-red-400' : 'text-violet-600 dark:text-violet-400'
                      : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* CONTENT AREA (Destra) */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white dark:bg-slate-900 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
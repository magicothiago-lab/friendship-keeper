'use client';

import { useState, useEffect, useRef } from 'react';
import { getSettings, saveSettings, exportAllData, importAllData } from '@/lib/storage';
import { requestNotificationPermission, getNotificationPermission } from '@/lib/notifications';
import { Settings } from '@/lib/types';
import { ArrowLeft, Moon, Sun, Bell, Download, Upload, Shield, Heart, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    darkMode: false,
    defaultFrequencyMin: 14,
    defaultFrequencyMax: 30,
    notificationsEnabled: false,
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const loadedSettings = getSettings();
    setSettings(loadedSettings);
    
    // Apply dark mode
    if (loadedSettings?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Check notification permission
    setNotificationPermission(getNotificationPermission());
  }, []);

  const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleRequestNotificationPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(getNotificationPermission());
    if (granted) {
      handleSettingChange('notificationsEnabled', true);
    }
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `friendship-keeper-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      setImportStatus(success ? 'success' : 'error');
      
      if (success) {
        const loadedSettings = getSettings();
        setSettings(loadedSettings);
        if (loadedSettings?.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Heart className="w-12 h-12 text-coral-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Appearance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-coral-500" />
              ) : (
                <Sun className="w-5 h-5 text-coral-500" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme</p>
              </div>
            </div>
            <button
              onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.darkMode ? 'bg-coral-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.darkMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </motion.section>

        {/* Contact Frequency Defaults */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Default Contact Frequency</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Set default reminder window for new friends
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minimum (days)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={settings.defaultFrequencyMin}
                onChange={(e) => handleSettingChange('defaultFrequencyMin', parseInt(e.target?.value ?? '14', 10) || 14)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maximum (days)
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={settings.defaultFrequencyMax}
                onChange={(e) => handleSettingChange('defaultFrequencyMax', parseInt(e.target?.value ?? '30', 10) || 30)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-coral-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get reminded about friends you haven&apos;t contacted
                  </p>
                </div>
              </div>
            </div>
            
            {notificationPermission === 'unsupported' ? (
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Push notifications are not supported in this browser.
              </p>
            ) : notificationPermission === 'denied' ? (
              <p className="text-sm text-red-600 dark:text-red-400">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            ) : notificationPermission === 'granted' ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-sm">Notifications enabled</span>
              </div>
            ) : (
              <button
                onClick={handleRequestNotificationPermission}
                className="w-full py-2 px-4 bg-coral-500 hover:bg-coral-600 text-white rounded-lg font-medium transition-colors"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </motion.section>

        {/* Data Management */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Export or import your data as JSON. Your data never leaves your device.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                <button
                  onClick={handleImportClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              
              {importStatus === 'success' && (
                <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Data imported successfully!</span>
                </div>
              )}
              {importStatus === 'error' && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Failed to import data. Please check the file format.</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Privacy Notice */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-coral-50 to-teal-50 dark:from-coral-900/20 dark:to-teal-900/20 rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-coral-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Privacy First</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                All your data is stored locally in your browser. We don&apos;t collect, transmit, or store any of your personal information on external servers. Your friendships are your own.
              </p>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

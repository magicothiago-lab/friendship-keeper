'use client';

import { useEffect, useState } from 'react';
import { FriendWithStatus } from '@/lib/types';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationAlertProps {
  friends: FriendWithStatus[];
}

export default function NotificationAlert({ friends }: NotificationAlertProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [dueSoonCount, setDueSoonCount] = useState(0);

  useEffect(() => {
    const overdue = (friends ?? []).filter(f => f?.urgencyStatus === 'overdue').length;
    const dueSoon = (friends ?? []).filter(f => f?.urgencyStatus === 'due_soon').length;
    setOverdueCount(overdue);
    setDueSoonCount(dueSoon);
    
    if (overdue > 0 || dueSoon > 0) {
      setShowAlert(true);
    }
  }, [friends]);

  if (!showAlert || (overdueCount === 0 && dueSoonCount === 0)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-40 max-w-sm"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-coral-100 dark:bg-coral-900/30 rounded-full">
              <Bell className="w-5 h-5 text-coral-600 dark:text-coral-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Friendship Reminder</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {overdueCount > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    {overdueCount} friend{overdueCount > 1 ? 's' : ''} overdue!
                  </span>
                )}
                {overdueCount > 0 && dueSoonCount > 0 && ' '}
                {dueSoonCount > 0 && (
                  <span className="text-yellow-600 dark:text-yellow-400">
                    {dueSoonCount} due soon.
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => setShowAlert(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

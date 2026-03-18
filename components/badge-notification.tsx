'use client';

import { Badge } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award } from 'lucide-react';

interface BadgeNotificationProps {
  badge: Badge | null;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  if (!badge) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <div className="bg-gradient-to-r from-coral-500 to-teal-500 rounded-2xl shadow-xl p-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{badge?.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-coral-500" />
                  <span className="text-xs font-medium text-coral-600 dark:text-coral-400">NEW BADGE!</span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  {badge?.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {badge?.description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

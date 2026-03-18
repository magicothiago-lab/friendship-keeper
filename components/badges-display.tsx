'use client';

import { Badge, Stats } from '@/lib/types';
import { BADGES } from '@/lib/reminder-utils';
import { Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface BadgesDisplayProps {
  unlockedBadgeIds: string[];
  stats: Stats;
}

export default function BadgesDisplay({ unlockedBadgeIds, stats }: BadgesDisplayProps) {
  const isUnlocked = (badgeId: string) => (unlockedBadgeIds ?? []).includes(badgeId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-coral-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({(unlockedBadgeIds ?? []).length}/{BADGES.length})
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {BADGES.map((badge, index) => {
          const unlocked = isUnlocked(badge?.id ?? '');
          
          return (
            <motion.div
              key={badge?.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative p-3 rounded-xl text-center transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-coral-50 to-teal-50 dark:from-coral-900/20 dark:to-teal-900/20 border-2 border-coral-200 dark:border-coral-700'
                  : 'bg-gray-100 dark:bg-gray-700/50 border-2 border-gray-200 dark:border-gray-600 opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">
                {unlocked ? badge?.icon : '🔒'}
              </div>
              <p className={`text-xs font-semibold ${
                unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {badge?.name}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {badge?.description}
              </p>
              {!unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="w-3 h-3 text-gray-400" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { Stats } from '@/lib/types';
import { Users, Calendar, TrendingUp, AlertTriangle, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatsCardsProps {
  stats: Stats;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const startTime = Date.now();
    const tick = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Friends This Week',
      value: stats?.contactedThisWeek ?? 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Friends This Month',
      value: stats?.contactedThisMonth ?? 0,
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Current Streak',
      value: stats?.currentStreak ?? 0,
      suffix: ' days',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Longest Streak',
      value: stats?.longestStreak ?? 0,
      suffix: ' days',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400',
    },
    {
      title: 'At-Risk Friends',
      value: stats?.atRiskFriendships ?? 0,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      isWarning: true,
    },
    {
      title: 'Total Interactions',
      value: stats?.totalInteractions ?? 0,
      icon: <MessageCircle className="w-6 h-6" />,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      textColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${card.bgColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className={`${card.textColor} mb-2`}>{card.icon}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
          <p className={`text-2xl font-bold ${card.textColor}`}>
            <AnimatedNumber value={card.value} />
            {card?.suffix ?? ''}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

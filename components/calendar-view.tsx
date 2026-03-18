'use client';

import { FriendWithStatus } from '@/lib/types';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarViewProps {
  friends: FriendWithStatus[];
}

export default function CalendarView({ friends }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getRemindersForDay = (day: Date): FriendWithStatus[] => {
    return (friends ?? []).filter(friend => {
      if (!friend?.nextReminderStart || !friend?.nextReminderEnd) return false;
      const start = parseISO(friend.nextReminderStart);
      const end = parseISO(friend.nextReminderEnd);
      return day >= start && day <= end;
    });
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-coral-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reminder Calendar
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day, index) => {
            const reminders = getRemindersForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);

            return (
              <div
                key={index}
                className={`min-h-[80px] p-1 rounded-lg border transition-colors ${
                  isCurrentMonth
                    ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    : 'bg-gray-100/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                } ${isDayToday ? 'ring-2 ring-coral-500' : ''}`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isDayToday
                    ? 'text-coral-600 dark:text-coral-400'
                    : isCurrentMonth
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5 overflow-hidden max-h-[50px]">
                  {reminders.slice(0, 2).map(friend => (
                    <div
                      key={friend?.id}
                      className={`text-[10px] truncate px-1 py-0.5 rounded ${
                        friend?.urgencyStatus === 'overdue'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : friend?.urgencyStatus === 'due_soon'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {friend?.name}
                    </div>
                  ))}
                  {reminders.length > 2 && (
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1">
                      +{reminders.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-600 dark:text-gray-400">Overdue</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-gray-600 dark:text-gray-400">Due Soon</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Safe</span>
        </div>
      </div>
    </div>
  );
}

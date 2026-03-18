'use client';

import { FriendWithStatus } from '@/lib/types';
import { getUrgencyColor, getUrgencyTextColor, getMotivationalMessage } from '@/lib/reminder-utils';
import { User, Calendar, MessageCircle, Phone, Video, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

interface FriendCardProps {
  friend: FriendWithStatus;
  onEdit: (friend: FriendWithStatus) => void;
  onDelete: (friendId: string) => void;
  onLogInteraction: (friendId: string) => void;
}

export default function FriendCard({ friend, onEdit, onDelete, onLogInteraction }: FriendCardProps) {
  const relationshipLabels: Record<string, string> = {
    close_friend: 'Close Friend',
    acquaintance: 'Acquaintance',
    family: 'Family',
    colleague: 'Colleague',
    other: 'Other',
  };

  const statusLabel = {
    overdue: 'Overdue',
    due_soon: 'Due Soon',
    safe: 'All Good',
    unknown: 'No Data',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-coral-400 to-teal-400 flex-shrink-0">
          {friend?.photo ? (
            <Image
              src={friend.photo}
              alt={friend?.name ?? 'Friend'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {friend?.name ?? 'Unknown'}
            </h3>
            <span className={`w-3 h-3 rounded-full ${getUrgencyColor(friend?.urgencyStatus ?? 'unknown')}`} />
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {relationshipLabels[friend?.relationshipType ?? 'other'] ?? 'Other'}
          </p>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyTextColor(friend?.urgencyStatus ?? 'unknown')} bg-opacity-10 ${friend?.urgencyStatus === 'overdue' ? 'bg-red-100 dark:bg-red-900/20' : friend?.urgencyStatus === 'due_soon' ? 'bg-yellow-100 dark:bg-yellow-900/20' : friend?.urgencyStatus === 'safe' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            {statusLabel[friend?.urgencyStatus ?? 'unknown']}
            {friend?.daysUntilDue !== null && friend?.daysUntilDue !== undefined && (
              <span className="ml-1">
                {friend.daysUntilDue < 0 ? `(${Math.abs(friend.daysUntilDue)}d overdue)` : `(${friend.daysUntilDue}d left)`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      <p className="mt-3 text-sm italic text-gray-600 dark:text-gray-300">
        {getMotivationalMessage(friend?.urgencyStatus ?? 'unknown', friend?.name ?? 'them')}
      </p>

      {/* Last Contact & Reminder Window */}
      <div className="mt-3 space-y-1 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>
            Last contact: {friend?.lastInteractionDate ? format(new Date(friend.lastInteractionDate), 'MMM d, yyyy') : 'Never'}
          </span>
        </div>
        {friend?.nextReminderStart && friend?.nextReminderEnd && (
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>
              Contact window: {format(new Date(friend.nextReminderStart), 'MMM d')} - {format(new Date(friend.nextReminderEnd), 'MMM d')}
            </span>
          </div>
        )}
      </div>

      {/* Notes */}
      {friend?.notes && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {friend.notes}
        </p>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onLogInteraction?.(friend?.id ?? '')}
          className="flex items-center gap-1 px-3 py-1.5 bg-coral-500 hover:bg-coral-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Phone className="w-4 h-4" />
          Log Interaction
        </button>
        <button
          onClick={() => onEdit?.(friend)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete?.(friend?.id ?? '')}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

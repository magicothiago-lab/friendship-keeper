'use client';

import { useState, useEffect } from 'react';
import { Interaction, InteractionType, Friend } from '@/lib/types';
import { X, Phone, MessageSquare, Users, Video, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';

interface InteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (interaction: Interaction) => void;
  friendId: string;
  friendName: string;
  suggestedType?: InteractionType;
}

const interactionTypes: { value: InteractionType; label: string; icon: React.ReactNode }[] = [
  { value: 'call', label: 'Phone Call', icon: <Phone className="w-5 h-5" /> },
  { value: 'text', label: 'Text/Message', icon: <MessageSquare className="w-5 h-5" /> },
  { value: 'visit', label: 'In-Person Visit', icon: <Users className="w-5 h-5" /> },
  { value: 'video_call', label: 'Video Call', icon: <Video className="w-5 h-5" /> },
  { value: 'other', label: 'Other', icon: <HelpCircle className="w-5 h-5" /> },
];

export default function InteractionModal({ isOpen, onClose, onSave, friendId, friendName, suggestedType }: InteractionModalProps) {
  const [type, setType] = useState<InteractionType>(suggestedType ?? 'call');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(suggestedType ?? 'call');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setDuration('');
      setNotes('');
    }
  }, [isOpen, suggestedType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const interaction: Interaction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      friendId,
      type,
      date: new Date(date).toISOString(),
      duration: duration === '' ? undefined : duration,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave?.(interaction);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Log Interaction
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">with {friendName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Interaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type of Interaction
            </label>
            <div className="grid grid-cols-2 gap-2">
              {interactionTypes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    type === t.value
                      ? 'border-coral-500 bg-coral-50 dark:bg-coral-900/20 text-coral-600 dark:text-coral-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  {t.icon}
                  <span className="text-sm font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target?.value ?? format(new Date(), 'yyyy-MM-dd'))}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes) - optional
            </label>
            <input
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target?.value ? parseInt(e.target.value, 10) : '')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 30"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target?.value ?? '')}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="What did you talk about?"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-coral-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Save Interaction
          </button>
        </form>
      </div>
    </div>
  );
}

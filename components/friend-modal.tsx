'use client';

import { useState, useEffect, useRef } from 'react';
import { Friend, RelationshipType } from '@/lib/types';
import { X, Upload, User } from 'lucide-react';
import Image from 'next/image';

interface FriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (friend: Friend) => void;
  friend?: Friend | null;
  defaultFrequencyMin: number;
  defaultFrequencyMax: number;
}

export default function FriendModal({ isOpen, onClose, onSave, friend, defaultFrequencyMin, defaultFrequencyMax }: FriendModalProps) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('close_friend');
  const [frequencyMin, setFrequencyMin] = useState(defaultFrequencyMin);
  const [frequencyMax, setFrequencyMax] = useState(defaultFrequencyMax);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (friend) {
      setName(friend?.name ?? '');
      setPhoto(friend?.photo);
      setNotes(friend?.notes ?? '');
      setRelationshipType(friend?.relationshipType ?? 'close_friend');
      setFrequencyMin(friend?.contactFrequencyMin ?? defaultFrequencyMin);
      setFrequencyMax(friend?.contactFrequencyMax ?? defaultFrequencyMax);
    } else {
      setName('');
      setPhoto(undefined);
      setNotes('');
      setRelationshipType('close_friend');
      setFrequencyMin(defaultFrequencyMin);
      setFrequencyMax(defaultFrequencyMax);
    }
  }, [friend, defaultFrequencyMin, defaultFrequencyMax]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name?.trim()) return;

    const now = new Date().toISOString();
    const friendData: Friend = {
      id: friend?.id ?? `friend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      photo,
      notes: notes.trim(),
      relationshipType,
      lastInteractionDate: friend?.lastInteractionDate ?? null,
      contactFrequencyMin: frequencyMin,
      contactFrequencyMax: frequencyMax,
      createdAt: friend?.createdAt ?? now,
      updatedAt: now,
    };

    onSave?.(friendData);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {friend ? 'Edit Friend' : 'Add New Friend'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-coral-400 to-teal-400 cursor-pointer hover:opacity-80 transition-opacity"
            >
              {photo ? (
                <Image src={photo} alt="Preview" fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">Click to upload photo</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target?.value ?? '')}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter friend's name"
            />
          </div>

          {/* Relationship Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Relationship Type
            </label>
            <select
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target?.value as RelationshipType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="close_friend">Close Friend</option>
              <option value="acquaintance">Acquaintance</option>
              <option value="family">Family</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Contact Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Min Days
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={frequencyMin}
                onChange={(e) => setFrequencyMin(parseInt(e.target?.value ?? '14', 10) || 14)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Days
              </label>
              <input
                type="number"
                min={1}
                max={365}
                value={frequencyMax}
                onChange={(e) => setFrequencyMax(parseInt(e.target?.value ?? '30', 10) || 30)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Contact window: Reach out between {frequencyMin} and {frequencyMax} days after last contact
          </p>

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
              placeholder="Birthday, hobbies, conversation topics..."
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-coral-500 to-teal-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {friend ? 'Save Changes' : 'Add Friend'}
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Friend, FriendWithStatus, Stats, Interaction, Badge } from '@/lib/types';
import { getFriends, saveFriends, addFriend, updateFriend, deleteFriend, getInteractions, addInteraction, getSettings, getUnlockedBadges, saveUnlockedBadges } from '@/lib/storage';
import { calculateFriendStatus, sortFriendsByUrgency, calculateStats, checkNewBadges, BADGES } from '@/lib/reminder-utils';
import { registerServiceWorker, requestNotificationPermission, showLocalNotification } from '@/lib/notifications';
import FriendCard from '@/components/friend-card';
import FriendModal from '@/components/friend-modal';
import InteractionModal from '@/components/interaction-modal';
import DeleteConfirmModal from '@/components/delete-confirm-modal';
import StatsCards from '@/components/stats-cards';
import CalendarView from '@/components/calendar-view';
import BadgesDisplay from '@/components/badges-display';
import BadgeNotification from '@/components/badge-notification';
import NotificationAlert from '@/components/notification-alert';
import { Plus, Heart, Settings, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<Stats>({
    contactedThisWeek: 0,
    contactedThisMonth: 0,
    longestStreak: 0,
    currentStreak: 0,
    atRiskFriendships: 0,
    totalFriends: 0,
    totalInteractions: 0,
  });
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  
  // Modal states
  const [isFriendModalOpen, setIsFriendModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [selectedFriendName, setSelectedFriendName] = useState<string>('');
  const [deletingFriendId, setDeletingFriendId] = useState<string>('');
  const [deletingFriendName, setDeletingFriendName] = useState<string>('');
  
  const [settings, setSettingsState] = useState({ defaultFrequencyMin: 14, defaultFrequencyMax: 30 });
  const [mounted, setMounted] = useState(false);

  const loadData = useCallback(() => {
    const rawFriends = getFriends();
    const friendsWithStatus = sortFriendsByUrgency(
      rawFriends.map(f => calculateFriendStatus(f))
    );
    setFriends(friendsWithStatus);
    
    const allInteractions = getInteractions();
    setInteractions(allInteractions);
    
    const calculatedStats = calculateStats(rawFriends, allInteractions);
    setStats(calculatedStats);
    
    const currentSettings = getSettings();
    setSettingsState({
      defaultFrequencyMin: currentSettings?.defaultFrequencyMin ?? 14,
      defaultFrequencyMax: currentSettings?.defaultFrequencyMax ?? 30,
    });
    
    // Check for new badges
    const currentUnlocked = getUnlockedBadges();
    setUnlockedBadges(currentUnlocked);
    const newBadges = checkNewBadges(calculatedStats, currentUnlocked);
    if (newBadges.length > 0) {
      const updatedUnlocked = [...currentUnlocked, ...newBadges.map(b => b?.id ?? '')];
      saveUnlockedBadges(updatedUnlocked);
      setUnlockedBadges(updatedUnlocked);
      setNewBadge(newBadges[0] ?? null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadData();
    
    // Register service worker
    registerServiceWorker();
    
    // Check for notifications
    const settings = getSettings();
    if (settings?.notificationsEnabled) {
      const rawFriends = getFriends();
      const overdue = rawFriends.filter(f => {
        const status = calculateFriendStatus(f);
        return status?.urgencyStatus === 'overdue';
      });
      
      if (overdue.length > 0) {
        showLocalNotification(
          'Friendship Reminder',
          `You have ${overdue.length} friend${overdue.length > 1 ? 's' : ''} you haven\'t contacted in a while!`
        );
      }
    }
  }, [loadData]);

  const handleSaveFriend = (friend: Friend) => {
    if (editingFriend) {
      updateFriend(friend);
    } else {
      addFriend(friend);
    }
    setEditingFriend(null);
    loadData();
  };

  const handleEditFriend = (friend: FriendWithStatus) => {
    setEditingFriend(friend);
    setIsFriendModalOpen(true);
  };

  const handleDeleteClick = (friendId: string) => {
    const friend = friends.find(f => f?.id === friendId);
    setDeletingFriendId(friendId);
    setDeletingFriendName(friend?.name ?? '');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingFriendId) {
      deleteFriend(deletingFriendId);
      loadData();
    }
  };

  const handleLogInteraction = (friendId: string) => {
    const friend = friends.find(f => f?.id === friendId);
    setSelectedFriendId(friendId);
    setSelectedFriendName(friend?.name ?? '');
    setIsInteractionModalOpen(true);
  };

  const handleSaveInteraction = (interaction: Interaction) => {
    addInteraction(interaction);
    loadData();
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-coral-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Friendship Keeper</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </Link>
            <button
              onClick={() => {
                setEditingFriend(null);
                setIsFriendModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-coral-500 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Friend</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Nurture Your <span className="text-coral-500">Friendships</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay connected with the people who matter most to you.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Friends List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-coral-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your Friends
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({friends.length})
                </span>
              </div>
            </div>

            {friends.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
              >
                <Sparkles className="w-12 h-12 text-coral-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Start Your Friendship Journey
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Add your first friend and begin nurturing meaningful connections.
                </p>
                <button
                  onClick={() => {
                    setEditingFriend(null);
                    setIsFriendModalOpen(true);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-coral-500 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Add Your First Friend
                </button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {friends.map((friend, index) => (
                  <motion.div
                    key={friend?.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <FriendCard
                      friend={friend}
                      onEdit={handleEditFriend}
                      onDelete={handleDeleteClick}
                      onLogInteraction={handleLogInteraction}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <CalendarView friends={friends} />
          </div>
        </div>

        {/* Badges Section */}
        <BadgesDisplay unlockedBadgeIds={unlockedBadges} stats={stats} />
      </main>

      {/* Modals */}
      <FriendModal
        isOpen={isFriendModalOpen}
        onClose={() => {
          setIsFriendModalOpen(false);
          setEditingFriend(null);
        }}
        onSave={handleSaveFriend}
        friend={editingFriend}
        defaultFrequencyMin={settings.defaultFrequencyMin}
        defaultFrequencyMax={settings.defaultFrequencyMax}
      />

      <InteractionModal
        isOpen={isInteractionModalOpen}
        onClose={() => setIsInteractionModalOpen(false)}
        onSave={handleSaveInteraction}
        friendId={selectedFriendId}
        friendName={selectedFriendName}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        friendName={deletingFriendName}
      />

      {/* Notifications */}
      <NotificationAlert friends={friends} />
      <BadgeNotification badge={newBadge} onClose={() => setNewBadge(null)} />
    </div>
  );
}

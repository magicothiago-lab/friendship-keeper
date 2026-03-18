'use client';

import { Friend, Interaction, Settings } from './types';

const FRIENDS_KEY = 'friendship_keeper_friends';
const INTERACTIONS_KEY = 'friendship_keeper_interactions';
const SETTINGS_KEY = 'friendship_keeper_settings';
const BADGES_KEY = 'friendship_keeper_unlocked_badges';

const defaultSettings: Settings = {
  darkMode: false,
  defaultFrequencyMin: 14,
  defaultFrequencyMax: 30,
  notificationsEnabled: false,
};

export function getFriends(): Friend[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(FRIENDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFriends(friends: Friend[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export function addFriend(friend: Friend): void {
  const friends = getFriends();
  friends.push(friend);
  saveFriends(friends);
}

export function updateFriend(updatedFriend: Friend): void {
  const friends = getFriends();
  const index = friends.findIndex(f => f?.id === updatedFriend?.id);
  if (index !== -1) {
    friends[index] = updatedFriend;
    saveFriends(friends);
  }
}

export function deleteFriend(friendId: string): void {
  const friends = getFriends();
  saveFriends(friends.filter(f => f?.id !== friendId));
  // Also delete related interactions
  const interactions = getInteractions();
  saveInteractions(interactions.filter(i => i?.friendId !== friendId));
}

export function getInteractions(): Interaction[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(INTERACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveInteractions(interactions: Interaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(interactions));
}

export function addInteraction(interaction: Interaction): void {
  const interactions = getInteractions();
  interactions.push(interaction);
  saveInteractions(interactions);
  // Update friend's last interaction date
  const friends = getFriends();
  const friendIndex = friends.findIndex(f => f?.id === interaction?.friendId);
  if (friendIndex !== -1 && friends[friendIndex]) {
    const friend = friends[friendIndex];
    const currentLast = friend?.lastInteractionDate ? new Date(friend.lastInteractionDate) : null;
    const newDate = new Date(interaction?.date ?? new Date().toISOString());
    if (!currentLast || newDate > currentLast) {
      friends[friendIndex] = { ...friend, lastInteractionDate: interaction?.date ?? null, updatedAt: new Date().toISOString() };
      saveFriends(friends);
    }
  }
}

export function getInteractionsForFriend(friendId: string): Interaction[] {
  return getInteractions().filter(i => i?.friendId === friendId);
}

export function getSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function getUnlockedBadges(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(BADGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveUnlockedBadges(badgeIds: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BADGES_KEY, JSON.stringify(badgeIds));
}

export function exportAllData(): string {
  const data = {
    friends: getFriends(),
    interactions: getInteractions(),
    settings: getSettings(),
    unlockedBadges: getUnlockedBadges(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data?.friends) saveFriends(data.friends);
    if (data?.interactions) saveInteractions(data.interactions);
    if (data?.settings) saveSettings(data.settings);
    if (data?.unlockedBadges) saveUnlockedBadges(data.unlockedBadges);
    return true;
  } catch {
    return false;
  }
}

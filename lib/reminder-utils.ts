import { Friend, FriendWithStatus, UrgencyStatus, Stats, Interaction, Badge } from './types';
import { addDays, differenceInDays, startOfDay, isWithinInterval, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from 'date-fns';

export function calculateFriendStatus(friend: Friend): FriendWithStatus {
  const today = startOfDay(new Date());
  const lastContact = friend?.lastInteractionDate ? startOfDay(new Date(friend.lastInteractionDate)) : null;
  
  let urgencyStatus: UrgencyStatus = 'unknown';
  let nextReminderStart: string | null = null;
  let nextReminderEnd: string | null = null;
  let daysUntilDue: number | null = null;
  let daysSinceLastContact: number | null = null;

  if (lastContact) {
    daysSinceLastContact = differenceInDays(today, lastContact);
    const minDays = friend?.contactFrequencyMin ?? 14;
    const maxDays = friend?.contactFrequencyMax ?? 30;
    
    nextReminderStart = addDays(lastContact, minDays).toISOString();
    nextReminderEnd = addDays(lastContact, maxDays).toISOString();
    
    daysUntilDue = maxDays - daysSinceLastContact;
    
    if (daysSinceLastContact > maxDays) {
      urgencyStatus = 'overdue';
    } else if (daysSinceLastContact >= minDays) {
      urgencyStatus = 'due_soon';
    } else {
      urgencyStatus = 'safe';
    }
  }

  return {
    ...friend,
    urgencyStatus,
    nextReminderStart,
    nextReminderEnd,
    daysUntilDue,
    daysSinceLastContact,
  };
}

export function sortFriendsByUrgency(friends: FriendWithStatus[]): FriendWithStatus[] {
  const statusOrder: Record<UrgencyStatus, number> = {
    overdue: 0,
    due_soon: 1,
    safe: 2,
    unknown: 3,
  };
  
  return [...(friends ?? [])].sort((a, b) => {
    const aStatus = statusOrder[a?.urgencyStatus ?? 'unknown'] ?? 3;
    const bStatus = statusOrder[b?.urgencyStatus ?? 'unknown'] ?? 3;
    if (aStatus !== bStatus) return aStatus - bStatus;
    // Secondary sort: by days until due (ascending)
    return (a?.daysUntilDue ?? Infinity) - (b?.daysUntilDue ?? Infinity);
  });
}

export function getUrgencyColor(status: UrgencyStatus): string {
  switch (status) {
    case 'overdue': return 'bg-red-500';
    case 'due_soon': return 'bg-yellow-500';
    case 'safe': return 'bg-green-500';
    default: return 'bg-gray-400';
  }
}

export function getUrgencyTextColor(status: UrgencyStatus): string {
  switch (status) {
    case 'overdue': return 'text-red-600';
    case 'due_soon': return 'text-yellow-600';
    case 'safe': return 'text-green-600';
    default: return 'text-gray-500';
  }
}

export function getMotivationalMessage(status: UrgencyStatus, name: string): string {
  switch (status) {
    case 'overdue':
      return `Don't let this friendship fade! ${name} misses you.`;
    case 'due_soon':
      return `Time to reach out to ${name} soon!`;
    case 'safe':
      return `Great job keeping in touch with ${name}!`;
    default:
      return `Start building memories with ${name}!`;
  }
}

export function calculateStats(friends: Friend[], interactions: Interaction[]): Stats {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const interactionsThisWeek = (interactions ?? []).filter(i => {
    const date = new Date(i?.date ?? '');
    return isWithinInterval(date, { start: weekStart, end: weekEnd });
  });
  
  const interactionsThisMonth = (interactions ?? []).filter(i => {
    const date = new Date(i?.date ?? '');
    return isWithinInterval(date, { start: monthStart, end: monthEnd });
  });
  
  const uniqueFriendsThisWeek = new Set(interactionsThisWeek.map(i => i?.friendId));
  const uniqueFriendsThisMonth = new Set(interactionsThisMonth.map(i => i?.friendId));
  
  // Calculate at-risk friendships (>90 days no contact)
  const atRiskCount = (friends ?? []).filter(f => {
    if (!f?.lastInteractionDate) return true;
    const days = differenceInDays(today, new Date(f.lastInteractionDate));
    return days > 90;
  }).length;
  
  // Calculate streaks
  const { longestStreak, currentStreak } = calculateStreaks(interactions ?? []);
  
  return {
    contactedThisWeek: uniqueFriendsThisWeek.size,
    contactedThisMonth: uniqueFriendsThisMonth.size,
    longestStreak,
    currentStreak,
    atRiskFriendships: atRiskCount,
    totalFriends: (friends ?? []).length,
    totalInteractions: (interactions ?? []).length,
  };
}

function calculateStreaks(interactions: Interaction[]): { longestStreak: number; currentStreak: number } {
  if (!interactions?.length) return { longestStreak: 0, currentStreak: 0 };
  
  // Get unique dates of interactions
  const dates = [...new Set((interactions ?? []).map(i => startOfDay(new Date(i?.date ?? '')).toISOString()))]
    .sort()
    .map(d => new Date(d));
  
  if (!dates?.length) return { longestStreak: 0, currentStreak: 0 };
  
  let longestStreak = 1;
  let currentStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const diff = differenceInDays(dates[i] ?? new Date(), dates[i - 1] ?? new Date());
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  // Check if current streak is active (last interaction was today or yesterday)
  const today = startOfDay(new Date());
  const lastDate = dates[dates.length - 1];
  const daysSinceLast = lastDate ? differenceInDays(today, lastDate) : Infinity;
  
  if (daysSinceLast <= 1) {
    currentStreak = tempStreak;
  } else {
    currentStreak = 0;
  }
  
  return { longestStreak, currentStreak };
}

export const BADGES: Badge[] = [
  {
    id: 'first_friend',
    name: 'First Friend',
    description: 'Added your first friend',
    icon: '👋',
    condition: (stats) => (stats?.totalFriends ?? 0) >= 1,
  },
  {
    id: 'social_circle',
    name: 'Social Circle',
    description: 'Added 5 friends',
    icon: '🎉',
    condition: (stats) => (stats?.totalFriends ?? 0) >= 5,
  },
  {
    id: 'popular',
    name: 'Popular',
    description: 'Added 10 friends',
    icon: '⭐',
    condition: (stats) => (stats?.totalFriends ?? 0) >= 10,
  },
  {
    id: 'first_contact',
    name: 'First Contact',
    description: 'Logged your first interaction',
    icon: '💬',
    condition: (stats) => (stats?.totalInteractions ?? 0) >= 1,
  },
  {
    id: 'chatterbox',
    name: 'Chatterbox',
    description: 'Logged 10 interactions',
    icon: '📞',
    condition: (stats) => (stats?.totalInteractions ?? 0) >= 10,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Logged 50 interactions',
    icon: '🦋',
    condition: (stats) => (stats?.totalInteractions ?? 0) >= 50,
  },
  {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Interacted 3 days in a row',
    icon: '🔥',
    condition: (stats) => (stats?.longestStreak ?? 0) >= 3,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day interaction streak',
    icon: '💪',
    condition: (stats) => (stats?.longestStreak ?? 0) >= 7,
  },
  {
    id: 'no_one_left_behind',
    name: 'No One Left Behind',
    description: 'No at-risk friendships',
    icon: '🛡️',
    condition: (stats) => (stats?.atRiskFriendships ?? 1) === 0 && (stats?.totalFriends ?? 0) >= 3,
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Contacted 5+ friends in a week',
    icon: '🏆',
    condition: (stats) => (stats?.contactedThisWeek ?? 0) >= 5,
  },
];

export function checkNewBadges(stats: Stats, unlockedBadgeIds: string[]): Badge[] {
  const newBadges: Badge[] = [];
  for (const badge of BADGES) {
    if (!(unlockedBadgeIds ?? []).includes(badge?.id ?? '') && badge?.condition?.(stats)) {
      newBadges.push(badge);
    }
  }
  return newBadges;
}

export type RelationshipType = 'close_friend' | 'acquaintance' | 'family' | 'colleague' | 'other';

export type InteractionType = 'call' | 'text' | 'visit' | 'video_call' | 'other';

export interface Friend {
  id: string;
  name: string;
  photo?: string; // base64 encoded
  notes: string;
  relationshipType: RelationshipType;
  lastInteractionDate: string | null; // ISO date string
  contactFrequencyMin: number; // days
  contactFrequencyMax: number; // days
  createdAt: string;
  updatedAt: string;
}

export interface Interaction {
  id: string;
  friendId: string;
  type: InteractionType;
  date: string; // ISO date string
  duration?: number; // minutes
  notes: string;
  createdAt: string;
}

export interface Settings {
  darkMode: boolean;
  defaultFrequencyMin: number;
  defaultFrequencyMax: number;
  notificationsEnabled: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  condition: (stats: Stats) => boolean;
}

export interface Stats {
  contactedThisWeek: number;
  contactedThisMonth: number;
  longestStreak: number;
  currentStreak: number;
  atRiskFriendships: number;
  totalFriends: number;
  totalInteractions: number;
}

export type UrgencyStatus = 'overdue' | 'due_soon' | 'safe' | 'unknown';

export interface FriendWithStatus extends Friend {
  urgencyStatus: UrgencyStatus;
  nextReminderStart: string | null;
  nextReminderEnd: string | null;
  daysUntilDue: number | null;
  daysSinceLastContact: number | null;
}

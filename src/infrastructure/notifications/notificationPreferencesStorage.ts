import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  type NotificationPreferencesRepository,
} from '@/src/ports/notificationPreferencesRepository';

const STORAGE_KEY = 'subtrack_notification_preferences_v1';

function parsePreferences(raw: string | null): NotificationPreferences {
  if (!raw) {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      enabled: parsed.enabled === true,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
}

export const notificationPreferencesStorage: NotificationPreferencesRepository = {
  async load(): Promise<NotificationPreferences> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return parsePreferences(raw);
  },

  async save(preferences: NotificationPreferences): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  },
};

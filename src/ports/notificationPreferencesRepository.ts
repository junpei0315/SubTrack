export interface NotificationPreferences {
  /** 通知を受け取るか（支払い日・未使用見直しをまとめて制御） */
  enabled: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
};

export interface NotificationPreferencesRepository {
  load(): Promise<NotificationPreferences>;
  save(preferences: NotificationPreferences): Promise<void>;
}

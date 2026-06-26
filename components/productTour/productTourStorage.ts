import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_KEY = '@subtrack/product_tour_pending';
const completedKey = (userId: string) => `@subtrack/product_tour_completed/${userId}`;

/** 同一セッション内でルーティング競合を避けるための同期フラグ。 */
let queuedForSession = false;
const queuedListeners = new Set<() => void>();

function notifyQueuedListeners(): void {
  queuedListeners.forEach((listener) => {
    listener();
  });
}

export function markProductTourPending(): void {
  queuedForSession = true;
  notifyQueuedListeners();
  void AsyncStorage.setItem(PENDING_KEY, '1');
}

export function isProductTourQueued(): boolean {
  return queuedForSession;
}

export function clearProductTourQueued(): void {
  queuedForSession = false;
}

export function subscribeProductTourQueued(listener: () => void): () => void {
  queuedListeners.add(listener);
  return () => {
    queuedListeners.delete(listener);
  };
}

export async function takeStoredProductTourPending(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PENDING_KEY);
  if (!value) {
    return false;
  }
  await AsyncStorage.removeItem(PENDING_KEY);
  return true;
}

export async function isProductTourCompleted(userId: string): Promise<boolean> {
  return (await AsyncStorage.getItem(completedKey(userId))) === '1';
}

export async function markProductTourCompleted(userId: string): Promise<void> {
  clearProductTourQueued();
  await AsyncStorage.setItem(completedKey(userId), '1');
}

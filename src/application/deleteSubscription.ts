/**
 * F-04: サブスクを物理削除する。利用履歴（usage_logs）は FK の ON DELETE CASCADE で
 * まとめて削除される。誤操作防止の確認は presentation 層で行う。
 */

import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function deleteSubscription(
  repository: SubscriptionRepository,
  id: string
): Promise<void> {
  return repository.delete(id);
}

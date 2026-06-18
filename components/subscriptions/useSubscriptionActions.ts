import { useState } from 'react';

import { confirmDestructive, showAlert } from '@/components/ui/confirm';
import {
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
} from '@/src/application/changeSubscriptionStatus';
import { deleteSubscription } from '@/src/application/deleteSubscription';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface UseSubscriptionActionsParams {
  /** 停止・再開・解約でステータスが変わったとき、更新後のサブスクを返す。 */
  onUpdated?: (subscription: Subscription) => void;
  /** 削除が完了したとき。 */
  onDeleted?: () => void;
}

interface UseSubscriptionActionsResult {
  isBusy: boolean;
  pause: (subscription: Subscription) => Promise<void>;
  resume: (subscription: Subscription) => Promise<void>;
  confirmCancel: (subscription: Subscription) => void;
  confirmDelete: (subscription: Subscription) => void;
}

export function useSubscriptionActions({
  onUpdated,
  onDeleted,
}: UseSubscriptionActionsParams = {}): UseSubscriptionActionsResult {
  const [isBusy, setIsBusy] = useState(false);

  const run = async <T,>(task: () => Promise<T>, errorMessage: string): Promise<T | undefined> => {
    setIsBusy(true);
    try {
      return await task();
    } catch (error) {
      if (__DEV__) {
        console.error('[useSubscriptionActions]', error);
      }
      const detail =
        __DEV__ && error instanceof Error ? `\n（${error.message}）` : '';
      showAlert('操作に失敗しました', `${errorMessage}${detail}`);
      return undefined;
    } finally {
      setIsBusy(false);
    }
  };

  const pause = async (subscription: Subscription) => {
    const updated = await run(
      () => pauseSubscription(subscriptionRepositorySupabase, subscription),
      '通信環境を確認して再度お試しください。'
    );
    if (updated) {
      onUpdated?.(updated);
    }
  };

  const resume = async (subscription: Subscription) => {
    const updated = await run(
      () => resumeSubscription(subscriptionRepositorySupabase, subscription),
      '通信環境を確認して再度お試しください。'
    );
    if (updated) {
      onUpdated?.(updated);
    }
  };

  const confirmCancel = (subscription: Subscription) => {
    confirmDestructive({
      title: 'このサブスクを解約しますか？',
      message: '解約すると合計金額の計算から外れます。利用履歴は残ります。',
      confirmLabel: '解約する',
      onConfirm: () => {
        void (async () => {
          const updated = await run(
            () => cancelSubscription(subscriptionRepositorySupabase, subscription),
            '通信環境を確認して再度お試しください。'
          );
          if (updated) {
            onUpdated?.(updated);
          }
        })();
      },
    });
  };

  const confirmDelete = (subscription: Subscription) => {
    confirmDestructive({
      title: 'このサブスクを削除しますか？',
      message: '利用履歴を含めて完全に削除されます。元に戻すことはできません。',
      confirmLabel: '削除する',
      onConfirm: () => {
        void (async () => {
          const result = await run(async () => {
            await deleteSubscription(subscriptionRepositorySupabase, subscription.id);
            return true as const;
          }, '通信環境を確認して再度お試しください。一覧から削除されていません。');
          if (result) {
            onDeleted?.();
          }
        })();
      },
    });
  };

  return { isBusy, pause, resume, confirmCancel, confirmDelete };
}

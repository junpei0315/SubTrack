import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/components/auth/AuthProvider';
import { getSubscriptions } from '@/src/application/getSubscriptions';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface OnboardingContextValue {
  /** サブスク件数の解決中（ルーティング判定を保留すべき間）true。 */
  isResolving: boolean;
  /** 初回オンボーディング（サブスク一括登録）を表示すべきか。 */
  needsOnboarding: boolean;
  /** 一括登録・スキップ後、ホームへの遷移を促すためローカルに反映する。 */
  markCompletedLocally: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const repository = subscriptionRepositorySupabase;

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { session, isLoading } = useAuth();
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  // 直近で解決済みのユーザー ID。重複フェッチと取りこぼしを防ぐ。
  const resolvedUserIdRef = useRef<string | null>(null);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!userId) {
      resolvedUserIdRef.current = null;
      setNeedsOnboarding(false);
      setIsResolving(false);
      return;
    }

    if (resolvedUserIdRef.current === userId) {
      return;
    }

    let isMounted = true;
    setIsResolving(true);

    // 仮実装: ログイン済みでサブスクが 1 件も無ければオンボーディングを表示する。
    // 将来は profiles.onboarding_completed で「sign-up 後 1 回だけ」に切り替える。
    void getSubscriptions(repository)
      .then((subscriptions) => {
        if (!isMounted) {
          return;
        }
        resolvedUserIdRef.current = userId;
        setNeedsOnboarding(subscriptions.length === 0);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        // 取得失敗時はオンボーディングへ誘導せず通常フローを優先する。
        resolvedUserIdRef.current = userId;
        setNeedsOnboarding(false);
      })
      .finally(() => {
        if (isMounted) {
          setIsResolving(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, isLoading]);

  const markCompletedLocally = useCallback(() => {
    setNeedsOnboarding(false);
  }, []);

  const value = useMemo<OnboardingContextValue>(
    () => ({ isResolving, needsOnboarding, markCompletedLocally }),
    [isResolving, needsOnboarding, markCompletedLocally]
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (context === null) {
    throw new Error('useOnboarding は OnboardingProvider の内側で使用してください');
  }
  return context;
}

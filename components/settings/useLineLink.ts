import { useCallback, useEffect, useState } from 'react';

import { openLineOfficialAccount } from '@/components/settings/openLineOfficialAccount';
import { issueLineLinkCode } from '@/src/application/issueLineLinkCode';
import { lineLinkRepositorySupabase } from '@/src/infrastructure/supabase/lineLinkRepositorySupabase';

export function useLineLink() {
  const [isLinked, setIsLinked] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLinked(await lineLinkRepositorySupabase.isLinked());
    } catch {
      setErrorMessage('連携状態の取得に失敗しました');
    }
  }, []);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const generateCode = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setCode(await issueLineLinkCode(lineLinkRepositorySupabase));
    } catch {
      setErrorMessage('コードの発行に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openOfficialAccount = useCallback(async () => {
    setErrorMessage(null);
    try {
      await openLineOfficialAccount();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'LINE公式アカウントを開けませんでした';
      setErrorMessage(message);
    }
  }, []);

  const unlink = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await lineLinkRepositorySupabase.unlink();
      setCode(null);
      await refreshStatus();
    } catch {
      setErrorMessage('連携の解除に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [refreshStatus]);

  return {
    isLinked,
    code,
    isLoading,
    errorMessage,
    generateCode,
    openOfficialAccount,
    unlink,
  };
}

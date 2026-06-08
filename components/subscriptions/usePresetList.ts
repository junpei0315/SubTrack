import { useCallback, useEffect, useState } from 'react';

import { getPresets } from '@/src/application/getPresets';
import type { PresetService } from '@/src/domain/preset';
import { presetRepositorySupabase } from '@/src/infrastructure/supabase/presetRepositorySupabase';

interface UsePresetListResult {
  presets: PresetService[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
}

export function usePresetList(): UsePresetListResult {
  const [presets, setPresets] = useState<PresetService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getPresets(presetRepositorySupabase);
      setPresets(result);
    } catch {
      setErrorMessage('プリセットの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    presets,
    isLoading,
    errorMessage,
    reload: load,
  };
}

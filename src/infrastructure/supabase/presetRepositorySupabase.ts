import type { PresetService } from '@/src/domain/preset';
import type { PresetRepository } from '@/src/ports/presetRepository';

import { supabase } from './client';
import { mapPresetRow, PRESET_SELECT } from './presetMapper';

export const presetRepositorySupabase: PresetRepository = {
  async findAll(): Promise<PresetService[]> {
    const { data, error } = await supabase
      .from('services')
      .select(PRESET_SELECT)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapPresetRow(row as Record<string, unknown>));
  },
};

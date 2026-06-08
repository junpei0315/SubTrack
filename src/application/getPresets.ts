import type { PresetService } from '@/src/domain/preset';
import type { PresetRepository } from '@/src/ports/presetRepository';

export async function getPresets(repository: PresetRepository): Promise<PresetService[]> {
  return repository.findAll();
}

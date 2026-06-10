import type { PresetService } from '@/src/domain/preset';

export interface PresetRepository {
  findAll(): Promise<PresetService[]>;
}

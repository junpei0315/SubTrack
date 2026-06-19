import type { Profile } from '@/src/domain/profile';
import type { ProfileRepository } from '@/src/ports/profileRepository';

export async function getProfile(repository: ProfileRepository): Promise<Profile | null> {
  return repository.getCurrent();
}

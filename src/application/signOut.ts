import type { AuthRepository } from '@/src/ports/authRepository';

/** サインアウトする。 */
export async function signOut(repository: AuthRepository): Promise<void> {
  await repository.signOut();
}

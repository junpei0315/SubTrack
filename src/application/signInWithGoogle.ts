import type { AuthRepository } from '@/src/ports/authRepository';

/** Google アカウントでサインインする。 */
export async function signInWithGoogle(repository: AuthRepository): Promise<void> {
  await repository.signInWithGoogle();
}

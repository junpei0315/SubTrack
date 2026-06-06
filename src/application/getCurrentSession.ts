import type { AuthSession } from '@/src/domain/auth';
import type { AuthRepository } from '@/src/ports/authRepository';

/** 現在のセッションを取得する（未ログインなら null）。 */
export async function getCurrentSession(
  repository: AuthRepository
): Promise<AuthSession | null> {
  return repository.getSession();
}

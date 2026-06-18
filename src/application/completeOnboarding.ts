import type { ProfileRepository } from '@/src/ports/profileRepository';

/**
 * 初回オンボーディングを完了済みとして記録する。
 * サブスクを一括登録した場合・スキップした場合のどちらでも呼ぶ。
 */
export async function completeOnboarding(repository: ProfileRepository): Promise<void> {
  await repository.markOnboardingCompleted();
}

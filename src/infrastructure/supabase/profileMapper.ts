import type { Profile } from '@/src/domain/profile';

export const PROFILE_SELECT = 'id, email, display_currency, onboarding_completed';

export function mapProfileRow(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: (row.email as string) ?? '',
    displayCurrency: (row.display_currency as string) ?? 'JPY',
    onboardingCompleted: Boolean(row.onboarding_completed),
  };
}

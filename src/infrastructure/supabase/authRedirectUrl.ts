import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** メール確認・OAuth 用のリダイレクト URL（Supabase の Allow list に登録する値と一致させる）。 */
export function getAuthRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  const scheme =
    typeof Constants.expoConfig?.scheme === 'string' ? Constants.expoConfig.scheme : 'subscapp';
  return `${scheme}://auth/callback`;
}

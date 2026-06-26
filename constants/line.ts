/** SubTrack 公式アカウント（公開 URL。環境変数で上書き可） */
const DEFAULT_LINE_OFFICIAL_ACCOUNT_URL = 'https://lin.ee/WNsV6Qq';

/** LINE 公式アカウントの友だち追加 URL。`EXPO_PUBLIC_LINE_OFFICIAL_ACCOUNT_URL` 未設定時は既定値。 */
export function getLineOfficialAccountUrl(): string {
  const url = process.env.EXPO_PUBLIC_LINE_OFFICIAL_ACCOUNT_URL?.trim();
  return url && url.length > 0 ? url : DEFAULT_LINE_OFFICIAL_ACCOUNT_URL;
}

export function isLineOfficialAccountConfigured(): boolean {
  return getLineOfficialAccountUrl().length > 0;
}

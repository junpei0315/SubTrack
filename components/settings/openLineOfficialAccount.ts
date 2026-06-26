import { Linking } from 'react-native';

import { getLineOfficialAccountUrl } from '@/constants/line';

export async function openLineOfficialAccount(): Promise<void> {
  const url = getLineOfficialAccountUrl();
  if (!url) {
    throw new Error('LINE公式アカウントのURLが設定されていません');
  }

  await Linking.openURL(url);
}

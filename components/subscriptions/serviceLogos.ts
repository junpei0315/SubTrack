import type { ImageSourcePropType } from 'react-native';

/**
 * logo_key（assets/services/{logo_key}.jpeg）から同梱画像を解決するマップ。
 * React Native の require は静的解決が必須なため、ここで一覧として保持する。
 * 新しいロゴを assets/services に追加したら本マップにも 1 行追加する。
 */
const SERVICE_LOGOS: Record<string, ImageSourcePropType> = {
  abema: require('@/assets/services/abema.jpeg'),
  amazonprime: require('@/assets/services/amazonprime.jpeg'),
  'anytimefitness.co': require('@/assets/services/anytimefitness.co.jpeg'),
  apple: require('@/assets/services/apple.jpeg'),
  applemusic: require('@/assets/services/applemusic.jpeg'),
  audible: require('@/assets/services/audible.jpeg'),
  canva: require('@/assets/services/canva.jpeg'),
  chargespot: require('@/assets/services/chargespot.jpeg'),
  chatgpt: require('@/assets/services/chatgpt.jpeg'),
  chocozap: require('@/assets/services/chocozap.jpeg'),
  claude: require('@/assets/services/claude.jpeg'),
  cocacola: require('@/assets/services/cocacola.jpeg'),
  'cocos-jpn.co': require('@/assets/services/cocos-jpn.co.jpeg'),
  cursor: require('@/assets/services/cursor.jpeg'),
  dazn: require('@/assets/services/dazn.jpeg'),
  deepl: require('@/assets/services/deepl.jpeg'),
  disneyplus: require('@/assets/services/disneyplus.jpeg'),
  'dmm.co': require('@/assets/services/dmm.co.jpeg'),
  dropbox: require('@/assets/services/dropbox.jpeg'),
  duolingo: require('@/assets/services/duolingo.jpeg'),
  figma: require('@/assets/services/figma.jpeg'),
  gemini: require('@/assets/services/gemini.jpeg'),
  github: require('@/assets/services/github.jpeg'),
  goinc: require('@/assets/services/goinc.jpeg'),
  goodnotes: require('@/assets/services/goodnotes.jpeg'),
  googleone: require('@/assets/services/googleone.jpeg'),
  hulu: require('@/assets/services/hulu.jpeg'),
  icloud: require('@/assets/services/icloud.jpeg'),
  kindle: require('@/assets/services/kindle.jpeg'),
  luup: require('@/assets/services/luup.jpeg'),
  netflix: require('@/assets/services/netflix.jpeg'),
  nintendo: require('@/assets/services/nintendo.jpeg'),
  nosh: require('@/assets/services/nosh.jpeg'),
  notion: require('@/assets/services/notion.jpeg'),
  pairs: require('@/assets/services/pairs.jpeg'),
  pixiv: require('@/assets/services/pixiv.jpeg'),
  playstation: require('@/assets/services/playstation.jpeg'),
  progate: require('@/assets/services/progate.jpeg'),
  simeji: require('@/assets/services/simeji.jpeg'),
  slack: require('@/assets/services/slack.jpeg'),
  spotify: require('@/assets/services/spotify.jpeg'),
  sukiya: require('@/assets/services/sukiya.jpeg'),
  tapple: require('@/assets/services/tapple.jpeg'),
  tinder: require('@/assets/services/tinder.jpeg'),
  uber: require('@/assets/services/uber.jpeg'),
  udemy: require('@/assets/services/udemy.jpeg'),
  unext: require('@/assets/services/unext.jpeg'),
  with: require('@/assets/services/with.jpeg'),
  x: require('@/assets/services/x.jpeg'),
  youtube: require('@/assets/services/youtube.jpeg'),
  youtubemusic: require('@/assets/services/youtubemusic.jpeg'),
};

/**
 * 同梱ロゴ（logoKey）優先、無ければ外部 URL（logoUri）を解決する。
 * どちらも無い場合は undefined（呼び出し側でフォールバック表示）。
 */
export function resolveServiceLogo(
  logoKey?: string,
  logoUri?: string
): ImageSourcePropType | undefined {
  if (logoKey && SERVICE_LOGOS[logoKey]) {
    return SERVICE_LOGOS[logoKey];
  }
  if (logoUri) {
    return { uri: logoUri };
  }
  return undefined;
}

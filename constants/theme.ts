/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

import { AppColors } from '@/constants/colors';

const tintColor = '#fff';

const palette = {
  text: '#ECEDEE',
  background: AppColors.background,
  tint: tintColor,
  icon: '#9BA1A6',
  tabIconDefault: '#9BA1A6',
  tabIconSelected: tintColor,
  brand: AppColors.accentBrand,
  headerBackground: AppColors.backgroundDarker,
  headerText: AppColors.text,
  headerBorder: AppColors.border,
};

/**
 * SubTrack のブランドカラー（暫定）。ロゴ・主要アクセントに使う赤。
 * 直書きの 16 進カラーを避けるため、ブランド色はここに集約する。
 */
export const BrandColor = AppColors.accentBrand;

export const Colors = {
  light: palette,
  dark: palette,
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, className, ...otherProps }: ThemedViewProps) {
  // lightColor / darkColor が明示されたときのみ背景色を inline で強制する。
  // 未指定なら className（bg-*）や style 側で背景を制御できるようにする。
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const backgroundStyle = lightColor || darkColor ? { backgroundColor } : undefined;

  return <View className={className} style={[backgroundStyle, style]} {...otherProps} />;
}

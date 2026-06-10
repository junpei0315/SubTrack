import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

const TYPE_CLASS: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base leading-6 text-foreground',
  defaultSemiBold: 'text-base leading-6 font-semibold text-foreground',
  title: 'text-[32px] font-bold leading-8 text-foreground',
  subtitle: 'text-xl font-bold text-foreground',
  link: 'text-base leading-[30px] text-accent',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  // lightColor / darkColor が明示されたときのみ文字色を inline で強制する。
  // 未指定なら type の className（例: link の text-accent）や style 側で色を制御できる。
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const colorStyle = lightColor || darkColor ? { color } : undefined;

  return (
    <Text
      className={`${TYPE_CLASS[type]}${className ? ` ${className}` : ''}`}
      style={[colorStyle, style]}
      {...rest}
    />
  );
}

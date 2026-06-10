import { Link, usePathname } from 'expo-router';
import { ChartNoAxesColumn, LayoutGrid, Settings } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Footer Component（完全版）
 */
export default function Footer() {
  if (Platform.OS === 'web') {
    return <FooterWeb />;
  }

  return <FooterNative />;
}

/* ========================
   ✅ Native版（完全）
======================== */
function FooterNative() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const pathname = usePathname();
  const insets = useSafeAreaInsets(); // ✅ iPhone対応

  const navigationLinks = [
    {
      label: 'Home',
      href: '/(tabs)/home',
      icon: LayoutGrid,
    },
    {
      label: '分析',
      href: '/(tabs)/subscriptions',
      icon: ChartNoAxesColumn,
    },
    {
      label: '設定',
      href: '/(tabs)/settings',
      icon: Settings,
    },
  ] as const;

  return (
    <View
      style={[
        styles.footerContainer,
        {
          borderTopColor: colors.icon,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          paddingBottom: insets.bottom, // ✅ SafeArea対応
        },
      ]}
    >
      {/* ナビゲーション */}
      <View style={styles.navRow}>
        {navigationLinks.map((link) => {
          const Icon = link.icon;

          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link key={link.href} href={link.href} asChild>
              <Pressable style={styles.navItem}>
                <Icon size={24} color={isActive ? colors.tint : colors.icon} />
                <Text
                  style={[
                    styles.navLabel,
                    {
                      color: isActive ? colors.tint : colors.icon,
                    },
                  ]}
                >
                  {link.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

/* ========================
   ✅ Web版（簡易）
======================== */
function FooterWeb() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Reuse the same navigation links as native, but render fixed at bottom for web.
  const navigationLinks = [
    {
      label: 'ホーム',
      href: '/(tabs)/home',
      icon: LayoutGrid,
    },
    {
      label: '分析',
      href: '/(tabs)/subscriptions',
      icon: ChartNoAxesColumn,
    },
    {
      label: '設定',
      href: '/(tabs)/settings',
      icon: Settings,
    },
  ] as const;

  const pathname = usePathname();

  return (
    <View
      style={[
        styles.webFooter,
        {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
          borderTopColor: colors.icon,
        },
      ]}
    >
      <View style={styles.navRow}>
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

          return (
            <Link key={link.href} href={link.href} asChild>
              <Pressable style={styles.navItem}>
                <Icon size={20} color={isActive ? colors.tint : colors.icon} />
                <Text style={[styles.navLabel, { color: isActive ? colors.tint : colors.icon }]}>
                  {link.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

/* ========================
   ✅ Styles
======================== */
const styles = StyleSheet.create({
  footerContainer: {
    borderTopWidth: 1,

    position: 'absolute',
    bottom: 0,
    width: '100%',

    paddingTop: 8,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  navItem: {
    alignItems: 'center',
  },

  navLabel: {
    fontSize: 11,
    marginTop: 4,
  },

  webFooter: {
    padding: 16,
    alignItems: 'center',
  },
});

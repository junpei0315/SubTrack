import { ScrollView, StyleSheet } from 'react-native';

import { LineLinkCard } from '@/components/settings/LineLinkCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/settings/screens/SettingsTopScreen.tsx を実装して差し替える
// 関連機能: F-12 / F-13 / F-14 への導線
export default function SettingsRoute() {
  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Settings</ThemedText>
        <LineLinkCard />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
});

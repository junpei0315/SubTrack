import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { GenreSelector } from '@/components/subscriptions/GenreSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_GENRE_ID, type GenreId } from '@/src/domain/genre';

// TODO: src/features/subscriptions/screens/SubscriptionNewScreen.tsx を実装して差し替える
// 関連機能: F-02（カスタム新規追加）
// 現状は GenreSelector の表示確認用のたたき。
export default function SubscriptionNewRoute() {
  const [genreId, setGenreId] = useState<GenreId>(DEFAULT_GENRE_ID);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ジャンル
        </ThemedText>
        <GenreSelector selectedId={genreId} onChange={setGenreId} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    paddingHorizontal: 16,
  },
});

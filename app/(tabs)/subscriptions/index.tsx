import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { SubscriptionListItem } from '@/components/subscriptions/SubscriptionListItem';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import type { Subscription } from '@/src/domain/subscription';

export default function SubscriptionListRoute() {
  const router = useRouter();
  const { subscriptions, isLoading, errorMessage, reload } = useSubscriptionList();

  const handlePress = useCallback(
    (subscription: Subscription) => {
      router.push(`/subscriptions/${subscription.id}`);
    },
    [router]
  );

  if (isLoading && subscriptions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color="#DC052D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionListItem subscription={item} onPress={handlePress} />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor="#DC052D" />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrapper}>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : (
              <>
                <Text style={styles.emptyTitle}>登録中のサブスクはありません</Text>
                <Text style={styles.emptyHint}>＋ボタンからサブスクを登録しましょう</Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const BACKGROUND_COLOR = '#0f0f0f';
const TEXT_COLOR = '#ffffff';
const SUBTLE_COLOR = '#9aa0a6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 8,
  },
  emptyTitle: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    color: SUBTLE_COLOR,
    fontSize: 13,
  },
  errorText: {
    color: '#DC052D',
    fontSize: 14,
  },
});

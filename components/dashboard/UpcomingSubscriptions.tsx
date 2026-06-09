import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SubscriptionListItem } from '@/components/subscriptions/SubscriptionListItem';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import type { Subscription } from '@/src/domain/subscription';
import { getUpcomingSubscriptions } from '@/src/domain/upcomingSubscriptions';

const PREVIEW_COUNT = 3;

export const UpcomingSubscriptions: React.FC = () => {
  const router = useRouter();
  const { subscriptions, isLoading, errorMessage } = useSubscriptionList();

  const upcoming = useMemo(
    () => getUpcomingSubscriptions(subscriptions, PREVIEW_COUNT),
    [subscriptions]
  );

  const handlePressItem = (subscription: Subscription) => {
    router.push(`/subscriptions/${subscription.id}`);
  };

  const handlePressAll = () => {
    router.push('/subscriptions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>サブスクリプション</Text>
        <TouchableOpacity
          style={styles.allButton}
          activeOpacity={0.7}
          onPress={handlePressAll}
          accessibilityRole="button"
          accessibilityLabel="サブスクリプションを全て表示"
        >
          <Text style={styles.allButtonText}>全て</Text>
          <ChevronRight size={16} color="#9aa0a6" />
        </TouchableOpacity>
      </View>

      {isLoading && subscriptions.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#ff3a5e" />
        </View>
      ) : errorMessage ? (
        <Text style={styles.message}>{errorMessage}</Text>
      ) : upcoming.length === 0 ? (
        <Text style={styles.message}>登録中のサブスクはありません</Text>
      ) : (
        <View style={styles.list}>
          {upcoming.map((subscription) => (
            <SubscriptionListItem
              key={subscription.id}
              subscription={subscription}
              onPress={handlePressItem}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const TEXT_COLOR = '#ffffff';
const SUBTLE_COLOR = '#9aa0a6';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    marginVertical: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  allButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  allButtonText: {
    color: SUBTLE_COLOR,
    fontSize: 14,
    fontWeight: '600',
  },
  centered: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: SUBTLE_COLOR,
    fontSize: 14,
    paddingVertical: 12,
  },
  list: {
    gap: 12,
  },
});

import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { SubscriptionListItem } from '@/components/subscriptions/SubscriptionListItem';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import { AppColors } from '@/constants/colors';
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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionListItem subscription={item} onPress={handlePress} />
        )}
        contentContainerClassName="flex-grow p-4"
        ItemSeparatorComponent={() => <View className="h-3" />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor={AppColors.accent}
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center gap-2 py-20">
            {errorMessage ? (
              <Text className="text-sm text-accent">{errorMessage}</Text>
            ) : (
              <>
                <Text className="text-base font-bold text-foreground">
                  登録中のサブスクはありません
                </Text>
                <Text className="text-[13px] text-subtle">
                  +ボタンからサブスクを登録しましょう
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { SubscriptionListItem } from '@/components/subscriptions/SubscriptionListItem';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import { AppColors } from '@/constants/colors';
import type { Subscription } from '@/src/domain/subscription';

type ListTab = 'active' | 'cancelled';

export default function SubscriptionListRoute() {
  const router = useRouter();
  const { subscriptions, isLoading, errorMessage, reload } = useSubscriptionList();
  const [tab, setTab] = useState<ListTab>('active');

  const handlePress = useCallback(
    (subscription: Subscription) => {
      router.push(`/subscriptions/${subscription.id}`);
    },
    [router]
  );

  const cancelledCount = useMemo(
    () => subscriptions.filter((sub) => sub.status === 'cancelled').length,
    [subscriptions]
  );

  const visible = useMemo(
    () =>
      subscriptions.filter((sub) =>
        tab === 'cancelled' ? sub.status === 'cancelled' : sub.status !== 'cancelled'
      ),
    [subscriptions, tab]
  );

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
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
      <View className="flex-row gap-2 px-4 pb-1 pt-4">
        <TabButton label="稼働中" active={tab === 'active'} onPress={() => setTab('active')} />
        <TabButton
          label={cancelledCount > 0 ? `解約済み（${cancelledCount}）` : '解約済み'}
          active={tab === 'cancelled'}
          onPress={() => setTab('cancelled')}
        />
      </View>

      <FlatList
        data={visible}
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
            ) : tab === 'cancelled' ? (
              <Text className="text-base font-bold text-foreground">
                解約済みのサブスクはありません
              </Text>
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

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={active ? { selected: true } : {}}
      accessibilityLabel={label}
      className={`rounded-full px-4 py-2 ${active ? 'bg-accent-brand' : 'bg-card'}`}
    >
      <Text className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-subtle'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

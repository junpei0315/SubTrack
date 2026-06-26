import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProductTour } from '@/components/productTour/ProductTourProvider';
import { ProductTourUsagePreview } from '@/components/productTour/ProductTourUsagePreview';
import { SubscriptionListItem } from '@/components/subscriptions/SubscriptionListItem';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import { AppColors } from '@/constants/colors';
import type { Subscription } from '@/src/domain/subscription';

type ListTab = 'active' | 'cancelled';

/** フィルター行とリスト先頭の間（固定） */
const LIST_TOP_GAP = 8;

export default function SubscriptionListRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentStepId } = useProductTour();
  const { subscriptions, isLoading, errorMessage, reload } = useSubscriptionList();
  const [tab, setTab] = useState<ListTab>('active');
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);

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

  const handlePullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await reload();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [reload]);

  const tourHeader =
    currentStepId === 'usage-heatmap' ? <ProductTourUsagePreview /> : null;

  const contentContainerStyle = useMemo(
    (): StyleProp<ViewStyle> => ({
      paddingTop: LIST_TOP_GAP,
      paddingHorizontal: 16,
      paddingBottom: insets.bottom + 96,
      ...(visible.length === 0 ? { flexGrow: 1 } : {}),
    }),
    [insets.bottom, visible.length]
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
      <View className="flex-row gap-2 px-4 pb-0 pt-1">
        <TabButton label="契約中" active={tab === 'active'} onPress={() => setTab('active')} />
        <TabButton
          label={cancelledCount > 0 ? `解約済み（${cancelledCount}）` : '解約済み'}
          active={tab === 'cancelled'}
          onPress={() => setTab('cancelled')}
        />
      </View>

      {tourHeader}

      <FlatList
        style={{ flex: 1 }}
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionListItem subscription={item} onPress={handlePress} />
        )}
        contentContainerStyle={contentContainerStyle}
        ItemSeparatorComponent={ListSeparator}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handlePullRefresh}
            tintColor={AppColors.accent}
          />
        }
        ListEmptyComponent={
          <View className="items-center gap-2 py-20">
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

function ListSeparator() {
  return <View className="h-3" />;
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

import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { PresetGridCard } from '@/components/subscriptions/PresetGridCard';
import {
  getPresetGridCardWidth,
  PRESET_GRID_COLUMNS,
} from '@/components/subscriptions/presetGridConstants';
import { AppColors } from '@/constants/colors';
import type { PresetService } from '@/src/domain/preset';

interface PresetGridListProps {
  presets: PresetService[];
  isLoading: boolean;
  errorMessage: string | null;
  onPresetPress: (preset: PresetService) => void;
  onReload?: () => void;
  getSelected?: (preset: PresetService) => boolean;
  refreshable?: boolean;
  showEmptyReloadButton?: boolean;
}

/** プリセット選択画面共通の3列グリッド一覧。 */
export const PresetGridList: React.FC<PresetGridListProps> = ({
  presets,
  isLoading,
  errorMessage,
  onPresetPress,
  onReload,
  getSelected,
  refreshable = false,
  showEmptyReloadButton = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = useMemo(() => getPresetGridCardWidth(screenWidth), [screenWidth]);
  const showSelection = getSelected !== undefined;

  if (isLoading && presets.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={AppColors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={presets}
      keyExtractor={(item) => item.id}
      numColumns={PRESET_GRID_COLUMNS}
      renderItem={({ item }) => (
        <PresetGridCard
          preset={item}
          width={cardWidth}
          selected={showSelection ? getSelected(item) : undefined}
          onPress={onPresetPress}
        />
      )}
      columnWrapperClassName="justify-start gap-3"
      contentContainerClassName="flex-grow gap-3 p-5 pb-4"
      showsVerticalScrollIndicator={false}
      refreshControl={
        refreshable && onReload ? (
          <RefreshControl refreshing={isLoading} onRefresh={onReload} tintColor={AppColors.accent} />
        ) : undefined
      }
      ListEmptyComponent={
        <View className="flex-1 items-center justify-center py-20">
          {errorMessage ? (
            <View className="items-center gap-3">
              <Text className="text-sm text-accent">{errorMessage}</Text>
              {showEmptyReloadButton && onReload ? (
                <TouchableOpacity
                  onPress={onReload}
                  className="rounded-full bg-white/[0.08] px-5 py-2.5"
                >
                  <Text className="text-sm font-semibold text-foreground">再読み込み</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <Text className="text-sm text-subtle">該当するサブスクがありません</Text>
          )}
        </View>
      }
    />
  );
};

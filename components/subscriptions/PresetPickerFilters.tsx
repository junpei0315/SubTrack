import React from 'react';
import { View } from 'react-native';

import { GenreSelector } from '@/components/subscriptions/GenreSelector';
import { SubscriptionSearchBar } from '@/components/subscriptions/SubscriptionSearchBar';
import type { GenreId } from '@/src/domain/genre';

interface PresetPickerFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  genreFilter: GenreId | null;
  onGenreChange: (genreId: GenreId | null) => void;
}

/** プリセット選択画面共通の検索バー＋ジャンルチップ。 */
export const PresetPickerFilters: React.FC<PresetPickerFiltersProps> = ({
  query,
  onQueryChange,
  genreFilter,
  onGenreChange,
}) => (
  <>
    <View className="px-5 pt-2">
      <SubscriptionSearchBar value={query} onChangeText={onQueryChange} />
    </View>

    <View className="pt-2">
      <GenreSelector selectedId={genreFilter} onChange={onGenreChange} includeAll />
    </View>
  </>
);

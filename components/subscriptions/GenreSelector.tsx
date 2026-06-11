import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { GENRES, type GenreId } from '@/src/domain/genre';

interface GenreSelectorProps {
  selectedId: GenreId | null;
  onChange: (id: GenreId | null) => void;
  /** 先頭に「全て」（選択解除 = null）のピルを表示する */
  includeAll?: boolean;
  className?: string;
}

export const GenreSelector: React.FC<GenreSelectorProps> = ({
  selectedId,
  onChange,
  includeAll = false,
  className,
}) => {
  return (
    <View className={`w-full${className ? ` ${className}` : ''}`}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="items-center gap-3 px-4 py-2"
      >
        {includeAll ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onChange(null)}
            className={`min-w-[72px] items-center justify-center rounded-full px-5 py-3 ${selectedId === null ? 'bg-accent' : 'bg-white/[0.08]'}`}
          >
            <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
              全て
            </Text>
          </TouchableOpacity>
        ) : null}
        {GENRES.map((genre) => {
          const isSelected = genre.id === selectedId;
          return (
            <TouchableOpacity
              key={genre.id}
              activeOpacity={0.8}
              onPress={() => onChange(genre.id)}
              className={`min-w-[72px] items-center justify-center rounded-full px-5 py-3 ${isSelected ? 'bg-accent' : 'bg-white/[0.08]'}`}
            >
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {genre.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

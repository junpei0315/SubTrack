import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';
import { AppColors } from '@/constants/colors';
import type { PresetService } from '@/src/domain/preset';

interface OnboardingPresetCardProps {
  preset: PresetService;
  width: number;
  selected: boolean;
  onPress: () => void;
}

/**
 * 初回オンボーディングのサブスク一括選択で使うグリッドカード。
 * 価格は表示せず、タップでボトムシート（別UI）を開いてプラン選択する。
 */
export const OnboardingPresetCard: React.FC<OnboardingPresetCardProps> = ({
  preset,
  width,
  selected,
  onPress,
}) => {
  const logoSource = resolveServiceLogo(preset.logoKey, preset.logoUri);
  const initial = preset.name.charAt(0).toUpperCase();

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityState={selected ? { selected: true } : {}}
      accessibilityLabel={preset.name}
      style={{ width, aspectRatio: 1 }}
      className={`justify-between rounded-2xl border p-3 ${
        selected ? 'border-accent bg-accent/10' : 'border-border bg-card'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="h-12 w-12 overflow-hidden rounded-xl">
          {logoSource ? (
            <Image source={logoSource} className="h-full w-full" contentFit="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-surface">
              <Text className="text-lg font-bold text-foreground">{initial}</Text>
            </View>
          )}
        </View>

        <View
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            selected ? 'border-accent bg-accent' : 'border-border-muted'
          }`}
        >
          {selected ? <MaterialIcons name="check" size={14} color={AppColors.text} /> : null}
        </View>
      </View>

      <View className="gap-0.5">
        <Text className="text-[13px] font-bold text-foreground" numberOfLines={2}>
          {preset.name}
        </Text>
        <Text className="text-[11px] text-subtle" numberOfLines={1}>
          {preset.genre}
        </Text>
      </View>
    </Pressable>
  );
};

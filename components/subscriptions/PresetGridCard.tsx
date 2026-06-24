import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import type { PresetService } from '@/src/domain/preset';

import { resolveServiceLogo } from './serviceLogos';

interface PresetGridCardProps {
  preset: PresetService;
  width: number;
  /** 指定時は選択インジケータを表示（オンボーディングの複数選択用）。 */
  selected?: boolean;
  disabled?: boolean;
  onPress?: (preset: PresetService) => void;
}

/**
 * プリセット選択の3列グリッド用カード。
 * 価格は表示せず、タップでモーダルを開いてプラン選択する。
 */
export const PresetGridCard: React.FC<PresetGridCardProps> = ({
  preset,
  width,
  selected,
  disabled = false,
  onPress,
}) => {
  const logoSource = resolveServiceLogo(preset.logoKey, preset.logoUri);
  const initial = preset.name.charAt(0).toUpperCase();
  const showSelection = selected !== undefined;

  const handlePress = () => {
    if (disabled) {
      return;
    }
    void Haptics.selectionAsync();
    onPress?.(preset);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{
        ...(selected ? { selected: true } : {}),
        ...(disabled ? { disabled: true } : {}),
      }}
      accessibilityLabel={disabled ? `${preset.name}、登録済み` : preset.name}
      style={{ width, aspectRatio: 1 }}
      className={`justify-between rounded-2xl border p-3 ${
        disabled
          ? 'border-border bg-card opacity-50'
          : selected
            ? 'border-accent bg-accent/10'
            : 'border-border bg-card'
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

        {showSelection ? (
          <View
            className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
              selected ? 'border-accent bg-accent' : 'border-border-muted'
            }`}
          >
            {selected ? <MaterialIcons name="check" size={14} color={AppColors.text} /> : null}
          </View>
        ) : null}
      </View>

      <View className="gap-0.5">
        <Text
          className={`text-[13px] font-bold ${disabled ? 'text-subtle' : 'text-foreground'}`}
          numberOfLines={2}
        >
          {preset.name}
        </Text>
        <Text className="text-[11px] text-subtle" numberOfLines={1}>
          {disabled ? '登録済み' : preset.genre}
        </Text>
      </View>
    </Pressable>
  );
};

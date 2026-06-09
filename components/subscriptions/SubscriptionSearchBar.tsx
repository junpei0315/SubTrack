import { Search, XCircle } from 'lucide-react-native';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';

interface SubscriptionSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
  autoFocus?: boolean;
}

export const SubscriptionSearchBar: React.FC<SubscriptionSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'サービス名で検索',
  onClear,
  className,
  autoFocus,
}) => {
  const showClear = value.length > 0;

  return (
    <View
      className={`h-12 flex-row items-center gap-2.5 rounded-xl border-2 border-white/40 bg-background-black px-4${className ? ` ${className}` : ''}`}
    >
      <Search size={20} color={AppColors.whiteMuted50} />
      <TextInput
        className="flex-1 border-0 p-0 text-base text-foreground outline-none"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={AppColors.whiteMuted40}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        autoFocus={autoFocus}
      />
      {showClear ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="検索をクリア"
          hitSlop={8}
          onPress={() => {
            onChangeText('');
            onClear?.();
          }}
        >
          <XCircle size={18} color={AppColors.whiteMuted40} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

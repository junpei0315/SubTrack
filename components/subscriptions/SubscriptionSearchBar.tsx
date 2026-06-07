import { Search, XCircle } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

interface SubscriptionSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: TextInputProps['autoFocus'];
}

export const SubscriptionSearchBar: React.FC<SubscriptionSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'サービス名で検索',
  onClear,
  style,
  autoFocus,
}) => {
  const showClear = value.length > 0;

  return (
    <View style={[styles.container, style]}>
      <Search size={20} color="rgba(255, 255, 255, 0.5)" />
      <TextInput
        style={[styles.input, { outlineStyle: 'none' } as unknown as TextStyle]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
          <XCircle size={18} color="rgba(255, 255, 255, 0.4)" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    padding: 0,
    outlineWidth: 0,
    borderWidth: 0,
  },
});

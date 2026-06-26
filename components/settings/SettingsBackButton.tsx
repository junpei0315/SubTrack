import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { AppColors } from '@/constants/colors';

export function SettingsBackButton() {
  const router = useRouter();

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(tabs)/home');
  };

  return (
    <Pressable
      onPress={handlePress}
      className="-ml-1 flex-row items-center gap-1 self-start py-1"
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="戻る"
    >
      <MaterialIcons name="arrow-back" size={22} color={AppColors.text} />
      <Text className="text-base text-foreground">戻る</Text>
    </Pressable>
  );
}

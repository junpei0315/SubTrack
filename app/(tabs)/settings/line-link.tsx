import { ScrollView } from 'react-native';

import { LineLinkCard } from '@/components/settings/LineLinkCard';
import { SettingsBackButton } from '@/components/settings/SettingsBackButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LineLinkSettingsRoute() {
  return (
    <ScrollView className="flex-1">
      <ThemedView className="flex-1 gap-6 px-4 pb-6 pt-6">
        <SettingsBackButton />
        <ThemedText type="subtitle">LINE 連携</ThemedText>
        <LineLinkCard />
      </ThemedView>
    </ScrollView>
  );
}

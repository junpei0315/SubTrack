import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function SubscriptionsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Subscriptions' }} />
      <Stack.Screen name="new" options={{ title: 'New', presentation: 'modal' }} />
      <Stack.Screen name="[id]/index" options={{ title: 'Detail' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit' }} />
    </Stack>
  );
}

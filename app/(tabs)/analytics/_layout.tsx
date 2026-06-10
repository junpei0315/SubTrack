import { Stack } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function AnalyticsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Analytics' }} />
    </Stack>
  );
}

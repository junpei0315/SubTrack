import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function SubscriptionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.stackContent,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Subscriptions' }} />
      <Stack.Screen
        name="new"
        options={{
          title: 'New',
          presentation: 'modal',
          sheetAllowedDetents: [1],
          sheetGrabberVisible: false,
        }}
      />
      <Stack.Screen name="[id]/index" options={{ title: 'Detail' }} />
      <Stack.Screen name="[id]/edit" options={{ title: 'Edit' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  stackContent: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
});

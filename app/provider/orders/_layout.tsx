import NotificationBell from '@/components/shared/NotificationBell';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { Stack } from 'expo-router';

export default function ProviderOrdersLayout() {
  const session = useAuthStore((s) => s.session);
  const providerId = session?.providerId ?? '';

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Orders',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.gray800,
          headerRight: () => (
            <NotificationBell recipientId={providerId} recipientType="provider" />
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Order Details',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.gray800,
        }}
      />
    </Stack>
  );
}

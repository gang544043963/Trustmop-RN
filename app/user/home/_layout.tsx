import NotificationBell from '@/components/shared/NotificationBell';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { Stack } from 'expo-router';

export default function UserHomeLayout() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.userId ?? '';

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Home',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.gray800,
          headerRight: () => (
            <NotificationBell recipientId={userId} recipientType="user" />
          ),
        }}
      />
      <Stack.Screen name="provider/[id]" options={{ title: 'Provider Details' }} />
    </Stack>
  );
}

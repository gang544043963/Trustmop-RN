import NotificationBell from '@/components/shared/NotificationBell';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { Stack } from 'expo-router';

export default function TaskHallLayout() {
  const session = useAuthStore((s) => s.session);
  const providerId = session?.providerId ?? '';

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Task Hall',
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
          title: 'Task Details',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.gray800,
        }}
      />
    </Stack>
  );
}

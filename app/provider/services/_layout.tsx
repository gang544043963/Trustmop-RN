import { Colors } from '@/constants/theme';
import { Stack } from 'expo-router';

export default function ServicesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Services',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.gray800,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Edit Service',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.gray800,
        }}
      />
    </Stack>
  );
}

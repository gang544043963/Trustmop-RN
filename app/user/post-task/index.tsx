import TaskForm from '@/components/user/TaskForm';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

export default function PostTaskScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const user = useUserStore((s) => s.user);
  const createTask = useOrderStore((s) => s.createTask);

  const handleSubmit = async (data: any) => {
    if (!session?.userId) throw new Error('Not logged in');
    await createTask({ ...data, userId: session.userId });
    Alert.alert('Task Posted!', 'Your task has been posted successfully.', [
      { text: 'OK', onPress: () => router.replace('/user/orders' as any) },
    ]);
  };

  return (
    <View style={styles.container}>
      <TaskForm
        onSubmit={handleSubmit}
        initialAddress={user?.serviceAddress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

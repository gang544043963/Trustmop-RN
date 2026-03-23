import { BorderRadius, Colors, FontSize, Spacing, ProviderTheme } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { tasks, fetchTasks, acceptTask } = useOrderStore();
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (tasks.length === 0) fetchTasks();
  }, []);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ProviderTheme.primary} />
      </View>
    );
  }

  const scheduledDate = new Date(task.scheduledDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleAccept = async () => {
    const providerId = session?.providerId;
    if (!providerId) {
      Alert.alert('Error', 'No provider account found.');
      return;
    }
    setAccepting(true);
    try {
      await acceptTask(task.id, providerId);
      router.replace('/provider/orders' as any);
    } catch (err: any) {
      const msg: string = err?.message ?? '';
      if (msg.includes('pending verification') || msg.includes('not verified')) {
        Alert.alert('Verification Required', 'Account pending verification');
      } else if (msg.includes('not open') || msg.includes('accepted')) {
        Alert.alert('Unavailable', 'Task no longer available');
      } else {
        Alert.alert('Error', msg || 'Failed to accept task.');
      }
    } finally {
      setAccepting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Row label="Service" value={SERVICE_LABELS[task.serviceType] ?? task.serviceType} />
        <Row label="Address" value={task.serviceAddress} />
        <Row label="Date" value={scheduledDate} />
        <Row label="Time Slot" value={task.timeSlot} />
        <Row
          label="Budget"
          value={`₱${task.budgetMin.toLocaleString('en-PH')} – ₱${task.budgetMax.toLocaleString('en-PH')}`}
          highlight
        />
        {task.specialRequirements ? (
          <Row label="Special Requirements" value={task.specialRequirements} />
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.acceptBtn, accepting && styles.btnDisabled]}
        onPress={handleAccept}
        disabled={accepting}
      >
        {accepting ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.acceptBtnText}>Accept Task</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  content: { padding: Spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  rowLabel: { fontSize: FontSize.xs, color: Colors.gray400, marginBottom: 2 },
  rowValue: { fontSize: FontSize.md, color: Colors.gray800 },
  rowValueHighlight: { color: ProviderTheme.primary, fontWeight: '700' },
  acceptBtn: {
    backgroundColor: ProviderTheme.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  acceptBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});

import EmptyState from '@/components/shared/EmptyState';
import OrderCard from '@/components/shared/OrderCard';
import TaskForm from '@/components/user/TaskForm';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { cancelTask, listTasks, updateTask } from '@/data/services/task.service';
import { Task } from '@/data/types';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};
const STATUS_COLORS: Record<string, string> = {
  open: Colors.warning,
  accepted: Colors.success,
  cancelled: Colors.error,
};
const STATUS_LABELS: Record<string, string> = {
  open: 'Waiting for Provider',
  accepted: 'Provider Accepted',
  cancelled: 'Cancelled',
};

function TaskCard({
  task,
  onEdit,
  onCancel,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onCancel: (task: Task) => void;
}) {
  const scheduledDate = new Date(task.scheduledDate).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const color = STATUS_COLORS[task.status] ?? Colors.gray400;
  const canEdit = task.status === 'open';

  return (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskId}>#{task.id.slice(0, 8)}</Text>
        <View style={[styles.taskBadge, { backgroundColor: color + '22' }]}>
          <Text style={[styles.taskBadgeText, { color }]}>{STATUS_LABELS[task.status]}</Text>
        </View>
      </View>
      <Text style={styles.taskService}>{SERVICE_LABELS[task.serviceType] ?? task.serviceType}</Text>
      <Text style={styles.taskDate}>{scheduledDate} · {task.timeSlot}</Text>
      <Text style={styles.taskBudget}>
        Budget: ₱{task.budgetMin.toLocaleString('en-PH')} – ₱{task.budgetMax.toLocaleString('en-PH')}
      </Text>
      {task.specialRequirements ? (
        <Text style={styles.taskNote}>{task.specialRequirements}</Text>
      ) : null}
      {canEdit && (
        <View style={styles.taskActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(task)}>
            <Ionicons name="pencil-outline" size={14} color={Colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(task)}>
            <Ionicons name="trash-outline" size={14} color={Colors.error} />
            <Text style={styles.cancelBtnText}>Cancel Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

type ListItem =
  | { kind: 'section'; label: string }
  | { kind: 'task'; data: Task }
  | { kind: 'order'; data: import('@/data/types').Order };

export default function UserOrdersScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { orders, fetchOrders } = useOrderStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    if (!session?.userId) return;
    await fetchOrders(session.userId, 'user');
    const userTasks = await listTasks({ userId: session.userId });
    setTasks(userTasks);
    setRefreshing(false);
  }, [session?.userId, fetchOrders]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleEdit = (task: Task) => setEditingTask(task);

  const handleEditSubmit = async (data: any) => {
    if (!editingTask) return;
    await updateTask(editingTask.id, {
      serviceType: data.serviceType,
      serviceAddress: data.serviceAddress,
      scheduledDate: data.scheduledDate,
      timeSlot: data.timeSlot,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      specialRequirements: data.specialRequirements,
    });
    setEditingTask(null);
    await load();
  };

  const handleCancel = (task: Task) => {
    Alert.alert(
      'Cancel Task',
      'Are you sure you want to cancel this task?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await cancelTask(task.id);
            await load();
          },
        },
      ]
    );
  };

  const items: ListItem[] = [];
  if (orders.length > 0) {
    items.push({ kind: 'section', label: 'Orders' });
    orders.forEach((o) => items.push({ kind: 'order', data: o }));
  }
  if (tasks.length > 0) {
    items.push({ kind: 'section', label: 'Posted Tasks' });
    tasks.forEach((t) => items.push({ kind: 'task', data: t }));
  }

  const isEmpty = orders.length === 0 && tasks.length === 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item, i) =>
          item.kind === 'section' ? `section-${i}` : item.data.id
        }
        renderItem={({ item }) => {
          if (item.kind === 'section') {
            return <Text style={styles.sectionHeader}>{item.label}</Text>;
          }
          if (item.kind === 'order') {
            return (
              <OrderCard
                order={item.data}
                onPress={() => router.push(`/user/orders/${item.data.id}` as any)}
              />
            );
          }
          return (
            <TaskCard
              task={item.data}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          );
        }}
        contentContainerStyle={[styles.list, isEmpty && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No activity yet"
            subtitle="Post a task to get started"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Edit Task Modal */}
      <Modal
        visible={!!editingTask}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditingTask(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TouchableOpacity onPress={() => setEditingTask(null)}>
              <Ionicons name="close" size={24} color={Colors.gray700} />
            </TouchableOpacity>
          </View>
          {editingTask && (
            <TaskForm
              onSubmit={handleEditSubmit}
              initialAddress={editingTask.serviceAddress}
              initialValues={editingTask}
              submitLabel="Save Changes"
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  list: { padding: Spacing.md },
  listEmpty: { flex: 1 },
  sectionHeader: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  taskId: { fontSize: FontSize.sm, color: Colors.gray500, fontWeight: '500' },
  taskBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  taskBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  taskService: { fontSize: FontSize.md, fontWeight: '600', color: Colors.gray800, marginBottom: 2 },
  taskDate: { fontSize: FontSize.sm, color: Colors.gray500, marginBottom: 2 },
  taskBudget: { fontSize: FontSize.sm, color: Colors.gray600 },
  taskNote: { fontSize: FontSize.sm, color: Colors.gray400, marginTop: 4, fontStyle: 'italic' },
  taskActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editBtnText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '600' },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelBtnText: { fontSize: FontSize.sm, color: Colors.error, fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.gray800 },
});

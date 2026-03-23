import { BorderRadius, Colors, FontSize, Spacing, ProviderTheme } from '@/constants/theme';
import { Task } from '@/data/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) {
    const mins = Math.floor(diff / (1000 * 60));
    return `${mins}m ago`;
  }
  if (hours < 24) return `${hours}h ago`;
  return new Date(isoDate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

function formatBudget(min: number, max: number): string {
  const fmt = (n: number) => '₱' + n.toLocaleString('en-PH');
  return `${fmt(min)} – ${fmt(max)}`;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const isDeep = task.serviceType === 'deep_cleaning';
  const scheduledDate = new Date(task.scheduledDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.header}>
        <View style={[styles.badge, isDeep ? styles.badgeDeep : styles.badgeRegular]}>
          <Text style={styles.badgeText}>{SERVICE_LABELS[task.serviceType]}</Text>
        </View>
        <Text style={styles.postedTime}>{formatRelativeTime(task.createdAt)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.address} numberOfLines={2}>{task.serviceAddress}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.dateText}>{scheduledDate}</Text>
        <Text style={styles.separator}>·</Text>
        <Text style={styles.dateText}>{task.timeSlot}</Text>
      </View>

      <Text style={styles.budget}>{formatBudget(task.budgetMin, task.budgetMax)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeRegular: { backgroundColor: Colors.successLight },
  badgeDeep: { backgroundColor: ProviderTheme.primaryLight },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.gray800 },
  postedTime: { fontSize: FontSize.xs, color: Colors.gray400 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  icon: { fontSize: FontSize.sm },
  address: { fontSize: FontSize.sm, color: Colors.gray700, flex: 1 },
  dateText: { fontSize: FontSize.sm, color: Colors.gray500 },
  separator: { fontSize: FontSize.sm, color: Colors.gray400 },
  budget: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: ProviderTheme.primary,
    marginTop: Spacing.xs,
  },
});

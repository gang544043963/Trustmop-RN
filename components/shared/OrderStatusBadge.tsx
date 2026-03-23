import { BorderRadius, FontSize, Spacing } from '@/constants/theme';
import { OrderStatus } from '@/data/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

const STATUS_CONFIG: Record<OrderStatus, { color: string; label: string }> = {
  accepted: { color: '#2563EB', label: 'Accepted' },
  in_progress: { color: '#F59E0B', label: 'In Progress' },
  pending_confirmation: { color: '#D97706', label: 'Pending Confirmation' },
  completed: { color: '#16A34A', label: 'Completed' },
  cancelled: { color: '#6B7280', label: 'Cancelled' },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { color, label } = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});

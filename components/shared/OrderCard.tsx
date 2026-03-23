import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { Order } from '@/data/types';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
}

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};

function formatPrice(amount: number): string {
  return '₱' + amount.toLocaleString('en-PH');
}

export default function OrderCard({ order, onPress }: OrderCardProps) {
  const shortId = order.id.slice(0, 8);
  const serviceLabel = SERVICE_LABELS[order.serviceType] ?? order.serviceType;
  const scheduledDate = new Date(order.scheduledDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.orderId}>#{shortId}</Text>
        <Text style={styles.price}>{formatPrice(order.agreedPrice)}</Text>
      </View>
      <Text style={styles.serviceType}>{serviceLabel}</Text>
      <Text style={styles.date}>{scheduledDate}</Text>
      <View style={styles.badgeRow}>
        <OrderStatusBadge status={order.status} />
      </View>
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
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  orderId: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    fontWeight: '500',
  },
  price: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '700',
  },
  serviceType: {
    fontSize: FontSize.md,
    color: Colors.gray800,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  date: {
    fontSize: FontSize.sm,
    color: Colors.gray500,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
  },
});

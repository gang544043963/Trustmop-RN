import MockPayButton from '@/components/shared/MockPayButton';
import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import ReviewForm from '@/components/user/ReviewForm';
import { Colors, FontSize, Spacing, UserTheme } from '@/constants/theme';
import { listReviews } from '@/data/services/review.service';
import { Review } from '@/data/types';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_LABELS: Record<string, string> = {
  accepted: 'Accepted',
  in_progress: 'In Progress',
  pending_confirmation: 'Pending Confirmation',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};

export default function UserOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((s) => s.session);
  const { orders, fetchOrders, confirmCompletion } = useOrderStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const order = orders.find((o) => o.id === id);

  const load = useCallback(async () => {
    if (!session?.userId) return;
    await fetchOrders(session.userId, 'user');
    if (order) {
      const r = await listReviews(order.providerId);
      setReviews(r);
    }
    setRefreshing(false);
  }, [session?.userId, fetchOrders, order?.providerId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleConfirm = async () => {
    if (!id) return;
    setConfirming(true);
    try {
      await confirmCompletion(id);
    } finally {
      setConfirming(false);
    }
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={UserTheme.primary} />
      </View>
    );
  }

  const hasReview = reviews.some((r) => r.orderId === order.id);
  const scheduledDate = new Date(order.scheduledDate).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Order summary */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Service</Text>
          <Text style={styles.fieldValue}>{SERVICE_LABELS[order.serviceType]}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Address</Text>
          <Text style={styles.fieldValue}>{order.serviceAddress}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Date</Text>
          <Text style={styles.fieldValue}>{scheduledDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Time</Text>
          <Text style={styles.fieldValue}>{order.timeSlot}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Price</Text>
          <Text style={[styles.fieldValue, styles.price]}>
            ₱{order.agreedPrice.toLocaleString('en-PH')}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.fieldLabel}>Status</Text>
          <OrderStatusBadge status={order.status} />
        </View>
        {order.providerId ? (
          <View style={styles.row}>
            <Text style={styles.fieldLabel}>Provider ID</Text>
            <Text style={styles.fieldValue}>{order.providerId.slice(0, 12)}…</Text>
          </View>
        ) : null}
      </View>

      {/* Status history */}
      <Text style={styles.sectionTitle}>Status History</Text>
      <View style={styles.card}>
        {order.statusHistory.map((entry, i) => (
          <View key={i} style={styles.historyEntry}>
            <View style={styles.historyDot} />
            <View style={styles.historyInfo}>
              <Text style={styles.historyStatus}>{STATUS_LABELS[entry.status] ?? entry.status}</Text>
              <Text style={styles.historyTime}>
                {new Date(entry.timestamp).toLocaleString('en-PH')}
              </Text>
              {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {/* Confirm completion */}
      {order.status === 'pending_confirmation' && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={[styles.confirmBtn, confirming && styles.btnDisabled]}
            onPress={handleConfirm}
            disabled={confirming}
          >
            {confirming ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Completion</Text>
            )}
          </TouchableOpacity>
          <MockPayButton orderId={order.id} onSuccess={load} />
        </View>
      )}

      {/* Review form */}
      {order.status === 'completed' && !hasReview && session?.userId && (
        <View style={styles.actionSection}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          <ReviewForm
            orderId={order.id}
            providerId={order.providerId}
            userId={session.userId}
            onSubmit={load}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  content: { padding: Spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.gray500 },
  fieldValue: { fontSize: FontSize.sm, color: Colors.gray800, fontWeight: '500', flex: 1, textAlign: 'right' },
  price: { color: UserTheme.primary, fontWeight: '700' },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.gray800,
    marginBottom: Spacing.sm,
  },
  historyEntry: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: UserTheme.primary,
    marginTop: 4,
    marginRight: Spacing.sm,
  },
  historyInfo: { flex: 1 },
  historyStatus: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray800 },
  historyTime: { fontSize: FontSize.xs, color: Colors.gray400 },
  historyNote: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  actionSection: { gap: Spacing.sm, marginBottom: Spacing.md },
  confirmBtn: {
    backgroundColor: Colors.success,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  confirmBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});

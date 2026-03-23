import OrderStatusBadge from '@/components/shared/OrderStatusBadge';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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

export default function ProviderOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { orders, fetchOrders, updateOrderStatus, addPhotos } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const providerId = session?.providerId ?? '';
  const order = orders.find((o) => o.id === id);

  const load = useCallback(async () => {
    if (!providerId) return;
    await fetchOrders(providerId, 'provider');
    setRefreshing(false);
  }, [providerId, fetchOrders]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleStartService = async () => {
    if (!id) return;
    setLoading(true);
    try {
      await updateOrderStatus(id, 'in_progress');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to start service.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteService = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uris = result.assets.map((a) => a.uri);
        await addPhotos(id, uris);
      }
      await updateOrderStatus(id, 'pending_confirmation');
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to complete service.');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  const scheduledDate = new Date(order.scheduledDate).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Order details */}
      <View style={styles.card}>
        <Row label="Service" value={SERVICE_LABELS[order.serviceType] ?? order.serviceType} />
        <Row label="Address" value={order.serviceAddress} />
        <Row label="Date" value={scheduledDate} />
        <Row label="Time" value={order.timeSlot} />
        <Row
          label="Agreed Price"
          value={`₱${order.agreedPrice.toLocaleString('en-PH')}`}
          highlight
        />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Status</Text>
          <OrderStatusBadge status={order.status} />
        </View>
        <Row label="User ID" value={order.userId.slice(0, 12) + '…'} />
      </View>

      {/* Status history */}
      <Text style={styles.sectionTitle}>Status History</Text>
      <View style={styles.card}>
        {order.statusHistory.map((entry, i) => (
          <View key={i} style={styles.historyEntry}>
            <View style={styles.historyDot} />
            <View style={styles.historyInfo}>
              <Text style={styles.historyStatus}>
                {STATUS_LABELS[entry.status] ?? entry.status}
              </Text>
              <Text style={styles.historyTime}>
                {new Date(entry.timestamp).toLocaleString('en-PH')}
              </Text>
              {entry.note ? <Text style={styles.historyNote}>{entry.note}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      {/* Actions */}
      {order.status === 'accepted' && (
        <TouchableOpacity
          style={[styles.actionBtn, styles.startBtn, loading && styles.btnDisabled]}
          onPress={handleStartService}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.actionBtnText}>Start Service</Text>
          )}
        </TouchableOpacity>
      )}

      {order.status === 'in_progress' && (
        <TouchableOpacity
          style={[styles.actionBtn, styles.completeBtn, loading && styles.btnDisabled]}
          onPress={handleCompleteService}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.actionBtnText}>Complete Service</Text>
          )}
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  rowLabel: { fontSize: FontSize.sm, color: Colors.gray500 },
  rowValue: { fontSize: FontSize.sm, color: Colors.gray800, fontWeight: '500', flex: 1, textAlign: 'right' },
  rowValueHighlight: { color: Colors.primary, fontWeight: '700' },
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
    backgroundColor: Colors.primary,
    marginTop: 4,
    marginRight: Spacing.sm,
  },
  historyInfo: { flex: 1 },
  historyStatus: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.gray800 },
  historyTime: { fontSize: FontSize.xs, color: Colors.gray400 },
  historyNote: { fontSize: FontSize.xs, color: Colors.gray500, marginTop: 2 },
  actionBtn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  startBtn: { backgroundColor: Colors.primary },
  completeBtn: { backgroundColor: Colors.success },
  btnDisabled: { opacity: 0.7 },
  actionBtnText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '700' },
});

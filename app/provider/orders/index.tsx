import EmptyState from '@/components/shared/EmptyState';
import OrderCard from '@/components/shared/OrderCard';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function ProviderOrdersScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { orders, fetchOrders } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  const providerId = session?.providerId ?? '';

  const load = useCallback(async () => {
    if (!providerId) return;
    await fetchOrders(providerId, 'provider');
    setRefreshing(false);
  }, [providerId, fetchOrders]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => router.push(`/provider/orders/${item.id}` as any)}
          />
        )}
        contentContainerStyle={[styles.list, orders.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No orders yet"
            subtitle="Accept tasks to start receiving orders"
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  list: { padding: 16 },
  listEmpty: { flex: 1 },
});

import EmptyState from '@/components/shared/EmptyState';
import { BorderRadius, Colors, FontSize, Spacing } from '@/constants/theme';
import { Service } from '@/data/types';
import { useAuthStore } from '@/stores/auth.store';
import { useProviderStore } from '@/stores/provider.store';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};

const UNIT_LABELS: Record<string, string> = {
  per_hour: '/ hr',
  per_session: '/ session',
};

export default function ProviderServicesScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { services, fetchServices, updateService } = useProviderStore();
  const [refreshing, setRefreshing] = useState(false);

  const providerId = session?.providerId ?? '';

  const load = useCallback(async () => {
    if (!providerId) return;
    await fetchServices(providerId);
    setRefreshing(false);
  }, [providerId, fetchServices]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleToggleActive = async (service: Service) => {
    await updateService(service.id, { isActive: !service.isActive });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/provider/services/edit/${item.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.serviceType}>{SERVICE_LABELS[item.serviceType]}</Text>
        <Switch
          value={item.isActive}
          onValueChange={() => handleToggleActive(item)}
          trackColor={{ true: Colors.primary, false: Colors.gray300 }}
          thumbColor={Colors.white}
        />
      </View>
      <Text style={styles.price}>
        ₱{item.price.toLocaleString('en-PH')}{UNIT_LABELS[item.pricingUnit]}
      </Text>
      <Text style={styles.areas} numberOfLines={1}>
        📍 {item.coverageAreas.join(', ')}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, services.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="construct-outline"
            title="No services yet"
            subtitle="Add your first service to start accepting tasks"
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/provider/services/edit/new' as any)}
      >
        <Text style={styles.fabText}>+ Add Service</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  list: { padding: Spacing.md, paddingBottom: 80 },
  listEmpty: { flex: 1 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  serviceType: { fontSize: FontSize.md, fontWeight: '700', color: Colors.gray800 },
  price: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600', marginBottom: Spacing.xs },
  areas: { fontSize: FontSize.sm, color: Colors.gray500 },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.md },
});

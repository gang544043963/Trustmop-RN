import EmptyState from '@/components/shared/EmptyState';
import ServiceCard from '@/components/user/ServiceCard';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { ServiceWithProvider, listServices } from '@/data/services/service.service';
import { ServiceType } from '@/data/types';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Filter = 'all' | ServiceType;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Regular Cleaning', value: 'regular_cleaning' },
  { label: 'Deep Cleaning', value: 'deep_cleaning' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listServices(
        filter !== 'all' ? { serviceType: filter } : undefined
      );
      setServices(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBarWrapper}
        contentContainerStyle={styles.filterBar}
      >
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            style={[styles.chip, filter === f.value && styles.chipActive]}
            onPress={() => setFilter(f.value)}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            onPress={() =>
              router.push(
                `/user/home/provider/${item.provider.id}?serviceId=${item.id}` as any
              )
            }
          />
        )}
        contentContainerStyle={[
          styles.list,
          services.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="sparkles-outline"
            title="No services found"
            subtitle="Try a different filter or check back later"
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterBarWrapper: {
    flexGrow: 0,
  },
  filterBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.gray600,
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  list: { padding: Spacing.md },
  listEmpty: { flex: 1 },
});

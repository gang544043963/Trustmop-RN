import EmptyState from '@/components/shared/EmptyState';
import ServiceCard from '@/components/user/ServiceCard';
import { BorderRadius, Colors, FontSize, Spacing, UserTheme } from '@/constants/theme';
import { ServiceWithProvider, listServices } from '@/data/services/service.service';
import { ServiceType } from '@/data/types';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationStore } from '@/stores/notification.store';
import { Ionicons } from '@expo/vector-icons';
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
  const session = useAuthStore((s) => s.session);
  const { notifications, unreadCount, fetchNotifications, markAllRead } = useNotificationStore();
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (session?.userId) fetchNotifications(session.userId, 'user');
  }, [session?.userId]);

  const unreadNotifications = notifications.filter((n) => !n.isRead).slice(0, 3);

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
        <ActivityIndicator color={UserTheme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Notification banner */}
      {unreadNotifications.length > 0 && (
        <View style={styles.notifBox}>
          <View style={styles.notifHeader}>
            <Ionicons name="notifications" size={16} color={UserTheme.primary} />
            <Text style={styles.notifTitle}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Text>
            <Pressable onPress={() => session?.userId && markAllRead(session.userId)}>
              <Text style={styles.notifDismiss}>Dismiss all</Text>
            </Pressable>
          </View>
          {unreadNotifications.map((n) => (
            <View key={n.id} style={styles.notifItem}>
              <View style={styles.notifDot} />
              <Text style={styles.notifText} numberOfLines={1}>{n.title} — {n.body}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.listSection}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterBarWrapper: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
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
    backgroundColor: UserTheme.primary,
    borderColor: UserTheme.primary,
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
  listSection: { flex: 1 },
  notifBox: {
    margin: Spacing.md,
    marginBottom: 0,
    backgroundColor: UserTheme.primaryLight,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: UserTheme.primary,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  notifTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: UserTheme.primaryDark,
  },
  notifDismiss: {
    fontSize: FontSize.xs,
    color: UserTheme.primary,
    fontWeight: '600',
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: 2,
  },
  notifDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: UserTheme.primary,
  },
  notifText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.gray700,
  },
});

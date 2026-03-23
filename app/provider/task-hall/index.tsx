import TaskCard from '@/components/provider/TaskCard';
import EmptyState from '@/components/shared/EmptyState';
import { Colors, FontSize, Spacing } from '@/constants/theme';
import { ServiceType } from '@/data/types';
import { useOrderStore } from '@/stores/order.store';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

type Filter = 'all' | ServiceType;

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Regular', value: 'regular_cleaning' },
  { label: 'Deep', value: 'deep_cleaning' },
];

export default function TaskHallScreen() {
  const router = useRouter();
  const { tasks, fetchTasks } = useOrderStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [area, setArea] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    await fetchTasks({
      serviceType: filter !== 'all' ? filter : undefined,
      area: area.trim() || undefined,
    });
    setRefreshing(false);
  }, [filter, area, fetchTasks]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  return (
    <View style={styles.container}>
      {/* Filter bar */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
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
        <TextInput
          style={styles.areaInput}
          placeholder="Filter by area..."
          placeholderTextColor={Colors.gray400}
          value={area}
          onChangeText={setArea}
          onSubmitEditing={load}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => router.push(`/provider/task-hall/${item.id}` as any)}
          />
        )}
        contentContainerStyle={[styles.list, tasks.length === 0 && styles.listEmpty]}
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-outline"
            title="No open tasks"
            subtitle="Check back later for new tasks"
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  filterSection: {
    backgroundColor: Colors.white,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  chips: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.gray600 },
  chipTextActive: { color: Colors.white, fontWeight: '600' },
  areaInput: {
    marginHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.sm,
    color: Colors.gray800,
    backgroundColor: Colors.gray50,
  },
  list: { padding: Spacing.md },
  listEmpty: { flex: 1 },
});

import { Colors, FontSize, Spacing } from '@/constants/theme';
import { getProvider } from '@/data/services/provider.service';
import { listReviews } from '@/data/services/review.service';
import { ServiceWithProvider, listServices } from '@/data/services/service.service';
import { Provider, Review } from '@/data/types';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <Text style={{ fontSize: FontSize.md, color: Colors.accent }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
      <Text style={{ color: Colors.gray500 }}> {rating.toFixed(1)}</Text>
    </Text>
  );
}

const SERVICE_LABELS: Record<string, string> = {
  regular_cleaning: 'Regular Cleaning',
  deep_cleaning: 'Deep Cleaning',
};

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [p, s, r] = await Promise.all([
      getProvider(id),
      listServices({ providerId: id }),
      listReviews(id),
    ]);
    setProvider(p);
    setServices(s);
    setReviews(r);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Provider not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Provider header */}
      <View style={styles.providerHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {provider.displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.providerName}>{provider.displayName}</Text>
        <Stars rating={provider.averageRating} />
        <Text style={styles.reviewCount}>{provider.totalReviews} reviews</Text>
      </View>

      {/* Services */}
      <Text style={styles.sectionTitle}>Services</Text>
      {services.length === 0 ? (
        <Text style={styles.emptyText}>No services listed.</Text>
      ) : (
        services.map((s) => (
          <View key={s.id} style={styles.serviceCard}>
            <View style={styles.serviceRow}>
              <Text style={styles.serviceType}>{SERVICE_LABELS[s.serviceType]}</Text>
              <Text style={styles.servicePrice}>
                ₱{s.price.toLocaleString('en-PH')}/{s.pricingUnit === 'per_hour' ? 'hr' : 'session'}
              </Text>
            </View>
            {s.description ? (
              <Text style={styles.serviceDesc}>{s.description}</Text>
            ) : null}
            <Text style={styles.coverageAreas}>
              {s.coverageAreas.join(', ')}
            </Text>
          </View>
        ))
      )}

      {/* Reviews */}
      <Text style={styles.sectionTitle}>Reviews</Text>
      {reviews.length === 0 ? (
        <Text style={styles.emptyText}>No reviews yet.</Text>
      ) : (
        reviews.map((r) => (
          <View key={r.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</Text>
              <Text style={styles.reviewDate}>
                {new Date(r.createdAt).toLocaleDateString('en-PH', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </Text>
            </View>
            {r.comment ? <Text style={styles.reviewComment}>{r.comment}</Text> : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  content: { padding: Spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.error, fontSize: FontSize.md },
  providerHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.xl },
  providerName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  reviewCount: { fontSize: FontSize.sm, color: Colors.gray400, marginTop: 2 },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.gray800,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  emptyText: { fontSize: FontSize.sm, color: Colors.gray400, marginBottom: Spacing.md },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  serviceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  serviceType: { fontSize: FontSize.md, fontWeight: '600', color: Colors.gray800 },
  servicePrice: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  serviceDesc: { fontSize: FontSize.sm, color: Colors.gray500, marginBottom: 4 },
  coverageAreas: { fontSize: FontSize.sm, color: Colors.gray400 },
  reviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewStars: { fontSize: FontSize.sm, color: Colors.accent },
  reviewDate: { fontSize: FontSize.xs, color: Colors.gray400 },
  reviewComment: { fontSize: FontSize.sm, color: Colors.gray600 },
});

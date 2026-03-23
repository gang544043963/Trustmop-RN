import { BorderRadius, Colors, FontSize, Spacing, UserTheme } from '@/constants/theme';
import { ServiceWithProvider } from '@/data/services/service.service';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ServiceCardProps {
  service: ServiceWithProvider;
  onPress: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatPrice(price: number, unit: string): string {
  const formatted = '₱' + price.toLocaleString('en-PH');
  return unit === 'per_hour' ? `${formatted}/hr` : `${formatted}/session`;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { provider } = service;
  const isDeep = service.serviceType === 'deep_cleaning';
  const areas = service.coverageAreas.join(', ');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(provider.displayName)}</Text>
        </View>
        <View style={styles.providerInfo}>
          <Text style={styles.providerName} numberOfLines={1}>
            {provider.displayName}
          </Text>
          <View style={[styles.badge, isDeep ? styles.badgeDeep : styles.badgeRegular]}>
            <Text style={styles.badgeText}>
              {isDeep ? 'Deep Cleaning' : 'Regular Cleaning'}
            </Text>
          </View>
        </View>
        <Text style={styles.price}>
          {formatPrice(service.price, service.pricingUnit)}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color={Colors.accent} />
          <Text style={styles.rating}>{provider.averageRating.toFixed(1)}</Text>
        </View>
        <Text style={styles.areas} numberOfLines={1}>
          {areas}
        </Text>
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
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: UserTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  providerInfo: { flex: 1 },
  providerName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.gray800,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeRegular: { backgroundColor: Colors.successLight },
  badgeDeep: { backgroundColor: UserTheme.primaryLight },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.gray700 },
  price: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: UserTheme.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: { fontSize: FontSize.sm, color: Colors.gray600 },
  areas: { flex: 1, fontSize: FontSize.sm, color: Colors.gray400 },
});

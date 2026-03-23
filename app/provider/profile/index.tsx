import { BorderRadius, Colors, FontSize, Spacing, ProviderTheme } from '@/constants/theme';
import { getProviderByPhone } from '@/data/services/provider.service';
import { getUserByPhone } from '@/data/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { useProviderStore } from '@/stores/provider.store';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const STATUS_COLORS: Record<string, string> = {
  pending_review: Colors.warning,
  verified: Colors.success,
  rejected: Colors.error,
  banned: Colors.error,
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending Review',
  verified: 'Verified',
  rejected: 'Rejected',
  banned: 'Banned',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={[styles.star, i <= Math.round(rating) && styles.starFilled]}>
          ★
        </Text>
      ))}
      <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function ProviderProfileScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);
  const switchIdentity = useAuthStore((s) => s.switchIdentity);
  const { provider, fetchProvider } = useProviderStore();
  const { orders, fetchOrders } = useOrderStore();

  const providerId = session?.providerId ?? '';
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setNotFound(false);
    setLoading(true);
    if (providerId) {
      Promise.all([fetchProvider(providerId), fetchOrders(providerId, 'provider')])
        .then(() => {
          // fetchProvider sets provider to null if not found
        })
        .finally(() => setLoading(false));
    } else if (session?.phone) {
      getProviderByPhone(session.phone).then((p) => {
        if (p) {
          setSession({ ...session, providerId: p.id });
          return Promise.all([fetchProvider(p.id), fetchOrders(p.id, 'provider')]);
        } else {
          setNotFound(true);
        }
      }).finally(() => setLoading(false));
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [session?.providerId, session?.phone]);

  const earnings = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === 'released')
      .reduce((sum, o) => sum + o.agreedPrice * (1 - o.platformFeeRate), 0);
  }, [orders]);

  const handleSwitchToUser = async () => {
    if (!session?.phone) return;
    const user = await getUserByPhone(session.phone);
    if (!user) {
      const phone = session.phone.replace('+63', '');
      router.push(`/auth/profile-setup?role=user&phone=${phone}` as any);
      return;
    }
    switchIdentity('user');
    setSession({ ...session, userId: user.id, activeIdentity: 'user' });
    router.replace('/user/home' as any);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/welcome' as any);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={ProviderTheme.primary} />
      </View>
    );
  }

  if (notFound || !provider) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.gray500, fontSize: 16, textAlign: 'center', paddingHorizontal: 32 }}>
          No provider account found for this phone number.
        </Text>
        <Pressable
          style={[styles.btn, styles.switchBtn, { marginTop: 24, paddingHorizontal: 24 }]}
          onPress={() => {
            if (!session?.phone) return;
            const phone = session.phone.replace('+63', '');
            router.push(`/auth/profile-setup?role=provider&phone=${phone}` as any);
          }}
        >
          <Text style={styles.btnText}>Register as Provider</Text>
        </Pressable>
      </View>
    );
  }

  const statusColor = STATUS_COLORS[provider.status] ?? Colors.gray400;
  const statusLabel = STATUS_LABELS[provider.status] ?? provider.status;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {provider.displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <Text style={styles.displayName}>{provider.displayName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
        </View>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>{provider.phone}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Rating</Text>
          <StarRating rating={provider.averageRating} />
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Reviews</Text>
          <Text style={styles.fieldValue}>{provider.totalReviews}</Text>
        </View>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Earnings</Text>
          <Text style={[styles.fieldValue, styles.earnings]}>
            ₱{earnings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      <Pressable style={[styles.btn, styles.switchBtn]} onPress={handleSwitchToUser}>
        <Text style={styles.btnText}>Switch to User</Text>
      </Pressable>

      <Pressable style={[styles.btn, styles.logoutBtn]} onPress={handleLogout}>
        <Text style={[styles.btnText, styles.logoutBtnText]}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  content: { padding: Spacing.md },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center', marginBottom: Spacing.lg },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ProviderTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.xxl },
  displayName: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.gray800, marginBottom: Spacing.xs },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: { fontSize: FontSize.sm, fontWeight: '700' },
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
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.gray500 },
  fieldValue: { fontSize: FontSize.sm, color: Colors.gray800, fontWeight: '500' },
  earnings: { color: Colors.success, fontWeight: '700', fontSize: FontSize.md },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { fontSize: FontSize.md, color: Colors.gray300 },
  starFilled: { color: Colors.accent },
  ratingText: { fontSize: FontSize.sm, color: Colors.gray600, marginLeft: 4 },
  btn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
  switchBtn: { backgroundColor: Colors.gray700 },
  logoutBtn: { backgroundColor: Colors.errorLight },
  logoutBtnText: { color: Colors.error },
});

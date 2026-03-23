import { BorderRadius, Colors, FontSize, Spacing, UserTheme } from '@/constants/theme';
import { getProviderByPhone } from '@/data/services/provider.service';
import { getUserByPhone } from '@/data/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { useUserStore } from '@/stores/user.store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function UserProfileScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const setSession = useAuthStore((s) => s.setSession);
  const logout = useAuthStore((s) => s.logout);
  const switchIdentity = useAuthStore((s) => s.switchIdentity);
  const { user, fetchUser, updateProfile } = useUserStore();

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.userId) {
      fetchUser(session.userId);
    } else if (session?.phone) {
      // Fallback: look up by phone and patch session
      getUserByPhone(session.phone).then((u) => {
        if (u) {
          setSession({ ...session, userId: u.id });
          fetchUser(u.id);
        }
      });
    }
  }, [session?.userId, session?.phone]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName);
      setServiceAddress(user.serviceAddress);
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ displayName: displayName.trim(), serviceAddress: serviceAddress.trim() });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSwitchToProvider = async () => {
    if (!session?.phone) return;
    const provider = await getProviderByPhone(session.phone);
    if (!provider) {
      // No provider account — go register one
      const phone = session.phone.replace('+63', '');
      router.push(`/auth/profile-setup?role=provider&phone=${phone}` as any);
      return;
    }
    switchIdentity('provider');
    setSession({ ...session, providerId: provider.id, activeIdentity: 'provider' });
    router.replace('/provider/task-hall' as any);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/welcome' as any);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={UserTheme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Display Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor={Colors.gray400}
            />
          ) : (
            <Text style={styles.fieldValue}>{user.displayName}</Text>
          )}
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>{user.phone}</Text>
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Service Address</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={serviceAddress}
              onChangeText={setServiceAddress}
              placeholder="Your address"
              placeholderTextColor={Colors.gray400}
            />
          ) : (
            <Text style={styles.fieldValue}>{user.serviceAddress}</Text>
          )}
        </View>
      </View>

      {editing ? (
        <View style={styles.editActions}>
          <Pressable
            style={[styles.btn, styles.saveBtn, saving && styles.btnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.btnText}>Save</Text>
            )}
          </Pressable>
          <Pressable style={[styles.btn, styles.cancelBtn]} onPress={() => setEditing(false)}>
            <Text style={[styles.btnText, styles.cancelBtnText]}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={[styles.btn, styles.editBtn]} onPress={() => setEditing(true)}>
          <Text style={styles.btnText}>Edit Profile</Text>
        </Pressable>
      )}

      <Pressable style={[styles.btn, styles.switchBtn]} onPress={handleSwitchToProvider}>
        <Text style={styles.btnText}>Switch to Provider</Text>
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
    backgroundColor: UserTheme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.xxl },
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.gray400, marginBottom: 2 },
  fieldValue: { fontSize: FontSize.md, color: Colors.gray800 },
  input: {
    fontSize: FontSize.md,
    color: Colors.gray800,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginTop: 2,
  },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  btn: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
  editBtn: { backgroundColor: UserTheme.primary },
  saveBtn: { flex: 1, backgroundColor: UserTheme.primary },
  cancelBtn: { flex: 1, backgroundColor: Colors.gray200 },
  cancelBtnText: { color: Colors.gray700 },
  switchBtn: { backgroundColor: Colors.gray700 },
  logoutBtn: { backgroundColor: Colors.errorLight },
  logoutBtnText: { color: Colors.error },
  btnDisabled: { opacity: 0.7 },
});

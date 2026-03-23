import { Colors, FontSize, Spacing, BorderRadius } from '@/constants/theme';
import { IdentityType } from '@/data/types';
import { useNotificationStore } from '@/stores/notification.store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NotificationBellProps {
  recipientId: string;
  recipientType: IdentityType;
}

export default function NotificationBell({ recipientId, recipientType }: NotificationBellProps) {
  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotificationStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchNotifications(recipientId, recipientType);
  }, [recipientId, recipientType]);

  const handleOpen = () => {
    setVisible(true);
    if (unreadCount > 0) markAllRead(recipientId);
  };

  return (
    <>
      <Pressable style={styles.container} onPress={handleOpen}>
        <Ionicons name="notifications-outline" size={24} color={Colors.gray700} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.gray700} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={notifications.length === 0 && styles.emptyContainer}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={40} color={Colors.gray300} />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={[styles.item, !item.isRead && styles.itemUnread]}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemBody}>{item.body}</Text>
                <Text style={styles.itemTime}>
                  {new Date(item.createdAt).toLocaleString('en-PH', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </Text>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: 4, right: 4,
    minWidth: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.error,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: FontSize.xs - 2, color: Colors.white, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  title: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.gray800 },
  item: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  itemUnread: { backgroundColor: Colors.primaryLight + '18' },
  itemTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.gray800, marginBottom: 2 },
  itemBody: { fontSize: FontSize.sm, color: Colors.gray600, marginBottom: 4 },
  itemTime: { fontSize: FontSize.xs, color: Colors.gray400 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, paddingTop: 80 },
  emptyText: { fontSize: FontSize.md, color: Colors.gray400 },
});

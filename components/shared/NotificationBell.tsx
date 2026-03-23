import { Colors, FontSize } from '@/constants/theme';
import { IdentityType } from '@/data/types';
import { useNotificationStore } from '@/stores/notification.store';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface NotificationBellProps {
  recipientId: string;
  recipientType: IdentityType;
}

export default function NotificationBell({ recipientId, recipientType }: NotificationBellProps) {
  const { unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(recipientId, recipientType);
  }, [recipientId, recipientType]);

  return (
    <Pressable style={styles.container}>
      <Ionicons name="notifications-outline" size={24} color={Colors.gray700} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: FontSize.xs - 2,
    color: Colors.white,
    fontWeight: '700',
  },
});

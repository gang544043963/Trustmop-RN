import { create } from 'zustand';
import { listNotifications, markAllRead } from '../data/services/notification.service';
import { IdentityType, Notification } from '../data/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: (recipientId: string, recipientType: IdentityType) => Promise<void>;
  markAllRead: (recipientId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (recipientId, recipientType) => {
    const notifications = await listNotifications(recipientId, recipientType);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  markAllRead: async (recipientId) => {
    await markAllRead(recipientId);
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));

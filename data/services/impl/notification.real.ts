import { api } from '../../api';
import { IdentityType, Notification, NotificationType } from '../../types';

export async function createNotification(data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
  return api.post<Notification>('/notifications', data);
}

export async function listNotifications(recipientId: string, recipientType: IdentityType): Promise<Notification[]> {
  return api.get<Notification[]>(`/notifications?recipientId=${recipientId}&recipientType=${recipientType}`);
}

export async function markRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`, {});
}

export async function markAllRead(recipientId: string): Promise<void> {
  await api.post(`/notifications/mark-all-read`, { recipientId });
}

export async function triggerNotification(
  type: NotificationType,
  context: { userId?: string; providerId?: string; orderId?: string; taskId?: string }
): Promise<void> {
  await api.post('/notifications/trigger', { type, ...context });
}

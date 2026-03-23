import { getItem, setItem } from '../storage';
import { IdentityType, Notification, NotificationType, STORAGE_KEYS } from '../types';
import { delay } from './auth.service';

export async function createNotification(
  data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>
): Promise<Notification> {
  await delay(100);
  const notifications =
    (await getItem<Record<string, Notification>>(STORAGE_KEYS.NOTIFICATIONS)) ?? {};
  const notification: Notification = {
    ...data,
    id: 'notif-' + Date.now(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications[notification.id] = notification;
  await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return notification;
}

export async function listNotifications(
  recipientId: string,
  recipientType: IdentityType
): Promise<Notification[]> {
  await delay(100);
  const notifications =
    (await getItem<Record<string, Notification>>(STORAGE_KEYS.NOTIFICATIONS)) ?? {};
  return Object.values(notifications)
    .filter((n) => n.recipientId === recipientId && n.recipientType === recipientType)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markRead(id: string): Promise<void> {
  await delay(100);
  const notifications =
    (await getItem<Record<string, Notification>>(STORAGE_KEYS.NOTIFICATIONS)) ?? {};
  if (notifications[id]) {
    notifications[id] = { ...notifications[id], isRead: true };
    await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
}

export async function markAllRead(recipientId: string): Promise<void> {
  await delay(100);
  const notifications =
    (await getItem<Record<string, Notification>>(STORAGE_KEYS.NOTIFICATIONS)) ?? {};
  let changed = false;
  for (const id of Object.keys(notifications)) {
    if (notifications[id].recipientId === recipientId && !notifications[id].isRead) {
      notifications[id] = { ...notifications[id], isRead: true };
      changed = true;
    }
  }
  if (changed) await setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

export async function triggerNotification(
  type: NotificationType,
  context: { userId?: string; providerId?: string; orderId?: string; taskId?: string }
): Promise<void> {
  await delay(100);

  const base = {
    type,
    relatedOrderId: context.orderId,
    relatedTaskId: context.taskId,
  };

  switch (type) {
    case 'task_accepted':
      if (context.userId) {
        await createNotification({
          ...base,
          recipientId: context.userId,
          recipientType: 'user',
          title: 'Task Accepted',
          body: 'A provider has accepted your task',
        });
      }
      break;

    case 'order_pending_confirmation':
      if (context.userId) {
        await createNotification({
          ...base,
          recipientId: context.userId,
          recipientType: 'user',
          title: 'Service Completed',
          body: 'Your provider has completed the service. Please confirm.',
        });
      }
      break;

    case 'new_task_available':
      if (context.providerId) {
        await createNotification({
          ...base,
          recipientId: context.providerId,
          recipientType: 'provider',
          title: 'New Task Available',
          body: 'A new cleaning task matches your service area',
        });
      }
      break;

    case 'payment_completed':
      if (context.userId) {
        await createNotification({
          ...base,
          recipientId: context.userId,
          recipientType: 'user',
          title: 'Payment Confirmed',
          body: 'Payment has been processed successfully',
        });
      }
      if (context.providerId) {
        await createNotification({
          ...base,
          recipientId: context.providerId,
          recipientType: 'provider',
          title: 'Payment Confirmed',
          body: 'Payment has been processed successfully',
        });
      }
      break;

    case 'task_unaccepted_reminder':
      if (context.userId) {
        await createNotification({
          ...base,
          recipientId: context.userId,
          recipientType: 'user',
          title: 'Task Still Open',
          body: 'Your task has not been accepted yet',
        });
      }
      break;
  }
}

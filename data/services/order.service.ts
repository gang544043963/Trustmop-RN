import { getItem, setItem } from '../storage';
import { IdentityType, Order, OrderStatus, PaymentStatus, STORAGE_KEYS } from '../types';
import { delay } from './auth.service';
import { triggerNotification } from './notification.service';
import { getProvider } from './provider.service';
import { getTask, updateTask } from './task.service';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  accepted: ['in_progress'],
  in_progress: ['pending_confirmation'],
  pending_confirmation: ['completed'],
  completed: [],
  cancelled: [],
};

export async function createOrder(taskId: string, providerId: string): Promise<Order> {
  await delay(150);

  const task = await getTask(taskId);
  if (!task) throw new Error(`Task not found: ${taskId}`);
  if (task.status !== 'open') throw new Error(`Task is not open: ${task.status}`);

  const provider = await getProvider(providerId);
  if (!provider) throw new Error(`Provider not found: ${providerId}`);
  if (provider.status !== 'verified') throw new Error('Account pending verification');

  const orders = (await getItem<Record<string, Order>>(STORAGE_KEYS.ORDERS)) ?? {};
  const now = new Date().toISOString();
  const order: Order = {
    id: 'order-' + Date.now(),
    taskId,
    userId: task.userId,
    providerId,
    serviceType: task.serviceType,
    serviceAddress: task.serviceAddress,
    scheduledDate: task.scheduledDate,
    timeSlot: task.timeSlot,
    agreedPrice: task.budgetMax,
    platformFeeRate: 0.10,
    status: 'accepted',
    paymentStatus: 'unpaid',
    completionPhotos: [],
    statusHistory: [{ status: 'accepted', timestamp: now }],
    createdAt: now,
    updatedAt: now,
  };
  orders[order.id] = order;
  await setItem(STORAGE_KEYS.ORDERS, orders);

  await updateTask(taskId, { status: 'accepted', acceptedByProviderId: providerId });

  // Notify user that their task was accepted
  await triggerNotification('task_accepted', {
    userId: task.userId,
    providerId,
    orderId: order.id,
    taskId,
  });

  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  await delay(100);
  const orders = (await getItem<Record<string, Order>>(STORAGE_KEYS.ORDERS)) ?? {};
  return orders[id] ?? null;
}

export async function listOrders(id: string, role: IdentityType): Promise<Order[]> {
  await delay(100);
  const orders = (await getItem<Record<string, Order>>(STORAGE_KEYS.ORDERS)) ?? {};
  return Object.values(orders).filter((o) =>
    role === 'user' ? o.userId === id : o.providerId === id
  );
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<Order> {
  await delay(150);
  const orders = (await getItem<Record<string, Order>>(STORAGE_KEYS.ORDERS)) ?? {};
  if (!orders[orderId]) throw new Error(`Order not found: ${orderId}`);

  const order = orders[orderId];
  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Invalid status transition: ${order.status} → ${newStatus}`);
  }

  const now = new Date().toISOString();
  orders[orderId] = {
    ...order,
    status: newStatus,
    statusHistory: [...order.statusHistory, { status: newStatus, timestamp: now, note }],
    updatedAt: now,
  };
  await setItem(STORAGE_KEYS.ORDERS, orders);

  // Notify user when service is pending confirmation
  if (newStatus === 'pending_confirmation') {
    await triggerNotification('order_pending_confirmation', {
      userId: orders[orderId].userId,
      providerId: orders[orderId].providerId,
      orderId,
    });
  }

  return orders[orderId];
}

export async function addCompletionPhotos(orderId: string, photos: string[]): Promise<Order> {
  await delay(150);
  const orders = (await getItem<Record<string, Order>>(STORAGE_KEYS.ORDERS)) ?? {};
  if (!orders[orderId]) throw new Error(`Order not found: ${orderId}`);
  orders[orderId] = {
    ...orders[orderId],
    completionPhotos: [...orders[orderId].completionPhotos, ...photos],
    updatedAt: new Date().toISOString(),
  };
  await setItem(STORAGE_KEYS.ORDERS, orders);
  return orders[orderId];
}

async function setPaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
  const orders = (await getItem<Record<string, Order>>(STORAGE_KEYS.ORDERS)) ?? {};
  if (!orders[orderId]) throw new Error(`Order not found: ${orderId}`);
  orders[orderId] = { ...orders[orderId], paymentStatus, updatedAt: new Date().toISOString() };
  await setItem(STORAGE_KEYS.ORDERS, orders);
  return orders[orderId];
}

export async function mockPay(orderId: string): Promise<Order> {
  await delay(150);
  return setPaymentStatus(orderId, 'escrowed');
}

export async function mockRelease(orderId: string): Promise<Order> {
  await delay(150);
  const order = await setPaymentStatus(orderId, 'released');
  // Notify both user and provider that payment is complete
  await triggerNotification('payment_completed', {
    userId: order.userId,
    providerId: order.providerId,
    orderId,
  });
  return order;
}

export async function mockRefund(orderId: string): Promise<Order> {
  await delay(150);
  return setPaymentStatus(orderId, 'refunded');
}

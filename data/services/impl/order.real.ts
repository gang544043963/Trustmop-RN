import { api } from '../../api';
import { IdentityType, Order, OrderStatus } from '../../types';

export async function createOrder(taskId: string, providerId: string): Promise<Order> {
  return api.post<Order>('/orders', { taskId, providerId });
}

export async function getOrder(id: string): Promise<Order | null> {
  return api.get<Order>(`/orders/${id}`);
}

export async function listOrders(id: string, role: IdentityType): Promise<Order[]> {
  return api.get<Order[]>(`/orders?role=${role}&id=${id}`);
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<Order> {
  return api.patch<Order>(`/orders/${orderId}/status`, { status: newStatus, note });
}

export async function addCompletionPhotos(orderId: string, photos: string[]): Promise<Order> {
  return api.post<Order>(`/orders/${orderId}/photos`, { photos });
}

export async function mockPay(orderId: string): Promise<Order> {
  return api.post<Order>(`/orders/${orderId}/pay`, {});
}

export async function mockRelease(orderId: string): Promise<Order> {
  return api.post<Order>(`/orders/${orderId}/release`, {});
}

export async function mockRefund(orderId: string): Promise<Order> {
  return api.post<Order>(`/orders/${orderId}/refund`, {});
}

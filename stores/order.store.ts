import { create } from 'zustand';
import {
    addCompletionPhotos,
    createOrder,
    listOrders,
    mockPay,
    mockRelease,
    updateOrderStatus,
} from '../data/services/order.service';
import { createTask, listTasks } from '../data/services/task.service';
import { IdentityType, Order, OrderStatus, ServiceType, Task } from '../data/types';

interface OrderState {
  orders: Order[];
  tasks: Task[];
  fetchOrders: (id: string, role: IdentityType) => Promise<void>;
  fetchTasks: (filters?: { serviceType?: ServiceType; area?: string }) => Promise<void>;
  createTask: (
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'acceptedByProviderId'>
  ) => Promise<void>;
  acceptTask: (taskId: string, providerId: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  addPhotos: (orderId: string, photos: string[]) => Promise<void>;
  confirmCompletion: (orderId: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  tasks: [],

  fetchOrders: async (id, role) => {
    const orders = await listOrders(id, role);
    set({ orders });
  },

  fetchTasks: async (filters) => {
    const tasks = await listTasks(filters);
    set({ tasks });
  },

  createTask: async (data) => {
    await createTask(data);
  },

  acceptTask: async (taskId, providerId) => {
    const order = await createOrder(taskId, providerId);
    set((state) => ({ orders: [...state.orders, order] }));
    return order;
  },

  updateOrderStatus: async (orderId, status, note) => {
    const updated = await updateOrderStatus(orderId, status, note);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    }));
  },

  addPhotos: async (orderId, photos) => {
    const updated = await addCompletionPhotos(orderId, photos);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    }));
  },

  confirmCompletion: async (orderId) => {
    const updated = await updateOrderStatus(orderId, 'completed');
    await mockPay(orderId);
    await mockRelease(orderId);
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? updated : o)),
    }));
  },
}));

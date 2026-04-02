import { api } from '../../api';
import { ServiceType, Task } from '../../types';

export async function listTasks(filters?: { serviceType?: ServiceType; area?: string; userId?: string }): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.serviceType) params.set('serviceType', filters.serviceType);
  if (filters?.area) params.set('area', filters.area);
  if (filters?.userId) params.set('userId', filters.userId);
  return api.get<Task[]>(`/tasks?${params}`);
}

export async function getTask(id: string): Promise<Task | null> {
  return api.get<Task>(`/tasks/${id}`);
}

export async function createTask(
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'acceptedByProviderId'>
): Promise<Task> {
  return api.post<Task>('/tasks', data);
}

export async function updateTask(id: string, partial: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> {
  return api.patch<Task>(`/tasks/${id}`, partial);
}

export async function cancelTask(id: string): Promise<Task> {
  return api.post<Task>(`/tasks/${id}/cancel`, {});
}

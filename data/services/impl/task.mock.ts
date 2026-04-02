import { getItem, setItem } from '../../storage';
import { Provider, ServiceType, STORAGE_KEYS, Task } from '../../types';
import { delay } from './auth.mock';
import { triggerNotification } from '../notification.service';
import { listProviders } from '../provider.service';

export async function listTasks(filters?: {
  serviceType?: ServiceType;
  area?: string;
  userId?: string;
}): Promise<Task[]> {
  await delay(100);
  const tasks = (await getItem<Record<string, Task>>(STORAGE_KEYS.TASKS)) ?? {};
  return Object.values(tasks).filter((t) => {
    if (filters?.userId) return t.userId === filters.userId;
    if (t.status !== 'open') return false;
    if (filters?.serviceType && t.serviceType !== filters.serviceType) return false;
    if (filters?.area && !t.serviceAddress.toLowerCase().includes(filters.area.toLowerCase())) return false;
    return true;
  });
}

export async function getTask(id: string): Promise<Task | null> {
  await delay(100);
  const tasks = (await getItem<Record<string, Task>>(STORAGE_KEYS.TASKS)) ?? {};
  return tasks[id] ?? null;
}

export async function createTask(
  data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'acceptedByProviderId'>
): Promise<Task> {
  await delay(150);
  const tasks = (await getItem<Record<string, Task>>(STORAGE_KEYS.TASKS)) ?? {};
  const now = new Date().toISOString();
  const task: Task = { ...data, id: 'task-' + Date.now(), status: 'open', createdAt: now, updatedAt: now };
  tasks[task.id] = task;
  await setItem(STORAGE_KEYS.TASKS, tasks);
  try {
    const providers = await listProviders();
    const verified = providers.filter((p: Provider) => p.status === 'verified');
    await Promise.all(verified.map((p: Provider) =>
      triggerNotification('new_task_available', { providerId: p.id, taskId: task.id })
    ));
  } catch { /* non-critical */ }
  return task;
}

export async function updateTask(id: string, partial: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task> {
  await delay(150);
  const tasks = (await getItem<Record<string, Task>>(STORAGE_KEYS.TASKS)) ?? {};
  if (!tasks[id]) throw new Error(`Task not found: ${id}`);
  tasks[id] = { ...tasks[id], ...partial, updatedAt: new Date().toISOString() };
  await setItem(STORAGE_KEYS.TASKS, tasks);
  return tasks[id];
}

export async function cancelTask(id: string): Promise<Task> {
  await delay(150);
  const tasks = (await getItem<Record<string, Task>>(STORAGE_KEYS.TASKS)) ?? {};
  if (!tasks[id]) throw new Error(`Task not found: ${id}`);
  if (tasks[id].status !== 'open') throw new Error(`Cannot cancel task with status: ${tasks[id].status}`);
  tasks[id] = { ...tasks[id], status: 'cancelled', updatedAt: new Date().toISOString() };
  await setItem(STORAGE_KEYS.TASKS, tasks);
  return tasks[id];
}

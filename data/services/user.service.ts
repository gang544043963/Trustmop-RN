import { getItem, setItem } from '../storage';
import { STORAGE_KEYS, User } from '../types';
import { delay } from './auth.service';

export async function getUser(id: string): Promise<User | null> {
  await delay(100);
  const users = (await getItem<Record<string, User>>(STORAGE_KEYS.USERS)) ?? {};
  return users[id] ?? null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  await delay(100);
  const users = (await getItem<Record<string, User>>(STORAGE_KEYS.USERS)) ?? {};
  return Object.values(users).find((u) => u.phone === phone) ?? null;
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  await delay(150);
  const users = (await getItem<Record<string, User>>(STORAGE_KEYS.USERS)) ?? {};
  const user: User = {
    ...data,
    id: 'user-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  users[user.id] = user;
  await setItem(STORAGE_KEYS.USERS, users);
  return user;
}

export async function updateUser(
  id: string,
  partial: Partial<Omit<User, 'id'>>
): Promise<User> {
  await delay(150);
  const users = (await getItem<Record<string, User>>(STORAGE_KEYS.USERS)) ?? {};
  if (!users[id]) throw new Error(`User not found: ${id}`);
  users[id] = { ...users[id], ...partial };
  await setItem(STORAGE_KEYS.USERS, users);
  return users[id];
}

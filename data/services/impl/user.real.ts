import { api } from '../../api';
import { User } from '../../types';

export async function getUser(id: string): Promise<User | null> {
  return api.get<User>(`/users/${id}`);
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  return api.get<User>(`/users/by-phone/${encodeURIComponent(phone)}`);
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  return api.post<User>('/users', data);
}

export async function updateUser(id: string, partial: Partial<Omit<User, 'id'>>): Promise<User> {
  return api.patch<User>(`/users/${id}`, partial);
}

import { getItem, setItem } from './storage';
import { Notification, Order, Provider, Review, Service, STORAGE_KEYS, Task, User } from './types';

const SEED_USERS: Record<string, User> = {
  'user-seed-1': {
    id: 'user-seed-1',
    phone: '+639171234567',
    displayName: 'Maria Santos',
    serviceAddress: 'Makati City, Metro Manila',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
};

const SEED_PROVIDERS: Record<string, Provider> = {
  'provider-seed-1': {
    id: 'provider-seed-1',
    phone: '+639181111111',
    displayName: 'Juan dela Cruz Cleaning',
    status: 'verified',
    averageRating: 4.8,
    totalReviews: 12,
    governmentIdPhoto: 'mock://id1.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  'provider-seed-2': {
    id: 'provider-seed-2',
    phone: '+639182222222',
    displayName: 'Ana Reyes Home Services',
    status: 'verified',
    averageRating: 4.5,
    totalReviews: 8,
    governmentIdPhoto: 'mock://id2.jpg',
    createdAt: '2024-01-02T00:00:00.000Z',
  },
  'provider-seed-3': {
    id: 'provider-seed-3',
    phone: '+639183333333',
    displayName: 'Pedro Lim Deep Clean Pro',
    status: 'verified',
    averageRating: 4.2,
    totalReviews: 5,
    governmentIdPhoto: 'mock://id3.jpg',
    createdAt: '2024-01-03T00:00:00.000Z',
  },
};

const NOW = new Date().toISOString();

const SEED_SERVICES: Record<string, Service> = {
  'service-seed-1': {
    id: 'service-seed-1',
    providerId: 'provider-seed-1',
    serviceType: 'regular_cleaning',
    description: 'Professional regular home cleaning with eco-friendly products',
    price: 350,
    pricingUnit: 'per_hour',
    coverageAreas: ['Makati', 'BGC', 'Taguig'],
    photos: ['mock://photo1.jpg'],
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  'service-seed-2': {
    id: 'service-seed-2',
    providerId: 'provider-seed-1',
    serviceType: 'deep_cleaning',
    description: 'Thorough deep cleaning including appliances and hard-to-reach areas',
    price: 2500,
    pricingUnit: 'per_session',
    coverageAreas: ['Makati', 'BGC'],
    photos: ['mock://photo2.jpg'],
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  'service-seed-3': {
    id: 'service-seed-3',
    providerId: 'provider-seed-2',
    serviceType: 'regular_cleaning',
    description: 'Reliable weekly or bi-weekly home cleaning service',
    price: 300,
    pricingUnit: 'per_hour',
    coverageAreas: ['Quezon City', 'Mandaluyong'],
    photos: ['mock://photo3.jpg'],
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  'service-seed-4': {
    id: 'service-seed-4',
    providerId: 'provider-seed-2',
    serviceType: 'deep_cleaning',
    description: 'Move-in/move-out deep cleaning package',
    price: 3000,
    pricingUnit: 'per_session',
    coverageAreas: ['Quezon City'],
    photos: ['mock://photo4.jpg'],
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  'service-seed-5': {
    id: 'service-seed-5',
    providerId: 'provider-seed-3',
    serviceType: 'deep_cleaning',
    description: 'Industrial-grade deep cleaning for condos and houses',
    price: 2800,
    pricingUnit: 'per_session',
    coverageAreas: ['Pasig', 'Mandaluyong', 'Makati'],
    photos: ['mock://photo5.jpg'],
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
};

const SEED_TASKS: Record<string, Task> = {
  'task-seed-1': {
    id: 'task-seed-1',
    userId: 'user-seed-1',
    serviceType: 'regular_cleaning',
    serviceAddress: 'Unit 12B Ayala Tower, Makati',
    scheduledDate: '2024-02-15',
    timeSlot: '09:00-11:00',
    budgetMin: 500,
    budgetMax: 1000,
    specialRequirements: 'Please bring your own cleaning supplies',
    status: 'open',
    createdAt: '2024-01-20T08:00:00.000Z',
    updatedAt: '2024-01-20T08:00:00.000Z',
  },
  'task-seed-2': {
    id: 'task-seed-2',
    userId: 'user-seed-1',
    serviceType: 'deep_cleaning',
    serviceAddress: '45 Rizal Ave, Makati',
    scheduledDate: '2024-02-20',
    timeSlot: '13:00-17:00',
    budgetMin: 2000,
    budgetMax: 3500,
    status: 'open',
    createdAt: '2024-01-21T10:00:00.000Z',
    updatedAt: '2024-01-21T10:00:00.000Z',
  },
};

const SEED_ORDERS: Record<string, Order> = {
  'order-seed-1': {
    id: 'order-seed-1',
    taskId: 'task-seed-completed',
    userId: 'user-seed-1',
    providerId: 'provider-seed-1',
    serviceType: 'regular_cleaning',
    serviceAddress: 'Unit 12B Ayala Tower, Makati',
    scheduledDate: '2024-01-15',
    timeSlot: '09:00-11:00',
    agreedPrice: 700,
    platformFeeRate: 0.10,
    status: 'completed',
    paymentStatus: 'released',
    completionPhotos: ['mock://done1.jpg'],
    statusHistory: [
      { status: 'accepted',             timestamp: '2024-01-10T00:00:00.000Z' },
      { status: 'in_progress',          timestamp: '2024-01-15T09:00:00.000Z' },
      { status: 'pending_confirmation', timestamp: '2024-01-15T11:00:00.000Z' },
      { status: 'completed',            timestamp: '2024-01-15T11:30:00.000Z' },
    ],
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-15T11:30:00.000Z',
  },
};

const SEED_REVIEWS: Record<string, Review> = {
  'review-seed-1': {
    id: 'review-seed-1',
    orderId: 'order-seed-1',
    userId: 'user-seed-1',
    providerId: 'provider-seed-1',
    rating: 5,
    comment: 'Excellent service! Very thorough and professional.',
    createdAt: '2024-01-16T00:00:00.000Z',
  },
  'review-seed-2': {
    id: 'review-seed-2',
    orderId: 'order-seed-2',
    userId: 'user-seed-1',
    providerId: 'provider-seed-1',
    rating: 5,
    comment: 'Juan is very reliable and does great work.',
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  'review-seed-3': {
    id: 'review-seed-3',
    orderId: 'order-seed-3',
    userId: 'user-seed-1',
    providerId: 'provider-seed-2',
    rating: 4,
    comment: 'Good service, will book again.',
    createdAt: '2024-01-12T00:00:00.000Z',
  },
};

const SEED_NOTIFICATIONS: Record<string, Notification> = {
  'notif-seed-1': {
    id: 'notif-seed-1',
    recipientId: 'user-seed-1',
    recipientType: 'user',
    type: 'task_accepted',
    title: 'Task Accepted',
    body: 'Juan dela Cruz has accepted your regular cleaning task.',
    isRead: false,
    relatedOrderId: 'order-seed-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  'notif-seed-2': {
    id: 'notif-seed-2',
    recipientId: 'user-seed-1',
    recipientType: 'user',
    type: 'order_pending_confirmation',
    title: 'Service Completed',
    body: 'Your provider has finished the job. Please confirm completion.',
    isRead: false,
    relatedOrderId: 'order-seed-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  'notif-seed-3': {
    id: 'notif-seed-3',
    recipientId: 'user-seed-1',
    recipientType: 'user',
    type: 'task_unaccepted_reminder',
    title: 'Task Still Open',
    body: 'Your deep cleaning task has not been accepted yet. Consider adjusting your budget.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
};

export async function runSeedIfNeeded(): Promise<void> {
  const seeded = await getItem<boolean>(STORAGE_KEYS.SEEDED);
  if (!seeded) {
    await setItem(STORAGE_KEYS.USERS, SEED_USERS);
    await setItem(STORAGE_KEYS.PROVIDERS, SEED_PROVIDERS);
    await setItem(STORAGE_KEYS.SERVICES, SEED_SERVICES);
    await setItem(STORAGE_KEYS.TASKS, SEED_TASKS);
    await setItem(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    await setItem(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
    await setItem('@cleaning/platform_config', { platformFeeRate: 0.10 });
    await setItem(STORAGE_KEYS.SEEDED, true);
  }

  // Always ensure seed notifications exist (re-runs safely on reload)
  const existing = (await getItem<Record<string, Notification>>(STORAGE_KEYS.NOTIFICATIONS)) ?? {};
  const hasSeedNotifs = Object.keys(existing).some((k) => k.startsWith('notif-seed-'));
  if (!hasSeedNotifs) {
    const merged = { ...existing, ...SEED_NOTIFICATIONS };
    await setItem(STORAGE_KEYS.NOTIFICATIONS, merged);
  }
}

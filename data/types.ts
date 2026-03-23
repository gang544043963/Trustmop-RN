// ─── Identity & Auth ───────────────────────────────────────────

export type IdentityType = 'user' | 'provider';

export interface AuthSession {
  phone: string;           // +63XXXXXXXXXX
  activeIdentity: IdentityType;
  userId?: string;         // set if user account exists for this phone
  providerId?: string;     // set if provider account exists for this phone
}

// ─── User (C-side) ─────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  displayName: string;
  serviceAddress: string;
  createdAt: string;       // ISO 8601
}

// ─── Provider (B-side) ─────────────────────────────────────────

export type ProviderStatus = 'pending_review' | 'verified' | 'rejected' | 'banned';

export interface Provider {
  id: string;
  phone: string;
  displayName: string;
  governmentIdPhoto: string;   // local URI or base64
  status: ProviderStatus;
  rejectionReason?: string;
  averageRating: number;       // 0–5, computed from reviews
  totalReviews: number;
  createdAt: string;
}

// ─── Service Listing ───────────────────────────────────────────

export type ServiceType = 'regular_cleaning' | 'deep_cleaning';
export type PricingUnit = 'per_hour' | 'per_session';

export interface Service {
  id: string;
  providerId: string;
  serviceType: ServiceType;
  description: string;
  price: number;
  pricingUnit: PricingUnit;
  coverageAreas: string[];     // e.g. ["Makati", "BGC"]
  photos: string[];            // min 1 required
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Task ──────────────────────────────────────────────────────

export type TaskStatus = 'open' | 'accepted' | 'cancelled';

export interface Task {
  id: string;
  userId: string;
  serviceType: ServiceType;
  serviceAddress: string;
  scheduledDate: string;       // ISO 8601 date
  timeSlot: string;            // e.g. "09:00–11:00"
  budgetMin: number;
  budgetMax: number;
  specialRequirements?: string;
  status: TaskStatus;
  acceptedByProviderId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ─────────────────────────────────────────────────────

export type OrderStatus =
  | 'accepted'
  | 'in_progress'
  | 'pending_confirmation'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'unpaid' | 'escrowed' | 'released' | 'refunded';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  taskId: string;
  userId: string;
  providerId: string;
  serviceType: ServiceType;
  serviceAddress: string;
  scheduledDate: string;
  timeSlot: string;
  agreedPrice: number;
  platformFeeRate: number;     // e.g. 0.10 for 10%
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  completionPhotos: string[];
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Review ────────────────────────────────────────────────────

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  providerId: string;
  rating: number;              // 1–5 integer
  comment?: string;
  createdAt: string;
}

// ─── Notification ──────────────────────────────────────────────

export type NotificationType =
  | 'task_accepted'
  | 'order_pending_confirmation'
  | 'new_task_available'
  | 'payment_completed'
  | 'task_unaccepted_reminder';

export interface Notification {
  id: string;
  recipientId: string;         // userId or providerId
  recipientType: IdentityType;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  relatedOrderId?: string;
  relatedTaskId?: string;
  createdAt: string;
}

// ─── Storage Keys ──────────────────────────────────────────────

export const STORAGE_KEYS = {
  AUTH_SESSION:   '@trustmop/auth_session',
  USERS:          '@trustmop/users',
  PROVIDERS:      '@trustmop/providers',
  SERVICES:       '@trustmop/services',
  TASKS:          '@trustmop/tasks',
  ORDERS:         '@trustmop/orders',
  REVIEWS:        '@trustmop/reviews',
  NOTIFICATIONS:  '@trustmop/notifications',
  SEEDED:         '@trustmop/seeded',
  OTP_STORE:      '@trustmop/otp_store',
} as const;

# Design Document: Cleaning Service App

## Overview

A Philippines-based home cleaning service booking platform built on Expo React Native. The MVP connects household users (C-side) with cleaners/companies (B-side) through a fully local mock data layer — no backend required for Phase 1.

The app runs on an existing Expo Router project. All persistence uses AsyncStorage. Authentication uses a mock OTP flow (fixed code `123456`). Admin approval is pre-mocked (providers start as "Verified" in seed data). Payment uses a mock button (tap = success).

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Expo React Native App                 │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  Auth Layer  │  │  User Side   │  │ Provider Side │ │
│  │  (OTP mock)  │  │  (C-side)    │  │  (B-side)     │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │         │
│  ┌──────▼─────────────────▼───────────────────▼───────┐ │
│  │              State Management (Zustand)             │ │
│  │  authStore │ userStore │ providerStore │ orderStore │ │
│  └──────────────────────────┬────────────────────────┘ │
│                             │                           │
│  ┌──────────────────────────▼────────────────────────┐ │
│  │              Mock Data Service Layer               │ │
│  │   mockAuth │ mockServices │ mockOrders │ mockNotif │ │
│  └──────────────────────────┬────────────────────────┘ │
│                             │                           │
│  ┌──────────────────────────▼────────────────────────┐ │
│  │              AsyncStorage (Persistence)            │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

- **No backend**: All data lives in AsyncStorage, seeded from `data/seed.ts` on first launch.
- **Zustand** for global state: lightweight, no boilerplate, works well with React Native.
- **Expo Router file-based routing**: separate route groups for `(auth)`, `(user)`, and `(provider)`.
- **Role-based navigation**: after login, the app redirects to either `(user)` or `(provider)` tab group based on the active identity stored in `authStore`.
- **Dual identity**: one phone number can hold both a User account and a Provider account. The active identity is a session-level selection.

---

## Route Structure

```
app/
├── _layout.tsx                    # Root layout, auth guard
├── index.tsx                      # Redirect to (auth) or active role tabs
│
├── (auth)/
│   ├── _layout.tsx
│   ├── welcome.tsx                # Landing: "I am a User" / "I am a Provider"
│   ├── phone.tsx                  # Phone number entry
│   ├── otp.tsx                    # OTP verification
│   └── profile-setup.tsx          # Display name + address (first login)
│
├── (user)/
│   ├── _layout.tsx                # Bottom tabs: Home | Post Task | My Orders | Profile
│   ├── home/
│   │   ├── index.tsx              # Provider listing browse + filter
│   │   └── provider/[id].tsx      # Provider detail + reviews
│   ├── post-task/
│   │   └── index.tsx              # Task creation form
│   ├── orders/
│   │   ├── index.tsx              # Order list
│   │   └── [id].tsx               # Order detail + confirm + review
│   └── profile/
│       └── index.tsx              # User profile, address, switch identity
│
└── (provider)/
    ├── _layout.tsx                # Bottom tabs: Task Hall | My Services | My Orders | Profile
    ├── task-hall/
    │   ├── index.tsx              # Open task list + filter
    │   └── [id].tsx               # Task detail + accept
    ├── services/
    │   ├── index.tsx              # My service listings
    │   └── edit/[id].tsx          # Create / edit service listing
    ├── orders/
    │   ├── index.tsx              # Accepted order list
    │   └── [id].tsx               # Order detail + status update + photo upload
    └── profile/
        └── index.tsx              # Provider profile, earnings, verification status, switch identity
```

---

## Data Models

```typescript
// ─── Identity & Auth ───────────────────────────────────────────

type IdentityType = 'user' | 'provider';

interface AuthSession {
  phone: string;           // +63XXXXXXXXXX
  activeIdentity: IdentityType;
  userId?: string;         // set if user account exists for this phone
  providerId?: string;     // set if provider account exists for this phone
}

// ─── User (C-side) ─────────────────────────────────────────────

interface User {
  id: string;
  phone: string;
  displayName: string;
  serviceAddress: string;
  createdAt: string;       // ISO 8601
}

// ─── Provider (B-side) ─────────────────────────────────────────

type ProviderStatus = 'pending_review' | 'verified' | 'rejected' | 'banned';

interface Provider {
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

type ServiceType = 'regular_cleaning' | 'deep_cleaning';
type PricingUnit = 'per_hour' | 'per_session';

interface Service {
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

type TaskStatus = 'open' | 'accepted' | 'cancelled';

interface Task {
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

type OrderStatus =
  | 'accepted'
  | 'in_progress'
  | 'pending_confirmation'
  | 'completed'
  | 'cancelled';

type PaymentStatus = 'unpaid' | 'escrowed' | 'released' | 'refunded';

interface Order {
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

interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

// ─── Review ────────────────────────────────────────────────────

interface Review {
  id: string;
  orderId: string;
  userId: string;
  providerId: string;
  rating: number;              // 1–5 integer
  comment?: string;
  createdAt: string;
}

// ─── Notification ──────────────────────────────────────────────

type NotificationType =
  | 'task_accepted'
  | 'order_pending_confirmation'
  | 'new_task_available'
  | 'payment_completed'
  | 'task_unaccepted_reminder';

interface Notification {
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
```

---

## Mock Data Layer

### Storage Keys

```typescript
const STORAGE_KEYS = {
  AUTH_SESSION:   '@cleaning/auth_session',
  USERS:          '@cleaning/users',
  PROVIDERS:      '@cleaning/providers',
  SERVICES:       '@cleaning/services',
  TASKS:          '@cleaning/tasks',
  ORDERS:         '@cleaning/orders',
  REVIEWS:        '@cleaning/reviews',
  NOTIFICATIONS:  '@cleaning/notifications',
  SEEDED:         '@cleaning/seeded',
} as const;
```

### Seed Data Strategy

On first app launch (`SEEDED` key absent), `data/seed.ts` writes initial records:
- 3 verified providers with service listings and reviews
- 2 open tasks
- 1 completed order with review
- Platform fee rate: 10%

### Mock Service API

All functions are async and simulate network latency (100–300ms delay).

```
data/
├── seed.ts                  # Initial seed data
├── storage.ts               # AsyncStorage read/write helpers
└── services/
    ├── auth.service.ts      # sendOtp, verifyOtp, logout
    ├── user.service.ts      # getUser, updateUser
    ├── provider.service.ts  # getProvider, updateProvider
    ├── service.service.ts   # listServices, createService, updateService
    ├── task.service.ts      # listTasks, createTask, updateTask
    ├── order.service.ts     # createOrder, updateOrderStatus, getOrder
    ├── review.service.ts    # createReview, listReviews
    └── notification.service.ts  # listNotifications, markRead
```

### Mock OTP Flow

```typescript
// sendOtp(phone): stores { phone, code: '123456', expiresAt } in AsyncStorage
// verifyOtp(phone, code): checks code === '123456', returns session token
```

### Mock Payment Flow

```typescript
// mockPay(orderId): sets order.paymentStatus = 'escrowed', returns success
// mockRelease(orderId): sets order.paymentStatus = 'released'
// mockRefund(orderId): sets order.paymentStatus = 'refunded'
```

---

## State Management

Using **Zustand** with AsyncStorage persistence via `zustand/middleware` `persist`.

```typescript
// stores/auth.store.ts
interface AuthStore {
  session: AuthSession | null;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  switchIdentity: (identity: IdentityType) => void;
}

// stores/user.store.ts
interface UserStore {
  user: User | null;
  fetchUser: (id: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// stores/provider.store.ts
interface ProviderStore {
  provider: Provider | null;
  services: Service[];
  fetchProvider: (id: string) => Promise<void>;
  fetchServices: (providerId: string) => Promise<void>;
}

// stores/order.store.ts
interface OrderStore {
  orders: Order[];
  tasks: Task[];
  fetchOrders: (id: string, role: IdentityType) => Promise<void>;
  fetchTasks: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

// stores/notification.store.ts
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: (recipientId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}
```

---

## Core Components

```
components/
├── auth/
│   ├── PhoneInput.tsx           # +63 prefix, numeric keyboard
│   └── OtpInput.tsx             # 6-digit code input
├── user/
│   ├── ServiceCard.tsx          # Provider listing card (type, price, rating)
│   ├── TaskForm.tsx             # Task creation form
│   └── ReviewForm.tsx           # Star rating + comment
├── provider/
│   ├── TaskCard.tsx             # Open task card in Task Hall
│   └── ServiceForm.tsx          # Service listing create/edit form
├── shared/
│   ├── OrderCard.tsx            # Order summary card (both sides)
│   ├── OrderStatusBadge.tsx     # Colored status pill
│   ├── NotificationBell.tsx     # Bell icon with unread count badge
│   ├── MockPayButton.tsx        # "Pay Now" → instant success
│   └── EmptyState.tsx           # Empty list placeholder
└── ui/                          # Existing components (themed-text, etc.)
```

---

## Key Business Flows

### 1. Registration / Login

```
Welcome → select role
  → Phone entry → sendOtp(phone)
  → OTP screen (enter 123456) → verifyOtp(phone, code)
  → First login? → Profile Setup → Home tabs
  → Returning user? → Home tabs directly
```

### 2. Post Task (User)

```
Post Task tab → TaskForm
  → fill serviceType, address, date, timeSlot, budget
  → submit → task.service.createTask() → status: 'open'
  → notification sent to matching providers
  → redirect to My Orders
```

### 3. Accept Task (Provider)

```
Task Hall → filter by type/area → tap task
  → Task Detail → "Accept" button
  → order.service.createOrder() → task status: 'accepted'
  → notification sent to user
  → redirect to My Orders
```

### 4. Order Lifecycle

```
Provider: Accepted → tap "Start Service" → status: 'in_progress'
Provider: In Progress → tap "Complete" + optional photos → status: 'pending_confirmation'
User: Pending Confirmation → tap "Confirm" → MockPayButton → status: 'completed'
  → payment: escrowed → released (minus platform fee)
  → review prompt shown to user
```

### 5. Dual Identity Switch

```
Profile tab → "Switch to Provider" (or "Switch to User")
  → authStore.switchIdentity(newRole)
  → if account for that role doesn't exist → go to profile-setup for that role
  → router.replace('/(user)') or router.replace('/(provider)')
```

---

## Error Handling

| Scenario | Handling |
|---|---|
| AsyncStorage read failure | Show error toast, retry once |
| OTP wrong code | Show inline error, allow retry |
| Accept already-accepted task | Show "Task no longer available" alert |
| Provider not verified tries to accept | Show "Account pending verification" alert |
| Review rating out of range (< 1 or > 5) | Reject at form validation layer |
| Service listing missing photo | Reject at form validation layer |
| Network simulation timeout | Mock services resolve within 300ms; no timeout handling needed in MVP |

---


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: OTP Authentication Round-Trip

*For any* valid Philippine phone number (+63), sending an OTP and then verifying with the correct mock code (`123456`) should result in an authenticated session with the correct phone number stored.

**Validates: Requirements 1.2, 1.3, 1.5, 2.1**

---

### Property 2: Wrong OTP Rejected

*For any* phone number and any OTP code that is not `123456`, the verification call should return a failure result and no session should be created.

**Validates: Requirements 1.4**

---

### Property 3: Profile Update Persistence

*For any* user or provider, updating the display name and service address should result in those exact values being retrievable from storage afterward.

**Validates: Requirements 1.6**

---

### Property 4: Provider Registration Status Invariant

*For any* new provider registration, the resulting provider record should have status `pending_review` immediately after submission.

**Validates: Requirements 2.3**

---

### Property 5: Unverified Provider Cannot Accept Orders

*For any* provider whose status is not `verified`, attempting to accept any open task should return an error and no order should be created.

**Validates: Requirements 2.6**

---

### Property 6: Service Listing Creation and Browse Round-Trip

*For any* verified provider and valid service listing data (including at least one photo, a service type, price, and coverage area), creating the listing should cause it to appear in the public browse list with the correct fields.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

### Property 7: Unpublish Removes Listing from Browse

*For any* active service listing, unpublishing it should cause it to no longer appear in the public browse list.

**Validates: Requirements 3.5**

---

### Property 8: Browse Returns Only Verified Provider Listings

*For any* set of service listings in storage (including listings from unverified providers), the browse list should only return listings whose provider has `verified` status.

**Validates: Requirements 4.1**

---

### Property 9: Filter Returns Only Matching Results

*For any* filter applied to a list (service type filter on browse, or service type / area filter on Task Hall), every item in the returned list should satisfy the filter predicate.

**Validates: Requirements 4.2, 6.2**

---

### Property 10: Browse List Sorted by Rating Descending

*For any* set of service listings, the default browse result should be sorted such that each listing's `averageRating` is greater than or equal to the next listing's `averageRating`.

**Validates: Requirements 4.4**

---

### Property 11: New Task Has Open Status

*For any* valid task submission by a user, the created task record should have status `open`.

**Validates: Requirements 5.1, 5.3**

---

### Property 12: Task Cancellation Only Before Acceptance

*For any* task with status `open`, cancellation should succeed and set status to `cancelled`. For any task with status `accepted`, cancellation should return an error and the status should remain unchanged.

**Validates: Requirements 5.4**

---

### Property 13: Task Hall Shows Only Open Tasks

*For any* set of tasks in storage, the Task Hall query should return only tasks with status `open`.

**Validates: Requirements 6.1**

---

### Property 14: Accepting a Task Creates an Order and Updates Task Status

*For any* open task and verified provider, accepting the task should atomically create an order record and update the task status to `accepted`.

**Validates: Requirements 6.4**

---

### Property 15: Duplicate Task Acceptance Rejected

*For any* task that already has status `accepted`, a second acceptance attempt by any provider should return an error and no additional order should be created.

**Validates: Requirements 6.5**

---

### Property 16: Order Status Machine Validity

*For any* order, only valid forward transitions (accepted → in_progress → pending_confirmation → completed) should succeed. Any attempt to transition to a non-adjacent or backward status should return an error.

**Validates: Requirements 7.1, 7.2, 7.3**

---

### Property 17: Order Completion Triggers Payment Release

*For any* order with `paymentStatus = 'escrowed'`, confirming completion should set `paymentStatus` to `released` and `status` to `completed`.

**Validates: Requirements 7.4, 8.4**

---

### Property 18: Pre-Acceptance Cancellation Triggers Refund

*For any* order cancelled before reaching `accepted` status, the `paymentStatus` should be set to `refunded`.

**Validates: Requirements 8.5**

---

### Property 19: Platform Fee Deduction Invariant

*For any* completed order with a non-zero `agreedPrice` and `platformFeeRate`, the provider's net payout should equal `agreedPrice * (1 - platformFeeRate)`.

**Validates: Requirements 8.6**

---

### Property 20: Review Rating Bounds Enforcement

*For any* review submission, a rating value outside the range [1, 5] should be rejected and no review record should be created.

**Validates: Requirements 9.2**

---

### Property 21: Provider Average Rating Calculation

*For any* provider with one or more reviews, the stored `averageRating` should equal the arithmetic mean of all their review ratings, rounded to one decimal place.

**Validates: Requirements 9.3, 9.4**

---

### Property 22: Notification Created on Trigger Events

*For any* trigger event (task accepted, order pending confirmation, new matching task, payment completed), a notification record should be created for the correct recipient with the correct `type` field.

**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

---

### Property 23: Dual Identity Persistence Round-Trip

*For any* phone number, registering both a User identity and a Provider identity should result in both records being independently retrievable, each with the correct `phone` field.

**Validates: Requirements 12.4**

---

### Property 24: Active Identity Persisted Across Sessions

*For any* session where the user selects an identity (user or provider), the selected identity should be retrievable from storage and restored on next app launch.

**Validates: Requirements 12.2**

---

## Testing Strategy

### Dual Testing Approach

Both unit tests and property-based tests are required. They are complementary:
- Unit tests catch concrete bugs in specific scenarios and edge cases.
- Property tests verify universal correctness across randomized inputs.

### Property-Based Testing

**Library**: [`fast-check`](https://github.com/dubzzz/fast-check) — works with Jest/Vitest in React Native/Expo environments.

**Configuration**: Each property test runs a minimum of **100 iterations**.

**Tag format** (comment above each test):
```
// Feature: cleaning-service-app, Property N: <property_text>
```

Each correctness property above maps to exactly one property-based test. Generators should produce:
- Random valid PH phone numbers: `fc.string({ minLength: 10, maxLength: 10 }).map(s => '+63' + s.replace(/\D/g, '').slice(0, 10))`
- Random service types: `fc.constantFrom('regular_cleaning', 'deep_cleaning')`
- Random ratings: `fc.integer({ min: 1, max: 5 })`
- Random order statuses: `fc.constantFrom('accepted', 'in_progress', 'pending_confirmation', 'completed')`
- Random price/fee combinations: `fc.tuple(fc.float({ min: 100, max: 10000 }), fc.float({ min: 0.05, max: 0.30 }))`

### Unit Tests

Unit tests focus on:
- Specific examples demonstrating correct behavior (e.g., the exact mock OTP `123456` works)
- Integration between stores and mock services
- Edge cases: empty task list, provider with zero reviews, task with no special requirements
- Error message content for known failure scenarios

### Test File Structure

```
__tests__/
├── services/
│   ├── auth.service.test.ts
│   ├── task.service.test.ts
│   ├── order.service.test.ts
│   └── review.service.test.ts
├── stores/
│   ├── auth.store.test.ts
│   └── order.store.test.ts
└── properties/
    ├── auth.property.test.ts       # Properties 1, 2, 3
    ├── provider.property.test.ts   # Properties 4, 5, 6, 7, 8
    ├── task.property.test.ts       # Properties 9–15
    ├── order.property.test.ts      # Properties 16–18
    ├── payment.property.test.ts    # Properties 19
    ├── review.property.test.ts     # Properties 20, 21
    └── notification.property.test.ts  # Property 22
```

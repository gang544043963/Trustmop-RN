# Implementation Plan: Cleaning Service App

## Overview

Incremental implementation of a Philippines-based home cleaning service booking app using Expo React Native + Expo Router (file-based routing, no bracket route groups), Zustand for state management, AsyncStorage for persistence, and a fully local mock data layer. No backend required.

## Tasks

- [x] 1. Project setup and cleanup
  - Remove existing `app/(tabs)/` route group and `app/modal.tsx`; replace with the new route structure (`app/auth/`, `app/user/`, `app/provider/`)
  - Install required dependencies: `zustand`, `@react-native-async-storage/async-storage`, `expo-image-picker`, `fast-check` (dev), `jest` + `@testing-library/react-native` (dev)
  - Update `tsconfig.json` to add path alias `@/*` pointing to project root
  - Update `app.json` to set correct app name and slug
  - Update `constants/theme.ts` with brand color palette (primary blue, accent, neutral grays)
  - _Requirements: 12.3_

- [ ] 2. Data models and storage helpers
  - [x] 2.1 Create `data/types.ts` with all TypeScript interfaces and type aliases
    - `AuthSession`, `User`, `Provider`, `ProviderStatus`, `Service`, `ServiceType`, `PricingUnit`, `Task`, `TaskStatus`, `Order`, `OrderStatus`, `PaymentStatus`, `StatusHistoryEntry`, `Review`, `Notification`, `NotificationType`
    - Export `STORAGE_KEYS` constant object
    - _Requirements: 1.1, 2.1, 3.1, 5.1, 7.1, 8.3, 9.1, 10.1_

  - [x] 2.2 Create `data/storage.ts` with typed AsyncStorage helpers
    - `getItem<T>(key)`, `setItem<T>(key, value)`, `removeItem(key)`, `mergeItem<T>(key, partial)`
    - All functions async, wrap AsyncStorage with JSON parse/stringify
    - _Requirements: 1.3, 1.5_

  - [x] 2.3 Create `data/seed.ts` with initial seed data and `runSeedIfNeeded()` function
    - 3 verified providers, each with 1–2 service listings and 2–3 reviews
    - 2 open tasks posted by a seeded user
    - 1 completed order with review
    - Platform fee rate: 0.10
    - Check `STORAGE_KEYS.SEEDED` before writing; skip if already seeded
    - _Requirements: 2.4, 4.1, 6.1_

- [ ] 3. Mock service layer
  - [x] 3.1 Create `data/services/auth.service.ts`
    - `sendOtp(phone)`: stores `{ phone, code: '123456', expiresAt }` in AsyncStorage
    - `verifyOtp(phone, code)`: checks `code === '123456'`, returns `AuthSession` or throws
    - `logout()`: removes `STORAGE_KEYS.AUTH_SESSION`
    - Simulate 100–300ms async delay
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.2 Write unit tests for `auth.service.ts`
    - Test correct OTP `123456` succeeds and returns session
    - Test wrong OTP returns error and no session written
    - Test `logout` removes session key
    - _Requirements: 1.3, 1.4_

  - [x] 3.3 Create `data/services/user.service.ts`
    - `getUser(id)`, `createUser(data)`, `updateUser(id, partial)`
    - _Requirements: 1.6_

  - [x] 3.4 Create `data/services/provider.service.ts`
    - `getProvider(id)`, `createProvider(data)`, `updateProvider(id, partial)`, `listProviders()`
    - _Requirements: 2.1, 2.2, 2.3, 4.1_

  - [x] 3.5 Create `data/services/service.service.ts`
    - `listServices(filters?)`: returns active services from verified providers, sorted by `averageRating` desc
    - `getService(id)`, `createService(data)`, `updateService(id, partial)`
    - Filters: `serviceType?`, `providerId?`
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 4.1, 4.2, 4.4_

  - [x] 3.6 Create `data/services/task.service.ts`
    - `listTasks(filters?)`: returns only `status === 'open'` tasks
    - `getTask(id)`, `createTask(data)`, `updateTask(id, partial)`, `cancelTask(id)`
    - Filters: `serviceType?`, `area?`
    - _Requirements: 5.1, 5.3, 5.4, 6.1, 6.2_

  - [x] 3.7 Create `data/services/order.service.ts`
    - `createOrder(taskId, providerId)`: atomically creates order + sets task status to `accepted`
    - `getOrder(id)`, `listOrders(id, role)`, `updateOrderStatus(orderId, status, note?)`, `addCompletionPhotos(orderId, photos)`
    - `mockPay(orderId)`: sets `paymentStatus = 'escrowed'`
    - `mockRelease(orderId)`: sets `paymentStatus = 'released'`
    - `mockRefund(orderId)`: sets `paymentStatus = 'refunded'`
    - Enforce valid status transitions; throw on invalid
    - _Requirements: 6.4, 7.1, 7.2, 7.3, 7.4, 8.3, 8.4, 8.5_

  - [ ]* 3.8 Write unit tests for `order.service.ts`
    - Test `createOrder` creates order and sets task to `accepted`
    - Test duplicate acceptance throws and no second order created
    - Test invalid status transition throws
    - _Requirements: 6.4, 6.5, 7.1_

  - [x] 3.9 Create `data/services/review.service.ts`
    - `createReview(data)`: validates rating in [1,5], saves review, recomputes `provider.averageRating` and `provider.totalReviews`
    - `listReviews(providerId)`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 3.10 Create `data/services/notification.service.ts`
    - `createNotification(data)`, `listNotifications(recipientId, recipientType)`, `markRead(id)`, `markAllRead(recipientId)`
    - Helper `triggerNotification(type, context)` used internally by other services
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 4. Checkpoint — Ensure all mock service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Zustand stores
  - [x] 5.1 Create `stores/auth.store.ts`
    - State: `session`, `isLoading`
    - Actions: `login(phone, otp)`, `logout()`, `switchIdentity(identity)`, `setSession(session)`
    - Persist `session` to AsyncStorage via `zustand/middleware` `persist`
    - _Requirements: 1.3, 1.5, 12.2, 12.4_

  - [x] 5.2 Create `stores/user.store.ts`
    - State: `user`
    - Actions: `fetchUser(id)`, `updateProfile(data)`, `createProfile(data)`
    - _Requirements: 1.6_

  - [x] 5.3 Create `stores/provider.store.ts`
    - State: `provider`, `services`
    - Actions: `fetchProvider(id)`, `updateProvider(data)`, `fetchServices(providerId)`, `createService(data)`, `updateService(id, data)`
    - _Requirements: 2.1, 3.1, 3.5_

  - [x] 5.4 Create `stores/order.store.ts`
    - State: `orders`, `tasks`
    - Actions: `fetchOrders(id, role)`, `fetchTasks(filters?)`, `acceptTask(taskId, providerId)`, `updateOrderStatus(orderId, status)`, `addPhotos(orderId, photos)`, `confirmCompletion(orderId)`
    - _Requirements: 6.4, 7.1, 7.2, 7.3, 7.4_

  - [x] 5.5 Create `stores/notification.store.ts`
    - State: `notifications`, `unreadCount`
    - Actions: `fetchNotifications(recipientId, recipientType)`, `markAllRead()`
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 6. Root layout and auth guard
  - [x] 6.1 Rewrite `app/_layout.tsx`
    - Remove `(tabs)` stack screen; add `auth`, `user`, `provider` stack screens with `headerShown: false`
    - Call `runSeedIfNeeded()` on mount
    - Read `authStore.session` to determine initial route; redirect via `router.replace`
    - _Requirements: 12.1, 12.2_

  - [x] 6.2 Create `app/index.tsx`
    - Redirect to `auth/welcome` if no session, else to `user/home` or `provider/task-hall` based on `activeIdentity`
    - _Requirements: 12.2, 12.3_

- [ ] 7. Auth flow screens
  - [x] 7.1 Create `app/auth/_layout.tsx`
    - Stack navigator, `headerShown: false`

  - [x] 7.2 Create `app/auth/welcome.tsx`
    - Two buttons: "I am a User" and "I am a Provider"
    - Store role selection in local state, navigate to `auth/phone` with role param
    - _Requirements: 12.1_

  - [x] 7.3 Create `app/auth/phone.tsx`
    - `PhoneInput` component with +63 prefix
    - On submit: call `authService.sendOtp(phone)`, navigate to `auth/otp`
    - _Requirements: 1.2, 2.1_

  - [x] 7.4 Create `app/auth/otp.tsx`
    - `OtpInput` 6-digit component
    - On submit: call `authStore.login(phone, code)`
    - On success: check if profile exists for role; navigate to `auth/profile-setup` or role home
    - Show inline error on wrong OTP
    - _Requirements: 1.3, 1.4, 1.5_

  - [x] 7.5 Create `app/auth/profile-setup.tsx`
    - Fields: display name, service address (for user) or government ID photo upload (for provider)
    - On submit: call `userStore.createProfile` or `providerStore.createProvider`
    - Navigate to role home tabs
    - _Requirements: 1.6, 2.2, 2.3_

- [ ] 8. Shared UI components
  - [x] 8.1 Create `components/auth/PhoneInput.tsx`
    - +63 prefix label, numeric keyboard, validation for 10-digit PH number
    - _Requirements: 1.2_

  - [x] 8.2 Create `components/auth/OtpInput.tsx`
    - 6 individual digit boxes, auto-advance focus, paste support
    - _Requirements: 1.3_

  - [x] 8.3 Create `components/shared/OrderCard.tsx`
    - Shows order ID (truncated), service type, scheduled date, status badge, agreed price
    - Pressable, accepts `onPress` prop
    - _Requirements: 7.6_

  - [x] 8.4 Create `components/shared/OrderStatusBadge.tsx`
    - Colored pill: accepted=blue, in_progress=orange, pending_confirmation=yellow, completed=green, cancelled=gray
    - _Requirements: 7.6_

  - [x] 8.5 Create `components/shared/NotificationBell.tsx`
    - Bell icon from `@expo/vector-icons`, red badge with `unreadCount` from `notificationStore`
    - _Requirements: 10.1_

  - [x] 8.6 Create `components/shared/MockPayButton.tsx`
    - "Pay Now" button; on press calls `orderService.mockPay(orderId)` then `orderService.mockRelease(orderId)`, shows success feedback
    - _Requirements: 8.3, 8.4_

  - [x] 8.7 Create `components/shared/EmptyState.tsx`
    - Icon + title + subtitle props, centered layout
    - _Requirements: 4.1, 6.1_

- [ ] 9. User-side screens
  - [x] 9.1 Create `app/user/_layout.tsx`
    - Bottom tabs: Home, Post Task, My Orders, Profile
    - Icons from `@expo/vector-icons`
    - Show `NotificationBell` in header right for Home and Orders tabs
    - _Requirements: 12.3_

  - [x] 9.2 Create `app/user/home/index.tsx`
    - Fetch and display service listings via `serviceService.listServices()`
    - Filter bar: All / Regular Cleaning / Deep Cleaning
    - Render `ServiceCard` list; tap navigates to `user/home/provider/[id]`
    - Show `EmptyState` when list is empty
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 9.3 Create `components/user/ServiceCard.tsx`
    - Provider avatar (initials fallback), display name, service type badge, price, star rating, coverage areas
    - _Requirements: 4.1, 4.3_

  - [x] 9.4 Create `app/user/home/provider/[id].tsx`
    - Provider detail: name, rating, service description, price, coverage areas, photos
    - Reviews list with star rating and comment
    - _Requirements: 4.3, 9.4_

  - [x] 9.5 Create `app/user/post-task/index.tsx`
    - `TaskForm` component: service type picker, address input (pre-filled from user profile), date picker, time slot picker, budget min/max, optional special requirements
    - On submit: `orderStore.createTask(data)`, navigate to `user/orders`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 9.6 Create `components/user/TaskForm.tsx`
    - Controlled form with validation; all required fields must be non-empty; budget min ≤ max
    - _Requirements: 5.1, 5.2_

  - [x] 9.7 Create `app/user/orders/index.tsx`
    - List of user's orders via `orderStore.fetchOrders(userId, 'user')`
    - Render `OrderCard`; tap navigates to `user/orders/[id]`
    - Show `EmptyState` when no orders
    - _Requirements: 7.6_

  - [x] 9.8 Create `app/user/orders/[id].tsx`
    - Order detail: service info, status history timeline, provider info
    - If `status === 'pending_confirmation'`: show "Confirm Completion" button + `MockPayButton`
    - If `status === 'completed'` and no review: show `ReviewForm`
    - _Requirements: 7.4, 7.6, 8.3, 9.1_

  - [x] 9.9 Create `components/user/ReviewForm.tsx`
    - 5-star tap rating + optional text comment; submit calls `reviewService.createReview`
    - _Requirements: 9.1, 9.2_

  - [x] 9.10 Create `app/user/profile/index.tsx`
    - Display name, phone, service address (editable)
    - "Switch to Provider" button: calls `authStore.switchIdentity('provider')`, navigates accordingly
    - Logout button
    - _Requirements: 1.6, 12.4_

- [ ] 10. Provider-side screens
  - [x] 10.1 Create `app/provider/_layout.tsx`
    - Bottom tabs: Task Hall, My Services, My Orders, Profile
    - Show `NotificationBell` in header right for Task Hall and Orders tabs
    - _Requirements: 12.3_

  - [x] 10.2 Create `app/provider/task-hall/index.tsx`
    - Fetch open tasks via `orderStore.fetchTasks()`
    - Filter bar: service type + area text input
    - Render `TaskCard` list; tap navigates to `provider/task-hall/[id]`
    - Show `EmptyState` when no open tasks
    - _Requirements: 6.1, 6.2_

  - [x] 10.3 Create `components/provider/TaskCard.tsx`
    - Service type badge, address, date/time slot, budget range, posted time
    - _Requirements: 6.3_

  - [x] 10.4 Create `app/provider/task-hall/[id].tsx`
    - Task detail: all fields from `TaskCard` plus special requirements
    - "Accept Task" button: calls `orderStore.acceptTask(taskId, providerId)`
    - If provider not verified: show alert "Account pending verification"
    - If task already accepted: show alert "Task no longer available"
    - On success: navigate to `provider/orders`
    - _Requirements: 6.3, 6.4, 6.5, 2.6_

  - [x] 10.5 Create `app/provider/services/index.tsx`
    - List provider's services via `providerStore.fetchServices(providerId)`
    - "Add Service" button navigates to `provider/services/edit/new`
    - Tap existing service navigates to `provider/services/edit/[id]`
    - Toggle active/inactive inline
    - Show `EmptyState` when no services
    - _Requirements: 3.4, 3.5_

  - [x] 10.6 Create `app/provider/services/edit/[id].tsx`
    - `ServiceForm` for create (`id === 'new'`) and edit
    - On save: `providerStore.createService` or `providerStore.updateService`
    - Navigate back to `provider/services` on success
    - _Requirements: 3.1, 3.2, 3.3, 3.5_

  - [x] 10.7 Create `components/provider/ServiceForm.tsx`
    - Service type picker, description, price + unit picker, coverage areas (comma-separated), photo upload (min 1 via `expo-image-picker`), active toggle
    - Validate: at least 1 photo required
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 10.8 Create `app/provider/orders/index.tsx`
    - List provider's orders via `orderStore.fetchOrders(providerId, 'provider')`
    - Render `OrderCard`; tap navigates to `provider/orders/[id]`
    - Show `EmptyState` when no orders
    - _Requirements: 7.6_

  - [x] 10.9 Create `app/provider/orders/[id].tsx`
    - Order detail: service info, user info, status history timeline
    - If `status === 'accepted'`: show "Start Service" button → `updateOrderStatus('in_progress')`
    - If `status === 'in_progress'`: show "Complete Service" button + optional photo upload → `updateOrderStatus('pending_confirmation')`
    - _Requirements: 7.2, 7.3, 7.6_

  - [x] 10.10 Create `app/provider/profile/index.tsx`
    - Display name, phone, verification status badge, average rating, total reviews
    - Earnings summary: sum of released order amounts minus platform fee
    - "Switch to User" button: calls `authStore.switchIdentity('user')`
    - Logout button
    - _Requirements: 2.4, 2.5, 9.3, 12.4_

- [x] 11. Notification wiring
  - [x] 11.1 Wire `triggerNotification` calls into service layer
    - In `order.service.ts` `createOrder`: trigger `task_accepted` to user
    - In `order.service.ts` `updateOrderStatus` to `pending_confirmation`: trigger `order_pending_confirmation` to user
    - In `task.service.ts` `createTask`: trigger `new_task_available` to matching providers
    - In `order.service.ts` `mockRelease`: trigger `payment_completed` to both user and provider
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.2 Wire `notificationStore.fetchNotifications` into tab layouts
    - Call on mount and on tab focus in `app/user/_layout.tsx` and `app/provider/_layout.tsx`
    - _Requirements: 10.1_

- [x] 12. Checkpoint — Ensure all screens render and navigation flows work end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Property-based tests
  - [x] 13.1 Create `__tests__/properties/auth.property.test.ts`
    - [ ]* 13.1.1 Property 1: OTP authentication round-trip — for any valid PH phone number, `sendOtp` then `verifyOtp('123456')` returns session with correct phone
      - **Property 1: OTP Authentication Round-Trip**
      - **Validates: Requirements 1.2, 1.3, 1.5, 2.1**
    - [ ]* 13.1.2 Property 2: Wrong OTP rejected — for any phone and any code ≠ `123456`, `verifyOtp` throws and no session written
      - **Property 2: Wrong OTP Rejected**
      - **Validates: Requirements 1.4**
    - [ ]* 13.1.3 Property 3: Profile update persistence — for any user, updating display name and address retrieves exact values from storage
      - **Property 3: Profile Update Persistence**
      - **Validates: Requirements 1.6**

  - [x] 13.2 Create `__tests__/properties/provider.property.test.ts`
    - [ ]* 13.2.1 Property 4: New provider has `pending_review` status
      - **Property 4: Provider Registration Status Invariant**
      - **Validates: Requirements 2.3**
    - [ ]* 13.2.2 Property 5: Unverified provider cannot accept orders
      - **Property 5: Unverified Provider Cannot Accept Orders**
      - **Validates: Requirements 2.6**
    - [ ]* 13.2.3 Property 6: Service listing creation and browse round-trip
      - **Property 6: Service Listing Creation and Browse Round-Trip**
      - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - [ ]* 13.2.4 Property 7: Unpublish removes listing from browse
      - **Property 7: Unpublish Removes Listing from Browse**
      - **Validates: Requirements 3.5**
    - [ ]* 13.2.5 Property 8: Browse returns only verified provider listings
      - **Property 8: Browse Returns Only Verified Provider Listings**
      - **Validates: Requirements 4.1**

  - [x] 13.3 Create `__tests__/properties/task.property.test.ts`
    - [ ]* 13.3.1 Property 9: Filter returns only matching results
      - **Property 9: Filter Returns Only Matching Results**
      - **Validates: Requirements 4.2, 6.2**
    - [ ]* 13.3.2 Property 10: Browse list sorted by rating descending
      - **Property 10: Browse List Sorted by Rating Descending**
      - **Validates: Requirements 4.4**
    - [ ]* 13.3.3 Property 11: New task has `open` status
      - **Property 11: New Task Has Open Status**
      - **Validates: Requirements 5.1, 5.3**
    - [ ]* 13.3.4 Property 12: Task cancellation only before acceptance
      - **Property 12: Task Cancellation Only Before Acceptance**
      - **Validates: Requirements 5.4**
    - [ ]* 13.3.5 Property 13: Task Hall shows only open tasks
      - **Property 13: Task Hall Shows Only Open Tasks**
      - **Validates: Requirements 6.1**
    - [ ]* 13.3.6 Property 14: Accepting a task creates an order and updates task status
      - **Property 14: Accepting a Task Creates an Order and Updates Task Status**
      - **Validates: Requirements 6.4**
    - [ ]* 13.3.7 Property 15: Duplicate task acceptance rejected
      - **Property 15: Duplicate Task Acceptance Rejected**
      - **Validates: Requirements 6.5**

  - [x] 13.4 Create `__tests__/properties/order.property.test.ts`
    - [ ]* 13.4.1 Property 16: Order status machine validity
      - **Property 16: Order Status Machine Validity**
      - **Validates: Requirements 7.1, 7.2, 7.3**
    - [ ]* 13.4.2 Property 17: Order completion triggers payment release
      - **Property 17: Order Completion Triggers Payment Release**
      - **Validates: Requirements 7.4, 8.4**
    - [ ]* 13.4.3 Property 18: Pre-acceptance cancellation triggers refund
      - **Property 18: Pre-Acceptance Cancellation Triggers Refund**
      - **Validates: Requirements 8.5**

  - [x] 13.5 Create `__tests__/properties/payment.property.test.ts`
    - [ ]* 13.5.1 Property 19: Platform fee deduction invariant
      - **Property 19: Platform Fee Deduction Invariant**
      - **Validates: Requirements 8.6**

  - [x] 13.6 Create `__tests__/properties/review.property.test.ts`
    - [ ]* 13.6.1 Property 20: Review rating bounds enforcement
      - **Property 20: Review Rating Bounds Enforcement**
      - **Validates: Requirements 9.2**
    - [ ]* 13.6.2 Property 21: Provider average rating calculation
      - **Property 21: Provider Average Rating Calculation**
      - **Validates: Requirements 9.3, 9.4**

  - [x] 13.7 Create `__tests__/properties/notification.property.test.ts`
    - [ ]* 13.7.1 Property 22: Notification created on trigger events
      - **Property 22: Notification Created on Trigger Events**
      - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

  - [x] 13.8 Create `__tests__/properties/identity.property.test.ts`
    - [ ]* 13.8.1 Property 23: Dual identity persistence round-trip
      - **Property 23: Dual Identity Persistence Round-Trip**
      - **Validates: Requirements 12.4**
    - [ ]* 13.8.2 Property 24: Active identity persisted across sessions
      - **Property 24: Active Identity Persisted Across Sessions**
      - **Validates: Requirements 12.2**

- [x] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Route groups use plain directories (`auth/`, `user/`, `provider/`) — no parentheses
- All mock services simulate 100–300ms async delay
- OTP fixed code is `123456`; payment is fully mocked (tap = success)
- Property tests use `fast-check` with minimum 100 iterations each
- Admin features are out of MVP scope and not included in these tasks

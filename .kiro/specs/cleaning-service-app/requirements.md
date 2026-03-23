# Requirements Document

## Introduction

A Philippines-based home cleaning service booking platform connecting household users (C-side) with individual cleaners or cleaning companies (B-side). The MVP validates the core business flow: users post cleaning tasks, providers accept orders, complete service, process payment, and submit reviews.

The app is built on an existing Expo React Native project. The backend does not yet exist; all data will be served from local mock data during MVP development.

---

## Glossary

- **Platform**: The Expo React Native mobile application system described in this document
- **User**: A household customer who posts cleaning service requests via the App (C-side)
- **Provider**: An individual cleaner or cleaning company that offers and fulfills cleaning services via the App (B-side)
- **Task**: A cleaning service request posted by a User
- **Order**: The service transaction record created when a Provider accepts a Task
- **Admin**: Platform operations staff responsible for Provider verification and dispute resolution
- **OTP**: One-Time Password sent via SMS for phone number verification
- **GCash**: A Philippines-based mobile wallet payment service
- **Maya**: A Philippines-based mobile wallet payment service
- **FCM**: Firebase Cloud Messaging, used for push notifications
- **Government_ID**: A government-issued identity document required for Provider verification

---

## Requirements

### Requirement 1: User Registration and Login

**User Story:** As a Philippine household user, I want to register and log in to the App using my phone number, so that I can post cleaning service requests.

#### Acceptance Criteria

1. THE Platform SHALL support User account registration via phone number
2. WHEN a User submits a Philippine phone number (+63), THE Platform SHALL send an OTP verification code to that number
3. WHEN a User enters the correct OTP, THE Platform SHALL complete registration and automatically log the User in
4. IF a User enters an incorrect OTP, THEN THE Platform SHALL display a verification failure message and allow the User to request a new OTP
5. WHEN a registered User submits their phone number and correct OTP, THE Platform SHALL complete login and navigate to the home screen
6. THE User SHALL be able to enter a display name and service address as basic profile information after first login

---

### Requirement 2: Provider Registration and Verification

**User Story:** As a cleaner or cleaning company, I want to register and complete identity verification, so that I can accept orders on the platform.

#### Acceptance Criteria

1. THE Platform SHALL support Provider account registration via phone number using the same OTP flow as Requirement 1
2. WHEN a Provider registers, THE Platform SHALL require the Provider to upload a photo of a valid Government_ID
3. WHEN a Provider submits a registration application, THE Platform SHALL set the Provider account status to "Pending Review"
4. WHEN an Admin approves a Provider application, THE Platform SHALL update the Provider account status to "Verified" and send a notification to the Provider
5. IF an Admin rejects a Provider application, THEN THE Platform SHALL notify the Provider with a stated rejection reason
6. WHILE a Provider account status is "Pending Review", THE Platform SHALL prevent that Provider from accepting orders or publishing services

---

### Requirement 3: Provider Service Listing

**User Story:** As a verified Provider, I want to publish my cleaning service information, so that Users can find and select me.

#### Acceptance Criteria

1. WHEN a verified Provider creates a service listing, THE Provider SHALL be able to select a service type of either "Regular Cleaning" or "Deep Cleaning"
2. THE Provider SHALL be able to enter a service description, set a service price (per hour or per session), and specify service coverage areas
3. THE Provider SHALL be able to upload at least one service photo
4. WHEN a service listing is successfully published, THE Platform SHALL display the listing in the service browse list
5. THE Provider SHALL be able to edit or unpublish any of their active service listings at any time

---

### Requirement 4: User Browse and Search Providers

**User Story:** As a User, I want to browse and filter available cleaning providers, so that I can find a suitable service.

#### Acceptance Criteria

1. THE Platform SHALL display a list of verified Provider service listings, each showing service type, price, and average rating
2. THE User SHALL be able to filter the service list by service type ("Regular Cleaning" or "Deep Cleaning")
3. THE User SHALL be able to view a Provider detail page containing service description, price, service area, and past reviews
4. WHEN a User views the service list, THE Platform SHALL sort listings by average rating in descending order by default

---

### Requirement 5: User Post Cleaning Task

**User Story:** As a User, I want to post a cleaning task request, so that Providers can proactively accept my order.

#### Acceptance Criteria

1. THE User SHALL be able to post a Task containing service type, service address, desired date and time slot, and budget range
2. THE User SHALL be able to include an optional special requirements note in the Task
3. WHEN a Task is successfully posted, THE Platform SHALL set the Task status to "Open" and display it in the Task Hall
4. THE User SHALL be able to cancel or edit a Task before it has been accepted by a Provider
5. IF a Task has not been accepted within 24 hours of posting, THEN THE Platform SHALL send a notification to the User indicating the Task is still unaccepted

---

### Requirement 6: Provider Browse and Accept Tasks

**User Story:** As a Provider, I want to browse the Task Hall and accept orders, so that I can obtain work opportunities.

#### Acceptance Criteria

1. THE Provider SHALL be able to view all Tasks with status "Open" in the Task Hall
2. THE Provider SHALL be able to filter Tasks by service type and service area
3. THE Provider SHALL be able to view Task details including service type, address, time slot, budget, and special requirements
4. WHEN a Provider accepts a Task, THE Platform SHALL create an Order, update the Task status to "Accepted", and send a notification to the User
5. IF a Task has already been accepted by another Provider, THEN THE Platform SHALL prevent duplicate acceptance and display a message indicating the Task is no longer available

---

### Requirement 7: Order Lifecycle Management

**User Story:** As a User and as a Provider, I want to track order status, so that both parties have clear visibility into service progress.

#### Acceptance Criteria

1. THE Platform SHALL support the following Order status transitions: Open → Accepted → In Progress → Pending Confirmation → Completed
2. WHEN a Provider starts the service, THE Provider SHALL be able to update the Order status to "In Progress"
3. WHEN a Provider finishes the service, THE Provider SHALL be able to update the Order status to "Pending Confirmation" and optionally upload service completion photos
4. WHEN a User confirms acceptance of the completed service, THE Platform SHALL update the Order status to "Completed" and trigger payment settlement
5. IF a User has not confirmed acceptance within 48 hours of the Order reaching "Pending Confirmation" status, THEN THE Platform SHALL automatically confirm acceptance and trigger payment settlement
6. THE User and THE Provider SHALL each be able to view Order details and status history within the App

---

### Requirement 8: Payment

**User Story:** As a User, I want to pay using local Philippine payment methods, so that I can complete service payments securely and conveniently.

#### Acceptance Criteria

1. THE Platform SHALL support GCash and Maya as primary payment methods
2. THE Platform SHALL support Visa and Mastercard credit and debit card payments
3. WHEN a User confirms an Order, THE Platform SHALL require the User to complete a full prepayment that is held in escrow
4. WHEN an Order status changes to "Completed", THE Platform SHALL release the escrowed funds to the Provider's account
5. IF an Order is cancelled before the Order status reaches "Accepted", THEN THE Platform SHALL issue a full refund to the User's original payment method
6. THE Platform SHALL deduct a platform service fee from each successfully settled transaction at a rate configured by the Admin

---

### Requirement 9: Review System

**User Story:** As a User, I want to rate and review completed services, so that I can help other Users choose reliable Providers.

#### Acceptance Criteria

1. WHEN an Order status changes to "Completed", THE Platform SHALL prompt the User to submit a review for the Provider
2. THE User SHALL be able to submit a star rating from 1 to 5 and an optional text review
3. THE Provider SHALL be able to view all reviews received and their current average rating
4. THE Platform SHALL display the Provider's average rating and most recent reviews on the Provider detail page
5. IF a User has not submitted a review within 7 days of Order completion, THEN THE Platform SHALL close the review submission entry for that Order

---

### Requirement 10: In-App and Push Notifications

**User Story:** As a User and as a Provider, I want to receive timely notifications about order status changes, so that I can respond quickly.

#### Acceptance Criteria

1. WHEN a Provider accepts a Task, THE Platform SHALL send an in-app notification to the User
2. WHEN a Provider updates an Order to "Pending Confirmation", THE Platform SHALL send an in-app notification to the User
3. WHEN a User posts a new Task, THE Platform SHALL send in-app notifications to Providers whose service type and area match the Task
4. WHEN an Order payment is completed, THE Platform SHALL send confirmation notifications to both the User and the Provider
5. THE Platform SHALL use Firebase Cloud Messaging (FCM) to deliver push notifications when the App is in the background or closed

---

### Requirement 11: Admin Basic Functions

**User Story:** As a platform Admin, I want to review Provider applications and manage orders, so that I can maintain platform service quality.

#### Acceptance Criteria

1. THE Admin SHALL be able to view a list of Providers with "Pending Review" status and inspect their submitted Government_ID materials
2. THE Admin SHALL be able to approve or reject a Provider registration application
3. THE Admin SHALL be able to view all Orders and their details
4. THE Admin SHALL be able to process refund requests
5. THE Admin SHALL be able to freeze or ban a User or Provider account for policy violations

---

### Requirement 12: Identity Selection and Role-Based Navigation

**User Story:** As a new user, I want to select my identity (User or Provider) upon first login, so that I enter the correct role-specific interface.

#### Acceptance Criteria

1. WHEN a user logs in for the first time, THE Platform SHALL present two identity options: "I am a User" and "I am a Provider"
2. WHEN a user selects an identity, THE Platform SHALL persist the account's identity type and automatically navigate to the corresponding interface on subsequent logins
3. THE Platform SHALL display a completely different bottom navigation bar and feature set based on the selected identity type
4. THE Platform SHALL allow the same phone number to register both a User identity and a Provider identity, with an identity switch entry available on the login screen
5. WHEN a user is logged in as a User, THE Platform SHALL hide all Provider-exclusive feature entry points
6. WHEN a user is logged in as a Provider, THE Platform SHALL hide all User-exclusive feature entry points (such as Post Task)

#### User-Side (C-Side) Navigation Structure

Bottom navigation bar contains 4 tabs:

| Tab | Description |
|-----|-------------|
| Home | Browse Provider listings, filter by rating/price |
| Post Task | Create a new cleaning Task request |
| My Orders | View order list and status, confirm acceptance, submit reviews |
| Profile | Account info, service address management, notification settings |

#### Provider-Side (B-Side) Navigation Structure

Bottom navigation bar contains 4 tabs:

| Tab | Description |
|-----|-------------|
| Task Hall | Browse open Tasks, filter and accept orders |
| My Services | Manage published service listings, add/edit/unpublish |
| My Orders | View accepted orders, update service status, upload completion photos |
| Profile | Account info, earnings summary, verification status |

---

## MVP Scope Exclusions (Phase 1)

The following features are explicitly out of scope for Phase 1:

- In-app instant messaging between Users and Providers
- Real-time location tracking and navigation
- Coupons and promotional campaigns
- Membership or loyalty programs
- Intelligent recommendation algorithms
- Full analytics and reporting dashboards
- Multi-language support (Tagalog)
- Invoice generation

---

## Technical Constraints

- Framework: Expo React Native (existing project)
- Backend: Not yet available; all data served from local mock data during MVP
- UI Language: English (official language of the Philippines)
- Payment: GCash, Maya, Visa/Mastercard (may be mocked in MVP)
- OTP: Philippine +63 numbers (may be mocked in MVP)
- Data Privacy: Must comply with the Philippine Data Privacy Act (Republic Act No. 10173)

# Sport Booking WebApp - Requirements

## 1. Document Purpose

This document describes the functional and non-functional requirements of Sport Booking WebApp. It is the foundation for database design, API design, UI design, and development planning.

## 2. Functional Requirements

### 2.1. Authentication

Requirement ID: **FR-AUTH**

- Users can register an account with full name, email, phone number, and password or Google account.
- Users can log in with email and password or Google account.
- The system returns a JWT after successful login.
- Logged-in users can view their profile information.
- Passwords must be encrypted before being stored in the database.
- The system supports at least three roles: `USER`, `VENDOR`, and `ADMIN`.
- `USER` represents a customer who books courts.
- `VENDOR` represents a court owner or venue operator who manages their own venues, courts, and bookings.
- `ADMIN` represents a system administrator who manages platform-level data, user accounts, vendors, and system policies.

### 2.2. Sport Management

Requirement ID: **FR-SPORT**

- Users can view the list of sports.
- Admin can create a sport.
- Admin can update a sport.
- Admin can delete or deactivate a sport.
- Vendor can use existing active sports when creating or updating their courts.

Example sports:

- Football
- Badminton
- Pickleball
- Tennis
- Basketball

### 2.3. Venue Management

Requirement ID: **FR-VENUE**

- Users can view the list of venues.
- Users can view venue details.
- Vendor can create a venue.
- Vendor can update their own venues.
- Vendor can delete or deactivate their own venues if business rules allow it.
- Admin can view all venues.
- Admin can approve, reject, deactivate, or moderate venues if needed.

Venue information includes:

- Venue name
- Address
- Description
- Contact phone number
- Opening time
- Closing time

### 2.4. Court Management

Requirement ID: **FR-COURT**

- Users can view the list of courts.
- Users can filter courts by sport and venue.
- Users can view court details.
- Vendor can create courts under their own venues.
- Vendor can update their own courts.
- Vendor can delete or deactivate their own courts if business rules allow it.
- Admin can view all courts.
- Admin can deactivate or moderate courts if needed.

Court information includes:

- Court name
- Sport
- Venue
- Hourly price
- Operating status
- Description

### 2.5. Time Slot Management

Requirement ID: **FR-TIMESLOT**

- The system has a list of bookable time slots.
- Users can view available time slots for a court by date.
- Vendor can manage bookable time slots for their own courts if needed.
- Admin can manage global time slot templates if the system uses shared time slots.

Example time slots:

- 06:00 - 07:00
- 07:00 - 08:00
- 18:00 - 19:00
- 19:00 - 20:00

### 2.6. Booking

Requirement ID: **FR-BOOKING**

- Logged-in users can book a court.
- Each booking belongs to one user, one court, one date, and one time slot.
- The system does not allow duplicate bookings for the same court, date, and time slot.
- The system does not allow bookings in the past.
- Users can view their own booking history.
- Users can cancel a booking if the booking has not happened yet.
- Vendor can view bookings for their own courts.
- Vendor can confirm or cancel bookings for their own courts.
- Admin can view all bookings for monitoring and support.
- Admin can cancel or moderate bookings if there is a system-level issue.

Booking statuses:

- `PENDING`: waiting for confirmation
- `CONFIRMED`: confirmed
- `REJECTED`: rejected
- `CANCELLED`: cancelled
- `COMPLETED`: completed

### 2.7. Vendor Dashboard

Requirement ID: **FR-VENDOR**

- Vendor can access the vendor management area.
- Vendor can view basic statistics for their own venues and courts.
- Vendor can manage their own venues.
- Vendor can manage their own courts.
- Vendor can manage bookings for their own courts.
- Vendor cannot manage venues, courts, or bookings that belong to another vendor.

### 2.8. Admin Dashboard

Requirement ID: **FR-ADMIN**

- Admin can access the admin area.
- Admin can view platform-level statistics.
- Admin can manage sports.
- Admin can manage user and vendor accounts.
- Admin can view and moderate venues.
- Admin can view and moderate courts.
- Admin can view and moderate bookings.
- Admin can configure system-level settings and policies.

## 3. Non-functional Requirements

### 3.1. Security

Requirement ID: **NFR-SECURITY**

- Passwords must be encrypted with BCrypt or an equivalent solution.
- Protected APIs must require a valid JWT.
- Users must not access Vendor or Admin APIs.
- Vendors must not access Admin APIs.
- Vendors can only manage venues, courts, and bookings that belong to them.
- Users can only view and manage their own bookings.

### 3.2. Architecture

Requirement ID: **NFR-ARCH**

- Backend is organized into Controller, Service, Repository, Entity, and DTO layers.
- Controllers only handle requests and responses.
- Services contain business logic.
- Repositories only handle database access.
- Frontend is separated into pages, components, API clients, and routes.

### 3.3. Performance

Requirement ID: **NFR-PERFORMANCE**

- List APIs should support pagination when data grows.
- Duplicate booking checks must be done directly against the database.
- API responses should return only necessary data and avoid exposing sensitive information.

### 3.4. Maintainability

Requirement ID: **NFR-MAINTAINABILITY**

- Code should use clear names.
- Important values such as database passwords and secret keys must not be hard-coded.
- Environment-specific configuration should be stored in config files or environment variables.
- API errors should use a consistent response format.

### 3.5. User Interface

Requirement ID: **NFR-UI**

- The UI should be simple and easy to use.
- The UI should be responsive on desktop and mobile.
- Forms should have labels, placeholders, and basic error messages.
- Management tables should have clear view, edit, and delete actions.

## 4. Priority

### Must Have

- Register and log in.
- View the list of sports.
- View the list of courts.
- Book a court.
- View booking history.
- Vendor manages their own venues, courts, and bookings.
- Admin manages sports and platform-level user/vendor administration.

### Should Have

- Filter courts by sport.
- Filter courts by venue.
- Cancel bookings.
- Vendor confirms bookings.
- Admin moderates bookings when needed.

### Could Have

- Court thumbnail image.
- Search court by name.
- Basic dashboard statistics.
- Vendor onboarding flow.

### Won't Have in MVP

- Online payment.
- Chat.
- Map.
- Court reviews.

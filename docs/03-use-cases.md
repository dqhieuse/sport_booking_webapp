# Sport Booking WebApp - Use Cases

## 1. Document Purpose

This document describes the main use cases of the system. Each use case clarifies the actor, preconditions, main flow, alternative flow, and expected result.

## 2. Actor List

### Guest

A visitor who has not logged in.

Can:

- View the home page.
- View the list of sports.
- View the list of courts.
- View court details.
- Register.
- Log in.

### User

A logged-in user.

Can:

- Use all Guest features without log in and register features.
- Book a court.
- View booking history.
- Cancel their own bookings.
- View profile information.

### Vendor

A court owner or venue operator.

Can:

- Manage their own venues.
- Manage their own courts.
- View bookings for their own courts.
- Confirm or cancel bookings for their own courts.
- View basic statistics for their own business.

### Admin

A system administrator.

Can:

- Manage sports.
- Manage user and vendor accounts.
- View and moderate venues.
- View and moderate courts.
- View and moderate bookings.
- Manage platform-level settings.

## 3. Use Case UC-01: Register Account

Actor: Guest

Goal: Create a new account and verify the user's email before allowing booking features.

Preconditions:

- Guest is not logged in.
- Email does not already exist in the system.
- Email verification service is available.

Main flow:

1. Guest opens the registration page.
2. Guest enters full name, email, phone number, and password.
3. Guest clicks the register button.
4. The system validates the input data.
5. The system encrypts the password.
6. The system creates a new user with the `USER` role and `PENDING_VERIFICATION` status.
7. The system generates an email verification token.
8. The system sends a verification email to the registered email address.
9. The system shows a message asking the user to verify their email.
10. Guest opens the verification link from the email.
11. The system validates the verification token.
12. The system activates the account.
13. The system shows a successful email verification message.

Alternative flow:

- If the email already exists, the system shows an error message.
- If the input data is invalid, the system shows validation errors on the form.
- If the email verification token is invalid or expired, the system shows an error and allows the user to request a new verification email.
- If the email cannot be delivered, the account remains `PENDING_VERIFICATION` and cannot be used for booking.
- If the user registers with Google account, the system can treat the email as already verified if the provider returns a verified email.

Result:

- A new user account is created in the database.
- The account can only log in and book courts after email verification is completed.

Cleanup rule:

- Unverified accounts should be deleted or deactivated automatically after a configured period, for example 24-72 hours, to reduce database growth from fake or temporary emails.

## 4. Use Case UC-02: Log In

Actor: Guest

Goal: Log in to the system using email/password, phone number/password, or Google account.

Preconditions:

- The account already exists, or the Google email can be matched to an existing account or used to create a new account.

Main flow:

1. Guest opens the login page.
2. Guest enters email or phone number and password.
3. Guest clicks the login button.
4. The system validates the email/phone number and password.
5. The system checks that the account is active and email is verified.
6. The system generates an access token and a refresh token.
7. The frontend stores the tokens.
8. The system redirects the user to the home page or the previous page.

Alternative flow:

- If email, phone number, or password is incorrect, the system shows an error message.
- If the account is disabled, the system shows a login blocked message.
- If the account email is not verified, the system asks the user to verify email or resend verification email.
- If the user chooses Google login, the frontend redirects the user to Google authentication.
- If Google authentication succeeds and the email already exists, the system logs in that account.
- If Google authentication succeeds and the email does not exist, the system creates a new `USER` account with verified email, then logs in the user.
- If Google does not return a verified email, the system rejects login or requires email verification.
- If the Google account email belongs to an existing password-based account, the system can link the Google login provider after confirming the email is verified.

Result:

- User logs in successfully and can call protected APIs.

## 5. Use Case UC-03: Refresh Access Token

Actor: User, Vendor, Admin

Goal: Get a new access token without logging in again.

Preconditions:

- Actor has a valid refresh token.
- Refresh token is not expired or revoked.

Main flow:

1. Frontend detects that the access token is expired or close to expiration.
2. Frontend sends the refresh token to the refresh API.
3. The system validates the refresh token.
4. The system issues a new access token.
5. The system may rotate the refresh token.
6. Frontend stores the new token values.

Alternative flow:

- If the refresh token is invalid, expired, or revoked, the system returns 401 and requires login again.

Result:

- Actor can continue using protected APIs without entering credentials again.

## 6. Use Case UC-04: Log Out

Actor: User, Vendor, Admin

Goal: End the current login session.

Preconditions:

- Actor is logged in.

Main flow:

1. Actor clicks logout.
2. Frontend sends the refresh token to the logout API.
3. The system revokes the refresh token.
4. Frontend clears local authentication data.
5. The system redirects the actor to the login page or home page.

Alternative flow:

- If the refresh token is already expired or revoked, frontend still clears local authentication data.

Result:

- Actor is logged out and the refresh token can no longer be used.

## 7. Use Case UC-05: View Court List

Actor: Guest, User, Vendor, Admin

Goal: View active sports courts.

Preconditions:

- The system has court data.

Main flow:

1. Actor opens the court list page.
2. Frontend calls the API to get the court list.
3. The system returns the court list.
4. Frontend displays court name, sport, venue, price, and status.

Alternative flow:

- If there are no courts, the system shows an empty list message.
- If the API fails, the frontend shows an error message.

Result:

- Actor can view the court list.

## 8. Use Case UC-06: View Court Details

Actor: Guest, User, Vendor, Admin

Goal: View detailed information about a court.

Preconditions:

- The court exists and is active.

Main flow:

1. Actor selects a court from the list.
2. Frontend calls the API to get court details.
3. The system returns court information.
4. Frontend displays detailed information, price, and booking action.

Alternative flow:

- If the court does not exist, the system returns 404.
- If the court is disabled, the system shows an unavailable message.

Result:

- Actor can view court details.

## 9. Use Case UC-07: View Available Time Slots

Actor: User

Goal: Check available time slots for a court by date.

Preconditions:

- User is logged in.
- The court exists.
- The court has active configured time slots.
- The selected date is not in the past.

Main flow:

1. User opens the booking page.
2. User selects a booking date.
3. Frontend calls the API to get available time slots for the court and date.
4. The system loads active time slots configured for the court from `court_time_slots`.
5. The system excludes time slots that already have valid bookings.
6. The system returns the available time slots.
7. Frontend displays the available time slots.

Alternative flow:

- If the selected date is in the past, the system shows an error message.
- If the court has no active configured time slots, the frontend shows that the court is not available for booking.
- If there are no available time slots, the frontend shows a fully booked message.

Result:

- User knows which time slots can be booked.

## 10. Use Case UC-08: Book Court

Actor: User

Goal: Create a court booking.

Preconditions:

- User is logged in.
- Court exists and is active.
- Selected time slot is available.
- Selected time slot is enabled for the selected court.
- Booking date is not in the past.
- User selects a payment method.

Main flow:

1. User selects a court.
2. User selects a date.
3. User selects a time slot.
4. User selects a payment method. The preferred method is prepaid online payment through VNPAY.
5. User clicks confirm booking.
6. The system validates the court, date, time slot, court time slot configuration, and payment method again.
7. The system checks duplicate bookings.
8. The system creates a booking with status `PENDING`.
9. The system creates payment information based on the selected payment method.

Payment flow A: VNPAY prepaid

1. The system creates a payment request with payment method `VNPAY` and payment status `PENDING`.
2. The system redirects the user to the VNPAY payment page.
3. User completes payment on VNPAY.
4. VNPAY redirects the user back to the system.
5. The system verifies the VNPAY callback/signature.
6. If payment succeeds, the system updates payment status to `PAID`.
7. The booking remains `PENDING` until Vendor confirms, or becomes `CONFIRMED` automatically if auto-confirmation is enabled.
8. Frontend shows a successful booking and payment message.

Payment flow B: Cash at court

1. The system creates a booking with payment method `CASH_AT_COURT` and payment status `UNPAID`.
2. The booking remains `PENDING` and waits for Vendor confirmation.
3. User pays directly at the venue.
4. Vendor marks the payment as paid when receiving cash.
5. The system updates payment status to `PAID`.

Alternative flow:

- If the time slot has just been booked by another user, the system shows that it is no longer available.
- If the user is not logged in, the frontend redirects to the login page.
- If the data is invalid, the system shows an error message.
- If VNPAY payment fails, the booking stays unpaid or is automatically cancelled after a configured timeout.
- If VNPAY callback verification fails, the system does not mark the payment as paid.
- If the user chooses cash at court, the system may require Vendor confirmation before the booking is considered valid.

Result:

- A new booking is created in the database.
- Payment information is created with one of the supported methods: `VNPAY` or `CASH_AT_COURT`.
- Prepaid VNPAY booking is preferred because it reduces no-show risk.

## 11. Use Case UC-09: View Booking History

Actor: User

Goal: View the user's own bookings.

Preconditions:

- User is logged in.

Main flow:

1. User opens the booking history page.
2. Frontend calls the API to get bookings of the current user.
3. The system returns the booking list.
4. Frontend displays court, date, time slot, total price, and status.

Alternative flow:

- If the user has no bookings, frontend shows an empty list message.

Result:

- User can view their own booking history.

## 12. Use Case UC-10: Cancel Booking

Actor: User

Goal: Cancel one of the user's own bookings.

Preconditions:

- User is logged in.
- Booking belongs to the current user.
- Booking has not happened yet.
- Booking is not already `CANCELLED` or `COMPLETED`.

Main flow:

1. User opens booking history.
2. User selects a booking to cancel.
3. User clicks cancel booking.
4. The system checks booking ownership.
5. The system checks booking status.
6. The system checks payment status.
7. The system updates the booking status to `CANCELLED`.
8. The system handles refund logic if the booking was already paid.
9. Frontend shows a successful cancellation message.

Alternative flow:

- If the booking does not belong to the user, the system returns 403.
- If the booking is already completed, the system does not allow cancellation.
- If the booking was not paid, the system only updates booking status to `CANCELLED`.
- If the booking was paid through VNPAY and still satisfies the cancellation policy, the system creates a refund request or marks the booking as `REFUND_PENDING`.
- If the booking was paid through VNPAY but is outside the refundable cancellation window, the system cancels the booking without refund or requires Vendor/Admin review.
- If the booking was marked as paid by cash at court, cancellation should normally require Vendor confirmation because payment was handled offline.
- If refund processing fails, the booking remains `CANCELLED` but refund status should be marked as `REFUND_FAILED` for Vendor/Admin follow-up.

Result:

- Booking status is updated to `CANCELLED`.
- If the booking was paid, refund status is tracked separately from booking status.

## 13. Use Case UC-11: Vendor Manage Venues

Actor: Vendor

Goal: Create, update, delete, or deactivate venues owned by the vendor.

Preconditions:

- Vendor is logged in.

Main flow:

1. Vendor opens the venue management page.
2. The system displays only venues owned by the vendor.
3. Vendor creates, updates, or deactivates a venue.
4. The system validates the input data.
5. The system saves the changes.
6. Frontend refreshes the venue list.

Alternative flow:

- If the venue already has courts or bookings, the system should deactivate it instead of hard deleting it.
- If the input data is invalid, the frontend shows an error message.
- If the vendor tries to update another vendor's venue, the system returns 403.

Result:

- Venue data is updated.

## 14. Use Case UC-12: Vendor Manage Courts

Actor: Vendor

Goal: Create, update, delete, or deactivate courts under the vendor's venues.

Preconditions:

- Vendor is logged in.
- The target venue belongs to the vendor.

Main flow:

1. Vendor opens the court management page.
2. The system displays only courts under the vendor's venues.
3. Vendor creates, updates, or deactivates a court.
4. The system validates the input data and venue ownership.
5. The system saves the changes.
6. Frontend refreshes the court list.

Alternative flow:

- If the court already has bookings, the system should deactivate it instead of hard deleting it.
- If the vendor tries to manage a court under another vendor's venue, the system returns 403.
- If the input data is invalid, the frontend shows an error message.

Result:

- Court data is updated.

## 15. Use Case UC-13: Vendor Manage Bookings

Actor: Vendor

Goal: Monitor and update booking statuses.

Preconditions:

- Vendor is logged in.

Main flow:

1. Vendor opens the booking management page.
2. The system displays bookings for the vendor's courts.
3. Vendor filters bookings by date, status, or court.
4. Vendor confirms or cancels a booking.
5. The system updates the booking status.
6. Frontend displays the new status.

Alternative flow:

- If the booking does not exist, the system returns 404.
- If the booking belongs to another vendor's court, the system returns 403.
- If the booking is already completed, the system does not allow invalid status updates.

Result:

- Booking status is updated according to business rules.

## 16. Use Case UC-14: Admin Moderate Platform Data

Actor: Admin

Goal: Monitor and moderate users, vendors, venues, courts, and bookings at the platform level.

Preconditions:

- Admin is logged in.

Main flow:

1. Admin opens the admin dashboard.
2. The system displays platform-level data.
3. Admin searches or filters users, vendors, venues, courts, or bookings.
4. Admin performs a moderation action if needed.
5. The system saves the change.

Alternative flow:

- If the target data does not exist, the system returns 404.
- If the moderation action violates business rules, the system rejects the action.

Result:

- Platform-level data is reviewed or moderated.

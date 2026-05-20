# Sport Booking WebApp - API Specification Draft

## 1. Document Purpose

This document describes the draft REST API for the Spring Boot backend. The React frontend will call these APIs using Axios.

## 2. General Conventions

Base URL when running locally:

```text
http://localhost:8080/api
```

Response content type:

```text
application/json
```

Header for APIs that require login:

```text
Authorization: Bearer <access_token>
```

## 3. Suggested Response Structure

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Failure:

```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 4. Auth API

### 4.1. Register

```text
POST /auth/register
```

Auth: Not required

Request body:

```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "phone": "0900000000",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Register successfully. Please verify your email.",
  "data": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "user@example.com",
    "phone": "0900000000",
    "role": "USER",
    "status": "PENDING_VERIFICATION",
    "emailVerified": false
  }
}
```

### 4.2. Verify Email

```text
GET /auth/verify-email
```

Auth: Not required

Query params:

```text
token=
```

Response:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "emailVerified": true,
    "status": "ACTIVE"
  }
}
```

### 4.3. Resend Verification Email

```text
POST /auth/resend-verification
```

Auth: Not required

Request body:

```json
{
  "email": "user@example.com"
}
```

### 4.4. Login

```text
POST /auth/login
```

Auth: Not required

Request body:

```json
{
  "identifier": "user@example.com",
  "password": "123456"
}
```

Note:

- `identifier` can be either email or phone number.
- Backend should detect the identifier type and find the user by email or phone.

Response:

```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "accessToken": "access-token",
    "refreshToken": "refresh-token",
    "expiresIn": 1800,
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@example.com",
      "avatarUrl": "https://cdn.example.com/avatars/user-1.jpg",
      "role": "USER",
      "emailVerified": true
    }
  }
}
```

### 4.5. Google Login

```text
POST /auth/google
```

Auth: Not required

Request body:

```json
{
  "idToken": "google-id-token"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successfully",
  "data": {
    "accessToken": "access-token",
    "refreshToken": "refresh-token",
    "expiresIn": 1800,
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@example.com",
      "avatarUrl": "https://cdn.example.com/avatars/user-1.jpg",
      "role": "USER",
      "provider": "GOOGLE",
      "emailVerified": true
    }
  }
}
```

### 4.6. Refresh Token

```text
POST /auth/refresh-token
```

Auth: Not required

Request body:

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-access-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 1800
  }
}
```

Note:

- Backend should validate that the refresh token exists, is not expired, and is not revoked.
- Refresh token rotation is recommended: when a new refresh token is issued, the old one should be revoked.
- Store only refresh token hash in the database.

### 4.7. Logout

```text
POST /auth/logout
```

Auth: USER, VENDOR, ADMIN

Request body:

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "success": true,
  "message": "Logout successfully",
  "data": null
}
```

Note:

- Backend revokes the refresh token.
- Frontend should clear access token, refresh token, and user data.

### 4.8. Get Current User

```text
GET /auth/me
```

Auth: USER, VENDOR, ADMIN

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "fullName": "Nguyen Van A",
    "email": "user@example.com",
    "phone": "0900000000",
    "avatarUrl": "https://cdn.example.com/avatars/user-1.jpg",
    "role": "USER",
    "emailVerified": true
  }
}
```

### 4.9. Upload Current User Avatar

```text
POST /auth/me/avatar
```

Auth: USER, VENDOR, ADMIN

Content type:

```text
multipart/form-data
```

Form data:

```text
file=<image_file>
```

Response:

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatarUrl": "https://cdn.example.com/avatars/user-1.jpg"
  }
}
```

Note:

- Backend should validate file type and file size.
- Accepted file types should be limited to common image formats such as JPG, PNG, or WebP.
- The returned `avatarUrl` is saved in `users.avatar_url`.
- Storage can be local for development and object storage for production.
- Avatar, venue image, and court image APIs should reuse the same internal image storage service.

### 4.10. Admin Creates Vendor Account

```text
POST /admin/vendors
```

Auth: ADMIN

Request body:

```json
{
  "fullName": "ABC Sports Owner",
  "email": "vendor@example.com",
  "phone": "0911111111",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Vendor account created successfully",
  "data": {
    "id": 2,
    "fullName": "ABC Sports Owner",
    "email": "vendor@example.com",
    "phone": "0911111111",
    "role": "VENDOR",
    "status": "ACTIVE"
  }
}
```

### 4.11. Admin Updates User Status or Role

```text
PUT /admin/users/{id}
```

Auth: ADMIN

Request body:

```json
{
  "role": "VENDOR",
  "status": "ACTIVE"
}
```

## 5. Sport API

### 5.1. Get Sport List

```text
GET /sports
```

Auth: Not required

Query params:

```text
status=ACTIVE
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "name": "Badminton",
      "description": "Indoor racket sport",
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "name": "Football",
      "description": "Outdoor team sport",
      "status": "ACTIVE"
    }
  ]
}
```

### 5.2. Get Sport Details

```text
GET /sports/{id}
```

Auth: Not required

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Badminton",
    "description": "Indoor racket sport",
    "status": "ACTIVE"
  }
}
```

### 5.3. Create Sport

```text
POST /admin/sports
```

Auth: ADMIN

Request body:

```json
{
  "name": "Pickleball",
  "description": "Pickleball sport"
}
```

### 5.4. Update Sport

```text
PUT /admin/sports/{id}
```

Auth: ADMIN

### 5.5. Delete or Deactivate Sport

```text
DELETE /admin/sports/{id}
```

Auth: ADMIN

## 6. Venue API

### 6.1. Get Venue List

```text
GET /venues
```

Auth: Not required

Query params:

```text
keyword=
status=ACTIVE
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "ABC Sports Complex",
        "address": "District 1, Ho Chi Minh City",
        "phone": "0900000000",
        "openingTime": "06:00",
        "closingTime": "22:00",
        "status": "ACTIVE",
        "primaryImageUrl": "https://cdn.example.com/venues/venue-1-1.jpg"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 6.2. Get Venue Details

```text
GET /venues/{id}
```

Auth: Not required

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "ABC Sports Complex",
    "address": "District 1, Ho Chi Minh City",
    "description": "Multi-sport venue",
    "phone": "0900000000",
    "openingTime": "06:00",
    "closingTime": "22:00",
    "status": "ACTIVE",
    "vendor": {
      "id": 2,
      "fullName": "ABC Sports Owner"
    },
    "images": [
      {
        "id": 1,
        "imageUrl": "https://cdn.example.com/venues/venue-1-1.jpg",
        "isPrimary": true,
        "sortOrder": 1
      }
    ]
  }
}
```

### 6.3. Create Venue

```text
POST /vendor/venues
```

Auth: VENDOR

Request body:

```json
{
  "name": "ABC Sports Complex",
  "address": "District 1, Ho Chi Minh City",
  "description": "Multi-sport venue",
  "phone": "0900000000",
  "openingTime": "06:00",
  "closingTime": "22:00"
}
```

### 6.4. Update Own Venue

```text
PUT /vendor/venues/{id}
```

Auth: VENDOR

### 6.5. Delete or Deactivate Own Venue

```text
DELETE /vendor/venues/{id}
```

Auth: VENDOR

### 6.6. Admin Gets All Venues

```text
GET /admin/venues
```

Auth: ADMIN

Query params:

```text
vendorId=
status=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "ABC Sports Complex",
        "address": "District 1, Ho Chi Minh City",
        "status": "ACTIVE",
        "primaryImageUrl": "https://cdn.example.com/venues/venue-1-1.jpg",
        "vendor": {
          "id": 2,
          "fullName": "ABC Sports Owner",
          "email": "vendor@example.com"
        },
        "createdAt": "2026-05-15T09:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

Note:

- List APIs should only return `primaryImageUrl` to keep the response lightweight.
- Use `GET /venues/{id}/images` when the UI needs the full venue image gallery.

### 6.7. Get Venue Images

```text
GET /venues/{id}/images
```

Auth: Not required

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "imageUrl": "https://cdn.example.com/venues/venue-1-1.jpg",
      "isPrimary": true,
      "sortOrder": 1
    },
    {
      "id": 2,
      "imageUrl": "https://cdn.example.com/venues/venue-1-2.jpg",
      "isPrimary": false,
      "sortOrder": 2
    }
  ]
}
```

### 6.8. Upload Own Venue Image

```text
POST /vendor/venues/{id}/images
```

Auth: VENDOR

Note:

- Vendor can only upload images for venues they own.
- Backend should validate file type and file size.
- This API should reuse the same internal image storage service used by avatar and court image uploads.

Content type:

```text
multipart/form-data
```

Form data:

```text
file=<image_file>
```

Response:

```json
{
  "success": true,
  "message": "Venue image uploaded successfully",
  "data": {
    "id": 1,
    "imageUrl": "https://cdn.example.com/venues/venue-1-1.jpg",
    "isPrimary": false,
    "sortOrder": 1
  }
}
```

### 6.9. Delete Own Venue Image

```text
DELETE /vendor/venues/{id}/images/{imageId}
```

Auth: VENDOR

### 6.10. Set Own Venue Primary Image

```text
PUT /vendor/venues/{id}/images/{imageId}/primary
```

Auth: VENDOR

### 6.11. Vendor Gets Own Venues

```text
GET /vendor/venues
```

Auth: VENDOR

Query params:

```text
status=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "ABC Sports Complex",
        "address": "District 1, Ho Chi Minh City",
        "phone": "0900000000",
        "openingTime": "06:00",
        "closingTime": "22:00",
        "status": "ACTIVE",
        "primaryImageUrl": "https://cdn.example.com/venues/venue-1-1.jpg",
        "courtCount": 4,
        "createdAt": "2026-05-15T09:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## 7. Court API

### 7.1. Get Court List

```text
GET /courts
```

Auth: Not required

Query params:

```text
sportId=
venueId=
keyword=
status=ACTIVE
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Badminton Court 01",
        "pricePerHour": 120000,
        "status": "ACTIVE",
        "sport": {
          "id": 1,
          "name": "Badminton"
        },
        "venue": {
          "id": 1,
          "name": "ABC Sports Complex",
          "address": "District 1, Ho Chi Minh City"
        },
        "primaryImageUrl": "https://cdn.example.com/courts/court-1-1.jpg"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 7.2. Get Court Details

```text
GET /courts/{id}
```

Auth: Not required

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Badminton Court 01",
    "description": "Indoor court",
    "pricePerHour": 120000,
    "status": "ACTIVE",
    "sport": {
      "id": 1,
      "name": "Badminton"
    },
    "venue": {
      "id": 1,
      "name": "ABC Sports Complex",
      "address": "District 1, Ho Chi Minh City",
      "openingTime": "06:00",
      "closingTime": "22:00"
    },
    "images": [
      {
        "id": 1,
        "imageUrl": "https://cdn.example.com/courts/court-1-1.jpg",
        "isPrimary": true,
        "sortOrder": 1
      }
    ],
    "timeSlots": [
      {
        "id": 1,
        "startTime": "06:00",
        "endTime": "07:00",
        "status": "ACTIVE"
      }
    ]
  }
}
```

### 7.3. Get Available Time Slots for a Court

```text
GET /courts/{id}/available-slots
```

Auth: USER, VENDOR, ADMIN

Note:

- Available slots are calculated from active `court_time_slots`.
- The system excludes slots that already have active bookings on the selected date.

Query params:

```text
date=2026-05-15
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "courtId": 1,
    "bookingDate": "2026-05-15",
    "items": [
      {
        "id": 1,
        "startTime": "06:00",
        "endTime": "07:00",
        "available": true
      },
      {
        "id": 2,
        "startTime": "07:00",
        "endTime": "08:00",
        "available": true
      }
    ]
  }
}
```

### 7.4. Create Court

```text
POST /vendor/courts
```

Auth: VENDOR

Request body:

```json
{
  "name": "Badminton Court 01",
  "sportId": 2,
  "venueId": 1,
  "pricePerHour": 120000,
  "description": "Indoor court",
  "timeSlotIds": [1, 2, 3, 4]
}
```

Note:

- `timeSlotIds` is optional.
- If provided, the system creates active `court_time_slots` for the new court.

### 7.5. Update Own Court

```text
PUT /vendor/courts/{id}
```

Auth: VENDOR

### 7.6. Delete or Deactivate Own Court

```text
DELETE /vendor/courts/{id}
```

Auth: VENDOR

### 7.7. Get Own Court Time Slots

```text
GET /vendor/courts/{id}/time-slots
```

Auth: VENDOR

Note:

- Vendor can only view time slots of their own courts.

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "startTime": "06:00",
      "endTime": "07:00",
      "enabled": true
    },
    {
      "id": 2,
      "startTime": "07:00",
      "endTime": "08:00",
      "enabled": false
    }
  ]
}
```

### 7.8. Update Own Court Time Slots

```text
PUT /vendor/courts/{id}/time-slots
```

Auth: VENDOR

Request body:

```json
{
  "timeSlotIds": [1, 2, 3, 4]
}
```

Note:

- The system should enable the submitted slots for the court.
- Slots not included in the request can be marked `INACTIVE` instead of being hard deleted.
- Existing future bookings must not be deleted when a slot is deactivated.

### 7.9. Admin Gets All Courts

```text
GET /admin/courts
```

Auth: ADMIN

Query params:

```text
vendorId=
venueId=
sportId=
status=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Badminton Court 01",
        "pricePerHour": 120000,
        "status": "ACTIVE",
        "sport": {
          "id": 1,
          "name": "Badminton"
        },
        "venue": {
          "id": 1,
          "name": "ABC Sports Complex"
        },
        "primaryImageUrl": "https://cdn.example.com/courts/court-1-1.jpg",
        "vendor": {
          "id": 2,
          "fullName": "ABC Sports Owner",
          "email": "vendor@example.com"
        },
        "createdAt": "2026-05-15T09:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 7.10. Get Court Images

```text
GET /courts/{id}/images
```

Auth: Not required

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "imageUrl": "https://cdn.example.com/courts/court-1-1.jpg",
      "isPrimary": true,
      "sortOrder": 1
    },
    {
      "id": 2,
      "imageUrl": "https://cdn.example.com/courts/court-1-2.jpg",
      "isPrimary": false,
      "sortOrder": 2
    }
  ]
}
```

### 7.11. Upload Own Court Image

```text
POST /vendor/courts/{id}/images
```

Auth: VENDOR

Note:

- Vendor can only upload images for courts under their own venues.
- Backend should validate file type and file size.
- This API should reuse the same internal image storage service used by avatar and venue image uploads.

Content type:

```text
multipart/form-data
```

Form data:

```text
file=<image_file>
```

Response:

```json
{
  "success": true,
  "message": "Court image uploaded successfully",
  "data": {
    "id": 1,
    "imageUrl": "https://cdn.example.com/courts/court-1-1.jpg",
    "isPrimary": false,
    "sortOrder": 1
  }
}
```

### 7.12. Delete Own Court Image

```text
DELETE /vendor/courts/{id}/images/{imageId}
```

Auth: VENDOR

### 7.13. Set Own Court Primary Image

```text
PUT /vendor/courts/{id}/images/{imageId}/primary
```

Auth: VENDOR

### 7.14. Vendor Gets Own Courts

```text
GET /vendor/courts
```

Auth: VENDOR

Query params:

```text
venueId=
sportId=
status=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Badminton Court 01",
        "pricePerHour": 120000,
        "status": "ACTIVE",
        "sport": {
          "id": 1,
          "name": "Badminton"
        },
        "venue": {
          "id": 1,
          "name": "ABC Sports Complex"
        },
        "primaryImageUrl": "https://cdn.example.com/courts/court-1-1.jpg",
        "activeTimeSlotCount": 4,
        "createdAt": "2026-05-15T09:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

## 8. Booking API

### 8.1. Create Booking

```text
POST /bookings
```

Auth: USER

Request body:

```json
{
  "courtId": 1,
  "timeSlotId": 3,
  "bookingDate": "2026-05-15",
  "paymentMethod": "VNPAY",
  "note": "Booking for a group of 6 people"
}
```

Response:

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 10,
    "courtName": "Badminton Court 01",
    "bookingDate": "2026-05-15",
    "startTime": "08:00",
    "endTime": "09:00",
    "totalPrice": 120000,
    "status": "PENDING",
    "payment": {
      "method": "VNPAY",
      "status": "PENDING",
      "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/..."
    }
  }
}
```

### 8.2. Get Current User Bookings

```text
GET /bookings/my
```

Auth: USER

Query params:

```text
status=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 10,
        "bookingDate": "2026-05-15",
        "startTime": "08:00",
        "endTime": "09:00",
        "totalPrice": 120000,
        "status": "PENDING",
        "court": {
          "id": 1,
          "name": "Badminton Court 01",
          "primaryImageUrl": "https://cdn.example.com/courts/court-1-1.jpg"
        },
        "venue": {
          "id": 1,
          "name": "ABC Sports Complex",
          "address": "District 1, Ho Chi Minh City"
        },
        "payment": {
          "method": "VNPAY",
          "status": "PAID"
        }
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 8.3. Get Booking Details

```text
GET /bookings/{id}
```

Auth: USER, VENDOR, ADMIN

Note:

- User can only view their own bookings.
- Vendor can only view bookings for their own courts.
- Admin can view all bookings.

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": 10,
    "bookingDate": "2026-05-15",
    "startTime": "08:00",
    "endTime": "09:00",
    "totalPrice": 120000,
    "status": "PENDING",
    "note": "Booking for a group of 6 people",
    "user": {
      "id": 1,
      "fullName": "Nguyen Van A",
      "email": "user@example.com",
      "phone": "0900000000"
    },
    "court": {
      "id": 1,
      "name": "Badminton Court 01",
      "pricePerHour": 120000
    },
    "venue": {
      "id": 1,
      "name": "ABC Sports Complex",
      "address": "District 1, Ho Chi Minh City"
    },
    "payment": {
      "method": "VNPAY",
      "status": "PAID",
      "amount": 120000,
      "paidAt": "2026-05-15T07:30:00"
    },
    "createdAt": "2026-05-14T20:00:00"
  }
}
```

### 8.4. User Cancels Booking

```text
PUT /bookings/{id}/cancel
```

Auth: USER

Response:

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "bookingId": 10,
    "bookingStatus": "CANCELLED",
    "paymentStatus": "REFUND_PENDING"
  }
}
```

### 8.5. Vendor Gets Own Court Bookings

```text
GET /vendor/bookings
```

Auth: VENDOR

Query params:

```text
status=
courtId=
date=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 10,
        "bookingDate": "2026-05-15",
        "startTime": "08:00",
        "endTime": "09:00",
        "totalPrice": 120000,
        "status": "PENDING",
        "user": {
          "id": 1,
          "fullName": "Nguyen Van A",
          "phone": "0900000000"
        },
        "court": {
          "id": 1,
          "name": "Badminton Court 01"
        },
        "payment": {
          "method": "VNPAY",
          "status": "PAID"
        }
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 8.6. Vendor Confirms Booking

```text
PUT /vendor/bookings/{id}/confirm
```

Auth: VENDOR

### 8.7. Vendor Cancels Booking

```text
PUT /vendor/bookings/{id}/cancel
```

Auth: VENDOR

### 8.8. Vendor Marks Cash Payment as Paid

```text
PUT /vendor/bookings/{id}/mark-cash-paid
```

Auth: VENDOR

Note:

- Only applies to bookings with payment method `CASH_AT_COURT`.
- Vendor can only update bookings for their own courts.

### 8.9. Admin Gets All Bookings

```text
GET /admin/bookings
```

Auth: ADMIN

Query params:

```text
status=
courtId=
date=
page=0
size=10
```

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      {
        "id": 10,
        "bookingDate": "2026-05-15",
        "startTime": "08:00",
        "endTime": "09:00",
        "totalPrice": 120000,
        "status": "PENDING",
        "user": {
          "id": 1,
          "fullName": "Nguyen Van A",
          "email": "user@example.com"
        },
        "vendor": {
          "id": 2,
          "fullName": "ABC Sports Owner"
        },
        "court": {
          "id": 1,
          "name": "Badminton Court 01"
        },
        "venue": {
          "id": 1,
          "name": "ABC Sports Complex"
        },
        "payment": {
          "method": "VNPAY",
          "status": "PAID"
        }
      }
    ],
    "page": 0,
    "size": 10,
    "totalItems": 1,
    "totalPages": 1
  }
}
```

### 8.10. Admin Cancels or Moderates Booking

```text
PUT /admin/bookings/{id}/cancel
```

Auth: ADMIN

## 9. Payment API

### 9.1. VNPAY Return URL

```text
GET /payments/vnpay/return
```

Auth: Not required

Note:

- Used when VNPAY redirects the user back to the frontend/backend after payment.
- The system must verify VNPAY response data before showing the final payment result.

### 9.2. VNPAY IPN Callback

```text
POST /payments/vnpay/ipn
```

Auth: Not required

Note:

- Used by VNPAY server-to-server notification.
- The system must verify VNPAY signature before updating payment status.
- If payment succeeds, update payment status to `PAID`.
- If payment fails, update payment status to `FAILED`.

### 9.3. Get Payment Details by Booking

```text
GET /bookings/{id}/payment
```

Auth: USER, VENDOR, ADMIN

Note:

- User can only view payment information for their own bookings.
- Vendor can only view payment information for bookings on their own courts.
- Admin can view all payment information.

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "bookingId": 10,
    "method": "VNPAY",
    "amount": 120000,
    "status": "PAID",
    "providerTransactionId": "VNPAY123456789",
    "paidAt": "2026-05-15T07:30:00",
    "refundAmount": null,
    "refundReason": null,
    "refundedAt": null
  }
}
```

## 10. Time Slot API

### 10.1. Get Time Slot List

```text
GET /time-slots
```

Auth: Not required

Response:

```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "startTime": "06:00",
      "endTime": "07:00",
      "status": "ACTIVE"
    },
    {
      "id": 2,
      "startTime": "07:00",
      "endTime": "08:00",
      "status": "ACTIVE"
    }
  ]
}
```

### 10.2. Create Global Time Slot

```text
POST /admin/time-slots
```

Auth: ADMIN

Request body:

```json
{
  "startTime": "06:00",
  "endTime": "07:00"
}
```

## 11. Error Codes to Handle

| HTTP status | Case |
| --- | --- |
| 400 | Invalid request data |
| 401 | Not logged in or invalid token |
| 403 | No access permission |
| 404 | Data not found |
| 409 | Data conflict, for example duplicate booking |
| 500 | Server error |

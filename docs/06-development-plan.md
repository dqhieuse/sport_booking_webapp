# Sport Booking WebApp - Agile Development Plan

## 1. Document Purpose

This document defines the Agile implementation plan for Sport Booking WebApp.

The goal is not only to finish features, but to build a product that can be:

- developed in small usable increments,
- demonstrated after each sprint,
- deployed to a production-like environment,
- maintained and extended after the MVP.

Docs `01` to `05` are treated as the approved product and technical baseline.

## 2. Development Approach

The project will follow a lightweight Agile Scrum style.

Recommended sprint length:

- 1 week per sprint for student development.
- 2 weeks per sprint if development time is limited.

Each sprint must produce a working increment. A working increment means:

- backend APIs run successfully,
- frontend screens can call real APIs when applicable,
- database changes are versioned,
- important flows can be tested manually,
- README or docs are updated when setup or behavior changes.

Avoid building the whole backend first and frontend later. The project should grow by vertical slices when possible: database, backend API, frontend UI, and verification for one business flow.

## 3. Product Release Goal

The MVP release must support these demo flows:

1. Guest views sports, venues, courts, and court details.
2. User registers, verifies email, logs in, and views profile.
3. User checks available slots and creates a booking.
4. User pays by VNPAY sandbox or chooses cash at court.
5. User views booking history and booking details.
6. Vendor logs in and manages own venues, courts, images, time slots, and bookings.
7. Admin logs in and manages sports, users/vendors, venues, courts, and bookings.

Production-like release requirements:

- backend uses environment variables for secrets and environment-specific values,
- database schema is managed by migrations,
- sample demo data can be seeded safely,
- frontend can be built and served from a deployed environment,
- backend and frontend use production API URLs correctly,
- error responses are consistent,
- protected routes and role-based access are enforced,
- logs are useful enough for debugging real demo issues.

## 4. Agile Roles

Product Owner:

- decides MVP priority,
- accepts or rejects sprint results,
- controls scope changes.

Developer:

- implements backend, frontend, database, and tests,
- keeps code consistent with docs,
- reports blockers early.

Tester:

- verifies APIs with Postman or equivalent,
- verifies UI flows in browser,
- checks edge cases such as permission errors and duplicate bookings.

In this student project, one person can play multiple roles, but the responsibilities should still be separated mentally.

## 5. Backlog Priority

### Must Have

- Project setup and repository structure.
- PostgreSQL database and migrations.
- Core entities and seed data.
- Public browsing APIs and pages.
- Local authentication with JWT access token and opaque refresh token.
- Email verification.
- Role-based authorization.
- User profile and avatar.
- Vendor venue/court management.
- Venue and court image management.
- Court time slot configuration.
- Available slot lookup by court and date.
- Booking creation, detail, history, and cancellation.
- Payment records for `VNPAY` and `CASH_AT_COURT`.
- VNPAY sandbox return/IPN handling.
- Vendor booking management and cash payment marking.
- Admin management for sports, users/vendors, venues, courts, and bookings.
- Production/demo deployment.

### Should Have

- Google login.
- Court and venue search/filter.
- Basic dashboard statistics for Vendor/Admin.
- Pagination, sorting, and filters on management pages.
- Automated tests for important service logic.
- Docker Compose for local database and app dependencies.

### Could Have

- Advanced analytics.
- Review/rating system.
- Discount codes.
- Map integration.
- Chat with venue owner.

## 6. Definition of Ready

A backlog item is ready for implementation when:

- the related API or behavior exists in docs `02` to `05`,
- request/response fields are clear,
- main validation rules are known,
- role permissions are known,
- expected success and error cases are understood,
- UI entry point is known if the item affects frontend.

If an item is not ready, update the docs before coding.

## 7. Definition of Done

A backlog item is done only when:

- code builds successfully,
- database migration is included if schema changes,
- API follows the common response format,
- backend validation and permission checks are implemented,
- important business logic is covered by focused tests where practical,
- API is verified with Postman or an API client,
- frontend UI is verified in browser if applicable,
- loading, empty, and error states are handled where applicable,
- no secret or important config value is hard-coded,
- docs or README are updated if behavior/setup changed.

For production/demo readiness, a feature is not considered complete if it only works with manually edited local values.

## 8. Technical Standards

Backend:

- Use Spring Boot with Controller, Service, Repository, Entity, and DTO layers.
- Controllers handle request/response only.
- Services contain business rules and authorization ownership checks.
- Repositories only handle database access.
- Do not return JPA entities directly from APIs.
- Use Bean Validation for request DTOs.
- Use transaction boundaries for booking creation, image ordering, payment updates, and slot configuration.
- Use global exception handling for consistent error responses.

Frontend:

- Use ReactJS, React Router, Axios, and Tailwind CSS.
- Separate pages, components, API clients, auth state, and route guards.
- Store access token and refresh token consistently.
- Add Axios interceptor for attaching access token and refreshing expired access token.
- Build simple but complete user, vendor, and admin flows.

Database:

- Use PostgreSQL.
- Use migration tooling such as Flyway or Liquibase.
- Seed roles, sports, time slots, and demo accounts through repeatable or controlled scripts.
- Avoid destructive changes after real data exists.

Security:

- Store passwords with BCrypt.
- Store refresh token hashes, not raw refresh tokens.
- Keep JWT secret, Google client ID, VNPAY credentials, database URL, and storage config in environment variables.
- Enforce `USER`, `VENDOR`, and `ADMIN` access at backend level, not only frontend.
- Vendors must only access their own venues, courts, images, slots, bookings, and payments.

## 9. Sprint Plan

### Sprint 0: Project Foundation and Production Skeleton

Goal:

- Create a clean foundation that can run locally and later be deployed.

Scope:

- Initialize Git repository.
- Create Spring Boot backend project.
- Create React frontend project with Tailwind CSS.
- Configure PostgreSQL.
- Add backend health check API.
- Configure CORS for local frontend.
- Add environment-based config structure.
- Add database migration tool.
- Add basic README with local running steps.
- Add local `.env.example` files if needed.
- Optional: add Docker Compose for PostgreSQL.

Expected demo:

- Backend runs at `http://localhost:8080`.
- Frontend runs at `http://localhost:5173`.
- `GET /api/health` returns successfully.
- Database connection works.

Verification:

- Run backend.
- Run frontend.
- Call `GET /api/health`.
- Confirm migrations run successfully.

### Sprint 1: Database Core and Public Browsing

Goal:

- Let guests browse real sports, venues, and courts from the database.

Scope:

- Create entities, enums, repositories, and migrations for:
  - roles,
  - users,
  - sports,
  - venues,
  - courts,
  - venue_images,
  - court_images,
  - time_slots,
  - court_time_slots.
- Seed roles, sports, time slots, sample vendor, sample venues, and sample courts.
- Implement public APIs:
  - `GET /sports`
  - `GET /sports/{id}`
  - `GET /venues`
  - `GET /venues/{id}`
  - `GET /venues/{id}/images`
  - `GET /courts`
  - `GET /courts/{id}`
  - `GET /courts/{id}/images`
- Build frontend pages:
  - home or discovery page,
  - court list,
  - court detail,
  - venue detail if needed.

Expected demo:

- Guest can open the frontend and browse real court data from PostgreSQL.

Verification:

- Test public APIs with Postman.
- Open frontend and verify list/detail pages.
- Check that detail APIs return `primaryImageUrl`, while gallery APIs return image lists.

### Sprint 2: Local Auth, JWT, Refresh Token, and Profile

Goal:

- Users can register, verify email, log in, stay logged in, and view profile.

Scope:

- Configure Spring Security.
- Implement BCrypt password hashing.
- Implement JWT access token.
- Implement opaque refresh token with hash storage, rotation, and revocation.
- Implement local auth APIs:
  - `POST /auth/register`
  - `GET /auth/verify-email`
  - `POST /auth/resend-verification`
  - `POST /auth/login`
  - `POST /auth/refresh-token`
  - `POST /auth/logout`
  - `GET /auth/me`
  - `POST /auth/me/avatar`
- Implement frontend auth pages:
  - register,
  - login,
  - profile.
- Implement auth state, protected routes, and Axios token handling.
- Add basic local email strategy for development, such as logging verification links or using a test SMTP provider.

Expected demo:

- User can register, verify email, log in, refresh token, log out, and view profile.

Verification:

- Local account cannot log in before email verification.
- Invalid token returns `401`.
- User route rejects unauthenticated requests.
- Refresh token rotation revokes the old token.

### Sprint 3: Vendor Setup - Venues, Courts, Images, and Time Slots

Goal:

- Vendor can prepare bookable courts from the UI.

Scope:

- Implement vendor venue APIs.
- Implement vendor court APIs.
- Implement venue image APIs.
- Implement court image APIs.
- Implement vendor court time slot APIs:
  - `GET /time-slots` for `VENDOR` and `ADMIN`
  - `GET /vendor/courts/{id}/time-slots`
  - `PUT /vendor/courts/{id}/time-slots`
- Enforce vendor ownership checks.
- Build vendor UI:
  - vendor venue list/form,
  - vendor court list/form,
  - image gallery management,
  - court time slot configuration.

Expected demo:

- Vendor can create a venue, create a court, upload images, set primary image, and enable bookable time slots.

Verification:

- Vendor A cannot manage Vendor B data.
- Image `sortOrder` and `isPrimary` rules work.
- Court time slot update is transactional.

### Sprint 4: Booking and Cash Payment MVP

Goal:

- User can book a court using cash-at-court payment.

Scope:

- Create migrations/entities for bookings and payments if not already added.
- Implement:
  - `GET /courts/{id}/available-slots?date=`
  - `POST /bookings`
  - `GET /bookings/my`
  - `GET /bookings/{id}`
  - `PUT /bookings/{id}/cancel`
  - `GET /bookings/{id}/payment`
  - `GET /vendor/bookings`
  - `PUT /vendor/bookings/{id}/confirm`
  - `PUT /vendor/bookings/{id}/reject`
  - `PUT /vendor/bookings/{id}/cancel`
  - `PUT /vendor/bookings/{id}/mark-cash-paid`
- Implement duplicate booking protection.
- Validate active court time slot.
- Validate date is not in the past.
- Calculate total price.
- Build frontend:
  - available slot picker,
  - booking creation page,
  - user booking history,
  - booking detail,
  - vendor booking management.

Expected demo:

- User books a court with `CASH_AT_COURT`.
- Vendor confirms booking and marks cash as paid.
- Duplicate booking is blocked.

Verification:

- Try duplicate booking for the same court/date/slot.
- Try booking a disabled slot.
- Try booking a past date.
- User A cannot view User B booking.
- Vendor cannot view another vendor's booking.

### Sprint 5: VNPAY Sandbox Payment

Goal:

- Online payment flow works in sandbox mode.

Scope:

- Configure VNPAY sandbox credentials through environment variables.
- Implement VNPAY payment URL creation.
- Implement:
  - `GET /payments/vnpay/return`
  - `POST /payments/vnpay/ipn`
- Verify VNPAY signature before updating payment status.
- Handle success and failure statuses.
- Add frontend payment redirect and payment result page.
- Add clear behavior for failed or expired VNPAY payments.

Expected demo:

- User creates a booking with `VNPAY`, completes sandbox payment, and sees payment status updated to `PAID`.

Verification:

- Successful payment updates payment to `PAID`.
- Failed payment updates payment to `FAILED`.
- Invalid signature does not update payment.
- Repeated callback is idempotent.

### Sprint 6: Admin Dashboard and Moderation

Goal:

- Admin can manage platform-level data.

Scope:

- Implement:
  - sport CRUD,
  - user/vendor management,
  - venue moderation,
  - court moderation,
  - booking moderation,
  - admin list APIs with pagination and filters.
- Build admin UI:
  - dashboard summary,
  - sports management,
  - users/vendors management,
  - venues management,
  - courts management,
  - bookings management.

Expected demo:

- Admin can create/update/deactivate sports, manage accounts, and moderate platform data.

Verification:

- User and Vendor cannot access Admin APIs.
- Admin can filter and inspect platform records.
- Deactivation does not break existing booking history.

### Sprint 7: Google Login and User Experience Polish

Goal:

- Improve real-world login options and frontend usability.

Scope:

- Implement Google login:
  - `POST /auth/google`
  - verified email check,
  - account creation or matching behavior.
- Clarify and implement behavior when Google email matches existing local account.
- Improve frontend loading, empty, and error states.
- Improve responsive layout.
- Add filters for court list by sport, venue, date, and keyword if feasible.
- Add basic dashboard statistics for Vendor/Admin if feasible.

Expected demo:

- User can log in with Google and use the same core booking flow.
- UI is usable on desktop and mobile.

Verification:

- Google login rejects unverified Google email.
- Existing local account matching behavior works as documented.
- Main pages are responsive.

### Sprint 8: Production Hardening and Release

Goal:

- Prepare the project for real demo and deployment.

Scope:

- Add production configuration profile.
- Review all environment variables.
- Finalize README:
  - local setup,
  - database setup,
  - migration command,
  - backend run command,
  - frontend run command,
  - production build command,
  - demo accounts,
  - deployment notes.
- Add API collection or API testing notes.
- Add seed data for demo:
  - admin account,
  - vendor account,
  - user account,
  - sports,
  - venues,
  - courts,
  - time slots.
- Add focused automated tests for:
  - auth,
  - refresh token rotation,
  - booking duplicate protection,
  - vendor ownership,
  - image primary/sort order,
  - payment callback signature/idempotency.
- Configure logging.
- Verify frontend production build.
- Deploy backend, frontend, and database to selected hosting.

Expected demo:

- The deployed app can run the full MVP flow without local-only assumptions.

Verification:

- Run smoke test on deployed environment:
  - browse courts,
  - login,
  - create booking,
  - pay or mark cash paid,
  - vendor manages booking,
  - admin moderates data.

## 10. Recommended Release Milestones

### MVP Alpha

Included by end of Sprint 4:

- public browsing,
- local auth,
- vendor court setup,
- cash booking flow.

Purpose:

- prove the core business flow works before spending time on payment and polish.

### MVP Beta

Included by end of Sprint 6:

- VNPAY sandbox,
- vendor booking management,
- admin moderation.

Purpose:

- make the project complete enough for a realistic demo.

### MVP Production Demo

Included by end of Sprint 8:

- deployment,
- demo data,
- README,
- smoke-tested flows,
- production-like config.

Purpose:

- make the project portfolio-ready and presentable.

## 11. Testing Strategy

Manual API testing:

- Use Postman or an equivalent API client for all important APIs.
- Keep one collection for public, auth, user, vendor, admin, and payment APIs.

Backend automated tests:

- Prioritize service tests for business rules.
- Add integration tests for security and booking conflicts where practical.
- Do not over-test simple getters/setters or generated code.

Frontend testing:

- Manually test main flows in browser.
- Verify route guards for user, vendor, and admin pages.
- Verify loading, empty, and error states.

Production smoke testing:

- Run a short checklist after deployment.
- Check logs after each important flow.
- Confirm frontend calls the deployed backend URL, not localhost.

## 12. Deployment Strategy

Minimum production-like setup:

- PostgreSQL hosted database.
- Spring Boot backend deployed as a server app.
- React frontend deployed as a static app.
- Environment variables configured in hosting platform.
- HTTPS enabled by hosting platform or reverse proxy.

Recommended environment variables:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_TOKEN_TTL`
- `REFRESH_TOKEN_TTL`
- `APP_FRONTEND_URL`
- `APP_BACKEND_URL`
- `GOOGLE_CLIENT_ID`
- `VNPAY_TMN_CODE`
- `VNPAY_HASH_SECRET`
- `VNPAY_PAYMENT_URL`
- `VNPAY_RETURN_URL`
- `STORAGE_TYPE`
- `STORAGE_BASE_URL`

Recommended demo accounts:

- `admin@example.com`
- `vendor@example.com`
- `user@example.com`

Never commit real secrets to Git.

## 13. Risk Management

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Building frontend too late | Hard to demo real product | Build UI together with each vertical slice |
| Payment integration takes longer than expected | Booking flow delayed | Finish `CASH_AT_COURT` booking first, then add VNPAY |
| Auth becomes too complex | Blocks many features | Implement local auth first, Google login later |
| Image storage complicates deployment | Demo fails on uploaded images | Start with local storage abstraction, keep interface ready for object storage |
| No database migration strategy | Production deployment becomes unsafe | Use Flyway or Liquibase from the beginning |
| Weak seed data | Demo looks empty | Prepare realistic demo venues, courts, slots, and bookings |
| Missing ownership checks | Serious security issue | Put ownership checks in service layer and test them |

## 14. Daily Workflow

For each task:

1. Confirm the related docs/API behavior.
2. Create or update database migration if needed.
3. Implement backend entity/repository/service/controller/DTO.
4. Test API manually.
5. Implement frontend API client/page/component if applicable.
6. Test UI manually.
7. Add focused automated tests for risky logic.
8. Update README/docs if behavior or setup changed.

End of each sprint:

- run backend,
- run frontend,
- run important tests,
- run the sprint demo scenario,
- list unfinished items,
- move unfinished items back to backlog,
- decide next sprint scope based on working software, not only written plans.

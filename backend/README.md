# Sport Booking Backend

Spring Boot REST API for Sport Booking WebApp.

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- Flyway
- Maven Wrapper

## Project Structure

```text
backend
├── src/main/java/com/sportbooking
│   ├── common      # Shared API response, exception, constants, helpers
│   ├── config      # Spring configuration
│   └── module      # Feature modules
├── src/main/resources
│   ├── application.yml
│   ├── application-local.yml
│   └── db/migration
│       ├── common      # Migrations shared by PostgreSQL and H2 tests
│       └── postgresql  # PostgreSQL-only migrations
└── src/test
    ├── java
    └── resources/application-test.yml
```

Prepared business modules:

- `auth`
- `booking`
- `court`
- `health`
- `payment`
- `sport`
- `user`
- `venue`

Each business module is prepared for:

- `controller`
- `dto`
- `entity`
- `repository`
- `service`

## Environment

Copy the sample environment file before running locally:

```bash
cp .env.example .env
```

Current environment variables:

```text
SPRING_PROFILES_ACTIVE=local
SERVER_PORT=8080

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sport_booking
DB_USERNAME=sport_booking
DB_PASSWORD=sport_booking

APP_CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Do not commit `.env`.

## Run Locally

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run the backend:

```bash
./mvnw spring-boot:run
```

The backend runs at:

```text
http://localhost:8080
```

Check the health API:

```bash
curl http://localhost:8080/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Backend is running",
  "data": {
    "status": "UP",
    "service": "sport-booking-backend"
  },
  "errors": []
}
```

## Database Migrations

Flyway runs automatically when the backend starts.

Runtime PostgreSQL uses both locations:

```text
classpath:db/migration/common
classpath:db/migration/postgresql
```

Test profile uses only:

```text
classpath:db/migration/common
```

Why the split:

- `common` contains schema and seed data that can run on PostgreSQL and H2 test database.
- `postgresql` contains PostgreSQL-specific constraints, such as partial unique indexes.

Current migrations:

- `common/V1__init_schema.sql` - initial migration marker
- `common/V2__create_initial_schema.sql` - core schema from `docs/04-database-design.md`
- `common/V3__seed_initial_reference_data.sql` - roles, sports, and time slots
- `postgresql/V4__add_postgresql_partial_indexes.sql` - PostgreSQL partial unique indexes

Important PostgreSQL constraints:

- One primary image per venue.
- One primary image per court.
- No duplicate active booking for the same `court_id`, `booking_date`, and `time_slot_id` when status is `PENDING` or `CONFIRMED`.

## Test Database

Tests use H2 in-memory database from `src/test/resources/application-test.yml`:

```text
jdbc:h2:mem:sport_booking_test;MODE=PostgreSQL
```

H2 is only used for automated tests. Local application runtime still uses PostgreSQL.

## Useful Commands

Run tests:

```bash
./mvnw test
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Stop PostgreSQL:

```bash
docker compose down
```

Reset local PostgreSQL data:

```bash
docker compose down -v
docker compose up -d postgres
./mvnw spring-boot:run
```

Use reset only for local development because it deletes the Docker volume.

## Current Verification

The current backend foundation has been verified with:

```bash
./mvnw test
```

The PostgreSQL migrations have also been verified by starting the backend against the local Docker PostgreSQL database.

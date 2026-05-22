# Sport Booking Backend

Spring Boot REST API for Sport Booking WebApp.

## Prerequisites

- Java 21 or newer
- Docker Desktop with Docker Compose
- Git

Maven does not need to be installed globally because this project uses Maven Wrapper (`./mvnw`).

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- Flyway
- H2 for automated tests only

## Project Structure

```text
src/main/java/com/sportbooking
├── common      # Shared API response, exception, constants, helpers
├── config      # Spring configuration
└── module      # Feature modules
    ├── auth
    ├── booking
    ├── court
    ├── health
    ├── payment
    ├── sport
    ├── user
    └── venue
```

Each business module is prepared for `controller`, `dto`, `entity`, `repository`, and `service` packages.

## Environment

Create a local environment file:

```bash
cp .env.example .env
```

Current variables:

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

Check the API:

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

Runtime PostgreSQL migration locations:

```text
classpath:db/migration/common
classpath:db/migration/postgresql
```

Test migration location:

```text
classpath:db/migration/common
```

The split exists because H2 is used for fast tests and does not support every PostgreSQL feature. PostgreSQL-only migrations contain partial unique indexes for rules such as:

- one primary image per venue
- one primary image per court
- no duplicate active booking for the same court, date, and time slot

Current migrations:

- `common/V1__init_schema.sql` - initial migration marker
- `common/V2__create_initial_schema.sql` - core schema from `docs/04-database-design.md`
- `common/V3__seed_initial_reference_data.sql` - roles, sports, and time slots
- `postgresql/V4__add_postgresql_partial_indexes.sql` - PostgreSQL partial unique indexes

## Testing

Run backend tests:

```bash
./mvnw test
```

Tests use H2 in-memory database with PostgreSQL compatibility mode:

```text
jdbc:h2:mem:sport_booking_test;MODE=PostgreSQL
```

The local application runtime still uses PostgreSQL.

## Useful Commands

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

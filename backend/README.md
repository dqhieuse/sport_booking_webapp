# Sport Booking Backend

Backend API for Sport Booking WebApp.

## Tech Stack

- Java 21
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- PostgreSQL
- Flyway

## Package Structure

```text
com.sportbooking
├── common          # Shared API response, exception, constants, helpers
├── config          # Spring configuration
└── module
    ├── auth        # Authentication and tokens
    ├── booking     # Booking flow
    ├── court       # Court management and public court data
    ├── health      # Health check API
    ├── payment     # Payment records and payment callbacks
    ├── sport       # Sport catalog
    ├── user        # User profile and account data
    └── venue       # Venue management and public venue data
```

Each business module is prepared with:

- `controller`
- `dto`
- `entity`
- `repository`
- `service`

## Local Setup

1. Copy environment file:

```bash
cp .env.example .env
```

2. Start PostgreSQL:

```bash
docker compose up -d postgres
```

3. Run backend:

```bash
./mvnw spring-boot:run
```

4. Check health API:

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

Flyway runs automatically on startup.

Current migrations:

- `db/migration/common/V1__init_schema.sql` - initial migration marker
- `db/migration/common/V2__create_initial_schema.sql` - core schema from `docs/04-database-design.md`
- `db/migration/common/V3__seed_initial_reference_data.sql` - roles, sports, and time slots
- `db/migration/postgresql/V4__add_postgresql_partial_indexes.sql` - PostgreSQL partial unique indexes

The schema uses PostgreSQL constraints for foreign keys, enum-like status values, active booking uniqueness, and one primary image per venue/court.

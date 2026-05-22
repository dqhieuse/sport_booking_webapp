# Sport Booking WebApp

Sport Booking WebApp is an online sports court booking system. The project contains a Spring Boot REST API, a React frontend, and planning/design documents for the MVP.

## Repository Structure

```text
.
├── backend/   # Spring Boot REST API
├── frontend/  # React + Vite + Tailwind CSS web app
├── docs/      # Product, API, database, and development documents
└── outputs/   # Planning/export files
```

## Local Prerequisites

Install these tools before running the project locally:

- Java 21 or newer
- Docker Desktop, including Docker Compose
- Node.js 20 or newer
- npm 10 or newer
- Git

PostgreSQL is provided through Docker Compose in `backend/docker-compose.yml`, so a separate local PostgreSQL installation is not required for normal development.

## Quick Start

From the repository root, start the database:

```bash
cd backend
docker compose up -d postgres
```

In the same `backend` directory, run the backend:

```bash
cp .env.example .env
./mvnw spring-boot:run
```

From another terminal at the repository root, run the frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Local URLs:

- Backend API: `http://localhost:8080`
- Backend health check: `http://localhost:8080/api/health`
- Frontend: `http://localhost:5173`

## Documentation

- Backend setup and database migrations: [backend/README.md](backend/README.md)
- Frontend setup and UI architecture: [frontend/README.md](frontend/README.md)
- Product and technical docs: [docs/](docs/)

## Verification

Backend:

```bash
cd backend
./mvnw test
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

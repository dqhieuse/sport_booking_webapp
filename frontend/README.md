# Sport Booking Frontend

React web app for Sport Booking WebApp.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Git

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style components
- React Router
- Axios

## Project Structure

```text
src
├── components     # Reusable UI components
├── config         # Environment-driven app configuration
├── features      # Feature-based frontend modules
├── layouts       # Shared page layouts
├── lib           # Shared libraries such as API client
├── pages         # Route-level screens
├── routes        # React Router setup and path constants
├── styles        # Global styles and Tailwind entry
└── types         # Shared TypeScript types
```

## Environment

Create a local environment file:

```bash
cp .env.example .env
```

Current variables:

```text
VITE_API_BASE_URL=http://localhost:8080/api
```

Do not commit `.env`.

## Run Locally

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The app runs at:

```text
http://localhost:5173
```

## UI Theme

The frontend uses a shadcn/ui-style setup:

- `src/styles/index.css` defines theme CSS variables.
- `tailwind.config.js` maps Tailwind tokens to those variables.
- `src/lib/utils.ts` provides `cn()` for class merging.
- `src/components/ui/` contains reusable primitives such as `Button`, `Card`, `Badge`, and `Separator`.

## API Client

- `VITE_API_BASE_URL` controls the backend API base URL.
- `src/config/env.ts` centralizes environment values.
- `src/lib/apiClient.ts` wraps Axios and returns the backend `{ success, message, data, errors }` response shape.
- `src/lib/authTokenStore.ts` prepares access-token attachment for later auth tasks.
- `src/lib/apiError.ts` normalizes Axios failures into `ApiError`.

## Route Skeleton

- `/` - Home
- `/sports` - Sport catalog
- `/venues` - Venue browsing
- `/courts` - Court browsing
- `/courts/:courtId` - Court details
- `/login` and `/register` - Authentication entry points
- `/profile` and `/bookings` - User area
- `/vendor/*` - Vendor workspace
- `/admin/*` - Admin workspace

## Verification

```bash
npm run lint
npm run build
```

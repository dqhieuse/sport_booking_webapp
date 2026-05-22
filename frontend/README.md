# Sport Booking Frontend

Frontend web app for Sport Booking WebApp.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

## Project Structure

```text
src
├── features      # Feature-based frontend modules
├── layouts       # Shared page layouts
├── lib           # Shared libraries such as API client
├── pages         # Route-level screens
├── routes        # React Router setup and path constants
└── styles        # Global styles and Tailwind entry
```

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

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Run the frontend:

```bash
npm run dev
```

The app runs at:

```text
http://localhost:5173
```

## Useful Commands

```bash
npm run lint
npm run build
```

import { HealthCheckCard } from '../features/health/components/HealthCheckCard';

const foundationItems = [
  'Vite React app',
  'TypeScript',
  'Tailwind CSS',
  'React Router',
  'Base app layout',
  'Route skeleton',
  'Axios API client',
  'Environment-based API URL',
];

export function HomePage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Sprint 0 Foundation
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Sport Booking WebApp frontend is ready
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          This React foundation is prepared for public browsing, authentication,
          booking, vendor management, and admin workflows.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {foundationItems.map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <HealthCheckCard />
    </div>
  );
}

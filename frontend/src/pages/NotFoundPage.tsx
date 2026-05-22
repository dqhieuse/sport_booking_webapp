import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-red-600">404</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-950">Page not found</h1>
      <p className="mt-3 text-slate-600">The page you requested does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-brand-700"
      >
        Back to home
      </Link>
    </section>
  );
}

type RoutePlaceholderPageProps = {
  title: string;
  description: string;
};

export function RoutePlaceholderPage({ title, description }: RoutePlaceholderPageProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Route skeleton</p>
      <h1 className="mt-3 text-2xl font-bold text-slate-950">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        This screen is ready for feature implementation in a later task.
      </div>
    </section>
  );
}

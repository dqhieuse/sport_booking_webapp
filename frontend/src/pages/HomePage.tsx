import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HealthCheckCard } from '@/features/health/components/HealthCheckCard';

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
    <div className="page-grid">
      <Card>
        <CardHeader>
          <Badge className="w-fit">Sprint 0 Foundation</Badge>
          <CardTitle className="text-3xl">Sport Booking WebApp frontend is ready</CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
          This React foundation is prepared for public browsing, authentication,
          booking, vendor management, and admin workflows.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
          {foundationItems.map((item) => (
            <div key={item} className="rounded-md border bg-muted px-4 py-3">
              <p className="text-sm font-medium text-foreground">{item}</p>
            </div>
          ))}
          </div>
        </CardContent>
      </Card>

      <HealthCheckCard />
    </div>
  );
}

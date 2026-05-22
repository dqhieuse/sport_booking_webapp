import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { getBackendHealth } from '../api/healthApi';

type HealthStatus = 'loading' | 'online' | 'offline' | 'unknown';

const statusClassNames: Record<HealthStatus, string> = {
  loading: 'bg-amber-50 text-amber-700 hover:bg-amber-50',
  online: 'bg-accent text-accent-foreground hover:bg-accent',
  offline: 'bg-destructive text-destructive-foreground hover:bg-destructive',
  unknown: 'bg-muted text-muted-foreground hover:bg-muted',
};

export function HealthCheckCard() {
  const [status, setStatus] = useState<HealthStatus>('loading');
  const [message, setMessage] = useState('Checking backend connection...');

  useEffect(() => {
    let ignoreResult = false;

    async function checkHealth() {
      try {
        const result = await getBackendHealth();
        if (ignoreResult) {
          return;
        }

        setStatus(result.data.status === 'UP' ? 'online' : 'unknown');
        setMessage(result.message || 'Backend responded.');
      } catch {
        if (ignoreResult) {
          return;
        }

        setStatus('offline');
        setMessage('Backend is not reachable. Start the Spring Boot API and try again.');
      }
    }

    checkHealth();

    return () => {
      ignoreResult = true;
    };
  }, []);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardDescription className="font-semibold uppercase tracking-wide">API Status</CardDescription>
          <CardTitle className="mt-3 text-xl">Backend health</CardTitle>
        </div>
        <Badge className={statusClassNames[status]}>{status}</Badge>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        <p className="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          API base URL: {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'}
        </p>
      </CardContent>
    </Card>
  );
}

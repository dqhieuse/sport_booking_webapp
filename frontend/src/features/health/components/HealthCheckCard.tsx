import { useEffect, useState } from 'react';

import { getBackendHealth } from '../api/healthApi';

type HealthStatus = 'loading' | 'online' | 'offline' | 'unknown';

const statusClassNames: Record<HealthStatus, string> = {
  loading: 'bg-amber-50 text-amber-700 ring-amber-200',
  online: 'bg-brand-50 text-brand-700 ring-brand-100',
  offline: 'bg-red-50 text-red-700 ring-red-100',
  unknown: 'bg-slate-100 text-slate-700 ring-slate-200',
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
    <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            API Status
          </p>
          <h2 className="mt-3 text-xl font-bold text-slate-950">Backend health</h2>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 ${statusClassNames[status]}`}
        >
          {status}
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
      <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
        API base URL: {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api'}
      </p>
    </aside>
  );
}

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { ChangeEvent, FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resendVerificationEmail, verifyEmail } from '@/features/auth/api/authApi';
import type { EmailVerificationResponse } from '@/features/auth/types';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

  const [manualToken, setManualToken] = useState(tokenFromUrl);
  const [status, setStatus] = useState<VerificationStatus>(tokenFromUrl ? 'verifying' : 'idle');
  const [verificationResult, setVerificationResult] = useState<EmailVerificationResponse | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState('');
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const runVerification = useCallback(async (token: string, signal?: AbortSignal) => {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      setStatus('idle');
      setVerificationResult(null);
      setVerificationMessage(null);
      setVerificationError('Verification token is required.');
      return;
    }

    setStatus('verifying');
    setVerificationError(null);
    setVerificationMessage(null);

    try {
      const response = await verifyEmail(normalizedToken, signal);

      if (signal?.aborted) {
        return;
      }

      setVerificationResult(response.data);
      setVerificationMessage(response.message);
      setStatus('success');
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setVerificationResult(null);
      setStatus('error');

      if (error instanceof ApiError) {
        setVerificationError(error.message);
        return;
      }

      setVerificationError('Could not verify your email. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!tokenFromUrl) {
      return;
    }

    setManualToken(tokenFromUrl);
    const controller = new AbortController();
    void runVerification(tokenFromUrl, controller.signal);

    return () => controller.abort();
  }, [runVerification, tokenFromUrl]);

  function handleTokenChange(event: ChangeEvent<HTMLInputElement>) {
    setManualToken(event.target.value);
    setVerificationError(null);
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runVerification(manualToken);
  }

  async function handleResendSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = resendEmail.trim().toLowerCase();
    setResendError(null);
    setResendMessage(null);

    if (!normalizedEmail) {
      setResendError('Email is required.');
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setResendError('Enter a valid email address.');
      return;
    }

    setIsResending(true);
    try {
      const response = await resendVerificationEmail({ email: normalizedEmail });
      setResendMessage(response.message);
      setResendEmail(normalizedEmail);
    } catch (error) {
      if (error instanceof ApiError) {
        setResendError(error.message);
        return;
      }

      setResendError('Could not send a new verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="page-hero space-y-6 lg:sticky lg:top-24">
          <Badge className="w-fit gap-2 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Email verification
          </Badge>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Verify your SportZone account.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Open the verification link from your email. If the link does not open automatically, paste the token here
              and submit it manually.
            </p>
          </div>

          <div className="grid gap-3">
            <InfoRow
              icon={<MailCheck className="h-5 w-5" aria-hidden="true" />}
              title="Check your inbox"
              description="Use the latest email from SportZone because old tokens may no longer be valid."
            />
            <InfoRow
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              title="Activate before login"
              description="Local accounts can log in only after email verification succeeds."
            />
          </div>
        </div>

        <div className="space-y-5">
          <Card className="sportzone-panel">
            <CardHeader>
              <CardTitle>Verify email</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                Token is read from the URL when available.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <VerificationState
                status={status}
                message={verificationMessage}
                error={verificationError}
                result={verificationResult}
              />

              {status !== 'success' && (
                <form onSubmit={handleVerifySubmit} noValidate className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="verificationToken" className="text-sm font-medium text-foreground">
                      Verification token
                    </label>
                    <input
                      id="verificationToken"
                      name="verificationToken"
                      value={manualToken}
                      onChange={handleTokenChange}
                      autoComplete="one-time-code"
                      placeholder="Paste your verification token"
                      aria-invalid={Boolean(verificationError)}
                      aria-describedby={verificationError ? 'verification-token-error' : undefined}
                      className={cn(
                        'soft-input h-12 w-full rounded-full px-4 text-sm',
                        verificationError && 'border-destructive/70',
                      )}
                    />
                    {verificationError && (
                      <p id="verification-token-error" className="flex items-start gap-2 text-xs leading-5 text-destructive">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {verificationError}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full" disabled={status === 'verifying'}>
                    {status === 'verifying' ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        Verifying
                      </>
                    ) : (
                      <>
                        Verify email
                        <MailCheck className="h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {status !== 'success' && (
            <Card className="sportzone-panel">
              <CardHeader>
                <CardTitle>Need a new link?</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">
                  Enter the email you registered with. For privacy, SportZone will not reveal whether the account exists.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResendSubmit} noValidate className="space-y-4">
                  {resendMessage && (
                    <div className="rounded-2xl border border-primary/25 bg-primary/10 p-4 text-sm leading-6 text-foreground">
                      {resendMessage}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="resendEmail" className="text-sm font-medium text-foreground">
                      Email
                    </label>
                    <input
                      id="resendEmail"
                      name="resendEmail"
                      type="email"
                      value={resendEmail}
                      onChange={(event) => {
                        setResendEmail(event.target.value);
                        setResendError(null);
                      }}
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={Boolean(resendError)}
                      aria-describedby={resendError ? 'resend-email-error' : undefined}
                      className={cn(
                        'soft-input h-12 w-full rounded-full px-4 text-sm',
                        resendError && 'border-destructive/70',
                      )}
                    />
                    {resendError && (
                      <p id="resend-email-error" className="flex items-start gap-2 text-xs leading-5 text-destructive">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {resendError}
                      </p>
                    )}
                  </div>

                  <Button type="submit" variant="secondary" className="w-full" disabled={isResending}>
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending
                      </>
                    ) : (
                      <>
                        Send new link
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}

function VerificationState({
  status,
  message,
  error,
  result,
}: {
  status: VerificationStatus;
  message: string | null;
  error: string | null;
  result: EmailVerificationResponse | null;
}) {
  if (status === 'verifying') {
    return (
      <div className="flex gap-3 rounded-2xl border border-border/80 bg-secondary/70 p-4 text-sm text-foreground">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
        <p className="leading-6">Verifying your email token...</p>
      </div>
    );
  }

  if (status === 'success' && result) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5">
          <div className="flex gap-4">
            <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground">Email verified</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {message || 'Your email has been verified successfully.'}
              </p>
            </div>
          </div>
        </div>

        <dl className="grid gap-3 rounded-2xl border border-border/80 bg-secondary/70 p-4 text-sm sm:grid-cols-2">
          <AccountDetail label="Status" value={result.status.replace(/_/g, ' ')} />
          <AccountDetail label="Email verified" value={result.emailVerified ? 'Yes' : 'No'} />
        </dl>

        <Button asChild size="lg" className="w-full">
          <Link to={routePaths.login}>Go to login</Link>
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex gap-3 rounded-2xl border border-destructive/35 bg-destructive/10 p-4 text-sm text-foreground">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-foreground">Verification failed</h2>
          <p className="mt-1 leading-6 text-muted-foreground">
            {error || 'The verification token is invalid or expired.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-secondary/70 p-4 text-sm leading-6 text-muted-foreground">
      Paste the token from your verification email to activate your account.
    </div>
  );
}

function InfoRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border/80 bg-card/80 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function AccountDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words font-medium text-foreground">{value}</dd>
    </div>
  );
}

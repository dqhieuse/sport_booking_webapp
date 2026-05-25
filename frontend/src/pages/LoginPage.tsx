import { AlertCircle, Eye, EyeOff, Loader2, LogIn, MailWarning, ShieldCheck } from 'lucide-react';
import { ChangeEvent, FormEvent, ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loginLocalAccount } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/useAuth';
import type { LoginRequest } from '@/features/auth/types';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type LoginFormValues = LoginRequest;
type LoginField = keyof LoginFormValues;
type FieldErrors = Partial<Record<LoginField, string>>;

const initialValues: LoginFormValues = {
  identifier: '',
  password: '',
};

function normalizeValues(values: LoginFormValues): LoginFormValues {
  return {
    identifier: values.identifier.trim().toLowerCase(),
    password: values.password,
  };
}

function validateLoginForm(values: LoginFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const normalizedValues = normalizeValues(values);

  if (!normalizedValues.identifier) {
    errors.identifier = 'Email or phone is required.';
  } else if (normalizedValues.identifier.length > 150) {
    errors.identifier = 'Email or phone must be at most 150 characters.';
  }

  if (!normalizedValues.password) {
    errors.password = 'Password is required.';
  } else if (normalizedValues.password.length > 100) {
    errors.password = 'Password must be at most 100 characters.';
  }

  return errors;
}

function mapApiErrors(errors: string[]): FieldErrors {
  return errors.reduce<FieldErrors>((mappedErrors, error) => {
    const [rawField, ...messageParts] = error.split(':');
    const field = rawField.trim() as LoginField;
    const message = messageParts.join(':').trim();

    if (field in initialValues && message) {
      mappedErrors[field] = message;
    }

    return mappedErrors;
  }, {});
}

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isVerificationError, setIsVerificationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleFieldChange(field: LoginField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        [field]: undefined,
      }));
      setApiMessage(null);
      setIsVerificationError(false);
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateLoginForm(values);
    setFieldErrors(validationErrors);
    setApiMessage(null);
    setIsVerificationError(false);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const request = normalizeValues(values);

    setIsSubmitting(true);
    try {
      const response = await loginLocalAccount(request);
      login(response.data);
      navigate(routePaths.home, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const mappedErrors = mapApiErrors(error.errors);
        setFieldErrors(mappedErrors);
        setApiMessage(error.message);
        setIsVerificationError(error.message.toLowerCase().includes('verify'));
        return;
      }

      setApiMessage('Could not log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-6 border-b border-border pb-8 lg:border-b-0 lg:pb-0 lg:pr-8">
          <Badge className="w-fit gap-2 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Welcome back
          </Badge>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
              Log in to manage your bookings.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Use your registered email or phone number. Local accounts must verify email before logging in.
            </p>
          </div>

          <div className="grid gap-3">
            <InfoRow
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              title="Secure session"
              description="SportZone keeps the access token in memory and restores the session with a secure refresh cookie."
            />
            <InfoRow
              icon={<MailWarning className="h-5 w-5" aria-hidden="true" />}
              title="Verification required"
              description="If your email is still pending, use the verification page before trying again."
            />
          </div>
        </div>

        <Card className="sportzone-panel rounded-xl">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              New to SportZone?{' '}
              <Link to={routePaths.register} className="font-medium text-primary">
                Create an account
              </Link>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {apiMessage && Object.keys(fieldErrors).length === 0 && (
                <InlineAlert
                  message={apiMessage}
                  action={isVerificationError ? (
                    <Link to={routePaths.verifyEmail} className="font-medium text-primary">
                      Open verification page
                    </Link>
                  ) : undefined}
                />
              )}

              <TextField
                id="identifier"
                label="Email or phone"
                value={values.identifier}
                onChange={handleFieldChange('identifier')}
                error={fieldErrors.identifier}
                autoComplete="username"
                placeholder="you@example.com or 0900000000"
              />

              <PasswordField
                value={values.password}
                onChange={handleFieldChange('password')}
                error={fieldErrors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((current) => !current)}
              />

              <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    Logging in
                  </>
                ) : (
                  <>
                    Log in
                    <LogIn className="h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type TextFieldProps = {
  id: LoginField;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
};

function TextField({ id, label, value, onChange, error, autoComplete, placeholder }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'h-12 w-full rounded-xl border bg-secondary px-4 text-sm text-foreground transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          error ? 'border-destructive/70' : 'border-border focus:border-primary',
        )}
      />
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  error,
  showPassword,
  onTogglePassword,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm font-medium text-foreground">
        Password
      </label>
      <div
        className={cn(
          'flex h-12 items-center rounded-xl border bg-secondary transition focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          error ? 'border-destructive/70' : 'border-border focus-within:border-primary',
        )}
      >
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'password-error' : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error && <FieldError id="password-error" message={error} />}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="flex items-start gap-2 text-xs leading-5 text-destructive">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function InlineAlert({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="space-y-2">
        <p className="leading-6">{message}</p>
        {action}
      </div>
    </div>
  );
}

function InfoRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

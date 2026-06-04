import { DangerCircle, Eye, EyeOff, Login, MailOpen, ShieldCheck } from '@mynaui/icons-react';
import { ChangeEvent, FormEvent, ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { loginLocalAccount } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/useAuth';
import type { LoginRequest } from '@/features/auth/types';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { getRedirectPath } from '@/routes/routeRedirect';
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
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = getRedirectPath(location.state);
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
      navigate(redirectTo, { replace: true });
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
        <div className="space-y-6 lg:sticky lg:top-24">
          <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
            <Login className="size-3.5" aria-hidden="true" />
            Welcome back
          </Badge>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Log in to manage your bookings.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Use your registered email or phone number. Local accounts must verify email before logging in.
            </p>
          </div>

          <div className="grid gap-3">
            <InfoRow
              icon={<ShieldCheck className="size-5" aria-hidden="true" />}
              title="Secure session"
              description="SportZone keeps the access token in memory and restores the session with a secure refresh cookie."
            />
            <InfoRow
              icon={<MailOpen className="size-5" aria-hidden="true" />}
              title="Verification required"
              description="If your email is still pending, use the verification page before trying again."
            />
          </div>
        </div>

        <Card>
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
                placeholder="Enter your email or phone number"
              />

              <PasswordField
                value={values.password}
                onChange={handleFieldChange('password')}
                error={fieldErrors.password}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((current) => !current)}
                placeholder="Enter your password"
              />

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner className="size-5 animate-spin" aria-hidden="true" />
                    Logging in
                  </>
                ) : (
                  <>
                    Log in
                    <Login className="size-5" aria-hidden="true" />
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
      <Label htmlFor={id}>
        {label}
      </Label>
      <Input
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(error && 'border-destructive')}
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
  placeholder,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  showPassword: boolean;
  onTogglePassword: () => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">
        Password
      </Label>
      <div className="relative">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'password-error' : undefined}
          className={cn('pr-10', error && 'border-destructive')}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="soft-icon-button absolute right-1 top-1 size-8"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {error && <FieldError id="password-error" message={error} />}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="flex items-start gap-2 text-xs leading-5 text-destructive">
      <DangerCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function InlineAlert({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <Alert variant="destructive">
      <DangerCircle className="size-4" aria-hidden="true" />
      <AlertDescription>
        <p className="leading-6">{message}</p>
        {action}
      </AlertDescription>
    </Alert>
  );
}

function InfoRow({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

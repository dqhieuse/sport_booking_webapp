import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { ChangeEvent, FormEvent, ReactNode, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { registerLocalAccount } from '@/features/auth/api/authApi';
import type { AuthUserResponse, RegisterRequest } from '@/features/auth/types';
import { ApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { routePaths } from '@/routes/routePaths';

type RegisterFormValues = RegisterRequest & {
  confirmPassword: string;
};

type RegisterField = keyof RegisterFormValues;
type FieldErrors = Partial<Record<RegisterField, string>>;

const initialFormValues: RegisterFormValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s()]+$/;

function normalizeFormValues(values: RegisterFormValues): RegisterFormValues {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    password: values.password,
    confirmPassword: values.confirmPassword,
  };
}

function validateRegisterForm(values: RegisterFormValues): FieldErrors {
  const errors: FieldErrors = {};
  const normalizedValues = normalizeFormValues(values);

  if (!normalizedValues.fullName) {
    errors.fullName = 'Full name is required.';
  } else if (normalizedValues.fullName.length > 100) {
    errors.fullName = 'Full name must be at most 100 characters.';
  }

  if (!normalizedValues.email) {
    errors.email = 'Email is required.';
  } else if (!emailPattern.test(normalizedValues.email)) {
    errors.email = 'Enter a valid email address.';
  } else if (normalizedValues.email.length > 150) {
    errors.email = 'Email must be at most 150 characters.';
  }

  if (!normalizedValues.phone) {
    errors.phone = 'Phone number is required.';
  } else if (!phonePattern.test(normalizedValues.phone)) {
    errors.phone = 'Phone number can only contain digits, spaces, +, -, and parentheses.';
  } else if (normalizedValues.phone.length > 20) {
    errors.phone = 'Phone number must be at most 20 characters.';
  }

  if (!normalizedValues.password) {
    errors.password = 'Password is required.';
  } else if (normalizedValues.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  } else if (normalizedValues.password.length > 100) {
    errors.password = 'Password must be at most 100 characters.';
  }

  if (!normalizedValues.confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (normalizedValues.confirmPassword !== normalizedValues.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function mapApiErrors(errors: string[]): FieldErrors {
  return errors.reduce<FieldErrors>((mappedErrors, error) => {
    const [rawField, ...messageParts] = error.split(':');
    const field = rawField.trim() as RegisterField;
    const message = messageParts.join(':').trim();

    if (field in initialFormValues && message) {
      mappedErrors[field] = message;
    }

    return mappedErrors;
  }, {});
}

function mapApiMessageToFieldError(message: string): FieldErrors {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('email')) {
    return { email: message };
  }

  if (normalizedMessage.includes('phone')) {
    return { phone: message };
  }

  return {};
}

export function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>(initialFormValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<AuthUserResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordHint = useMemo(() => {
    if (!values.password) {
      return 'Use at least 6 characters.';
    }

    if (values.password.length < 6) {
      return `${6 - values.password.length} more characters needed.`;
    }

    return 'Password length looks good.';
  }, [values.password]);

  function handleFieldChange(field: RegisterField) {
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
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateRegisterForm(values);
    setFieldErrors(validationErrors);
    setApiMessage(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const normalizedValues = normalizeFormValues(values);
    const request: RegisterRequest = {
      fullName: normalizedValues.fullName,
      email: normalizedValues.email,
      phone: normalizedValues.phone,
      password: normalizedValues.password,
    };

    setIsSubmitting(true);
    try {
      const response = await registerLocalAccount(request);
      setRegisteredUser(response.data);
      setApiMessage(null);
      setValues(initialFormValues);
      setFieldErrors({});
    } catch (error) {
      if (error instanceof ApiError) {
        const mappedErrors = mapApiErrors(error.errors);
        const nextFieldErrors = Object.keys(mappedErrors).length > 0
          ? mappedErrors
          : mapApiMessageToFieldError(error.message);
        setFieldErrors(nextFieldErrors);
        setApiMessage(error.message);
        return;
      }

      setApiMessage('Could not create your account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="page-hero space-y-6 lg:sticky lg:top-24">
          <Badge className="w-fit gap-2 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
            Join SportZone
          </Badge>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Create your account and start booking faster.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground">
              Register with your email and phone number. After submitting, SportZone will send a verification link to
              your email before you can log in.
            </p>
          </div>

          <div className="grid gap-3">
            <InfoRow
              icon={<UserPlus className="h-5 w-5" aria-hidden="true" />}
              title="Simple account setup"
              description="Only your name, email, phone, and password are required."
            />
            <InfoRow
              icon={<Mail className="h-5 w-5" aria-hidden="true" />}
              title="Email verification"
              description="Check your inbox after registration to activate the account."
            />
            <InfoRow
              icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
              title="Protected credentials"
              description="Passwords are submitted securely to the backend and never displayed back."
            />
          </div>
        </div>

        <Card className="sportzone-panel">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Already have an account?{' '}
              <Link to={routePaths.login} className="font-medium text-primary">
                Log in
              </Link>
            </p>
          </CardHeader>
          <CardContent>
            {registeredUser ? (
              <RegistrationSuccess user={registeredUser} onRegisterAnother={() => setRegisteredUser(null)} />
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {apiMessage && Object.keys(fieldErrors).length === 0 && (
                  <InlineAlert message={apiMessage} />
                )}

                <TextField
                  id="fullName"
                  label="Full name"
                  value={values.fullName}
                  onChange={handleFieldChange('fullName')}
                  error={fieldErrors.fullName}
                  autoComplete="name"
                  placeholder="Duong Quoc Hieu"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleFieldChange('email')}
                    error={fieldErrors.email}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <TextField
                    id="phone"
                    label="Phone"
                    value={values.phone}
                    onChange={handleFieldChange('phone')}
                    error={fieldErrors.phone}
                    autoComplete="tel"
                    placeholder="0900000000"
                  />
                </div>

                <PasswordField
                  id="password"
                  label="Password"
                  value={values.password}
                  onChange={handleFieldChange('password')}
                  error={fieldErrors.password}
                  autoComplete="new-password"
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword((current) => !current)}
                  hint={passwordHint}
                />

                <PasswordField
                  id="confirmPassword"
                  label="Confirm password"
                  value={values.confirmPassword}
                  onChange={handleFieldChange('confirmPassword')}
                  error={fieldErrors.confirmPassword}
                  autoComplete="new-password"
                  showPassword={showConfirmPassword}
                  onTogglePassword={() => setShowConfirmPassword((current) => !current)}
                />

                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      Creating account
                    </>
                  ) : (
                    <>
                      Create account
                      <UserPlus className="h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type TextFieldProps = {
  id: RegisterField;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
};

function TextField({ id, label, value, onChange, error, type = 'text', autoComplete, placeholder }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          'soft-input h-12 w-full rounded-full px-4 text-sm',
          error && 'border-destructive/70',
        )}
      />
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'placeholder'> & {
  showPassword: boolean;
  onTogglePassword: () => void;
  hint?: string;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
  showPassword,
  onTogglePassword,
  hint,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={cn(
          'soft-input flex h-12 items-center rounded-full',
          error && 'border-destructive/70',
        )}
      >
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="soft-icon-button mr-2 h-9 w-9"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error ? <FieldError id={`${id}-error`} message={error} /> : hint ? <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p> : null}
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

function InlineAlert({ message }: { message: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-destructive/35 bg-destructive/10 p-4 text-sm text-foreground">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
      <p className="leading-6">{message}</p>
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

function RegistrationSuccess({ user, onRegisterAnother }: { user: AuthUserResponse; onRegisterAnother: () => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5">
        <div className="flex gap-4">
          <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We created your SportZone account and sent a verification link to{' '}
              <span className="font-medium text-foreground">{user.email}</span>.
            </p>
          </div>
        </div>
      </div>

      <dl className="grid gap-3 rounded-2xl border border-border/80 bg-secondary/70 p-4 text-sm sm:grid-cols-2">
        <AccountDetail label="Full name" value={user.fullName} />
        <AccountDetail label="Phone" value={user.phone} />
        <AccountDetail label="Status" value={user.status.replace(/_/g, ' ')} />
        <AccountDetail label="Email verified" value={user.emailVerified ? 'Yes' : 'No'} />
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to={routePaths.login}>Go to login</Link>
        </Button>
        <Button type="button" variant="secondary" onClick={onRegisterAnother}>
          Register another account
        </Button>
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

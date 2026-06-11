import { Clock3, FileText, MapPin, Phone, Save, Store } from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';

export type VendorVenueFormValues = {
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  description: string;
};

type VendorVenueFormProps = {
  values: VendorVenueFormValues;
  onChange: (values: VendorVenueFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  cancelUrl: string;
  isSubmitting: boolean;
  isSubmitDisabled?: boolean;
  isDirty?: boolean;
  onReset?: () => void;
  title: string;
  description: string;
  submitLabel: string;
  submittingLabel: string;
  sidebar?: ReactNode;
};

export function VendorVenueForm({
  values,
  onChange,
  onSubmit,
  cancelUrl,
  isSubmitting,
  isSubmitDisabled = false,
  isDirty = true,
  onReset,
  title,
  description,
  submitLabel,
  submittingLabel,
  sidebar,
}: VendorVenueFormProps) {
  function handleFieldChange(field: keyof VendorVenueFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ ...values, [field]: event.target.value });
    };
  }

  return (
    <form className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" onSubmit={onSubmit} noValidate>
      <div className="min-w-0 space-y-6">
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Store className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="mt-1 max-w-2xl">{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="venue-name">
                Venue name <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="venue-name"
                value={values.name}
                onChange={handleFieldChange('name')}
                placeholder="SportZone Cầu Giấy"
                maxLength={150}
                required
                className="h-11"
              />
              <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                <p>Use the name customers recognize on maps and booking pages.</p>
                <span className="shrink-0 tabular-nums">{values.name.length}/150</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="venue-description">Public description</Label>
              <Textarea
                id="venue-description"
                value={values.description}
                onChange={handleFieldChange('description')}
                placeholder="Describe the playing surfaces, parking, changing rooms, lighting, and other facilities..."
                maxLength={1000}
                rows={7}
                className="min-h-40 resize-y"
              />
              <div className="flex justify-between gap-4 text-xs text-muted-foreground">
                <p>Help customers understand what is available before booking.</p>
                <span className="shrink-0 tabular-nums">{values.description.length}/1000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <MapPin className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Location and contact</CardTitle>
                <CardDescription className="mt-1">
                  Contact details shown to customers who need directions or venue support.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-2">
              <Label htmlFor="venue-address">
                Full address <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <Input
                id="venue-address"
                value={values.address}
                onChange={handleFieldChange('address')}
                placeholder="123 Xuân Thủy, Cầu Giấy, Hà Nội"
                maxLength={255}
                required
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Include street number, ward/district, and city for clearer directions.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue-phone">
                Contact phone <span className="text-destructive" aria-hidden="true">*</span>
              </Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="venue-phone"
                  type="tel"
                  value={values.phone}
                  onChange={handleFieldChange('phone')}
                  placeholder="0987654321"
                  maxLength={20}
                  required
                  className="h-11 pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for venue-specific customer enquiries.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Clock3 className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <CardTitle>Operating hours</CardTitle>
                <CardDescription className="mt-1">
                  Set the daily time range in which this venue can operate.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="venue-opening">
                  Opening time <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="venue-opening"
                  type="time"
                  value={values.openingTime}
                  onChange={handleFieldChange('openingTime')}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue-closing">
                  Closing time <span className="text-destructive" aria-hidden="true">*</span>
                </Label>
                <Input
                  id="venue-closing"
                  type="time"
                  value={values.closingTime}
                  onChange={handleFieldChange('closingTime')}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium text-foreground">Daily schedule preview</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Open from <span className="font-medium text-foreground">{values.openingTime || '--:--'}</span> to{' '}
                  <span className="font-medium text-foreground">{values.closingTime || '--:--'}</span>.
                  Court time slots should remain inside this range.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6">
        {sidebar}

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Save venue</CardTitle>
              <Badge variant={isDirty ? 'secondary' : 'outline'}>
                {isDirty ? 'Unsaved changes' : 'Up to date'}
              </Badge>
            </div>
            <CardDescription>
              Review the public preview and required information before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Store className="size-4" aria-hidden="true" />
                <span>{values.name.trim() || 'Venue name is required'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                <span className="line-clamp-2">{values.address.trim() || 'Address is required'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="size-4" aria-hidden="true" />
                <span>{values.description.trim() ? 'Public description added' : 'No public description yet'}</span>
              </div>
            </div>

            <Separator />

            <Button type="submit" className="w-full" disabled={isSubmitting || isSubmitDisabled}>
              {isSubmitting ? <Spinner /> : <Save className="size-4" aria-hidden="true" />}
              {isSubmitting ? submittingLabel : submitLabel}
            </Button>

            {onReset && (
              <Button type="button" variant="outline" className="w-full" onClick={onReset} disabled={!isDirty || isSubmitting}>
                Discard changes
              </Button>
            )}

            <Button asChild type="button" variant="ghost" className="w-full">
              <Link to={cancelUrl}>Back to venues</Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </form>
  );
}

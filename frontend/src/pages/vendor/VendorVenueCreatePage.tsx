import { MapPinHouse, Plus, Refresh } from '@mynaui/icons-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from "sonner";
import { createVendorVenue } from '@/features/vendor/api/vendorApi';
import type { VendorVenueRequest } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type VenueFormValues = {
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  description: string;
};

const initialFormValues: VenueFormValues = {
  name: '',
  address: '',
  phone: '',
  openingTime: '06:00',
  closingTime: '22:00',
  description: '',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not create venue.';
}

function toVenueRequest(values: VenueFormValues): VendorVenueRequest {
  return {
    name: values.name.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    openingTime: values.openingTime,
    closingTime: values.closingTime,
    description: values.description.trim() || null,
  };
}

export function VendorVenueCreatePage() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<VenueFormValues>(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFieldChange(field: keyof VenueFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.address.trim() || !formValues.phone.trim()) {
      toast.error("Please fill in all required fields.", {
        description: "Name, address, and phone are required.",
      });
      return;
    }

    if (formValues.openingTime >= formValues.closingTime) {
      toast.error("Opening time must be before closing time.", {
        description: "Please adjust the times accordingly.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createVendorVenue(toVenueRequest(formValues));
      toast.success('Venue created successfully.', {
        description: 'The new venue has been created.',
      });
      navigate(routePaths.vendorVenues);
    } catch (error) {
      toast.error("Failed to create venue.", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="space-y-3">
        <Badge variant="outline" className="w-fit gap-2 px-3 py-1">
          <MapPinHouse className="size-3.5" aria-hidden="true" />
          Create venue
        </Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Tạo venue mới.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Tách form tạo venue khỏi trang quản lý danh sách để luồng thao tác rõ ràng hơn.
          </p>
        </div>
      </section>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Venue information</CardTitle>
          <CardDescription>Thông tin này sẽ hiển thị ở trang browsing public.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue name</Label>
              <Input id="venue-name" value={formValues.name} onChange={handleFieldChange('name')} placeholder="SportZone Cầu Giấy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-address">Address</Label>
              <Input id="venue-address" value={formValues.address} onChange={handleFieldChange('address')} placeholder="123 Xuân Thủy, Cầu Giấy" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-phone">Phone</Label>
              <Input id="venue-phone" value={formValues.phone} onChange={handleFieldChange('phone')} placeholder="0987654321" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="venue-opening">Opening time</Label>
                <Input id="venue-opening" type="time" value={formValues.openingTime} onChange={handleFieldChange('openingTime')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-closing">Closing time</Label>
                <Input id="venue-closing" type="time" value={formValues.closingTime} onChange={handleFieldChange('closingTime')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-description">Description</Label>
              <Textarea
                id="venue-description"
                value={formValues.description}
                onChange={handleFieldChange('description')}
                placeholder="Mô tả tiện ích, bãi xe, phòng thay đồ..."
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Refresh className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                Create venue
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to={routePaths.vendorVenues}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

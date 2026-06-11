import { Calendar, Plus, Refresh } from '@mynaui/icons-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { getPublicSports } from '@/features/sports/api/sportsApi';
import type { Sport } from '@/features/sports/types';
import { toast } from "sonner";
import { createVendorCourt, getVendorVenues } from '@/features/vendor/api/vendorApi';
import type { VendorCourtRequest, VendorVenue } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type CourtFormValues = {
  name: string;
  venueId: string;
  sportId: string;
  pricePerHour: string;
  description: string;
};

const initialFormValues: CourtFormValues = {
  name: '',
  venueId: '',
  sportId: '',
  pricePerHour: '',
  description: '',
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not create court.';
}

function toCourtRequest(values: CourtFormValues): VendorCourtRequest {
  return {
    name: values.name.trim(),
    venueId: Number(values.venueId),
    sportId: Number(values.sportId),
    pricePerHour: Number(values.pricePerHour),
    description: values.description.trim() || null,
  };
}

export function VendorCourtCreatePage() {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VendorVenue[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [formValues, setFormValues] = useState<CourtFormValues>(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOptions() {
      try {
        const [venueResponse, sportResponse] = await Promise.all([
          getVendorVenues({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
          getPublicSports(controller.signal),
        ]);

        setVenues(venueResponse.data.items);
        setSports(sportResponse.data.filter((sport) => sport.status === 'ACTIVE'));
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error('Failed to load options.', {
            description: getErrorMessage(error),
          });
        }
      }
    }

    void loadOptions();

    return () => controller.abort();
  }, []);

  function handleFieldChange(field: keyof CourtFormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormValues((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.venueId || !formValues.sportId || Number(formValues.pricePerHour) <= 0) {
      toast.error('Please fill in all required fields with valid values.', {
        description: 'Court name, venue, sport, and price per hour are required.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createVendorCourt(toCourtRequest(formValues));
      toast.success('Court created successfully.', {
        description: 'The court has been successfully created.',
      });
      navigate(routePaths.vendorCourts);
    } catch (error) {
      toast.error('Failed to create court.', {
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
          <Calendar className="size-3.5" aria-hidden="true" />
          Create court
        </Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Tạo court mới.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Court được tạo từ venue và sport đang active.
          </p>
        </div>
      </section>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Court information</CardTitle>
          <CardDescription>Thông tin giá và mô tả sẽ dùng cho luồng booking.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="court-name">Court name</Label>
              <Input id="court-name" value={formValues.name} onChange={handleFieldChange('name')} placeholder="Court A1" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="court-venue">Venue</Label>
                <Select value={formValues.venueId} onValueChange={(value) => setFormValues((current) => ({ ...current, venueId: value }))}>
                  <SelectTrigger id="court-venue">
                    <SelectValue placeholder="Choose venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={String(venue.id)}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="court-sport">Sport</Label>
                <Select value={formValues.sportId} onValueChange={(value) => setFormValues((current) => ({ ...current, sportId: value }))}>
                  <SelectTrigger id="court-sport">
                    <SelectValue placeholder="Choose sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map((sport) => (
                      <SelectItem key={sport.id} value={String(sport.id)}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-price">Price per hour</Label>
              <Input id="court-price" type="number" min="0" step="1000" value={formValues.pricePerHour} onChange={handleFieldChange('pricePerHour')} placeholder="150000" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-description">Description</Label>
              <Textarea id="court-description" value={formValues.description} onChange={handleFieldChange('description')} placeholder="Mặt sân, ánh sáng, tiện ích..." />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Refresh className="size-4 animate-spin" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                Create court
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to={routePaths.vendorCourts}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

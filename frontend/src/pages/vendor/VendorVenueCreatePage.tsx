import { CheckCircle2, MapPinHouse } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createVendorVenue } from '@/features/vendor/api/vendorApi';
import { ConfirmActionDialog } from '@/features/vendor/components/ConfirmActionDialog';
import { CreationStepIndicator } from '@/features/vendor/components/CreationStepIndicator';
import { VendorEntityImageManager } from '@/features/vendor/components/VendorEntityImageManager';
import {
  VendorVenueForm,
  type VendorVenueFormValues,
} from '@/features/vendor/components/VendorVenueForm';
import type { VendorVenueDetail, VendorVenueRequest } from '@/features/vendor/types';
import { getVendorVenueEditPath, routePaths } from '@/routes/routePaths';

const initialFormValues: VendorVenueFormValues = {
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

function toVenueRequest(values: VendorVenueFormValues): VendorVenueRequest {
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
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<VendorVenueFormValues>(initialFormValues);
  const [createdVenue, setCreatedVenue] = useState<VendorVenueDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  function requestCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.address.trim() || !formValues.phone.trim()) {
      toast.error('Please fill in all required fields.', {
        description: 'Name, address, and phone are required.',
      });
      return;
    }

    if (formValues.openingTime >= formValues.closingTime) {
      toast.error('Opening time must be before closing time.');
      return;
    }

    setShowCreateConfirm(true);
  }

  async function confirmCreate() {
    setIsSubmitting(true);
    try {
      const response = await createVendorVenue(toVenueRequest(formValues));
      setCreatedVenue(response.data);
      setShowCreateConfirm(false);
      setStep(2);
      toast.success('Venue information saved.', {
        description: 'You can now upload images for this venue.',
      });
    } catch (error) {
      toast.error('Failed to create venue.', { description: getErrorMessage(error) });
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
            Create a new venue.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Save the basic information first, then upload images in a separate API step.
          </p>
        </div>
      </section>

      <CreationStepIndicator currentStep={step} steps={['Basic information', 'Add images', 'Complete']} />

      {step === 1 && (
        <VendorVenueForm
          values={formValues}
          onChange={setFormValues}
          onSubmit={requestCreate}
          cancelUrl={routePaths.vendorVenues}
          isSubmitting={isSubmitting}
          title="Venue information"
          description="Review the information before confirming. Creating this step saves the venue immediately."
          submitLabel="Review and create"
          submittingLabel="Creating..."
        />
      )}

      {step === 2 && createdVenue && (
        <div className="space-y-5">
          <VendorEntityImageManager
            targetType="venue"
            targetId={createdVenue.id}
            targetName={createdVenue.name}
          />
          <div className="flex justify-end">
            <Button type="button" onClick={() => setShowFinishConfirm(true)}>
              Continue to completion
            </Button>
          </div>
        </div>
      )}

      {step === 3 && createdVenue && (
        <Card className="mx-auto max-w-2xl text-center">
          <CardHeader>
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <CardTitle className="mt-3 text-2xl">Venue setup completed</CardTitle>
            <CardDescription>
              {createdVenue.name} has been saved. You can edit its information or manage it from the venue list.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col justify-center gap-2 sm:flex-row">
            <Button asChild>
              <Link to={getVendorVenueEditPath(createdVenue.id)}>Open venue editor</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={routePaths.vendorVenues}>Back to venues</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <ConfirmActionDialog
        open={showCreateConfirm}
        onOpenChange={setShowCreateConfirm}
        title="Create this venue?"
        description={
          <>
            The basic information for <strong className="text-foreground">{formValues.name || 'this venue'}</strong> will
            be saved now. Images are uploaded separately in the next step.
          </>
        }
        confirmLabel="Create venue"
        onConfirm={() => void confirmCreate()}
        isConfirming={isSubmitting}
      />

      <ConfirmActionDialog
        open={showFinishConfirm}
        onOpenChange={setShowFinishConfirm}
        title="Finish venue setup?"
        description="You can still add, remove, or change the primary image later from the Edit Venue page."
        confirmLabel="Finish setup"
        onConfirm={() => {
          setShowFinishConfirm(false);
          setStep(3);
        }}
      />
    </div>
  );
}

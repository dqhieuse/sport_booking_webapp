import { Image, Refresh, Upload } from '@mynaui/icons-react';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from "sonner";
import { getVendorCourts, getVendorVenues, uploadVendorCourtImage, uploadVendorVenueImage } from '@/features/vendor/api/vendorApi';
import type { VendorCourt, VendorVenue } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type GalleryTargetType = 'venue' | 'court';

const NO_TARGET_VALUE = 'none';
const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSizeBytes = 5 * 1024 * 1024;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not upload image.';
}

function validateImageFile(file: File) {
  if (!acceptedImageTypes.includes(file.type)) {
    return 'Image must be JPEG, PNG, or WebP.';
  }

  if (file.size > maxImageSizeBytes) {
    return 'Image must be at most 5MB.';
  }

  return null;
}

export function VendorImageCreatePage() {
  const navigate = useNavigate();
  const [targetType, setTargetType] = useState<GalleryTargetType>('venue');
  const [selectedTargetId, setSelectedTargetId] = useState(NO_TARGET_VALUE);
  const [venues, setVenues] = useState<VendorVenue[]>([]);
  const [courts, setCourts] = useState<VendorCourt[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrimaryUpload, setIsPrimaryUpload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTargets() {
      try {
        const [venueResponse, courtResponse] = await Promise.all([
          getVendorVenues({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
          getVendorCourts({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
        ]);

        setVenues(venueResponse.data.items);
        setCourts(courtResponse.data.items);
        setSelectedTargetId(venueResponse.data.items[0] ? String(venueResponse.data.items[0].id) : NO_TARGET_VALUE);
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error("Failed to load venues and courts.", {
            description: getErrorMessage(error),
          });
        }
      }
    }

    void loadTargets();

    return () => controller.abort();
  }, []);

  const targets = targetType === 'venue' ? venues : courts;

  function handleTargetTypeChange(value: string) {
    const nextType = value as GalleryTargetType;
    const nextTargets = nextType === 'venue' ? venues : courts;
    setTargetType(nextType);
    setSelectedTargetId(nextTargets[0] ? String(nextTargets[0].id) : NO_TARGET_VALUE);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      event.target.value = '';
      setSelectedFile(null);
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedTargetId === NO_TARGET_VALUE || !selectedFile) {
      toast.error('Choose a target and an image before uploading.');
      return;
    }

    setIsSubmitting(true);

    try {
      const targetId = Number(selectedTargetId);

      if (targetType === 'venue') {
        await uploadVendorVenueImage(targetId, selectedFile, { isPrimary: isPrimaryUpload });
      } else {
        await uploadVendorCourtImage(targetId, selectedFile, { isPrimary: isPrimaryUpload });
      }

      toast.success('Image uploaded successfully.', {
        description: 'The new image has been uploaded to the gallery.',
      });
      navigate(routePaths.vendorImages);
    } catch (error) {
      toast.error("Failed to upload image.", {
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
          <Image className="size-3.5" aria-hidden="true" />
          Upload image
        </Badge>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            Upload ảnh mới.
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Tạo ảnh venue/court ở trang riêng, không đặt form upload trong gallery.
          </p>
        </div>
      </section>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Image target</CardTitle>
          <CardDescription>Chọn venue/court active rồi upload ảnh mới.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="target-type">Target type</Label>
              <Select value={targetType} onValueChange={handleTargetTypeChange}>
                <SelectTrigger id="target-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="court">Court</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-select">Target</Label>
              <Select value={selectedTargetId} onValueChange={setSelectedTargetId} disabled={targets.length === 0}>
                <SelectTrigger id="target-select">
                  <SelectValue placeholder="Choose target" />
                </SelectTrigger>
                <SelectContent>
                  {targets.map((target) => (
                    <SelectItem key={target.id} value={String(target.id)}>
                      {target.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-image">Image file</Label>
              <Input id="vendor-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
              <p className="text-xs text-muted-foreground">JPEG, PNG hoặc WebP. Tối đa 5MB.</p>
            </div>

            <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={isPrimaryUpload}
                onChange={(event) => setIsPrimaryUpload(event.target.checked)}
              />
              Đặt làm ảnh đại diện sau khi upload
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" disabled={isSubmitting || !selectedFile || selectedTargetId === NO_TARGET_VALUE}>
                {isSubmitting ? <Refresh className="size-4 animate-spin" aria-hidden="true" /> : <Upload className="size-4" aria-hidden="true" />}
                Upload image
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to={routePaths.vendorImages}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

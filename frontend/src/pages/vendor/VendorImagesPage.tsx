import { Image, Plus, Refresh, Save, Star, Trash } from '@mynaui/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { EmptyState } from '@/components/empty-state';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicCourtImages } from '@/features/courts/api/courtsApi';
import { toast } from "sonner";
import { getPublicVenueImages } from '@/features/venues/api/venuesApi';
import {
  deleteVendorCourtImage,
  deleteVendorVenueImage,
  getVendorCourts,
  getVendorVenues,
  setPrimaryVendorCourtImage,
  setPrimaryVendorVenueImage,
} from '@/features/vendor/api/vendorApi';
import type { VendorCourt, VendorManagedImage, VendorVenue } from '@/features/vendor/types';
import { routePaths } from '@/routes/routePaths';

type GalleryTargetType = 'venue' | 'court';
type LoadState = 'idle' | 'loading' | 'success' | 'error';

const NO_TARGET_VALUE = 'none';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not load vendor images.';
}

export function VendorImagesPage() {
  const [targetType, setTargetType] = useState<GalleryTargetType>('venue');
  const [selectedTargetId, setSelectedTargetId] = useState(NO_TARGET_VALUE);
  const [venues, setVenues] = useState<VendorVenue[]>([]);
  const [courts, setCourts] = useState<VendorCourt[]>([]);
  const [images, setImages] = useState<VendorManagedImage[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [imageLoadState, setImageLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageErrorMessage, setImageErrorMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [imageReloadKey, setImageReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTargets() {
      setLoadState('loading');
      setErrorMessage(null);

      try {
        const [venueResponse, courtResponse] = await Promise.all([
          getVendorVenues({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
          getVendorCourts({ status: 'ACTIVE', page: 0, size: 100 }, controller.signal),
        ]);

        setVenues(venueResponse.data.items);
        setCourts(courtResponse.data.items);
        setLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
        setLoadState('error');
      }
    }

    void loadTargets();

    return () => controller.abort();
  }, [reloadKey]);

  const targets = targetType === 'venue' ? venues : courts;

  useEffect(() => {
    setSelectedTargetId(targets[0] ? String(targets[0].id) : NO_TARGET_VALUE);
    setImages([]);
  }, [targetType, targets]);

  useEffect(() => {
    if (selectedTargetId === NO_TARGET_VALUE) {
      setImages([]);
      setImageLoadState('success');
      return;
    }

    const controller = new AbortController();

    async function loadImages() {
      setImageLoadState('loading');
      setImageErrorMessage(null);

      try {
        const targetId = Number(selectedTargetId);
        const response =
          targetType === 'venue'
            ? await getPublicVenueImages(targetId, controller.signal)
            : await getPublicCourtImages(targetId, controller.signal);

        setImages(response.data);
        setImageLoadState('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setImageErrorMessage(getErrorMessage(error));
        setImageLoadState('error');
      }
    }

    void loadImages();

    return () => controller.abort();
  }, [imageReloadKey, selectedTargetId, targetType]);

  const selectedTarget = useMemo(
    () => targets.find((target) => String(target.id) === selectedTargetId) || null,
    [selectedTargetId, targets],
  );
  const isLoadingTargets = loadState === 'idle' || loadState === 'loading';
  const isLoadingImages = imageLoadState === 'idle' || imageLoadState === 'loading';
  const hasNoTargets = loadState === 'success' && targets.length === 0;

  async function handleSetPrimary(imageId: number) {
    if (!selectedTarget) {
      return;
    }

    setIsMutating(true);

    try {
      if (targetType === 'venue') {
        await setPrimaryVendorVenueImage(selectedTarget.id, imageId);
      } else {
        await setPrimaryVendorCourtImage(selectedTarget.id, imageId);
      }

      toast.success('Primary image updated.', {
        description: 'The selected image is now the primary image for this venue/court.',
      });
      setImageReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('Failed to update primary image.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDelete(imageId: number) {
    if (!selectedTarget) {
      return;
    }

    setIsMutating(true);

    try {
      if (targetType === 'venue') {
        await deleteVendorVenueImage(selectedTarget.id, imageId);
      } else {
        await deleteVendorCourtImage(selectedTarget.id, imageId);
      }

      toast.success('Image deleted.', {
        description: 'The image has been successfully deleted.',
      });
      setImageReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('Failed to delete image.', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="page-shell">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              Manage images for your venues and courts.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              View images, set primary images, and delete unused images. Upload new images on their respective pages.
            </p>
          </div>
        </div>
        <Button className="size-fit px-3 !no-underline" asChild>
          <Link to={routePaths.vendorImageCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Upload image
          </Link>
        </Button>
      </section>

      {loadState === 'error' && (
        <ApiErrorMessage
          title="Unable to load image targets"
          message={errorMessage}
          onRetry={() => setReloadKey((current) => current + 1)}
        />
      )}

      {isLoadingTargets && <GallerySkeleton />}

      {loadState === 'success' && (
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-xl">{selectedTarget?.name || 'Image gallery'}</CardTitle>
              <CardDescription>
                Image is ordered by their sort order. Primary image is shown first on the venue/court page and highlighted with a badge.
              </CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setImageReloadKey((current) => current + 1)}>
              <Refresh className="size-4" aria-hidden="true" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target-type">Target type</Label>
                <Select value={targetType} onValueChange={(value) => setTargetType(value as GalleryTargetType)}>
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
            </div>

            {hasNoTargets && (
              <EmptyState
                icon={<Image className="size-6" aria-hidden="true" />}
                title={`Chưa có ${targetType} active`}
                description="Tạo hoặc kích hoạt dữ liệu trước khi quản lý ảnh."
                className="max-w-none border"
              />
            )}

            {isLoadingImages && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-[4/3]" />
                ))}
              </div>
            )}

            {imageLoadState === 'error' && (
              <ApiErrorMessage
                title="Unable to load images"
                message={imageErrorMessage}
                onRetry={() => setImageReloadKey((current) => current + 1)}
              />
            )}

            {imageLoadState === 'success' && images.length === 0 && !hasNoTargets && (
              <EmptyState
                icon={<Image className="size-6" aria-hidden="true" />}
                title="Chưa có ảnh"
                description="Upload ảnh đầu tiên để hiển thị venue/court tốt hơn."
                className="max-w-none border"
              />
            )}

            {imageLoadState === 'success' && images.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((image) => (
                  <article key={image.id} className="overflow-hidden rounded-lg border bg-background">
                    <div className="relative aspect-[4/3] bg-muted">
                      <img src={image.imageUrl} alt="" className="h-full w-full object-cover" />
                      {image.isPrimary && (
                        <Badge className="absolute left-3 top-3 gap-1">
                          <Star className="size-3.5" aria-hidden="true" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3 p-3">
                      <p className="text-xs text-muted-foreground">Sort order: {image.sortOrder}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={isMutating || image.isPrimary}
                          onClick={() => handleSetPrimary(image.id)}
                          className="w-full"
                        >
                          <Save className="size-4" aria-hidden="true" />
                          Primary
                        </Button>
                        <Button
                          type="button"
                          variant="destructive_ghost"
                          className="w-full"
                          disabled={isMutating}
                          onClick={() => handleDelete(image.id)}
                        >
                          <Trash className="size-4" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GallerySkeleton() {
  return (
    <Card aria-busy="true">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3]" />
        ))}
      </CardContent>
    </Card>
  );
}

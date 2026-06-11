import { ImagePlus, Images, RefreshCw, Star, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { EmptyState } from '@/components/empty-state';
import { ApiErrorMessage } from '@/components/ui/api-error-message';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicCourtImages } from '@/features/courts/api/courtsApi';
import { getPublicVenueImages } from '@/features/venues/api/venuesApi';
import {
  deleteVendorCourtImage,
  deleteVendorVenueImage,
  setPrimaryVendorCourtImage,
  setPrimaryVendorVenueImage,
  uploadVendorCourtImage,
  uploadVendorVenueImage,
} from '@/features/vendor/api/vendorApi';
import type { VendorManagedImage } from '@/features/vendor/types';

import { ConfirmActionDialog } from './ConfirmActionDialog';

type TargetType = 'venue' | 'court';
type PendingAction =
  | { type: 'upload' }
  | { type: 'primary'; imageId: number }
  | { type: 'delete'; imageId: number }
  | null;

const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSizeBytes = 5 * 1024 * 1024;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Could not process image.';
}

export function VendorEntityImageManager({
  targetType,
  targetId,
  targetName,
  onImagesChanged,
}: {
  targetType: TargetType;
  targetId: number;
  targetName: string;
  onImagesChanged?: (images: VendorManagedImage[]) => void;
}) {
  const [images, setImages] = useState<VendorManagedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPrimaryUpload, setIsPrimaryUpload] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onImagesChangedRef = useRef(onImagesChanged);

  useEffect(() => {
    onImagesChangedRef.current = onImagesChanged;
  }, [onImagesChanged]);

  const loadImages = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response =
        targetType === 'venue'
          ? await getPublicVenueImages(targetId, signal)
          : await getPublicCourtImages(targetId, signal);
      const nextImages = [...response.data].sort((a, b) => {
        if (a.isPrimary) return -1;
        if (b.isPrimary) return 1;
        return a.sortOrder - b.sortOrder;
      });
      setImages(nextImages);
      onImagesChangedRef.current?.(nextImages);
    } catch (error) {
      if (!signal?.aborted) {
        setLoadError(getErrorMessage(error));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [targetId, targetType]);

  useEffect(() => {
    const controller = new AbortController();
    void loadImages(controller.signal);
    return () => controller.abort();
  }, [loadImages, reloadKey]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      toast.error('Image must be JPEG, PNG, or WebP.');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    if (file.size > maxImageSizeBytes) {
      toast.error('Image must be at most 5MB.');
      event.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function confirmAction() {
    if (!pendingAction) return;
    setIsMutating(true);

    try {
      if (pendingAction.type === 'upload') {
        if (!selectedFile) return;
        if (targetType === 'venue') {
          await uploadVendorVenueImage(targetId, selectedFile, { isPrimary: isPrimaryUpload });
        } else {
          await uploadVendorCourtImage(targetId, selectedFile, { isPrimary: isPrimaryUpload });
        }
        toast.success('Image uploaded successfully.');
        setSelectedFile(null);
        setIsPrimaryUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }

      if (pendingAction.type === 'primary') {
        if (targetType === 'venue') {
          await setPrimaryVendorVenueImage(targetId, pendingAction.imageId);
        } else {
          await setPrimaryVendorCourtImage(targetId, pendingAction.imageId);
        }
        toast.success('Primary image updated.');
      }

      if (pendingAction.type === 'delete') {
        if (targetType === 'venue') {
          await deleteVendorVenueImage(targetId, pendingAction.imageId);
        } else {
          await deleteVendorCourtImage(targetId, pendingAction.imageId);
        }
        toast.success('Image deleted.');
      }

      setPendingAction(null);
      setReloadKey((current) => current + 1);
    } catch (error) {
      toast.error('Image action failed.', { description: getErrorMessage(error) });
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Images className="size-5" aria-hidden="true" />
            Images
          </CardTitle>
          <CardDescription className="mt-1">
            Upload and manage images for {targetName}. Each image action is saved immediately.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setReloadKey((current) => current + 1)}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor={`${targetType}-${targetId}-image`}>Add image</Label>
            <Input
              ref={fileInputRef}
              id={`${targetType}-${targetId}-image`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${targetType}-${targetId}-primary`}
                checked={isPrimaryUpload}
                onCheckedChange={(checked) => setIsPrimaryUpload(checked === true)}
              />
              <Label htmlFor={`${targetType}-${targetId}-primary`} className="font-normal">
                Set as primary image
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">JPEG, PNG, or WebP. Maximum 5MB.</p>
          </div>
          <Button type="button" disabled={!selectedFile || isMutating} onClick={() => setPendingAction({ type: 'upload' })}>
            <Upload className="size-4" aria-hidden="true" />
            Upload image
          </Button>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/3]" />
            ))}
          </div>
        )}

        {loadError && (
          <ApiErrorMessage
            title="Unable to load images"
            message={loadError}
            onRetry={() => setReloadKey((current) => current + 1)}
          />
        )}

        {!isLoading && !loadError && images.length === 0 && (
          <EmptyState
            icon={<ImagePlus className="size-6" aria-hidden="true" />}
            title="No images yet"
            description="Upload the first image to improve the public listing."
            className="max-w-none border"
          />
        )}

        {!isLoading && !loadError && images.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="grid grid-cols-2 gap-2 p-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={image.isPrimary || isMutating}
                    onClick={() => setPendingAction({ type: 'primary', imageId: image.id })}
                  >
                    <Star className="size-4" aria-hidden="true" />
                    Primary
                  </Button>
                  <Button
                    type="button"
                    variant="destructive_ghost"
                    className="w-full"
                    disabled={isMutating}
                    onClick={() => setPendingAction({ type: 'delete', imageId: image.id })}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmActionDialog
        open={pendingAction !== null}
        onOpenChange={(open) => !open && !isMutating && setPendingAction(null)}
        title={
          pendingAction?.type === 'upload'
            ? 'Upload this image?'
            : pendingAction?.type === 'primary'
              ? 'Set as primary image?'
              : 'Delete this image?'
        }
        description={
          pendingAction?.type === 'delete'
            ? 'The image will be permanently removed from this listing.'
            : 'This action will be saved immediately and reflected in the venue/court gallery.'
        }
        confirmLabel={
          pendingAction?.type === 'upload'
            ? 'Upload'
            : pendingAction?.type === 'primary'
              ? 'Set primary'
              : 'Delete'
        }
        variant={pendingAction?.type === 'delete' ? 'destructive_ghost' : 'default'}
        onConfirm={() => void confirmAction()}
        isConfirming={isMutating}
      />
    </Card>
  );
}

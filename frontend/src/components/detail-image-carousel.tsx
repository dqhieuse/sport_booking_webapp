import { useEffect, useState } from 'react';

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { EmptyState } from '@/components/empty-state';
import { ImageRectangle } from '@mynaui/icons-react';

type DetailImage = {
  id: number;
  imageUrl: string;
};

type DetailImageCarouselProps = {
  images: DetailImage[];
  itemName: string;
};

export function DetailImageCarousel({ images, itemName }: DetailImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const carouselApi = api;
    setCurrentIndex(carouselApi.selectedScrollSnap());

    function handleSelect() {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    }

    carouselApi.on('select', handleSelect);
    carouselApi.on('reInit', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
      carouselApi.off('reInit', handleSelect);
    };
  }, [api]);

  if (images.length === 0) {
    return (
      <EmptyState
        icon={<ImageRectangle className="size-6" aria-hidden="true" />}
        title="No images available"
        description={`${itemName} has not added public images yet.`}
        className="aspect-[16/7] max-w-none rounded-lg border bg-card"
      />
    );
  }

  return (
    <div className="space-y-3">
      <Carousel setApi={setApi} opts={{ loop: images.length > 1 }} className="w-full">
        <CarouselContent className="-ml-0">
          {images.map((image, index) => (
            <CarouselItem key={image.id} className="overflow-hidden rounded-lg pl-0">
              <div className="relative aspect-[16/7] w-full overflow-hidden rounded-lg border shadow-sm">
                <img
                  src={image.imageUrl}
                  alt={`${itemName} image ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                {images.length > 1 && (
                  <p className="absolute bottom-3 right-4 text-xs text-white/90">
                    {currentIndex + 1} / {images.length}
                  </p>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <CarouselPrevious className="border-white/60 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18)] dark:border-white/20" />
            <CarouselNext className="border-white/60 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.18)] dark:border-white/20" />
          </>
        )}
      </Carousel>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => api?.scrollTo(index)}
              aria-label={`View image ${index + 1}`}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border transition-[border-color,opacity] duration-200 ${
                index === currentIndex ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={image.imageUrl}
                alt={`${itemName} thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import type { MouseEvent } from 'react';

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
};

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const pages = new Set([0, totalPages - 1, currentPage]);

  if (currentPage > 0) {
    pages.add(currentPage - 1);
  }

  if (currentPage + 1 < totalPages) {
    pages.add(currentPage + 1);
  }

  return Array.from(pages).sort((first, second) => first - second);
}

export function PaginationControls({ page, totalPages, totalItems, itemLabel, onPageChange }: PaginationControlsProps) {
  const normalizedTotalPages = Math.max(totalPages, 1);
  const visiblePages = getVisiblePages(page, normalizedTotalPages);

  function handlePageClick(nextPage: number) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();

      if (nextPage < 0 || nextPage >= normalizedTotalPages || nextPage === page) {
        return;
      }

      onPageChange(nextPage);
    };
  }

  return (
    <Pagination className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing page {page + 1} of {normalizedTotalPages} · {totalItems} {itemLabel}
      </p>
      <PaginationContent className="gap-0.5">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={handlePageClick(page - 1)}
            aria-disabled={page <= 0}
            tabIndex={page <= 0 ? -1 : undefined}
            className={cn(page <= 0 && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>

        {visiblePages.map((visiblePage, index) => {
          const previousPage = visiblePages[index - 1];
          const showEllipsis = previousPage !== undefined && visiblePage - previousPage > 1;

          return (
            <PaginationItem key={visiblePage} className="flex items-center">
              {showEllipsis && <PaginationEllipsis />}
              <PaginationLink href="#" isActive={visiblePage === page} onClick={handlePageClick(visiblePage)}>
                {visiblePage + 1}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={handlePageClick(page + 1)}
            aria-disabled={page + 1 >= normalizedTotalPages}
            tabIndex={page + 1 >= normalizedTotalPages ? -1 : undefined}
            className={cn(page + 1 >= normalizedTotalPages && 'pointer-events-none opacity-50')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

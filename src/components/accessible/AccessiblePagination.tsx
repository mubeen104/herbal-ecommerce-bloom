import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessiblePaginationProps {
  /**
   * Total number of items
   */
  totalItems: number;
  /**
   * Items per page
   */
  itemsPerPage: number;
  /**
   * Current page (1-indexed)
   */
  currentPage: number;
  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void;
  /**
   * Allow user to change items per page
   */
  allowItemsPerPageChange?: boolean;
  /**
   * Available page size options
   */
  pageSizeOptions?: number[];
  /**
   * Callback when items per page changes
   */
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  /**
   * Show page size selector
   */
  showPageSize?: boolean;
  /**
   * Show total count
   */
  showTotal?: boolean;
  /**
   * Show first/last page buttons
   */
  showFirstLast?: boolean;
  /**
   * Maximum page buttons to show
   */
  maxPageButtons?: number;
  /**
   * Scroll to top on page change
   */
  scrollToTop?: boolean;
  /**
   * Target element ID to scroll to
   */
  scrollTargetId?: string;
  /**
   * aria-label for navigation
   */
  ariaLabel?: string;
}

/**
 * Accessible Pagination Component
 *
 * Replacement for infinite scroll that provides better accessibility and usability.
 *
 * Features:
 * - Full keyboard navigation
 * - Screen reader friendly
 * - Shows total results
 * - Allows direct page navigation
 * - Deep linkable (can be combined with URL params)
 * - Browser back button friendly
 * - Scroll position management
 * - Footer remains accessible
 *
 * WCAG 2.2 Compliance:
 * - 2.1.1 Keyboard (Level A) ✓
 * - 2.4.3 Focus Order (Level A) ✓
 * - 2.4.7 Focus Visible (Level AA) ✓
 * - 3.2.3 Consistent Navigation (Level AA) ✓
 */
export const AccessiblePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  allowItemsPerPageChange = true,
  pageSizeOptions = [10, 20, 50, 100],
  onItemsPerPageChange,
  showPageSize = true,
  showTotal = true,
  showFirstLast = true,
  maxPageButtons = 7,
  scrollToTop = true,
  scrollTargetId = 'main-content',
  ariaLabel = 'Pagination navigation'
}: AccessiblePaginationProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const announcementRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) {
      return;
    }

    onPageChange(newPage);

    // Scroll to top or target element
    if (scrollToTop) {
      const target = document.getElementById(scrollTargetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }

    // Announce page change to screen readers
    if (announcementRef.current) {
      announcementRef.current.textContent = `Page ${newPage} of ${totalPages}. Showing items ${(newPage - 1) * itemsPerPage + 1} to ${Math.min(newPage * itemsPerPage, totalItems)} of ${totalItems}.`;
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newSize = parseInt(value, 10);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newSize);
      // Reset to page 1 when changing page size
      onPageChange(1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= maxPageButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfWindow = Math.floor(maxPageButtons / 2);

    // Always show first page
    pages.push(1);

    if (currentPage <= halfWindow + 2) {
      // Near start
      for (let i = 2; i <= maxPageButtons - 2; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - halfWindow - 1) {
      // Near end
      pages.push('...');
      for (let i = totalPages - maxPageButtons + 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Middle
      pages.push('...');
      for (let i = currentPage - halfWindow + 1; i <= currentPage + halfWindow - 1; i++) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return showTotal ? (
      <div className="text-sm text-muted-foreground text-center py-4">
        Showing all {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </div>
    ) : null;
  }

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className="space-y-4"
    >
      {/* Results info */}
      {showTotal && (
        <div className="text-sm text-muted-foreground text-center md:text-left">
          Showing <span className="font-medium text-foreground">{startItem}</span> to{' '}
          <span className="font-medium text-foreground">{endItem}</span> of{' '}
          <span className="font-medium text-foreground">{totalItems}</span> results
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Page size selector */}
        {showPageSize && allowItemsPerPageChange && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label htmlFor="page-size" className="text-sm text-muted-foreground whitespace-nowrap">
              Items per page:
            </label>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger
                id="page-size"
                className="w-20"
                aria-label="Select number of items per page"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          {/* First page */}
          {showFirstLast && !isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
              className="h-9 w-9"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Previous page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 text-muted-foreground"
                    aria-hidden="true"
                  >
                    ...
                  </span>
                );
              }

              const page = pageNum as number;
              const isCurrentPage = page === currentPage;

              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handlePageChange(page)}
                  aria-label={`${isCurrentPage ? 'Current page, ' : ''}Page ${page}`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                  className={cn(
                    'h-9 w-9',
                    isCurrentPage && 'pointer-events-none'
                  )}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next page */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Last page */}
          {showFirstLast && !isMobile && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
              className="h-9 w-9"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile: Show current page */}
        {isMobile && (
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Screen reader announcement region */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </nav>
  );
};

export default AccessiblePagination;

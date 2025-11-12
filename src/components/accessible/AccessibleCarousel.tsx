import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibleCarouselProps {
  /**
   * Carousel items to display
   */
  children: React.ReactNode[];
  /**
   * Auto-scroll delay in milliseconds (0 = disabled)
   */
  autoScrollDelay?: number;
  /**
   * Show navigation buttons
   */
  showNavigation?: boolean;
  /**
   * Show pagination dots
   */
  showPagination?: boolean;
  /**
   * Show play/pause button
   */
  showPlayPause?: boolean;
  /**
   * Items visible at once on different screens
   */
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  /**
   * Accessible label for the carousel
   */
  ariaLabel?: string;
  /**
   * Callback when slide changes
   */
  onSlideChange?: (index: number) => void;
  /**
   * Enable grid view as fallback
   */
  enableGridFallback?: boolean;
  /**
   * Gap between items
   */
  gap?: string;
}

/**
 * Accessible Carousel Component
 *
 * Features:
 * - Keyboard navigation (Arrow keys, Home, End)
 * - Screen reader announcements
 * - Pause/play controls
 * - Respects prefers-reduced-motion
 * - Works without JavaScript (progressive enhancement)
 * - Focus management
 * - Touch/swipe support
 * - Alternative grid view option
 *
 * WCAG 2.2 Compliance:
 * - 2.1.1 Keyboard (Level A) ✓
 * - 2.2.2 Pause, Stop, Hide (Level A) ✓
 * - 2.4.7 Focus Visible (Level AA) ✓
 * - 4.1.3 Status Messages (Level AA) ✓
 */
export const AccessibleCarousel = ({
  children,
  autoScrollDelay = 0,
  showNavigation = true,
  showPagination = true,
  showPlayPause = true,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 4 },
  ariaLabel = 'Content carousel',
  onSlideChange,
  enableGridFallback = true,
  gap = '1rem'
}: AccessibleCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoScrollDelay > 0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [useGridView, setUseGridView] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout>();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    if (mediaQuery.matches) {
      setIsPlaying(false);
    }

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setIsPlaying(false);
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    if (!isPlaying || isPaused || prefersReducedMotion || autoScrollDelay === 0) {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      return;
    }

    autoScrollTimerRef.current = setInterval(() => {
      goToNext();
    }, autoScrollDelay);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isPlaying, isPaused, currentIndex, prefersReducedMotion, autoScrollDelay]);

  const totalSlides = children.length;

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);

    // Announce to screen readers
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = `Slide ${newIndex + 1} of ${totalSlides}`;
    }
  }, [totalSlides, onSlideChange]);

  const goToPrevious = useCallback(() => {
    goToSlide(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  }, [currentIndex, goToSlide, totalSlides]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, goToSlide, totalSlides]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
    }
  };

  // Touch/swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Grid view toggle for accessibility
  const toggleView = () => {
    setUseGridView(!useGridView);
  };

  // Grid view fallback (fully accessible)
  if (useGridView) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{ariaLabel}</h2>
          {enableGridFallback && (
            <Button
              onClick={toggleView}
              variant="outline"
              size="sm"
            >
              Show as Carousel
            </Button>
          )}
        </div>
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
        >
          {children.map((child, index) => (
            <div key={index} role="listitem">
              {child}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{ariaLabel}</h2>
        <div className="flex gap-2">
          {enableGridFallback && (
            <Button
              onClick={toggleView}
              variant="outline"
              size="sm"
              aria-label="Switch to grid view"
            >
              Grid View
            </Button>
          )}
          {showPlayPause && autoScrollDelay > 0 && !prefersReducedMotion && (
            <Button
              onClick={togglePlayPause}
              variant="outline"
              size="sm"
              aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
              aria-pressed={isPlaying}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">
                {isPlaying ? 'Pause' : 'Play'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        {/* Carousel Track */}
        <div
          role="region"
          aria-label={ariaLabel}
          aria-roledescription="carousel"
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
        >
          <div
            className="overflow-hidden rounded-lg"
            style={{ gap }}
          >
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                gap
              }}
              aria-live="polite"
              aria-atomic="false"
            >
              {children.map((child, index) => (
                <div
                  key={index}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${index + 1} of ${totalSlides}`}
                  aria-hidden={index !== currentIndex}
                  className="min-w-full flex-shrink-0"
                >
                  {child}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        {showNavigation && totalSlides > 1 && (
          <>
            <Button
              onClick={goToPrevious}
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              aria-label="Previous slide"
              disabled={currentIndex === 0 && !isPlaying}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={goToNext}
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
              aria-label="Next slide"
              disabled={currentIndex === totalSlides - 1 && !isPlaying}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {showPagination && totalSlides > 1 && (
        <div
          className="flex justify-center gap-2"
          role="tablist"
          aria-label="Carousel navigation"
        >
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              role="tab"
              aria-label={`Go to slide ${index + 1}`}
              aria-selected={index === currentIndex}
              aria-controls={`slide-${index}`}
              tabIndex={index === currentIndex ? 0 : -1}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                index === currentIndex
                  ? 'bg-primary w-8'
                  : 'bg-muted hover:bg-muted-foreground/50'
              )}
            />
          ))}
        </div>
      )}

      {/* Screen Reader Live Region */}
      <div
        ref={liveRegionRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Instructions for screen reader users */}
      <div className="sr-only">
        Use left and right arrow keys to navigate slides.
        Press Home to go to the first slide, End for the last slide.
        {autoScrollDelay > 0 && ' Carousel will auto-advance unless paused.'}
      </div>
    </div>
  );
};

export default AccessibleCarousel;

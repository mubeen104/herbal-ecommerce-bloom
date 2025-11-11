import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from "@/components/ui/carousel";
import { useHeroSlides } from "@/hooks/useHeroSlides";

const HeroSlider = () => {
  const { data: slides, isLoading } = useHeroSlides();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Set<number>>(new Set());
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (slides && slides.length > 0) {
      const img = new Image();
      img.src = slides[0].image_url;
      img.onload = () => {
        setImagesLoaded(prev => new Set(prev).add(0));
      };
    }
  }, [slides]);

  const autoScrollSpeed = slides?.[0]?.auto_scroll_speed || 5000;

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    const interval = setInterval(() => {
      if (!isPaused) {
        if (api.canScrollNext()) {
          api.scrollNext();
        } else {
          api.scrollTo(0);
        }
      }
    }, autoScrollSpeed);

    return () => clearInterval(interval);
  }, [api, autoScrollSpeed, isPaused]);

  if (isLoading || !slides || slides.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <div className="w-full h-[500px] sm:h-[600px] lg:h-[700px]">
          <div className="relative h-full w-full bg-gradient-to-br from-primary/10 via-background to-accent/10">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-pulse" />
            <div className="flex items-center h-full px-4 sm:px-8 lg:px-16">
              <div className="max-w-7xl mx-auto w-full">
                <div className="max-w-2xl space-y-6 animate-fade-in">
                  <div className="h-16 sm:h-20 lg:h-24 bg-gradient-to-r from-muted/60 via-muted/40 to-muted/60 rounded-lg animate-pulse" />
                  <div className="h-8 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-14 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-full w-48 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-background to-muted/20">
      <div
        className="w-full h-[500px] sm:h-[600px] lg:h-[700px]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <Carousel
          setApi={setApi}
          className="w-full h-full"
          opts={{
            align: "start",
            loop: true,
            skipSnaps: false,
            dragFree: false
          }}
        >
          <CarouselContent className="h-full">
            {slides.map((slide, index) => {
              const isFirstSlide = index === 0;
              const isLoaded = imagesLoaded.has(index);

              return (
                <CarouselItem key={slide.id} className="h-full">
                  <div className="relative h-full w-full group">
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 animate-pulse" />
                    )}

                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      loading={isFirstSlide ? "eager" : "lazy"}
                      fetchPriority={isFirstSlide ? "high" : "auto"}
                      decoding="async"
                      className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={(e) => {
                        setImagesLoaded(prev => new Set(prev).add(index));
                        e.currentTarget.style.opacity = '1';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background)))';
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                    <div className="absolute inset-0 flex items-center p-4 sm:p-8 lg:p-16">
                      <div className="max-w-7xl mx-auto w-full">
                        <div className="max-w-2xl text-white space-y-4 sm:space-y-6 animate-fade-in">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-shadow-lg">
                            {slide.title}
                          </h1>
                          {slide.subtitle && (
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed text-shadow max-w-xl">
                              {slide.subtitle}
                            </p>
                          )}
                          {slide.link_url && (
                            <div className="pt-2 sm:pt-4">
                              <a
                                href={slide.link_url}
                                className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-foreground rounded-full font-semibold text-sm sm:text-base hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-2xl group/button"
                              >
                                <span>{slide.link_text || 'Shop Now'}</span>
                                <svg
                                  className="w-5 h-5 transform group-hover/button:translate-x-1 transition-transform duration-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                                  />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  current === index + 1
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default HeroSlider;

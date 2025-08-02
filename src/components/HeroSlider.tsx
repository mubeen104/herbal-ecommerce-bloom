import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi 
} from "@/components/ui/carousel";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HeroSlider = () => {
  const { data: slides, isLoading } = useHeroSlides();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });

    // Auto-scroll every 5 seconds
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [api]);

  if (isLoading || !slides || slides.length === 0) {
    return (
      <section className="relative bg-gradient-hero min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center space-x-3 text-primary">
                <Leaf className="h-6 w-6" />
                <span className="text-sm font-semibold uppercase tracking-wider">100% Natural & Organic</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Pure Wellness
                <span className="block text-primary">From Nature</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Discover our premium collection of organic herbs, natural supplements, and wellness products carefully sourced from trusted growers around the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="group" asChild>
                  <a href="/shop">
                    Shop Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-gradient-hero overflow-hidden">
      <Carousel 
        setApi={setApi} 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id}>
              <div className="relative min-h-[80vh] flex items-center">
                {/* Background Image with 4:3 aspect ratio positioned naturally */}
                <div className="absolute inset-0">
                  <AspectRatio ratio={4/3} className="w-full h-full">
                    <img 
                      src={slide.image_url} 
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  {/* Overlay for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/20" />
                </div>

                {/* Content */}
                <div className="relative container mx-auto px-4 py-16">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8 animate-fade-in">
                      {/* Natural Badge */}
                      <div className="flex items-center space-x-3 text-primary group">
                        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                          <Leaf className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-semibold uppercase tracking-wider">100% Natural & Organic</span>
                      </div>

                      {/* Main Heading */}
                      <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                        {slide.title.split(' ').slice(0, -2).join(' ')}
                        <span className="block text-primary bg-gradient-primary bg-clip-text text-transparent">
                          {slide.title.split(' ').slice(-2).join(' ')}
                        </span>
                      </h1>

                      {/* Subtitle */}
                      {slide.subtitle && (
                        <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                          {slide.subtitle}
                        </p>
                      )}

                      {/* Trust Indicators */}
                      <div className="flex items-center space-x-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center space-x-2 text-sm">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Premium Quality</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-muted-foreground">Lab Tested</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      {slide.link_url && (
                        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                          <Button 
                            size="lg" 
                            className="group bg-primary hover:bg-primary-hover text-primary-foreground shadow-medium hover:shadow-elevated transition-all duration-300 hover:scale-105" 
                            asChild
                          >
                            <a href={slide.link_url}>
                              {slide.link_text || 'Shop Now'}
                              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                            </a>
                          </Button>
                        </div>
                      )}

                      {/* Features Grid */}
                      <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                        {[
                          { icon: <Leaf className="h-6 w-6" />, label: "100% Organic", color: "text-green-600" },
                          { icon: <span className="text-xl font-bold">✓</span>, label: "Lab Tested", color: "text-blue-600" },
                          { icon: <span className="text-xl">🌱</span>, label: "Sustainable", color: "text-emerald-600" }
                        ].map((feature, featureIndex) => (
                          <div key={featureIndex} className="text-center group">
                            <div className="bg-card border border-border/50 rounded-xl w-16 h-16 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-300 shadow-soft hover:shadow-medium">
                              <span className={feature.color}>{feature.icon}</span>
                            </div>
                            <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors duration-300">
                              {feature.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300" />
        <CarouselNext className="right-4 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-primary hover:text-primary-foreground transition-all duration-300" />

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index + 1 
                  ? 'bg-primary scale-125' 
                  : 'bg-background/60 hover:bg-background/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-primary/10 rounded-full animate-float opacity-60" />
      <div className="absolute top-40 left-10 w-12 h-12 bg-accent/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-32 right-32 w-16 h-16 bg-primary/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default HeroSlider;
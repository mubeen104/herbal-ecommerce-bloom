import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCarouselAutoScroll } from '@/hooks/useCarouselAutoScroll';
import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

interface Testimonial {
  id: string;
  customer_name: string;
  rating: number;
  content: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const useHomepageTestimonials = () => {
  return useQuery({
    queryKey: ['homepage-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });
};

const HomepageTestimonials = () => {
  const { data: testimonials = [], isLoading } = useHomepageTestimonials();
  const [api, setApi] = useState<any>();
  
  useCarouselAutoScroll(api);

  if (isLoading) {
    return (
      <section className="py-24 bg-gradient-to-br from-background via-muted/5 to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent w-32" />
              <span className="mx-4 text-sm font-semibold text-accent uppercase tracking-wider">Testimonials</span>
              <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent w-32" />
            </div>
            <div className="h-10 bg-muted/40 rounded-lg w-96 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-muted/30 rounded-lg w-[600px] mx-auto animate-pulse" style={{ animationDelay: '0.1s' }} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="group relative bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-8 space-y-4">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-5 w-5 bg-muted/40 rounded animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                  </div>
                  <div className="h-4 bg-muted/40 rounded w-full animate-pulse" />
                  <div className="h-4 bg-muted/30 rounded w-5/6 animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="h-4 bg-muted/30 rounded w-4/6 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="pt-6 flex items-center gap-4">
                    <div className="h-12 w-12 bg-muted/40 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/40 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-muted/30 rounded w-24 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const getUserName = (testimonial: Testimonial) => {
    return testimonial.customer_name;
  };

  return (
    <section className="py-16 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Quote className="w-6 h-6 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Client's Feedback</h2>
            <Quote className="w-6 h-6 text-primary rotate-180" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover what our satisfied customers say about their journey with us
          </p>
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-background/80 backdrop-blur-sm border-border hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      {/* Rating Stars */}
                      <div className="flex justify-center mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 transition-colors ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Quote Icon */}
                      <div className="flex justify-center mb-4">
                        <Quote className="w-8 h-8 text-primary/20 group-hover:text-primary/40 transition-colors" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between">
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed text-center mb-6 italic">
                          "{testimonial.content}"
                        </p>
                        
                        {/* Customer Info */}
                        <div className="text-center border-t border-border/50 pt-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-2">
                            <span className="text-primary font-semibold text-lg">
                              {getUserName(testimonial).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-foreground text-sm md:text-base">
                            {getUserName(testimonial)}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">Verified Customer</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Navigation - Hidden on mobile, visible on larger screens */}
            <div className="hidden md:block">
              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border hover:bg-background/90" />
              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm border-border hover:bg-background/90" />
            </div>
          </Carousel>
          
          {/* Mobile swipe indicator */}
          <div className="flex justify-center mt-6 md:hidden">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span>Swipe to explore more testimonials</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageTestimonials;
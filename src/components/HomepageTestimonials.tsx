import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  user_id: string;
  created_at: string;
}

const useHomepageTestimonials = () => {
  return useQuery({
    queryKey: ['homepage-testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .eq('is_homepage_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });
};

const HomepageTestimonials = () => {
  const { data: testimonials = [], isLoading } = useHomepageTestimonials();

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">OUR POSITIVE CLIENT'S FEEDBACK</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card className="h-48 bg-muted"></Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const getUserName = (review: Review) => {
    // Since we don't have access to user profiles, we'll use anonymous names
    // This could be enhanced later to include actual user names
    return 'Satisfied Customer';
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">OUR POSITIVE CLIENT'S FEEDBACK</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.slice(0, 3).map((review) => (
            <Card key={review.id} className="bg-background border-border hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                
                {review.content && (
                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {review.content}
                  </p>
                )}
                
                <div className="mt-auto">
                  <h4 className="font-semibold text-foreground">
                    {getUserName(review)}
                  </h4>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Pagination dots */}
        {testimonials.length > 3 && (
          <div className="flex justify-center mt-8 space-x-2">
            {[...Array(Math.ceil(testimonials.length / 3))].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomepageTestimonials;
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().optional(),
  content: z.string().min(10, 'Review must be at least 10 characters long'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoveredRating, setHoveredRating] = useState(0);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
    },
  });

  const submitReview = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user!.id,
          rating: data.rating,
          title: data.title || null,
          content: data.content,
          is_approved: false, // Reviews need admin approval
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Review submitted',
        description: 'Your review has been submitted for approval. Thank you for your feedback!',
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
      console.error('Review submission error:', error);
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    submitReview.mutate(data);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please sign in to write a review.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => field.onChange(star)}
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoveredRating || field.value)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Give your review a title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience with this product..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={submitReview.isPending}
              className="w-full"
            >
              {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
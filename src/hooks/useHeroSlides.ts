import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  link_text?: string;
  is_active: boolean;
  display_order: number;
  auto_scroll_speed?: number;
  created_at: string;
  updated_at: string;
}

export const useHeroSlides = () => {
  return useQuery({
    queryKey: ['hero-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HeroSlide[];
    },
  });
};

export const useCreateHeroSlide = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slide: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .insert([slide])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast({
        title: 'Success',
        description: 'Hero slide created successfully.',
      });
    },
    onError: (error) => {
      console.error('Hero slide creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create hero slide. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateHeroSlide = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from('hero_slides')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast({
        title: 'Success',
        description: 'Hero slide updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Hero slide update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hero slide. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteHeroSlide = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      toast({
        title: 'Success',
        description: 'Hero slide deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Hero slide deletion error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hero slide. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
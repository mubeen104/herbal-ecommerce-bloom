import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  usage_limit?: number;
  user_usage_limit?: number;
  used_count: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  eligible_users: 'logged_in' | 'guests' | 'both';
  created_at: string;
  updated_at: string;
}

interface CreateCouponData {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  usage_limit?: number;
  user_usage_limit?: number;
  is_active?: boolean;
  starts_at?: string;
  expires_at?: string;
  eligible_users?: 'logged_in' | 'guests' | 'both';
}

export const useCoupons = () => {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
  });
};

export const useCreateCoupon = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponData: CreateCouponData) => {
      const { data, error } = await supabase
        .from('coupons')
        .insert([couponData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: 'Success',
        description: 'Coupon created successfully.',
      });
    },
    onError: (error) => {
      console.error('Coupon creation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create coupon. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCoupon = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase
        .from('coupons')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: 'Success',
        description: 'Coupon updated successfully.',
      });
    },
    onError: (error) => {
      console.error('Coupon update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update coupon. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCoupon = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully.',
      });
    },
    onError: (error) => {
      console.error('Coupon deletion error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete coupon. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useValidateCoupon = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ code, userId, isGuest, subtotal }: { code: string; userId?: string; isGuest: boolean; subtotal: number }) => {
      // Get coupon details
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error || !coupon) {
        throw new Error('Invalid coupon code');
      }

      // Validate eligibility
      if (coupon.eligible_users === 'logged_in' && isGuest) {
        throw new Error('This coupon is only available for logged-in users');
      }
      if (coupon.eligible_users === 'guests' && !isGuest) {
        throw new Error('This coupon is only available for guest users');
      }

      // Check if coupon is active and within date range
      const now = new Date();
      if (!coupon.is_active) {
        throw new Error('This coupon is no longer active');
      }
      if (coupon.starts_at && new Date(coupon.starts_at) > now) {
        throw new Error('This coupon is not yet active');
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < now) {
        throw new Error('This coupon has expired');
      }

      // Check total usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        throw new Error('This coupon has reached its usage limit');
      }

      // Check user-specific usage limit if user is logged in
      if (userId && coupon.user_usage_limit) {
        const { data: userUsage, error: usageError } = await supabase
          .from('coupon_usage')
          .select('*')
          .eq('coupon_id', coupon.id)
          .eq('user_id', userId);

        if (usageError) throw usageError;

        if (userUsage && userUsage.length >= coupon.user_usage_limit) {
          throw new Error('You have reached the usage limit for this coupon');
        }
      }

      // Check minimum amount requirement
      if (coupon.minimum_amount && subtotal < coupon.minimum_amount) {
        throw new Error(`Minimum order amount of PKR ${coupon.minimum_amount} required`);
      }

      return coupon;
    },
    onError: (error) => {
      toast({
        title: 'Invalid Coupon',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
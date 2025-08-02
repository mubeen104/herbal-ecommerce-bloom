-- Add missing columns to coupons table
ALTER TABLE public.coupons 
ADD COLUMN starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN user_usage_limit INTEGER,
ADD COLUMN eligible_users TEXT DEFAULT 'both' CHECK (eligible_users IN ('logged_in', 'guests', 'both'));

-- Update RLS policies for coupons
DROP POLICY IF EXISTS "Active coupons are publicly readable" ON public.coupons;

CREATE POLICY "Active coupons are publicly readable" ON public.coupons
FOR SELECT 
USING (
  is_active = true 
  AND (starts_at IS NULL OR starts_at <= now()) 
  AND (expires_at IS NULL OR expires_at > now())
);

CREATE POLICY "Admins can manage all coupons" ON public.coupons
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create coupon usage tracking table
CREATE TABLE public.coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  discount_amount NUMERIC NOT NULL
);

-- Enable RLS on coupon_usage
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupon_usage
CREATE POLICY "Admins can view all coupon usage" ON public.coupon_usage
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Allow coupon usage creation" ON public.coupon_usage
FOR INSERT 
WITH CHECK (true);

-- Update orders table to include coupon information
ALTER TABLE public.orders 
ADD COLUMN coupon_id UUID REFERENCES public.coupons(id),
ADD COLUMN coupon_code TEXT;
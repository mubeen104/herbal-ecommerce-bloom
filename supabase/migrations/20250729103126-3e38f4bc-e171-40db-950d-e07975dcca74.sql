-- Allow guest orders by making user_id nullable in orders table
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to handle guest orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create new policies that handle both authenticated and guest users
CREATE POLICY "Users and guests can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and owns the order, or if it's a guest order (user_id is null)
  (auth.uid() = user_id) OR (user_id IS NULL)
);

CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to view guest orders too
CREATE POLICY "Admins can view guest orders" 
ON public.orders 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) AND user_id IS NULL);
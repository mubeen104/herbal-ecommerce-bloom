-- Fix the guest order creation policy
DROP POLICY IF EXISTS "Users and guests can create orders" ON public.orders;

-- Create a corrected policy that properly handles guest orders
CREATE POLICY "Users and guests can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and owns the order
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
  OR 
  -- Allow if it's a guest order (user_id is null and user is not authenticated)
  (user_id IS NULL)
);
-- First, let's check what the current constraint allows
-- Then update it to include 'completed' as a valid status

-- Drop the existing check constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the updated check constraint that includes 'completed'
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled'));
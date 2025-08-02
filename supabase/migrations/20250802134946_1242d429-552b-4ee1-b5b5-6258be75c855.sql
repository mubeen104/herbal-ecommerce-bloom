-- First, let's see what the current constraint allows
-- We need to drop the existing constraint and recreate it with the correct values

-- Drop the existing check constraint
ALTER TABLE public.addresses DROP CONSTRAINT IF EXISTS addresses_type_check;

-- Add the correct check constraint that allows our address types
ALTER TABLE public.addresses ADD CONSTRAINT addresses_type_check 
CHECK (type IN ('home', 'work', 'other'));
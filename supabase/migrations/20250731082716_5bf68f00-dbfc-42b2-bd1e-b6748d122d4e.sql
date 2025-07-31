-- Add variant_id column to cart_items table to support product variants
ALTER TABLE public.cart_items 
ADD COLUMN variant_id UUID REFERENCES public.product_variants(id);

-- Add index for better performance
CREATE INDEX idx_cart_items_variant_id ON public.cart_items(variant_id);
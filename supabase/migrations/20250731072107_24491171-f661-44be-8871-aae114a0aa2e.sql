-- Enable Row Level Security on product_categories table
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access to product categories (needed for frontend to show product categories)
CREATE POLICY "Product categories are publicly readable" 
ON public.product_categories 
FOR SELECT 
USING (true);

-- Allow admins to manage product categories
CREATE POLICY "Admins can manage product categories" 
ON public.product_categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Add keywords column to products table for SEO optimization
ALTER TABLE public.products 
ADD COLUMN keywords TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN public.products.keywords IS 'SEO keywords for the product, maximum 30 keywords, stored as array';
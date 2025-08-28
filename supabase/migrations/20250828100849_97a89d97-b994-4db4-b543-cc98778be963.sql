-- Add homepage featured field to reviews table
ALTER TABLE public.reviews 
ADD COLUMN is_homepage_featured boolean DEFAULT false;

-- Create index for better performance when querying homepage featured reviews
CREATE INDEX idx_reviews_homepage_featured ON public.reviews(is_homepage_featured) WHERE is_homepage_featured = true;
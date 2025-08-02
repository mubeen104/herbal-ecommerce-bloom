-- Add auto_scroll_speed column to hero_slides table
ALTER TABLE public.hero_slides 
ADD COLUMN auto_scroll_speed INTEGER DEFAULT 5000;

-- Add comment for clarity
COMMENT ON COLUMN public.hero_slides.auto_scroll_speed IS 'Auto scroll speed in milliseconds (default: 5000ms = 5 seconds)';

-- Create storage bucket for hero slide images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for hero slides
CREATE POLICY "Hero slide images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'hero-slides');

CREATE POLICY "Admins can upload hero slide images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update hero slide images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete hero slide images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'hero-slides' AND public.has_role(auth.uid(), 'admin'));
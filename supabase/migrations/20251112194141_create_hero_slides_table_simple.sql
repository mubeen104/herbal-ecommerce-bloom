/*
  # Create Hero Slides Table
  
  1. New Tables
    - `hero_slides`
      - `id` (uuid, primary key)
      - `title` (text) - Main heading for the slide
      - `subtitle` (text) - Secondary text for the slide
      - `image_url` (text) - URL to the slide image
      - `link_url` (text) - URL the slide links to
      - `link_text` (text) - Text for the CTA button
      - `is_active` (boolean) - Whether the slide is active
      - `display_order` (integer) - Order in which slides appear
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS on `hero_slides` table
    - Add policy for public read access to active slides
    - Add policy for authenticated users to manage slides
*/

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT DEFAULT 'Shop Now',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hero slides are viewable by everyone" ON public.hero_slides;
CREATE POLICY "Hero slides are viewable by everyone" 
ON public.hero_slides 
FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage hero slides" ON public.hero_slides;
CREATE POLICY "Authenticated users can manage hero slides" 
ON public.hero_slides 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hero_slides (title, subtitle, image_url, link_url, display_order, is_active)
SELECT * FROM (VALUES
  ('Pure Wellness From Nature', 'Discover our premium collection of organic herbs and natural supplements', 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1920&h=800&fit=crop', '/shop', 1, true),
  ('100% Organic & Natural', 'Carefully sourced from trusted growers around the world', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=800&fit=crop', '/shop', 2, true),
  ('Premium Quality Guaranteed', 'Lab tested for purity and potency', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1920&h=800&fit=crop', '/contact', 3, true)
) AS v(title, subtitle, image_url, link_url, display_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.hero_slides LIMIT 1);
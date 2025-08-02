-- Create hero_slides table for homepage slider
CREATE TABLE public.hero_slides (
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

-- Enable Row Level Security
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Create policies for public viewing
CREATE POLICY "Hero slides are viewable by everyone" 
ON public.hero_slides 
FOR SELECT 
USING (is_active = true);

-- Create policies for admin management
CREATE POLICY "Admins can manage hero slides" 
ON public.hero_slides 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default slides
INSERT INTO public.hero_slides (title, subtitle, image_url, link_url, display_order, is_active) VALUES
('Pure Wellness From Nature', 'Discover our premium collection of organic herbs and natural supplements', '/lovable-uploads/22303e3e-d2dd-4bad-a05f-9245ad435b33.png', '/shop', 1, true),
('100% Organic & Natural', 'Carefully sourced from trusted growers around the world', '/lovable-uploads/22303e3e-d2dd-4bad-a05f-9245ad435b33.png', '/shop', 2, true),
('Premium Quality Guaranteed', 'Lab tested for purity and potency', '/lovable-uploads/22303e3e-d2dd-4bad-a05f-9245ad435b33.png', '/contact', 3, true);
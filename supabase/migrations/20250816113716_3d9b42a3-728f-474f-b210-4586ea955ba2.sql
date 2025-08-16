-- Create advertising pixels table
CREATE TABLE public.advertising_pixels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('google_ads', 'meta_pixel', 'tiktok_pixel')),
  pixel_id TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(platform) -- Only one pixel per platform
);

-- Enable Row Level Security
ALTER TABLE public.advertising_pixels ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can manage advertising pixels"
ON public.advertising_pixels
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Public can read enabled pixels for tracking
CREATE POLICY "Public can read enabled pixels"
ON public.advertising_pixels
FOR SELECT
USING (is_enabled = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_advertising_pixels_updated_at
BEFORE UPDATE ON public.advertising_pixels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
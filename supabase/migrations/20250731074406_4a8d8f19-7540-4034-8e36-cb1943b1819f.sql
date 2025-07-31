-- Create product_variants table for managing product variants
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_price NUMERIC,
  sku TEXT,
  inventory_quantity INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC,
  variant_options JSONB DEFAULT '{}', -- stores options like {"size": "L", "color": "Red"}
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_variant_images table for variant-specific images
CREATE TABLE public.product_variant_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  variant_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_variants
CREATE POLICY "Product variants are publicly readable"
ON public.product_variants
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage product variants"
ON public.product_variants
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for product_variant_images
CREATE POLICY "Product variant images are publicly readable"
ON public.product_variant_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage product variant images"
ON public.product_variant_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_active ON public.product_variants(is_active);
CREATE INDEX idx_product_variant_images_variant_id ON public.product_variant_images(variant_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraints
ALTER TABLE public.product_variants 
ADD CONSTRAINT fk_product_variants_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.product_variant_images 
ADD CONSTRAINT fk_product_variant_images_variant_id 
FOREIGN KEY (variant_id) REFERENCES public.product_variants(id) ON DELETE CASCADE;
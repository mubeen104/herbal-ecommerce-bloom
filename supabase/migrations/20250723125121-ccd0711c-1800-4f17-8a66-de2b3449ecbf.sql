-- Allow admins to manage product images
CREATE POLICY "Admins can manage product images" 
ON public.product_images 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
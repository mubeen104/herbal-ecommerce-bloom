/*
  # Create Function to Get Reviews with Profile Data
  
  This function bypasses RLS to fetch review data with profile information.
  It uses SECURITY DEFINER to ensure all users can see reviewer names.
*/

-- Create function to get reviews with profile data
CREATE OR REPLACE FUNCTION public.get_reviews_with_profiles(_product_id UUID)
RETURNS TABLE (
  id UUID,
  product_id UUID,
  user_id UUID,
  rating INTEGER,
  title TEXT,
  content TEXT,
  is_verified BOOLEAN,
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  profile_first_name TEXT,
  profile_last_name TEXT,
  profile_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.product_id,
    r.user_id,
    r.rating,
    r.title,
    r.content,
    r.is_verified,
    r.is_approved,
    r.created_at,
    r.updated_at,
    p.first_name AS profile_first_name,
    p.last_name AS profile_last_name,
    p.email AS profile_email
  FROM public.reviews r
  LEFT JOIN public.profiles p ON r.user_id = p.user_id
  WHERE r.product_id = _product_id
    AND r.is_approved = true
  ORDER BY r.created_at DESC;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.get_reviews_with_profiles(UUID) TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION public.get_reviews_with_profiles(UUID) IS 
  'Returns approved reviews for a product with profile information. Bypasses RLS to ensure all users can see reviewer names.';


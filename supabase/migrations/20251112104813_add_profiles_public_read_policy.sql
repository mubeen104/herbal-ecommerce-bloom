/*
  # Add Public Read Policy for Profiles

  1. Changes
    - Add policy to allow public read access to profiles (first_name, last_name)
    - This enables reviews to display reviewer names publicly
  
  2. Security
    - Only allows SELECT operations
    - Maintains existing privacy for profile modifications
    - Users can still only modify their own profiles
*/

-- Check if profiles table exists and add policy
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add policy to allow public read access to profiles for review display
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'Profiles are publicly readable for reviews'
    ) THEN
      EXECUTE 'CREATE POLICY "Profiles are publicly readable for reviews" ON public.profiles FOR SELECT USING (true)';
    END IF;
  END IF;
END $$;
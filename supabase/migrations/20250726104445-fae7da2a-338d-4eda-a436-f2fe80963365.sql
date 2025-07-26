-- First add unique constraint on user_id in profiles table
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Now create profiles for users who don't have them
INSERT INTO public.profiles (user_id, email, first_name, last_name, created_at, updated_at)
SELECT 
  au.id as user_id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'first_name', '') as first_name,
  COALESCE(au.raw_user_meta_data ->> 'last_name', '') as last_name,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Also ensure these users have user roles
INSERT INTO public.user_roles (user_id, role)
SELECT au.id, 'user'::app_role
FROM auth.users au
LEFT JOIN public.user_roles ur ON au.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;
-- Fix security definer function search_path issue
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to ensure users have default role
CREATE OR REPLACE FUNCTION public.ensure_user_has_role(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Check if user has any role, if not assign 'user' role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'user');
  END IF;
END;
$$;

-- Update existing users without roles to have 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'user'::app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Create improved promote_to_admin function
CREATE OR REPLACE FUNCTION public.promote_to_admin(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT au.id INTO _user_id
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.user_id
  WHERE p.email = _email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Ensure user has default role first
  PERFORM public.ensure_user_has_role(_user_id);
  
  -- Insert admin role (or update if exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create function to remove admin role
CREATE OR REPLACE FUNCTION public.remove_admin_role(_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT au.id INTO _user_id
  FROM auth.users au
  JOIN public.profiles p ON au.id = p.user_id
  WHERE p.email = _email;
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', _email;
  END IF;
  
  -- Remove admin role
  DELETE FROM public.user_roles 
  WHERE user_id = _user_id AND role = 'admin';
  
  -- Ensure user still has at least 'user' role
  PERFORM public.ensure_user_has_role(_user_id);
END;
$$;

-- Create trigger to auto-assign user role for new profiles
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Assign default 'user' role to new profile
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new profiles
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
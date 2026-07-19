
-- 1. Add UPDATE policy on invoices
CREATE POLICY "Users can update their own invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Lock down SECURITY DEFINER functions - revoke public/authenticated/anon execute
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_roles(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.admin_list_users() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies (runs as function owner via SECURITY DEFINER),
-- so RLS still works without EXECUTE grants to end-user roles.
-- admin_list_users is called from client — grant back to authenticated but with an internal admin check.
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(id uuid, email text, created_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;
  RETURN QUERY
    SELECT au.id, au.email::text, au.created_at
    FROM auth.users au
    ORDER BY au.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- Restrict storage invoice policies explicitly to non-anonymous authenticated users
DROP POLICY IF EXISTS "Authenticated users can view their own invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload their own invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own invoice files" ON storage.objects;

CREATE POLICY "Users can view their own invoice files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own invoice files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'invoices'
  AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own invoice files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices'
  AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND auth.uid()::text = (storage.foldername(name))[1]
);

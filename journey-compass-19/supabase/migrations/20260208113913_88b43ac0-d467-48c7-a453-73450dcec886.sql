-- Renforcer les politiques RLS pour restreindre l'accès aux utilisateurs authentifiés uniquement
-- et garantir l'isolation des données par utilisateur

-- ============================================
-- TABLE: custom_cities
-- ============================================
DROP POLICY IF EXISTS "Users can view their own custom cities" ON public.custom_cities;
DROP POLICY IF EXISTS "Users can create their own custom cities" ON public.custom_cities;
DROP POLICY IF EXISTS "Users can delete their own custom cities" ON public.custom_cities;

CREATE POLICY "Authenticated users can view their own custom cities" 
ON public.custom_cities 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own custom cities" 
ON public.custom_cities 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own custom cities" 
ON public.custom_cities 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- TABLE: invoices
-- ============================================
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can upload their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

CREATE POLICY "Authenticated users can view their own invoices" 
ON public.invoices 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can upload their own invoices" 
ON public.invoices 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own invoices" 
ON public.invoices 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- TABLE: profiles
-- ============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TABLE: trips
-- ============================================
DROP POLICY IF EXISTS "Users can view their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can create their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON public.trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON public.trips;

CREATE POLICY "Authenticated users can view their own trips" 
ON public.trips 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own trips" 
ON public.trips 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own trips" 
ON public.trips 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own trips" 
ON public.trips 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- TABLE: voyages
-- ============================================
DROP POLICY IF EXISTS "Users can view their own voyages" ON public.voyages;
DROP POLICY IF EXISTS "Users can create their own voyages" ON public.voyages;
DROP POLICY IF EXISTS "Users can update their own voyages" ON public.voyages;
DROP POLICY IF EXISTS "Users can delete their own voyages" ON public.voyages;

CREATE POLICY "Authenticated users can view their own voyages" 
ON public.voyages 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create their own voyages" 
ON public.voyages 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own voyages" 
ON public.voyages 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own voyages" 
ON public.voyages 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STORAGE: invoices bucket
-- ============================================
DROP POLICY IF EXISTS "Users can view their own invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own invoice files" ON storage.objects;

CREATE POLICY "Authenticated users can view their own invoice files" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can upload their own invoice files" 
ON storage.objects 
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete their own invoice files" 
ON storage.objects 
FOR DELETE 
TO authenticated
USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);
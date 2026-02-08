-- Remove the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can view custom cities" ON public.custom_cities;

-- Create a new policy that restricts access to user's own custom cities
CREATE POLICY "Users can view their own custom cities"
ON public.custom_cities
FOR SELECT
USING (auth.uid() = user_id);
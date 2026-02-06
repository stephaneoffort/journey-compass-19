-- Create table for custom cities added by users
CREATE TABLE public.custom_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  country_name TEXT NOT NULL,
  lat NUMERIC(10, 6) NOT NULL,
  lng NUMERIC(10, 6) NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(city, country)
);

-- Enable RLS
ALTER TABLE public.custom_cities ENABLE ROW LEVEL SECURITY;

-- Everyone can read custom cities (shared database)
CREATE POLICY "Anyone can view custom cities"
ON public.custom_cities
FOR SELECT
USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can create custom cities"
ON public.custom_cities
FOR INSERT
WITH CHECK (auth.uid() = user_id);
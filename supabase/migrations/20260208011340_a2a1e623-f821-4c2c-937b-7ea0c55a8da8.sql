-- Add accommodation_type column for logement trips
ALTER TABLE public.trips
ADD COLUMN accommodation_type text DEFAULT NULL;
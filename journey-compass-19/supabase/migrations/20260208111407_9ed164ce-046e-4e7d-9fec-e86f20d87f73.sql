-- Drop old constraint and add new one with all transport types including logement and frais
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_transport_type_check;

ALTER TABLE public.trips ADD CONSTRAINT trips_transport_type_check 
CHECK (transport_type = ANY (ARRAY['plane'::text, 'train'::text, 'car'::text, 'bus'::text, 'boat'::text, 'metro'::text, 'logement'::text, 'frais'::text]));
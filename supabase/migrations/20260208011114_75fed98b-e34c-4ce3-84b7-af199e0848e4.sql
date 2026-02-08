-- Add columns for station names (train, bus, metro)
ALTER TABLE public.trips
ADD COLUMN departure_station text DEFAULT NULL,
ADD COLUMN arrival_station text DEFAULT NULL;
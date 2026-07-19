-- Add new columns for enhanced trip tracking
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS car_type TEXT,
ADD COLUMN IF NOT EXISTS ticket_number TEXT,
ADD COLUMN IF NOT EXISTS seat_number TEXT,
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'recherche',
ADD COLUMN IF NOT EXISTS departure_time TIME,
ADD COLUMN IF NOT EXISTS arrival_time TIME;
-- Create voyages table (parent for trips)
CREATE TABLE public.voyages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voyages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voyages
CREATE POLICY "Users can view their own voyages" 
ON public.voyages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voyages" 
ON public.voyages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voyages" 
ON public.voyages 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voyages" 
ON public.voyages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add voyage_id to trips table
ALTER TABLE public.trips 
ADD COLUMN voyage_id UUID REFERENCES public.voyages(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_trips_voyage_id ON public.trips(voyage_id);

-- Add trigger for updated_at on voyages
CREATE TRIGGER update_voyages_updated_at
BEFORE UPDATE ON public.voyages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
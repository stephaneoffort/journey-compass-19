-- Add expense columns for car trips (personal vehicle / other)
ALTER TABLE public.trips 
ADD COLUMN toll_expense numeric DEFAULT NULL,
ADD COLUMN parking_expense numeric DEFAULT NULL,
ADD COLUMN other_expense numeric DEFAULT NULL;
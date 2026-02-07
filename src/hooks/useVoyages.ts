import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Voyage, VoyageWithTrips } from '@/types/voyage';
import { Trip, TransportType, TripStatus, Location, BookingStatus, CarType, co2PerKm } from '@/types/trip';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

function mapDbToTrip(row: any): Trip {
  return {
    id: row.id,
    departureCity: row.departure_city,
    departureCountry: row.departure_country,
    departureCountryName: row.departure_country_name,
    arrivalCity: row.arrival_city,
    arrivalCountry: row.arrival_country,
    arrivalCountryName: row.arrival_country_name,
    via: (row.via as Location[]) || [],
    departureDate: row.departure_date,
    departureTime: row.departure_time,
    returnDate: row.return_date,
    arrivalTime: row.arrival_time,
    transportType: row.transport_type as TransportType,
    company: row.company,
    carType: row.car_type as CarType | undefined,
    ticketNumber: row.ticket_number,
    seatNumber: row.seat_number,
    bookingStatus: (row.booking_status as BookingStatus) || 'recherche',
    price: row.price ? parseFloat(row.price) : undefined,
    distanceKm: row.distance_km,
    co2Kg: parseFloat(row.co2_kg),
    status: row.status as TripStatus,
    notes: row.notes,
    invoiceUrls: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    voyageId: row.voyage_id,
  };
}

function mapDbToVoyage(row: any, trips: Trip[] = []): VoyageWithTrips {
  const voyageTrips = trips.filter(t => t.voyageId === row.id);
  const sortedTrips = voyageTrips.sort((a, b) => 
    new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
  );
  
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || (sortedTrips[0]?.departureDate || null),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    trips: sortedTrips,
    totalDistanceKm: sortedTrips.reduce((sum, t) => sum + t.distanceKm, 0),
    totalCo2Kg: sortedTrips.reduce((sum, t) => sum + t.co2Kg, 0),
    totalPrice: sortedTrips.reduce((sum, t) => sum + (t.price || 0), 0),
    startDate: sortedTrips[0]?.departureDate,
    endDate: sortedTrips[sortedTrips.length - 1]?.departureDate,
  };
}

export function useVoyages() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['voyages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetch voyages
      const { data: voyages, error: voyagesError } = await supabase
        .from('voyages')
        .select('*')
        .order('created_at', { ascending: false });

      if (voyagesError) throw voyagesError;

      // Fetch all trips
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('departure_date', { ascending: true });

      if (tripsError) throw tripsError;

      const mappedTrips = trips.map(mapDbToTrip);
      return voyages.map(v => mapDbToVoyage(v, mappedTrips));
    },
    enabled: !!user,
  });
}

export function useVoyage(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['voyage', id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data: voyage, error: voyageError } = await supabase
        .from('voyages')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (voyageError) throw voyageError;
      if (!voyage) return null;

      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('voyage_id', id)
        .order('departure_date', { ascending: true });

      if (tripsError) throw tripsError;

      return mapDbToVoyage(voyage, trips.map(mapDbToTrip));
    },
    enabled: !!user && !!id,
  });
}

export function useCreateVoyage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (name?: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('voyages')
        .insert({
          user_id: user.id,
          name: name || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
    },
  });
}

export function useUpdateVoyage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name?: string }) => {
      const { data, error } = await supabase
        .from('voyages')
        .update({ name })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
      queryClient.invalidateQueries({ queryKey: ['voyage', variables.id] });
    },
  });
}

export function useDeleteVoyage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('voyages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
    },
  });
}

interface TripInsertForVoyage {
  voyageId: string;
  departureCity: string;
  departureCountry: string;
  departureCountryName: string;
  arrivalCity: string;
  arrivalCountry: string;
  arrivalCountryName: string;
  via: Location[];
  departureDate: string;
  departureTime?: string;
  returnDate?: string;
  arrivalTime?: string;
  transportType: TransportType;
  company?: string;
  carType?: CarType;
  ticketNumber?: string;
  seatNumber?: string;
  bookingStatus?: BookingStatus;
  price?: number;
  distanceKm: number;
  status?: TripStatus;
  notes?: string;
}

export function useAddTripToVoyage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trip: TripInsertForVoyage) => {
      if (!user) throw new Error('User not authenticated');

      const co2Kg = trip.distanceKm * co2PerKm[trip.transportType];

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          voyage_id: trip.voyageId,
          departure_city: trip.departureCity,
          departure_country: trip.departureCountry,
          departure_country_name: trip.departureCountryName,
          arrival_city: trip.arrivalCity,
          arrival_country: trip.arrivalCountry,
          arrival_country_name: trip.arrivalCountryName,
          via: trip.via as unknown as Json,
          departure_date: trip.departureDate,
          departure_time: trip.departureTime || null,
          return_date: trip.returnDate || null,
          arrival_time: trip.arrivalTime || null,
          transport_type: trip.transportType,
          company: trip.company || null,
          car_type: trip.carType || null,
          ticket_number: trip.ticketNumber || null,
          seat_number: trip.seatNumber || null,
          booking_status: trip.bookingStatus || 'recherche',
          price: trip.price || null,
          distance_km: trip.distanceKm,
          co2_kg: co2Kg,
          status: trip.status || 'planned',
          notes: trip.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToTrip(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
      queryClient.invalidateQueries({ queryKey: ['voyage', variables.voyageId] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

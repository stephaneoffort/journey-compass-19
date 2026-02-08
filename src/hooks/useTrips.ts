import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trip, TransportType, TripStatus, Location, BookingStatus, CarType, co2PerKm } from '@/types/trip';
import { useAuth } from './useAuth';
import type { Json } from '@/integrations/supabase/types';

interface TripInsert {
  voyageId?: string;
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
  departureStation?: string;
  arrivalStation?: string;
}

function mapDbToTrip(row: any): Trip {
  return {
    id: row.id,
    voyageId: row.voyage_id || undefined,
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
    departureStation: row.departure_station || undefined,
    arrivalStation: row.arrival_station || undefined,
    invoiceUrls: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useTrips() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('departure_date', { ascending: false });

      if (error) throw error;
      return data.map(mapDbToTrip);
    },
    enabled: !!user,
  });
}

export function useTrip(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? mapDbToTrip(data) : null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (trip: TripInsert) => {
      if (!user) throw new Error('User not authenticated');

      const co2Kg = trip.distanceKm * co2PerKm[trip.transportType];

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: user.id,
          voyage_id: trip.voyageId || null,
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
          departure_station: trip.departureStation || null,
          arrival_station: trip.arrivalStation || null,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToTrip(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
      if (data.voyageId) {
        queryClient.invalidateQueries({ queryKey: ['voyage', data.voyageId] });
      }
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TripInsert> & { id: string }) => {
      const updateData: any = {};
      
      if (updates.departureCity) updateData.departure_city = updates.departureCity;
      if (updates.departureCountry) updateData.departure_country = updates.departureCountry;
      if (updates.departureCountryName) updateData.departure_country_name = updates.departureCountryName;
      if (updates.arrivalCity) updateData.arrival_city = updates.arrivalCity;
      if (updates.arrivalCountry) updateData.arrival_country = updates.arrivalCountry;
      if (updates.arrivalCountryName) updateData.arrival_country_name = updates.arrivalCountryName;
      if (updates.via) updateData.via = updates.via;
      if (updates.departureDate) updateData.departure_date = updates.departureDate;
      if (updates.departureTime !== undefined) updateData.departure_time = updates.departureTime;
      if (updates.returnDate !== undefined) updateData.return_date = updates.returnDate;
      if (updates.arrivalTime !== undefined) updateData.arrival_time = updates.arrivalTime;
      if (updates.transportType) {
        updateData.transport_type = updates.transportType;
        if (updates.distanceKm) {
          updateData.co2_kg = updates.distanceKm * co2PerKm[updates.transportType];
        }
      }
      if (updates.company !== undefined) updateData.company = updates.company;
      if (updates.carType !== undefined) updateData.car_type = updates.carType;
      if (updates.ticketNumber !== undefined) updateData.ticket_number = updates.ticketNumber;
      if (updates.seatNumber !== undefined) updateData.seat_number = updates.seatNumber;
      if (updates.bookingStatus) updateData.booking_status = updates.bookingStatus;
      if (updates.distanceKm) {
        updateData.distance_km = updates.distanceKm;
        if (updates.transportType) {
          updateData.co2_kg = updates.distanceKm * co2PerKm[updates.transportType];
        }
      }
      if (updates.status) updateData.status = updates.status;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.departureStation !== undefined) updateData.departure_station = updates.departureStation;
      if (updates.arrivalStation !== undefined) updateData.arrival_station = updates.arrivalStation;

      const { data, error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToTrip(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
    },
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

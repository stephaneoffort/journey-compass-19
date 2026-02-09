import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trip, TransportType, TripStatus, Location, BookingStatus, CarType, AccommodationType, co2PerKm } from '@/types/trip';
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
  accommodationType?: AccommodationType;
  ticketNumber?: string;
  seatNumber?: string;
  bookingStatus?: BookingStatus;
  price?: number;
  distanceKm: number;
  status?: TripStatus;
  notes?: string;
  departureStation?: string;
  arrivalStation?: string;
  tollExpense?: number;
  parkingExpense?: number;
  otherExpense?: number;
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
    accommodationType: row.accommodation_type as AccommodationType | undefined,
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
    tollExpense: row.toll_expense ? parseFloat(row.toll_expense) : undefined,
    parkingExpense: row.parking_expense ? parseFloat(row.parking_expense) : undefined,
    otherExpense: row.other_expense ? parseFloat(row.other_expense) : undefined,
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
          accommodation_type: trip.accommodationType || null,
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
          toll_expense: trip.tollExpense || null,
          parking_expense: trip.parkingExpense || null,
          other_expense: trip.otherExpense || null,
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
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TripInsert> & { id: string }) => {
      const updateData: Record<string, unknown> = {};
      
      // Required fields - always update if provided
      if (updates.departureCity !== undefined) updateData.departure_city = updates.departureCity;
      if (updates.departureCountry !== undefined) updateData.departure_country = updates.departureCountry;
      if (updates.departureCountryName !== undefined) updateData.departure_country_name = updates.departureCountryName;
      if (updates.arrivalCity !== undefined) updateData.arrival_city = updates.arrivalCity;
      if (updates.arrivalCountry !== undefined) updateData.arrival_country = updates.arrivalCountry;
      if (updates.arrivalCountryName !== undefined) updateData.arrival_country_name = updates.arrivalCountryName;
      if (updates.via !== undefined) updateData.via = updates.via as unknown as Json;
      if (updates.departureDate !== undefined) updateData.departure_date = updates.departureDate;
      
      // Optional time fields - allow null/empty
      if (updates.departureTime !== undefined) updateData.departure_time = updates.departureTime || null;
      if (updates.returnDate !== undefined) updateData.return_date = updates.returnDate || null;
      if (updates.arrivalTime !== undefined) updateData.arrival_time = updates.arrivalTime || null;
      
      // Transport type and CO2 calculation
      if (updates.transportType !== undefined) {
        updateData.transport_type = updates.transportType;
      }
      
      // Distance and CO2 - handle 0 as valid value
      if (updates.distanceKm !== undefined) {
        updateData.distance_km = updates.distanceKm;
        const transportForCo2 = updates.transportType || 'car';
        updateData.co2_kg = updates.distanceKm * co2PerKm[transportForCo2];
      }
      
      // Optional string fields - allow empty strings to clear values
      if (updates.company !== undefined) updateData.company = updates.company || null;
      if (updates.carType !== undefined) updateData.car_type = updates.carType || null;
      if (updates.accommodationType !== undefined) updateData.accommodation_type = updates.accommodationType || null;
      if (updates.ticketNumber !== undefined) updateData.ticket_number = updates.ticketNumber || null;
      if (updates.seatNumber !== undefined) updateData.seat_number = updates.seatNumber || null;
      if (updates.notes !== undefined) updateData.notes = updates.notes || null;
      if (updates.departureStation !== undefined) updateData.departure_station = updates.departureStation || null;
      if (updates.arrivalStation !== undefined) updateData.arrival_station = updates.arrivalStation || null;
      
      // Booking status
      if (updates.bookingStatus !== undefined) updateData.booking_status = updates.bookingStatus;
      
      // Status
      if (updates.status !== undefined) updateData.status = updates.status;
      
      // Price - allow 0 and undefined to clear
      if (updates.price !== undefined) updateData.price = updates.price ?? null;
      
      // Car expenses - allow 0 and undefined to clear
      if (updates.tollExpense !== undefined) updateData.toll_expense = updates.tollExpense ?? null;
      if (updates.parkingExpense !== undefined) updateData.parking_expense = updates.parkingExpense ?? null;
      if (updates.otherExpense !== undefined) updateData.other_expense = updates.otherExpense ?? null;

      // Only update if there are changes
      if (Object.keys(updateData).length === 0) {
        throw new Error('No updates provided');
      }

      const { data, error } = await supabase
        .from('trips')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToTrip(data);
    },
    onSuccess: (data, variables) => {
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['voyages'] });
      if (data.voyageId) {
        queryClient.invalidateQueries({ queryKey: ['voyage', data.voyageId] });
      }
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

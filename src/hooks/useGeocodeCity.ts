import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CityData } from '@/data/cityCoordinates';

interface GeocodeResult {
  success: boolean;
  city: string;
  country: string;
  countryName: string;
  lat: number;
  lng: number;
  source: 'database' | 'nominatim';
}

export function useGeocodeCity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ city, country, countryName }: { city: string; country: string; countryName: string }): Promise<CityData> => {
      const { data, error } = await supabase.functions.invoke<GeocodeResult>('geocode-city', {
        body: { city, country, countryName },
      });

      if (error) {
        throw new Error(error.message || 'Failed to geocode city');
      }

      if (!data || !data.success) {
        throw new Error('City not found');
      }

      return {
        city: data.city,
        country: data.country,
        countryName: data.countryName,
        lat: data.lat,
        lng: data.lng,
      };
    },
    onSuccess: () => {
      // Invalidate custom cities query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['custom-cities'] });
    },
  });
}

export function useCustomCities() {
  return useQuery({
    queryKey: ['custom-cities'],
    queryFn: async (): Promise<CityData[]> => {
      const { data, error } = await supabase
        .from('custom_cities')
        .select('city, country, country_name, lat, lng')
        .order('city');

      if (error) {
        console.error('Error fetching custom cities:', error);
        return [];
      }

      return data.map(row => ({
        city: row.city,
        country: row.country,
        countryName: row.country_name,
        lat: parseFloat(String(row.lat)),
        lng: parseFloat(String(row.lng)),
      }));
    },
  });
}

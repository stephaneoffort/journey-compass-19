import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CityData } from '@/data/cityCoordinates';

interface SearchCityResult {
  success: boolean;
  results: CityData[];
}

export function useSearchCity(query: string, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['search-city', query],
    queryFn: async (): Promise<CityData[]> => {
      if (!query || query.length < 3) return [];
      
      console.log('[useSearchCity] Searching online for:', query);
      
      const { data, error } = await supabase.functions.invoke<SearchCityResult>('search-city', {
        body: { query },
      });

      if (error) {
        console.error('[useSearchCity] Error:', error);
        return [];
      }

      if (!data || !data.success) {
        console.log('[useSearchCity] No results');
        return [];
      }

      console.log('[useSearchCity] Found cities:', data.results);
      
      // Invalidate custom cities to include newly saved cities
      queryClient.invalidateQueries({ queryKey: ['custom-cities'] });
      
      return data.results;
    },
    enabled: enabled && query.length >= 3,
    staleTime: 60000, // Cache for 1 minute
    gcTime: 300000, // Keep in cache for 5 minutes
  });
}

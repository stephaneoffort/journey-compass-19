import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TripEstimate {
  estimatedDurationMinutes: number;
  estimatedCo2Kg: number;
  durationRange: { min: number; max: number };
  co2Comparison: string;
  tips: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface EstimateParams {
  departureCity: string;
  arrivalCity: string;
  transportType: string;
  distanceKm: number;
  stopovers?: string[];
}

export function useTripEstimate() {
  const [estimate, setEstimate] = useState<TripEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimate = async (params: EstimateParams) => {
    if (!params.departureCity || !params.arrivalCity || !params.distanceKm) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('estimate-trip', {
        body: params,
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setEstimate(data as TripEstimate);
    } catch (err) {
      console.error('Trip estimate error:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'estimation');
      setEstimate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEstimate = () => {
    setEstimate(null);
    setError(null);
  };

  return {
    estimate,
    isLoading,
    error,
    fetchEstimate,
    clearEstimate,
  };
}

import { Trip, transportEmoji, getFlag } from '@/types/trip';
import { Clock, MapPin, Euro, Route } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoyageSummaryProps {
  trips: Trip[];
}

export function VoyageSummary({ trips }: VoyageSummaryProps) {
  // Sort trips chronologically
  const sortedTrips = [...trips].sort((a, b) => {
    const dateA = new Date(`${a.departureDate}T${a.departureTime || '00:00'}`);
    const dateB = new Date(`${b.departureDate}T${b.departureTime || '00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  const totalPrice = sortedTrips.reduce((sum, trip) => {
    const tripPrice = (trip.price || 0) + (trip.tollExpense || 0) + (trip.parkingExpense || 0) + (trip.otherExpense || 0);
    return sum + tripPrice;
  }, 0);

  const totalDistance = sortedTrips.reduce((sum, trip) => sum + trip.distanceKm, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '—';
    return time.slice(0, 5);
  };

  // Estimate travel time based on transport type and distance
  const estimateDuration = (trip: Trip): string => {
    const { transportType, distanceKm } = trip;
    
    if (distanceKm === 0) return '—';
    
    // Average speeds in km/h
    const speeds: Record<string, number> = {
      plane: 800,
      train: 200,
      car: 80,
      bus: 60,
      boat: 30,
      metro: 35,
      logement: 0,
      frais: 0,
    };
    
    const speed = speeds[transportType] || 60;
    if (speed === 0) return '—';
    
    const hours = distanceKm / speed;
    
    if (hours < 1) {
      return `~${Math.round(hours * 60)} min`;
    } else if (hours < 24) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      return m > 0 ? `~${h}h${m.toString().padStart(2, '0')}` : `~${h}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return remainingHours > 0 ? `~${days}j ${remainingHours}h` : `~${days}j`;
    }
  };

  const getTripPrice = (trip: Trip): number => {
    return (trip.price || 0) + (trip.tollExpense || 0) + (trip.parkingExpense || 0) + (trip.otherExpense || 0);
  };

  if (trips.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 animate-slide-up">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Récapitulatif
      </h2>

      {/* Trip rows */}
      <div className="space-y-0 divide-y divide-border/50">
        {sortedTrips.map((trip, index) => (
          <div key={trip.id} className="py-3 first:pt-0">
            <div className="flex items-start gap-3">
              {/* Transport icon */}
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <span className="text-lg">{transportEmoji[trip.transportType]}</span>
              </div>

              {/* Trip details */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Route */}
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="flag-emoji text-xs">{getFlag(trip.departureCountry)}</span>
                  <span className="truncate">{trip.departureCity}</span>
                  {trip.transportType !== 'frais' && trip.transportType !== 'logement' && (
                    <>
                      <span className="text-muted-foreground">→</span>
                      <span className="flag-emoji text-xs">{getFlag(trip.arrivalCountry)}</span>
                      <span className="truncate">{trip.arrivalCity}</span>
                    </>
                  )}
                </div>

                {/* Date and times */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/80">
                    {formatDate(trip.departureDate)}
                  </span>
                  
                  {trip.transportType !== 'frais' && (
                    <>
                      <span className="flex items-center gap-1">
                        <span>Dép.</span>
                        <span className="font-medium">{formatTime(trip.departureTime)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>Arr.</span>
                        <span className="font-medium">{formatTime(trip.arrivalTime)}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Duration estimate and distance */}
                {trip.distanceKm > 0 && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {estimateDuration(trip)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Route className="w-3 h-3" />
                      {trip.distanceKm.toLocaleString('fr-FR')} km
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                {getTripPrice(trip) > 0 ? (
                  <span className="font-semibold text-sm">
                    {getTripPrice(trip).toFixed(0)}€
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Route className="w-4 h-4" />
              <span className="font-medium text-foreground">
                {totalDistance.toLocaleString('fr-FR')} km
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Euro className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-bold">
              {totalPrice.toFixed(0)}€
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

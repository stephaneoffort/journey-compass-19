import { Trip, transportEmoji, getFlag } from '@/types/trip';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const statusColors = {
    completed: 'border-l-transport-train',
    planned: 'border-l-transport-plane',
    cancelled: 'border-l-destructive',
  };

  return (
    <Link to={`/trips/${trip.id}`} className="block">
      <div className={cn('trip-card border-l-4', statusColors[trip.status])}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
            <span className="truncate">{trip.departureCity}</span>
            <span className="text-muted-foreground">→</span>
            {trip.via.length > 0 && (
              <>
                {trip.via.map((stop, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="flag-emoji text-xs">{getFlag(stop.country)}</span>
                    <span className="text-muted-foreground">→</span>
                  </span>
                ))}
              </>
            )}
            <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
            <span className="truncate">{trip.arrivalCity}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>{transportEmoji[trip.transportType]}</span>
              <span>{trip.distanceKm.toLocaleString('fr-FR')} km</span>
            </span>
            <span>•</span>
            <span>{new Date(trip.departureDate).toLocaleDateString('fr-FR', { 
              day: 'numeric',
              month: 'short'
            })}</span>
            {trip.returnDate && (
              <>
                <span>-</span>
                <span>{new Date(trip.returnDate).toLocaleDateString('fr-FR', { 
                  day: 'numeric',
                  month: 'short'
                })}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn('transport-badge', `transport-${trip.transportType}`)}>
            {trip.co2Kg < 50 ? '🌱' : trip.co2Kg < 200 ? '🌿' : '🍂'}
            <span>{trip.co2Kg.toFixed(0)} kg</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </Link>
  );
}

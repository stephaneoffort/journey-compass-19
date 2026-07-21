import { forwardRef } from 'react';
import { Trip } from '@/types/trip';
import { TransportIcon } from '@/components/transport/TransportIcon';
import { ChevronRight, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
}

export const TripCard = forwardRef<HTMLAnchorElement, TripCardProps>(
  ({ trip }, ref) => {
    const navigate = useNavigate();

    const statusColors = {
      completed: 'border-l-transport-train',
      planned: 'border-l-transport-plane',
      cancelled: 'border-l-destructive',
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      navigate(`/trips/${trip.id}/edit`);
    };

    return (
      <Link ref={ref} to={`/trips/${trip.id}`} className="block">
        <div className={cn('trip-card border-l-4', statusColors[trip.status])}>
          <TransportIcon mode={trip.transportType} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm font-medium truncate">
              <span className="truncate">{trip.departureCity}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {trip.departureCountry}
              </span>
              <span className="text-muted-foreground shrink-0">→</span>
              {trip.via.length > 0 &&
                trip.via.map((stop, i) => (
                  <span key={i} className="flex items-center gap-1.5 shrink-0">
                    <span className="truncate">{stop.city}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {stop.country}
                    </span>
                    <span className="text-muted-foreground">→</span>
                  </span>
                ))}
              <span className="truncate">{trip.arrivalCity}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground shrink-0">
                {trip.arrivalCountry}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>{trip.distanceKm.toLocaleString('fr-FR')} km</span>
              <span>•</span>
              <span>
                {new Date(trip.departureDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              {trip.returnDate && (
                <>
                  <span>-</span>
                  <span>
                    {new Date(trip.returnDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className={cn(
                'text-sm font-semibold',
                trip.co2Kg > 200
                  ? 'text-[hsl(var(--transport-car))]'
                  : 'text-[hsl(var(--transport-train))]'
              )}
            >
              {trip.co2Kg.toFixed(0)} kg
            </span>
            {trip.status !== 'completed' && (
              <button
                onClick={handleEditClick}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Modifier le trajet"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </Link>
    );
  }
);

TripCard.displayName = 'TripCard';

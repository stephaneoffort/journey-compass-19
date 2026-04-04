import { PageLayout } from '@/components/layout/PageLayout';
import { useTrips } from '@/hooks/useTrips';
import { useCustomCities } from '@/hooks/useGeocodeCity';
import { getFlag, transportEmoji } from '@/types/trip';
import { Globe, MapPin, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { TripMap } from '@/components/map/TripMap';

export default function MapView() {
  const { data: trips = [], isLoading } = useTrips();
  const { data: customCities = [] } = useCustomCities();

  const completedTrips = trips.filter(t => t.status === 'completed');

  const destinations = useMemo(() => {
    const map = new Map<string, { city: string; country: string; count: number }>();
    trips.forEach(trip => {
      const key = `${trip.arrivalCity}-${trip.arrivalCountry}`;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
      } else {
        map.set(key, { city: trip.arrivalCity, country: trip.arrivalCountry, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [trips]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Carte</h1>
        <p className="page-subtitle">Visualisez vos destinations</p>
      </div>

      <div className="px-5 space-y-6">
        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="stat-value text-2xl">{destinations.length}</div>
            <div className="text-muted-foreground">Destinations</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-2xl">{completedTrips.length}</div>
            <div className="text-muted-foreground">Trajets</div>
          </div>
        </div>

        {/* Interactive Map */}
        {trips.length > 0 && (
          <TripMap trips={trips} customCities={customCities.filter((c): c is typeof c & { lat: number; lng: number } => c.lat != null && c.lng != null)} />
        )}

        {/* Destinations list */}
        {destinations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Vos destinations</h2>
            <div className="space-y-2">
              {destinations.map((dest, index) => (
                <div
                  key={`${dest.city}-${dest.country}`}
                  className="glass-card p-4 flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="flag-emoji text-xl">{getFlag(dest.country)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{dest.city}</div>
                    <div className="text-xs text-muted-foreground">
                      {dest.count} trajet{dest.count > 1 ? 's' : ''}
                    </div>
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent routes */}
        {trips.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Derniers itinéraires</h2>
            <div className="space-y-2">
              {trips.slice(0, 5).map((trip, index) => (
                <div
                  key={trip.id}
                  className="glass-card p-4 flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${(destinations.length + index) * 50}ms` }}
                >
                  <span className="text-xl">{transportEmoji[trip.transportType]}</span>
                  <div className="flex-1 flex items-center gap-2 text-sm">
                    <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
                    <span className="truncate">{trip.departureCity}</span>
                    <span className="text-muted-foreground">→</span>
                    {trip.via.length > 0 && (
                      <>
                        {trip.via.map((stop, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <span className="flag-emoji">{getFlag(stop.country)}</span>
                            <span className="text-muted-foreground">→</span>
                          </span>
                        ))}
                      </>
                    )}
                    <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
                    <span className="truncate">{trip.arrivalCity}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {trip.distanceKm.toLocaleString('fr-FR')} km
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

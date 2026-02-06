import { PageLayout } from '@/components/layout/PageLayout';
import { mockTrips, calculateStats } from '@/data/mockTrips';
import { getFlag, transportEmoji } from '@/types/trip';
import { Globe, MapPin } from 'lucide-react';

export default function MapView() {
  const stats = calculateStats(mockTrips);
  
  // Get unique destinations
  const destinations = new Map<string, { city: string; country: string; count: number }>();
  mockTrips.forEach(trip => {
    const key = `${trip.arrivalCity}-${trip.arrivalCountry}`;
    const existing = destinations.get(key);
    if (existing) {
      existing.count++;
    } else {
      destinations.set(key, {
        city: trip.arrivalCity,
        country: trip.arrivalCountry,
        count: 1,
      });
    }
  });

  const sortedDestinations = Array.from(destinations.values())
    .sort((a, b) => b.count - a.count);

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Carte</h1>
        <p className="page-subtitle">Visualisez vos destinations</p>
      </div>

      <div className="px-5 space-y-6">
        {/* Map placeholder */}
        <div className="glass-card p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">Carte interactive</h3>
          <p className="text-sm text-muted-foreground mb-4">
            La carte interactive sera disponible prochainement
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="text-center">
              <div className="stat-value text-2xl">{destinations.size}</div>
              <div className="text-muted-foreground">Destinations</div>
            </div>
            <div className="text-center">
              <div className="stat-value text-2xl">{stats.totalTrips}</div>
              <div className="text-muted-foreground">Trajets</div>
            </div>
          </div>
        </div>

        {/* Destinations list */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Vos destinations</h2>
          <div className="space-y-2">
            {sortedDestinations.map((dest, index) => (
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

        {/* Recent routes */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Derniers itinéraires</h2>
          <div className="space-y-2">
            {mockTrips.slice(0, 5).map((trip, index) => (
              <div 
                key={trip.id}
                className="glass-card p-4 flex items-center gap-3 animate-slide-up"
                style={{ animationDelay: `${(sortedDestinations.length + index) * 50}ms` }}
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
      </div>
    </PageLayout>
  );
}

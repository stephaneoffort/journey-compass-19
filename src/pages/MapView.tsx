import { PageLayout } from '@/components/layout/PageLayout';
import { useTrips } from '@/hooks/useTrips';
import { useVoyages } from '@/hooks/useVoyages';
import { useCustomCities } from '@/hooks/useGeocodeCity';
import { TransportType } from '@/types/trip';
import { MapPin, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TripMap } from '@/components/map/TripMap';
import { TransportFilter } from '@/components/trips/TransportFilter';
import { TransportIcon } from '@/components/transport/TransportIcon';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

export default function MapView() {
  const { data: trips = [], isLoading } = useTrips();
  const { data: voyages = [] } = useVoyages();
  const { data: customCities = [] } = useCustomCities();
  const [selectedVoyageId, setSelectedVoyageId] = useState<string>('all');
  const [selectedTransport, setSelectedTransport] = useState<TransportType | 'all'>('all');

  const filteredTrips = useMemo(() => {
    let result = trips;
    if (selectedVoyageId !== 'all') result = result.filter(t => t.voyageId === selectedVoyageId);
    if (selectedTransport !== 'all') result = result.filter(t => t.transportType === selectedTransport);
    return result;
  }, [trips, selectedVoyageId, selectedTransport]);

  const completedTrips = filteredTrips.filter(t => t.status === 'completed');

  const destinations = useMemo(() => {
    const map = new Map<string, { city: string; country: string; count: number }>();
    filteredTrips.forEach(trip => {
      const key = `${trip.arrivalCity}-${trip.arrivalCountry}`;
      const existing = map.get(key);
      if (existing) {
        existing.count++;
      } else {
        map.set(key, { city: trip.arrivalCity, country: trip.arrivalCountry, count: 1 });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredTrips]);

  const getVoyageLabel = (v: typeof voyages[0]) => {
    if (v.name && !/^\d{4}-\d{2}-\d{2}$/.test(v.name)) return v.name;
    if (v.startDate) {
      return new Date(v.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return `Voyage du ${new Date(v.createdAt).toLocaleDateString('fr-FR')}`;
  };

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Carte</h1>
            <p className="page-subtitle">Visualisez vos destinations</p>
          </div>
          {voyages.length > 0 && (
            <Select value={selectedVoyageId} onValueChange={setSelectedVoyageId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrer par voyage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les voyages</SelectItem>
                {voyages.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {getVoyageLabel(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <TransportFilter selected={selectedTransport} onChange={setSelectedTransport} />

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
        {filteredTrips.length > 0 && (
          <TripMap trips={filteredTrips} customCities={customCities.filter((c): c is typeof c & { lat: number; lng: number } => c.lat != null && c.lng != null)} />
        )}

        {filteredTrips.length === 0 && selectedVoyageId !== 'all' && (
          <div className="card-flat p-6 text-center text-muted-foreground">
            <p>Aucun trajet dans ce voyage.</p>
          </div>
        )}

        {/* Destinations list */}
        {destinations.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Vos destinations</h2>
            <div className="space-y-2">
              {destinations.map((dest, index) => (
                <div
                  key={`${dest.city}-${dest.country}`}
                  className="card-flat p-4 flex items-center gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">{dest.country}</span>
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
        {filteredTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Derniers itinéraires</h2>
            <div className="space-y-2">
              {filteredTrips.slice(0, 5).map((trip, index) => (
                <div
                  key={trip.id}
                  className="card-flat p-4 flex items-center gap-3 animate-slide-up"
                  style={{ animationDelay: `${(destinations.length + index) * 50}ms` }}
                >
                  <TransportIcon mode={trip.transportType} badgeClassName="w-8 h-8" className="w-4 h-4" />
                  <div className="flex-1 flex items-center gap-1.5 text-sm flex-wrap">
                    <span className="truncate">{trip.departureCity}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{trip.departureCountry}</span>
                    <span className="text-muted-foreground">→</span>
                    {trip.via.length > 0 && (
                      <>
                        {trip.via.map((stop, i) => (
                          <span key={i} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{stop.country}</span>
                            <span className="text-muted-foreground">→</span>
                          </span>
                        ))}
                      </>
                    )}
                    <span className="truncate">{trip.arrivalCity}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{trip.arrivalCountry}</span>
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

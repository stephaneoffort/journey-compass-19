import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TripCard } from '@/components/trips/TripCard';
import { TransportFilter } from '@/components/trips/TransportFilter';
import { mockTrips, groupTripsByMonth } from '@/data/mockTrips';
import { TransportType } from '@/types/trip';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TripsList() {
  const [filter, setFilter] = useState<TransportType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = useMemo(() => {
    return mockTrips.filter(trip => {
      const matchesTransport = filter === 'all' || trip.transportType === filter;
      const matchesSearch = searchQuery === '' || 
        trip.departureCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.arrivalCity.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTransport && matchesSearch;
    });
  }, [filter, searchQuery]);

  const groupedTrips = useMemo(() => {
    const sorted = [...filteredTrips].sort(
      (a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime()
    );
    return groupTripsByMonth(sorted);
  }, [filteredTrips]);

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Mes trajets</h1>
        <p className="page-subtitle">{mockTrips.length} trajets enregistrés</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une destination..."
            className="input-glass pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <TransportFilter selected={filter} onChange={setFilter} />
      </div>

      {/* Trips grouped by month */}
      <div className="px-5 space-y-6">
        {Object.entries(groupedTrips).map(([month, trips]) => (
          <div key={month}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {month}
            </h3>
            <div className="space-y-3">
              {trips.map((trip, index) => (
                <div 
                  key={trip.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredTrips.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun trajet trouvé</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

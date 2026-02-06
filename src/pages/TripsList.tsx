import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TripCard } from '@/components/trips/TripCard';
import { TransportFilter } from '@/components/trips/TransportFilter';
import { useTrips } from '@/hooks/useTrips';
import { TransportType } from '@/types/trip';
import { Search, Loader2, Plane } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function groupTripsByMonth(trips: any[]): Record<string, any[]> {
  return trips.reduce((acc, trip) => {
    const date = new Date(trip.departureDate);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(trip);
    return acc;
  }, {} as Record<string, any[]>);
}

export default function TripsList() {
  const { data: trips = [], isLoading } = useTrips();
  const [filter, setFilter] = useState<TransportType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const matchesTransport = filter === 'all' || trip.transportType === filter;
      const matchesSearch = searchQuery === '' || 
        trip.departureCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.arrivalCity.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTransport && matchesSearch;
    });
  }, [trips, filter, searchQuery]);

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
        <p className="page-subtitle">{trips.length} trajets enregistrés</p>
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
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : Object.keys(groupedTrips).length > 0 ? (
          Object.entries(groupedTrips).map(([month, monthTrips]) => (
            <div key={month}>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {month}
              </h3>
              <div className="space-y-3">
                {monthTrips.map((trip, index) => (
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
          ))
        ) : (
          <div className="glass-card p-8 text-center">
            <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Aucun trajet trouvé</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {trips.length === 0 
                ? "Commencez par ajouter votre premier trajet" 
                : "Aucun résultat pour cette recherche"}
            </p>
            {trips.length === 0 && (
              <Link to="/add">
                <Button className="btn-primary">Ajouter un trajet</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

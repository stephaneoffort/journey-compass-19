import { useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useVoyages } from '@/hooks/useVoyages';
import { transportEmoji, getFlag } from '@/types/trip';
import { Loader2, Plane, ArrowRight, Calendar, Route, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function VoyagesList() {
  const { data: voyages = [], isLoading } = useVoyages();

  // Sort voyages by the departure date of their first trip (descending)
  const sortedVoyages = useMemo(() => {
    return [...voyages].sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [voyages]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Mes voyages</h1>
        <p className="page-subtitle">{voyages.length} voyage{voyages.length > 1 ? 's' : ''} enregistré{voyages.length > 1 ? 's' : ''}</p>
      </div>

      <div className="px-5 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedVoyages.length > 0 ? (
          sortedVoyages.map((voyage, index) => (
            <Link
              key={voyage.id}
              to={`/voyages/${voyage.id}`}
              className="block animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="glass-card p-4 hover:border-primary/30 transition-colors">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {voyage.name || formatDate(voyage.startDate)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(voyage.startDate)}</span>
                      {voyage.endDate && voyage.endDate !== voyage.startDate && (
                        <>
                          <span>→</span>
                          <span>{formatDate(voyage.endDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                    {voyage.trips.length} trajet{voyage.trips.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Trip route summary */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4 text-sm">
                  {voyage.trips.map((trip, i) => (
                    <div key={trip.id} className="flex items-center gap-1.5">
                      {i === 0 && (
                        <>
                          <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
                          <span>{trip.departureCity}</span>
                        </>
                      )}
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{transportEmoji[trip.transportType]}</span>
                      <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
                      <span>{trip.arrivalCity}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Route className="w-3.5 h-3.5 text-primary" />
                      <span className="font-semibold">{voyage.totalDistanceKm.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">km</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Leaf className={cn(
                        'w-3.5 h-3.5',
                        voyage.totalCo2Kg < 100 ? 'text-transport-train' : 
                        voyage.totalCo2Kg < 500 ? 'text-transport-car' : 'text-destructive'
                      )} />
                      <span className={cn(
                        'font-semibold',
                        voyage.totalCo2Kg < 100 ? 'text-transport-train' : 
                        voyage.totalCo2Kg < 500 ? 'text-transport-car' : 'text-destructive'
                      )}>
                        {voyage.totalCo2Kg.toFixed(0)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">kg CO₂</div>
                  </div>
                  {voyage.totalPrice > 0 && (
                    <div className="text-center">
                      <div className="font-semibold">{voyage.totalPrice.toFixed(0)}€</div>
                      <div className="text-xs text-muted-foreground">total</div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="glass-card p-8 text-center">
            <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Aucun voyage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre premier voyage
            </p>
            <Link to="/add">
              <Button className="btn-primary">Créer un voyage</Button>
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

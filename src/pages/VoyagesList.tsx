import { useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useVoyages } from '@/hooks/useVoyages';
import { VoyageCard } from '@/components/voyages/VoyageCard';
import { Loader2, Plane } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function VoyagesList() {
  const navigate = useNavigate();
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

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return '';
    if (end && end !== start) {
      return `${formatDate(start)} → ${formatDate(end)}`;
    }
    return formatDate(start);
  };

  const handleAddTrip = (e: React.MouseEvent, voyageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/add-single?voyageId=${voyageId}`);
  };

  return (
    <PageLayout>
      <div className="page-header safe-top flex items-end justify-between">
        <div>
          <h1 className="page-title">Mes voyages</h1>
          <p className="page-subtitle">
            {voyages.length} voyage{voyages.length > 1 ? 's' : ''} enregistré{voyages.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/add"
          className="hidden sm:inline-flex items-center text-sm font-medium rounded-lg px-3.5 py-2 bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          + Voyage
        </Link>
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
              <VoyageCard
                name={voyage.name || formatDate(voyage.startDate)}
                dateLabel={formatDateRange(voyage.startDate, voyage.endDate)}
                trips={voyage.trips}
                totalDistanceKm={voyage.totalDistanceKm}
                totalCo2Kg={voyage.totalCo2Kg}
                totalPrice={voyage.totalPrice}
                onAddTrip={(e) => handleAddTrip(e, voyage.id)}
              />
            </Link>
          ))
        ) : (
          <div className="rounded-xl border border-border p-8 text-center">
            <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Aucun voyage</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par créer votre premier voyage
            </p>
            <Link
              to="/add"
              className="inline-flex items-center text-sm font-medium rounded-lg px-4 py-2.5 bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Créer un voyage
            </Link>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

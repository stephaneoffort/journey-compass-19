import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useTrip, useDeleteTrip, useUpdateTrip } from '@/hooks/useTrips';
import { transportLabels } from '@/types/trip';
import { TransportIcon } from '@/components/transport/TransportIcon';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Route, Leaf, FileText, Trash2, Edit, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { InvoiceUpload } from '@/components/invoices/InvoiceUpload';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: trip, isLoading } = useTrip(id || '');
  const deleteTrip = useDeleteTrip();
  const updateTrip = useUpdateTrip();

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!trip) {
    return (
      <PageLayout>
        <div className="page-header safe-top">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="page-title">Trajet introuvable</h1>
        </div>
      </PageLayout>
    );
  }

  const statusLabels = {
    completed: { label: 'Terminé', class: 'bg-transport-train/15 text-transport-train' },
    planned: { label: 'Prévu', class: 'bg-transport-plane/15 text-transport-plane' },
    cancelled: { label: 'Annulé', class: 'bg-destructive/15 text-destructive' },
  };

  const handleDelete = async () => {
    if (confirm('Supprimer ce trajet ?')) {
      try {
        await deleteTrip.mutateAsync(trip.id);
        toast({ title: 'Trajet supprimé' });
        navigate('/trips');
      } catch {
        toast({ title: 'Erreur', variant: 'destructive' });
      }
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateTrip.mutateAsync({
        id: trip.id,
        status: trip.status === 'completed' ? 'planned' : 'completed'
      });
      toast({
        title: trip.status === 'completed' ? 'Marqué comme prévu' : 'Marqué comme terminé ✓'
      });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  const heavyCo2 = trip.co2Kg > 200;

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="px-5 space-y-6">
        {/* Header */}
        <div className="card-flat p-5 animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <TransportIcon
              mode={trip.transportType}
              badgeClassName="w-14 h-14 rounded-2xl"
              className="w-7 h-7"
            />
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusLabels[trip.status].class)}>
              {statusLabels[trip.status].label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-semibold tracking-tight mb-2">
            <span>{trip.departureCity}</span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
              {trip.departureCountry}
            </span>
            <span className="text-muted-foreground">→</span>
            {trip.via.length > 0 && trip.via.map((stop, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-base">{stop.city}</span>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                  {stop.country}
                </span>
                <span className="text-muted-foreground">→</span>
              </span>
            ))}
            <span>{trip.arrivalCity}</span>
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
              {trip.arrivalCountry}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            {transportLabels[trip.transportType]} • {trip.departureCountryName} → {trip.arrivalCountryName}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-flat p-4 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <div className="font-semibold">
              {new Date(trip.departureDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
            <div className="text-xs text-muted-foreground">Départ</div>
          </div>

          <div className="card-flat p-4 text-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <Route className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
            <div className="font-semibold">{trip.distanceKm.toLocaleString('fr-FR')}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>

          <div className="card-flat p-4 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Leaf className={cn('w-5 h-5 mx-auto mb-2', heavyCo2 ? 'text-[hsl(var(--transport-car))]' : 'text-[hsl(var(--transport-train))]')} />
            <div className={cn('font-semibold', heavyCo2 ? 'text-[hsl(var(--transport-car))]' : 'text-[hsl(var(--transport-train))]')}>
              {trip.co2Kg.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="card-flat p-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes
            </h3>
            <p className="text-sm text-muted-foreground">{trip.notes}</p>
          </div>
        )}

        {/* Invoices */}
        <div className="card-flat p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <InvoiceUpload tripId={trip.id} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '350ms' }}>
          {trip.status !== 'completed' && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/trips/${trip.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleMarkComplete}
            disabled={updateTrip.isPending}
          >
            {updateTrip.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {trip.status === 'completed' ? 'Marquer prévu' : 'Marquer terminé'}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleteTrip.isPending}
          >
            {deleteTrip.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

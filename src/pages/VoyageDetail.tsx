import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useVoyage, useDeleteVoyage, useUpdateVoyage } from '@/hooks/useVoyages';
import { TripCard } from '@/components/trips/TripCard';
import { VoyageSummary } from '@/components/voyages/VoyageSummary';
import { StatsRow } from '@/components/voyages/StatsRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Trash2, Loader2, Pencil, Check, X, Plus, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateVoyageExcel } from '@/utils/voyageExcel';

export default function VoyageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: voyage, isLoading } = useVoyage(id || '');
  const deleteVoyage = useDeleteVoyage();
  const updateVoyage = useUpdateVoyage();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!voyage) {
    return (
      <PageLayout>
        <div className="page-header safe-top">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="page-title">Voyage introuvable</h1>
        </div>
      </PageLayout>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const stepCount = voyage.trips.length + (voyage.trips.length > 0 ? 1 : 0);

  const handleDelete = async () => {
    if (confirm('Supprimer ce voyage et tous ses trajets ?')) {
      try {
        await deleteVoyage.mutateAsync(voyage.id);
        toast({ title: 'Voyage supprimé' });
        navigate('/voyages');
      } catch {
        toast({ title: 'Erreur', variant: 'destructive' });
      }
    }
  };

  const handleStartEditName = () => {
    setEditedName(voyage.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    try {
      await updateVoyage.mutateAsync({
        id: voyage.id,
        name: editedName || undefined,
      });
      setIsEditingName(false);
      toast({ title: 'Nom mis à jour' });
    } catch {
      toast({ title: 'Erreur', variant: 'destructive' });
    }
  };

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <Button variant="ghost" onClick={() => navigate('/voyages')} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="px-5 space-y-6">
        {/* Header */}
        <div className="card-flat animate-slide-up">
          <div className="p-5 pb-4">
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-3">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Nom du voyage"
                  className="flex-1"
                  autoFocus
                />
                <Button size="icon" variant="ghost" onClick={handleSaveName}>
                  <Check className="w-4 h-4 text-[hsl(var(--transport-train))]" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight truncate">
                    {voyage.name || formatDate(voyage.startDate)}
                  </h1>
                  <button
                    onClick={handleStartEditName}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1 mt-1"
                  >
                    <Pencil className="w-3 h-3" />
                    Modifier le nom
                  </button>
                </div>
                <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-secondary text-secondary-foreground shrink-0">
                  {stepCount} étape{stepCount > 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

          <StatsRow
            distanceKm={voyage.totalDistanceKm}
            co2Kg={voyage.totalCo2Kg}
            price={voyage.totalPrice}
          />
        </div>

        {/* Summary */}
        <VoyageSummary trips={voyage.trips} />

        {/* Trip list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Déplacements
            </h2>
            <Link to={`/add-single?voyageId=${voyage.id}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Plus className="w-4 h-4 mr-1" />
                Ajouter
              </Button>
            </Link>
          </div>

          {voyage.trips.map((trip, index) => (
            <div
              key={trip.id}
              className="animate-slide-up"
              style={{ animationDelay: `${250 + index * 50}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-medium text-secondary-foreground">
                  {index + 1}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(trip.departureDate)}
                </span>
              </div>
              <TripCard trip={trip} />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              toast({ title: 'Génération en cours...' });
              await generateVoyageExcel(voyage);
              toast({ title: 'Fichier téléchargé !' });
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger la feuille de calculs (.xlsx)
          </Button>

          <Button
            variant="outline"
            className="w-full text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={deleteVoyage.isPending}
          >
            {deleteVoyage.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer ce voyage
              </>
            )}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

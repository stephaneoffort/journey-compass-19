import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useVoyage, useDeleteVoyage, useUpdateVoyage } from '@/hooks/useVoyages';
import { TripCard } from '@/components/trips/TripCard';
import { transportEmoji, getFlag } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Calendar, Route, Leaf, Trash2, Loader2, Pencil, Check, X, Plus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
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
        <div className="glass-card p-6 animate-slide-up">
          {isEditingName ? (
            <div className="flex items-center gap-2 mb-4">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Nom du voyage"
                className="input-glass flex-1"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={handleSaveName}>
                <Check className="w-4 h-4 text-transport-train" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setIsEditingName(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {voyage.name || formatDate(voyage.startDate)}
                </h1>
                <button
                  onClick={handleStartEditName}
                  className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  <Pencil className="w-3 h-3" />
                  Modifier le nom
                </button>
              </div>
              <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {voyage.trips.length} trajet{voyage.trips.length > 1 ? 's' : ''}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(voyage.startDate)}</span>
            {voyage.endDate && voyage.endDate !== voyage.startDate && (
              <>
                <span>→</span>
                <span>{formatDate(voyage.endDate)}</span>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Route className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="font-semibold">{voyage.totalDistanceKm.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>
          
          <div className="glass-card p-4 text-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <Leaf className={cn(
              'w-5 h-5 mx-auto mb-2',
              voyage.totalCo2Kg < 100 ? 'text-transport-train' : 
              voyage.totalCo2Kg < 500 ? 'text-transport-car' : 'text-destructive'
            )} />
            <div className={cn(
              'font-semibold',
              voyage.totalCo2Kg < 100 ? 'text-transport-train' : 
              voyage.totalCo2Kg < 500 ? 'text-transport-car' : 'text-destructive'
            )}>
              {voyage.totalCo2Kg.toFixed(0)}
            </div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
          
          {voyage.totalPrice > 0 && (
            <div className="glass-card p-4 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="text-lg font-semibold">{voyage.totalPrice.toFixed(0)}€</div>
              <div className="text-xs text-muted-foreground">total</div>
            </div>
          )}
        </div>

        {/* Trip list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Déplacements
            </h2>
            <Link to={`/add-single?voyageId=${voyage.id}`}>
              <Button variant="ghost" size="sm" className="text-primary">
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
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground">
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
            onClick={() => generateVoyageExcel(voyage)}
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

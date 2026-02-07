import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { TripForm, TripFormData } from '@/components/forms/TripForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCreateVoyage, useAddTripToVoyage, useUpdateVoyage } from '@/hooks/useVoyages';
import { Trip, transportEmoji, getFlag } from '@/types/trip';
import { Plus, Check, ArrowRight, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = 'name' | 'trip' | 'confirm';

export default function AddVoyage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const createVoyage = useCreateVoyage();
  const addTrip = useAddTripToVoyage();
  const updateVoyage = useUpdateVoyage();
  
  const [step, setStep] = useState<Step>('name');
  const [voyageId, setVoyageId] = useState<string | null>(null);
  const [voyageName, setVoyageName] = useState('');
  const [addedTrips, setAddedTrips] = useState<Trip[]>([]);
  const [isAddingTrip, setIsAddingTrip] = useState(false);

  const handleStartVoyage = async () => {
    try {
      const voyage = await createVoyage.mutateAsync(voyageName || undefined);
      setVoyageId(voyage.id);
      setStep('trip');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le voyage.',
        variant: 'destructive',
      });
    }
  };

  const handleAddTrip = async (data: TripFormData) => {
    if (!voyageId) return;
    
    setIsAddingTrip(true);
    try {
      const trip = await addTrip.mutateAsync({
        voyageId,
        ...data,
      });
      
      setAddedTrips(prev => [...prev, trip]);
      setStep('confirm');
      
      // If no name was given initially, update with first trip's date
      if (!voyageName && addedTrips.length === 0) {
        await updateVoyage.mutateAsync({
          id: voyageId,
          name: data.departureDate,
        });
      }
      
      toast({
        title: 'Déplacement ajouté ! 🎉',
        description: `${data.departureCity} → ${data.arrivalCity}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le déplacement.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingTrip(false);
    }
  };

  const handleAddMore = () => {
    setStep('trip');
  };

  const handleFinish = () => {
    toast({
      title: 'Voyage enregistré ! ✈️',
      description: `${addedTrips.length} déplacement${addedTrips.length > 1 ? 's' : ''} ajouté${addedTrips.length > 1 ? 's' : ''}`,
    });
    navigate('/trips');
  };

  const totalDistance = addedTrips.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalCo2 = addedTrips.reduce((sum, t) => sum + t.co2Kg, 0);
  const totalPrice = addedTrips.reduce((sum, t) => sum + (t.price || 0), 0);

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Nouveau voyage</h1>
        <p className="page-subtitle">
          {step === 'name' && 'Donnez un nom à votre voyage'}
          {step === 'trip' && `Ajoutez le déplacement #${addedTrips.length + 1}`}
          {step === 'confirm' && 'Voulez-vous ajouter un autre déplacement ?'}
        </p>
      </div>

      <div className="px-5 pb-8">
        {/* Progress indicator */}
        {addedTrips.length > 0 && (
          <div className="glass-card p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {voyageName || addedTrips[0]?.departureDate}
              </span>
              <span className="text-xs text-muted-foreground">
                {addedTrips.length} déplacement{addedTrips.length > 1 ? 's' : ''}
              </span>
            </div>
            
            {/* Trip summary */}
            <div className="space-y-2">
              {addedTrips.map((trip, index) => (
                <div key={trip.id} className="flex items-center gap-2 text-sm">
                  <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                  <span>{transportEmoji[trip.transportType]}</span>
                  <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
                  <span>{trip.departureCity}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
                  <span>{trip.arrivalCity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-lg font-semibold">{totalDistance.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">km</div>
              </div>
              <div className="text-center">
                <div className={cn(
                  'text-lg font-semibold',
                  totalCo2 < 100 ? 'text-transport-train' : 
                  totalCo2 < 500 ? 'text-transport-car' : 'text-destructive'
                )}>
                  {totalCo2.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">kg CO₂</div>
              </div>
              {totalPrice > 0 && (
                <div className="text-center">
                  <div className="text-lg font-semibold">{totalPrice.toFixed(0)}€</div>
                  <div className="text-xs text-muted-foreground">total</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Name */}
        {step === 'name' && (
          <div className="space-y-6">
            <div className="glass-card p-4 space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">
                  Nom du voyage (optionnel)
                </Label>
                <div className="relative">
                  <Pencil className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={voyageName}
                    onChange={(e) => setVoyageName(e.target.value)}
                    placeholder="Ex: Conférence Berlin, Formation Paris..."
                    className="input-glass pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Si laissé vide, le nom sera la date du premier déplacement
                </p>
              </div>
            </div>

            <Button 
              onClick={handleStartVoyage}
              className="btn-primary w-full"
              disabled={createVoyage.isPending}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Continuer
            </Button>
          </div>
        )}

        {/* Step: Trip Form */}
        {step === 'trip' && (
          <TripForm
            onSubmit={handleAddTrip}
            isLoading={isAddingTrip}
            submitLabel="Ajouter ce déplacement"
            tripNumber={addedTrips.length + 1}
          />
        )}

        {/* Step: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-transport-train/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-transport-train" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Déplacement ajouté !</h2>
              <p className="text-muted-foreground">
                Voulez-vous ajouter un autre déplacement à ce voyage ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleFinish}
                className="h-14"
              >
                <Check className="w-4 h-4 mr-2" />
                Terminer
              </Button>
              <Button
                onClick={handleAddMore}
                className="btn-primary h-14"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un déplacement
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

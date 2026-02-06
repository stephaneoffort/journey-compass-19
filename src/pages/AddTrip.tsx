import { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CityAutocomplete } from '@/components/forms/CityAutocomplete';
import { StopoverInput } from '@/components/forms/StopoverInput';
import { CityData } from '@/data/cities';
import { Location, TransportType, transportEmoji, transportLabels, co2PerKm, getFlag } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowRight, Calendar, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '@/hooks/useTrips';

const transportTypes: TransportType[] = ['plane', 'train', 'car', 'bus', 'boat', 'metro'];

export default function AddTrip() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const createTrip = useCreateTrip();
  
  const [departure, setDeparture] = useState<CityData | null>(null);
  const [arrival, setArrival] = useState<CityData | null>(null);
  const [stopovers, setStopovers] = useState<Location[]>([]);
  const [transportType, setTransportType] = useState<TransportType>('train');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [notes, setNotes] = useState('');

  const estimatedCo2 = distanceKm ? parseFloat(distanceKm) * co2PerKm[transportType] : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departure || !arrival || !departureDate || !distanceKm) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTrip.mutateAsync({
        departureCity: departure.city,
        departureCountry: departure.country || 'XX',
        departureCountryName: departure.countryName || departure.city,
        arrivalCity: arrival.city,
        arrivalCountry: arrival.country || 'XX',
        arrivalCountryName: arrival.countryName || arrival.city,
        via: stopovers.filter(s => s.city),
        departureDate,
        returnDate: returnDate || undefined,
        transportType,
        distanceKm: parseInt(distanceKm),
        notes: notes || undefined,
      });

      toast({
        title: 'Trajet enregistré ! 🎉',
        description: `${departure.city} → ${arrival.city}`,
      });

      navigate('/trips');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'enregistrement.',
        variant: 'destructive',
      });
    }
  };

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Nouveau trajet</h1>
        <p className="page-subtitle">Enregistrez un déplacement professionnel</p>
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-6">
        {/* Departure & Arrival */}
        <div className="glass-card p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Départ</Label>
            <CityAutocomplete
              value={departure}
              onChange={setDeparture}
              placeholder="Ville de départ"
            />
          </div>

          {departure && arrival && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="flag-emoji">{getFlag(departure.country)}</span>
                <span>{departure.city}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
                {stopovers.filter(s => s.city).map((stop, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span className="flag-emoji">{getFlag(stop.country)}</span>
                    <span>{stop.city}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </span>
                ))}
                <span className="flag-emoji">{getFlag(arrival.country)}</span>
                <span>{arrival.city}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-muted-foreground">Arrivée</Label>
            <CityAutocomplete
              value={arrival}
              onChange={setArrival}
              placeholder="Ville d'arrivée"
            />
          </div>

          <StopoverInput stopovers={stopovers} onChange={setStopovers} />
        </div>

        {/* Transport Type */}
        <div className="space-y-3">
          <Label className="text-muted-foreground">Type de transport</Label>
          <div className="grid grid-cols-3 gap-2">
            {transportTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTransportType(type)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl transition-all',
                  transportType === type
                    ? `transport-${type} ring-2 ring-current`
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-2xl">{transportEmoji[type]}</span>
                <span className="text-xs font-medium">{transportLabels[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="glass-card p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Date de départ</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="input-glass pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Retour (optionnel)</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="input-glass pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Distance & CO2 */}
        <div className="glass-card p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Distance (km)</Label>
            <Input
              type="number"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder="Ex: 450"
              className="input-glass"
              required
            />
          </div>
          
          {estimatedCo2 > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
              <span className="text-sm text-muted-foreground">Empreinte CO₂ estimée</span>
              <span className={cn(
                'font-semibold',
                estimatedCo2 < 50 ? 'text-transport-train' : 
                estimatedCo2 < 200 ? 'text-transport-car' : 'text-destructive'
              )}>
                {estimatedCo2 < 50 ? '🌱' : estimatedCo2 < 200 ? '🌿' : '🍂'} {estimatedCo2.toFixed(1)} kg CO₂
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Notes (optionnel)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Motif du déplacement, références..."
            className="input-glass min-h-[100px]"
          />
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="btn-primary w-full" 
          disabled={createTrip.isPending}
        >
          {createTrip.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer le trajet
            </>
          )}
        </Button>
      </form>
    </PageLayout>
  );
}

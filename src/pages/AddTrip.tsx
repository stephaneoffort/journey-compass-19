import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { CityAutocomplete } from '@/components/forms/CityAutocomplete';
import { StopoverInput } from '@/components/forms/StopoverInput';
import { TransportOptions } from '@/components/forms/TransportOptions';
import { TrainStationSelect } from '@/components/forms/TrainStationSelect';
import { BusStationSelect } from '@/components/forms/BusStationSelect';
import { TripEstimateCard } from '@/components/trips/TripEstimateCard';
import { CityData, getCityCoordinates } from '@/data/cityCoordinates';
import { Location, TransportType, BookingStatus, CarType, transportEmoji, transportLabels, co2PerKm, getFlag } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowRight, Calendar, Clock, Save, Loader2, Route } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCreateTrip } from '@/hooks/useTrips';
import { calculateRouteDistance } from '@/utils/distance';
import { useTripEstimate } from '@/hooks/useTripEstimate';

const transportTypes: TransportType[] = ['plane', 'train', 'car', 'bus', 'boat', 'metro'];

export default function AddTrip() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const voyageId = searchParams.get('voyageId');
  const createTrip = useCreateTrip();
  
  // Transport (first)
  const [transportType, setTransportType] = useState<TransportType>('train');
  const [company, setCompany] = useState('');
  const [carType, setCarType] = useState<CarType | ''>('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('recherche');
  
  // Cities
  const [departure, setDeparture] = useState<CityData | null>(null);
  const [arrival, setArrival] = useState<CityData | null>(null);
  
  // Stations (train & bus)
  const [departureStation, setDepartureStation] = useState<string | null>(null);
  const [arrivalStation, setArrivalStation] = useState<string | null>(null);
  const [stopovers, setStopovers] = useState<Location[]>([]);
  
  // Dates & Times
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  
  // Distance & Price & Notes
  const [distanceKm, setDistanceKm] = useState('');
  const [manualDistance, setManualDistance] = useState(false);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  // AI Estimate
  const { estimate, isLoading: isEstimating, error: estimateError, fetchEstimate, clearEstimate } = useTripEstimate();

  // Calculate distance automatically when cities change
  const calculatedDistance = useMemo(() => {
    if (!departure || !arrival) return null;
    
    // Get coordinates for departure
    const depCoords = departure.lat && departure.lng 
      ? { lat: departure.lat, lng: departure.lng }
      : getCityCoordinates(departure.city, departure.country);
    
    // Get coordinates for arrival
    const arrCoords = arrival.lat && arrival.lng
      ? { lat: arrival.lat, lng: arrival.lng }
      : getCityCoordinates(arrival.city, arrival.country);
    
    if (!depCoords || !arrCoords) return null;
    
    // Build route points array
    const routePoints: Array<{ lat: number; lng: number } | null> = [depCoords];
    
    // Add stopovers if they have coordinates
    for (const stopover of stopovers) {
      if (stopover.city) {
        const stopCoords = stopover.lat && stopover.lng
          ? { lat: stopover.lat, lng: stopover.lng }
          : getCityCoordinates(stopover.city, stopover.country);
        routePoints.push(stopCoords);
      }
    }
    
    routePoints.push(arrCoords);
    
    return calculateRouteDistance(routePoints);
  }, [departure, arrival, stopovers]);

  // Auto-update distance when calculated
  useEffect(() => {
    console.log('[AddTrip] distance recompute', {
      departure,
      arrival,
      stopovers,
      calculatedDistance,
      manualDistance,
    });

    if (calculatedDistance !== null && !manualDistance) {
      setDistanceKm(calculatedDistance.toString());
    }
  }, [calculatedDistance, manualDistance, departure, arrival, stopovers]);

  // Check if all cities have coordinates
  const allCitiesKnown = useMemo(() => {
    if (!departure || !arrival) return false;
    
    const depHasCoords = (departure.lat && departure.lng) || getCityCoordinates(departure.city, departure.country);
    const arrHasCoords = (arrival.lat && arrival.lng) || getCityCoordinates(arrival.city, arrival.country);
    
    if (!depHasCoords || !arrHasCoords) return false;
    
    for (const stopover of stopovers) {
      if (stopover.city) {
        const stopHasCoords = (stopover.lat && stopover.lng) || getCityCoordinates(stopover.city, stopover.country);
        if (!stopHasCoords) return false;
      }
    }
    
    return true;
  }, [departure, arrival, stopovers]);

  const estimatedCo2 = distanceKm ? parseFloat(distanceKm) * co2PerKm[transportType] : 0;

  const handleTransportTypeChange = (type: TransportType) => {
    setTransportType(type);
    setCompany('');
    setCarType('');
    setTicketNumber('');
    setSeatNumber('');
    clearEstimate();
  };

  const handleRequestEstimate = () => {
    if (!departure || !arrival || !distanceKm) return;
    
    fetchEstimate({
      departureCity: departure.city,
      arrivalCity: arrival.city,
      transportType,
      distanceKm: parseInt(distanceKm),
      stopovers: stopovers.filter(s => s.city).map(s => s.city),
    });
  };

  const canEstimate = Boolean(departure && arrival && distanceKm);

  const handleManualDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualDistance(true);
    setDistanceKm(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!departure || !arrival || !departureDate) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir les villes et la date de départ.',
        variant: 'destructive',
      });
      return;
    }

    // Price is required when booking status is 'trouve' or 'achete'
    if ((bookingStatus === 'trouve' || bookingStatus === 'achete') && !price) {
      toast({
        title: 'Prix requis',
        description: 'Veuillez saisir le prix du trajet.',
        variant: 'destructive',
      });
      return;
    }

    if (!distanceKm && !allCitiesKnown) {
      toast({
        title: 'Distance requise',
        description: 'Veuillez saisir la distance manuellement pour les villes non reconnues.',
        variant: 'destructive',
      });
      return;
    }

    const finalDistance = distanceKm ? parseInt(distanceKm) : 0;

    try {
      await createTrip.mutateAsync({
        voyageId: voyageId || undefined,
        departureCity: departure.city,
        departureCountry: departure.country || 'XX',
        departureCountryName: departure.countryName || departure.city,
        arrivalCity: arrival.city,
        arrivalCountry: arrival.country || 'XX',
        arrivalCountryName: arrival.countryName || arrival.city,
        via: stopovers.filter(s => s.city),
        departureDate,
        departureTime: departureTime || undefined,
        returnDate: returnDate || undefined,
        arrivalTime: arrivalTime || undefined,
        transportType,
        company: company || undefined,
        carType: carType || undefined,
        ticketNumber: ticketNumber || undefined,
        seatNumber: seatNumber || undefined,
        bookingStatus,
        price: price ? parseFloat(price) : undefined,
        distanceKm: finalDistance,
        notes: notes || undefined,
      });

      toast({
        title: 'Trajet enregistré ! 🎉',
        description: `${departure.city} → ${arrival.city}`,
      });

      // Redirect to the voyage if adding to an existing one, otherwise to trips list
      if (voyageId) {
        navigate(`/voyages/${voyageId}`);
      } else {
        navigate('/trips');
      }
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
        <h1 className="page-title">
          {voyageId ? 'Ajouter un trajet' : 'Nouveau trajet'}
        </h1>
        <p className="page-subtitle">
          {voyageId 
            ? 'Ajouter un déplacement à ce voyage' 
            : 'Enregistrez un déplacement professionnel'}
        </p>
        {voyageId && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm">
            <span>📦</span>
            <span>Voyage existant</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="px-5 space-y-6">
        {/* Transport Type - FIRST */}
        <div className="space-y-3">
          <Label className="text-muted-foreground">Type de transport</Label>
          <div className="grid grid-cols-3 gap-2">
            {transportTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleTransportTypeChange(type)}
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

        {/* Transport-specific options */}
        <div className="glass-card p-4 space-y-4">
          <TransportOptions
            transportType={transportType}
            company={company}
            setCompany={setCompany}
            carType={carType}
            setCarType={setCarType}
            ticketNumber={ticketNumber}
            setTicketNumber={setTicketNumber}
            seatNumber={seatNumber}
            setSeatNumber={setSeatNumber}
            bookingStatus={bookingStatus}
            setBookingStatus={setBookingStatus}
          />

          {/* Price field - required when booking status is 'trouve' or 'achete' */}
          {(bookingStatus === 'trouve' || bookingStatus === 'achete') && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Prix (€) <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 125.50"
                className="input-glass"
                required
              />
            </div>
          )}
        </div>

        {/* Departure & Arrival */}
        <div className="glass-card p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Départ</Label>
            <CityAutocomplete
              value={departure}
              onChange={(city) => {
                setDeparture(city);
                setDepartureStation(null);
              }}
              placeholder="Ville de départ"
            />
            {/* Train station select for departure */}
            {transportType === 'train' && departure && (
              <TrainStationSelect
                cityName={departure.city}
                countryCode={departure.country}
                value={departureStation}
                onChange={setDepartureStation}
                label="Gare de départ"
              />
            )}
            {/* Bus station select for departure */}
            {transportType === 'bus' && departure && (
              <BusStationSelect
                cityName={departure.city}
                countryCode={departure.country}
                value={departureStation}
                onChange={setDepartureStation}
                label="Gare routière de départ"
              />
            )}
          </div>

          {departure && arrival && (
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-2 text-sm flex-wrap">
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
              onChange={(city) => {
                setArrival(city);
                setArrivalStation(null);
              }}
              placeholder="Ville d'arrivée"
            />
            {/* Train station select for arrival */}
            {transportType === 'train' && arrival && (
              <TrainStationSelect
                cityName={arrival.city}
                countryCode={arrival.country}
                value={arrivalStation}
                onChange={setArrivalStation}
                label="Gare d'arrivée"
              />
            )}
            {/* Bus station select for arrival */}
            {transportType === 'bus' && arrival && (
              <BusStationSelect
                cityName={arrival.city}
                countryCode={arrival.country}
                value={arrivalStation}
                onChange={setArrivalStation}
                label="Gare routière d'arrivée"
              />
            )}
          </div>

          <StopoverInput stopovers={stopovers} onChange={setStopovers} />
        </div>

        {/* Dates & Times */}
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
              <Label className="text-muted-foreground">Heure de départ</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="input-glass pl-10"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Date retour (opt.)</Label>
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
            <div className="space-y-2">
              <Label className="text-muted-foreground">Heure arrivée</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="input-glass pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Distance & CO2 - Auto-calculated */}
        {(departure && arrival) && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Distance estimée</span>
              </div>
              <span className="font-semibold">
                {calculatedDistance ? `${calculatedDistance.toLocaleString()} km` : 'Calcul...'}
              </span>
            </div>
            {estimatedCo2 > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Empreinte CO₂ (basique)</span>
                <span className={cn(
                  'font-semibold',
                  estimatedCo2 < 50 ? 'text-transport-train' : 
                  estimatedCo2 < 200 ? 'text-transport-car' : 'text-destructive'
                )}>
                  {estimatedCo2 < 50 ? '🌱' : estimatedCo2 < 200 ? '🌿' : '🍂'} {estimatedCo2.toFixed(1)} kg
                </span>
              </div>
            )}
          </div>
        )}

        {/* AI Estimation */}
        {(departure && arrival) && (
          <TripEstimateCard
            estimate={estimate}
            isLoading={isEstimating}
            error={estimateError}
            onRequestEstimate={handleRequestEstimate}
            canEstimate={canEstimate}
          />
        )}

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

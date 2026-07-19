import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { useTrip, useUpdateTrip } from '@/hooks/useTrips';
import { CityAutocomplete } from '@/components/forms/CityAutocomplete';
import { StopoverInput } from '@/components/forms/StopoverInput';
import { TransportOptions } from '@/components/forms/TransportOptions';
import { TrainStationSelect } from '@/components/forms/TrainStationSelect';
import { BusStationSelect } from '@/components/forms/BusStationSelect';
import { MetroStationSelect, isCityWithMetro } from '@/components/forms/MetroStationSelect';
import { CarExpenses, CarExpensesData } from '@/components/forms/CarExpenses';
import { CityData, getCityCoordinates } from '@/data/cityCoordinates';
import { Location, TransportType, BookingStatus, CarType, AccommodationType, transportEmoji, transportLabels, co2PerKm, getFlag } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Calendar, Clock, Save, Loader2, Route } from 'lucide-react';
import { calculateRouteDistance } from '@/utils/distance';
import { useToast } from '@/hooks/use-toast';

const transportTypes: TransportType[] = ['plane', 'train', 'car', 'bus', 'boat', 'metro', 'logement', 'frais'];

export default function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: trip, isLoading: tripLoading } = useTrip(id || '');
  const updateTrip = useUpdateTrip();
  
  // Transport
  const [transportType, setTransportType] = useState<TransportType>('train');
  const [company, setCompany] = useState('');
  const [carType, setCarType] = useState<CarType | ''>('');
  const [accommodationType, setAccommodationType] = useState<AccommodationType | ''>('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('recherche');
  
  // Cities
  const [departure, setDeparture] = useState<CityData | null>(null);
  const [arrival, setArrival] = useState<CityData | null>(null);
  const [stopovers, setStopovers] = useState<Location[]>([]);
  
  // Train stations (for French train trips)
  const [departureTrainStation, setDepartureTrainStation] = useState<string | null>(null);
  const [arrivalTrainStation, setArrivalTrainStation] = useState<string | null>(null);
  
  // Bus stations (for French bus trips)
  const [departureBusStation, setDepartureBusStation] = useState<string | null>(null);
  const [arrivalBusStation, setArrivalBusStation] = useState<string | null>(null);
  
  // Metro stations (for Paris/London metro trips)
  const [departureMetroStation, setDepartureMetroStation] = useState<string | null>(null);
  const [arrivalMetroStation, setArrivalMetroStation] = useState<string | null>(null);
  
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
  const [errors, setErrors] = useState<{ departure?: string; arrival?: string; date?: string; price?: string }>({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Car expenses (for personal vehicle)
  const [carExpenses, setCarExpenses] = useState<CarExpensesData>({
    tollExpense: '',
    parkingExpense: '',
    otherExpense: '',
  });

  // Initialize form with trip data
  useEffect(() => {
    if (trip && !isInitialized) {
      setTransportType(trip.transportType);
      setCompany(trip.company || '');
      setCarType(trip.carType || '');
      setAccommodationType(trip.accommodationType || '');
      setTicketNumber(trip.ticketNumber || '');
      setSeatNumber(trip.seatNumber || '');
      setBookingStatus(trip.bookingStatus);
      
      setDeparture({
        city: trip.departureCity,
        country: trip.departureCountry,
        countryName: trip.departureCountryName,
      });
      setArrival({
        city: trip.arrivalCity,
        country: trip.arrivalCountry,
        countryName: trip.arrivalCountryName,
      });
      setStopovers(trip.via || []);
      
      setDepartureDate(trip.departureDate);
      setDepartureTime(trip.departureTime || '');
      setReturnDate(trip.returnDate || '');
      setArrivalTime(trip.arrivalTime || '');
      
      setDistanceKm(trip.distanceKm.toString());
      setManualDistance(true);
      setPrice(trip.price?.toString() || '');
      setNotes(trip.notes || '');
      
      // Initialize station fields based on transport type
      if (trip.transportType === 'train') {
        setDepartureTrainStation(trip.departureStation || null);
        setArrivalTrainStation(trip.arrivalStation || null);
      } else if (trip.transportType === 'bus') {
        setDepartureBusStation(trip.departureStation || null);
        setArrivalBusStation(trip.arrivalStation || null);
      } else if (trip.transportType === 'metro') {
        setDepartureMetroStation(trip.departureStation || null);
        setArrivalMetroStation(trip.arrivalStation || null);
      }
      
      // Initialize car expenses
      if (trip.transportType === 'car') {
        setCarExpenses({
          tollExpense: trip.tollExpense?.toString() || '',
          parkingExpense: trip.parkingExpense?.toString() || '',
          otherExpense: trip.otherExpense?.toString() || '',
        });
      }
      
      setIsInitialized(true);
    }
  }, [trip, isInitialized]);

  // Calculate distance automatically when cities change
  const calculatedDistance = useMemo(() => {
    if (!departure || !arrival) return null;
    
    const depCoords = departure.lat && departure.lng 
      ? { lat: departure.lat, lng: departure.lng }
      : getCityCoordinates(departure.city, departure.country);
    
    const arrCoords = arrival.lat && arrival.lng
      ? { lat: arrival.lat, lng: arrival.lng }
      : getCityCoordinates(arrival.city, arrival.country);
    
    if (!depCoords || !arrCoords) return null;
    
    const routePoints: Array<{ lat: number; lng: number } | null> = [depCoords];
    
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

  useEffect(() => {
    if (calculatedDistance !== null && !manualDistance) {
      setDistanceKm(calculatedDistance.toString());
    }
  }, [calculatedDistance, manualDistance]);

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
    setAccommodationType('');
    setTicketNumber('');
    setSeatNumber('');
    // Reset station selections when transport type changes
    setDepartureTrainStation(null);
    setArrivalTrainStation(null);
    setDepartureBusStation(null);
    setArrivalBusStation(null);
    setDepartureMetroStation(null);
    setArrivalMetroStation(null);
    
    // Reset car expenses when switching away from car
    if (type !== 'car') {
      setCarExpenses({ tollExpense: '', parkingExpense: '', otherExpense: '' });
    }
  };
  
  // Check if we're in metro mode for Paris/London
  const isMetroMode = transportType === 'metro';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    
    setErrors({});
    
    const newErrors: typeof errors = {};
    
    // Frais divers: only date required, city is optional
    if (transportType === 'frais') {
      if (!departureDate) newErrors.date = 'Date requise';
      if ((bookingStatus === 'trouve' || bookingStatus === 'achete') && !price) {
        newErrors.price = 'Prix requis pour ce statut';
      }
    } else {
      if (!departure) newErrors.departure = 'Ville de départ requise';
      if (!arrival) newErrors.arrival = 'Ville d\'arrivée requise';
      if (!departureDate) newErrors.date = 'Date de départ requise';
      if ((bookingStatus === 'trouve' || bookingStatus === 'achete') && !price) {
        newErrors.price = 'Prix requis pour ce statut';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (transportType !== 'frais' && !distanceKm && !allCitiesKnown) {
      setErrors({ departure: 'Distance requise pour les villes non reconnues' });
      return;
    }

    const finalDistance = distanceKm ? parseInt(distanceKm) : 0;

    // Determine station names based on transport type
    const depStation = transportType === 'train' ? departureTrainStation 
                     : transportType === 'bus' ? departureBusStation 
                     : transportType === 'metro' ? departureMetroStation
                     : undefined;
    const arrStation = transportType === 'train' ? arrivalTrainStation 
                     : transportType === 'bus' ? arrivalBusStation 
                     : transportType === 'metro' ? arrivalMetroStation
                     : undefined;

    try {
      // Car expenses (only for personal vehicle)
      const showCarExpenses = transportType === 'car' && carType === 'personnel';
      
      // For frais divers, city is optional
      const depCity = transportType === 'frais' && !departure 
        ? 'Frais divers' 
        : departure?.city || '';
      const depCountry = transportType === 'frais' && !departure 
        ? 'XX' 
        : departure?.country || 'XX';
      const depCountryName = transportType === 'frais' && !departure 
        ? 'Frais' 
        : departure?.countryName || departure?.city || '';
      
      await updateTrip.mutateAsync({
        id: trip.id,
        departureCity: depCity,
        departureCountry: depCountry,
        departureCountryName: depCountryName,
        arrivalCity: depCity,
        arrivalCountry: depCountry,
        arrivalCountryName: depCountryName,
        via: stopovers.filter(s => s.city),
        departureDate,
        departureTime: departureTime || undefined,
        returnDate: returnDate || undefined,
        arrivalTime: arrivalTime || undefined,
        transportType,
        company: company || undefined,
        carType: carType || undefined,
        accommodationType: accommodationType || undefined,
        ticketNumber: ticketNumber || undefined,
        seatNumber: seatNumber || undefined,
        bookingStatus,
        price: price ? parseFloat(price) : undefined,
        distanceKm: transportType === 'frais' ? 0 : finalDistance,
        notes: notes || undefined,
        departureStation: depStation || undefined,
        arrivalStation: arrStation || undefined,
        tollExpense: showCarExpenses && carExpenses.tollExpense ? parseFloat(carExpenses.tollExpense) : undefined,
        parkingExpense: showCarExpenses && carExpenses.parkingExpense ? parseFloat(carExpenses.parkingExpense) : undefined,
        otherExpense: showCarExpenses && carExpenses.otherExpense ? parseFloat(carExpenses.otherExpense) : undefined,
      });
      
      toast({ title: 'Trajet modifié !' });
      navigate(`/trips/${trip.id}`);
    } catch {
      toast({ title: 'Erreur lors de la modification', variant: 'destructive' });
    }
  };

  if (tripLoading) {
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

  if (trip.status === 'completed') {
    return (
      <PageLayout>
        <div className="page-header safe-top">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="page-title">Modification impossible</h1>
          <p className="text-muted-foreground mt-2">Ce trajet est terminé et ne peut pas être modifié.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="page-title">Modifier le trajet</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pb-32 space-y-6">
        {/* Transport Type */}
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
            accommodationType={accommodationType}
            setAccommodationType={setAccommodationType}
            ticketNumber={ticketNumber}
            setTicketNumber={setTicketNumber}
            seatNumber={seatNumber}
            setSeatNumber={setSeatNumber}
            bookingStatus={bookingStatus}
            setBookingStatus={setBookingStatus}
          />

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
                className={cn('input-glass', errors.price && 'border-destructive')}
              />
              {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
            </div>
          )}
          
          {/* Car expenses for personal vehicle */}
          {transportType === 'car' && carType === 'personnel' && (
            <CarExpenses expenses={carExpenses} onChange={setCarExpenses} />
          )}
        </div>

        {/* Departure & Arrival */}
        <div className="glass-card p-4 space-y-4">
          {transportType === 'frais' ? (
            // Frais divers: optional single city
            <div className="space-y-2">
              <Label className="text-muted-foreground">Lieu (optionnel)</Label>
              <CityAutocomplete
                value={departure}
                onChange={(city) => {
                  setDeparture(city);
                  setArrival(city);
                }}
                placeholder="Ville (optionnel)"
              />
            </div>
          ) : transportType === 'logement' ? (
            // Logement: only one city field
            <div className="space-y-2">
              <Label className="text-muted-foreground">Lieu d'hébergement</Label>
              <CityAutocomplete
                value={departure}
                onChange={(city) => {
                  setDeparture(city);
                  // Also set arrival to same city for data consistency
                  setArrival(city);
                }}
                placeholder="Ville de l'hébergement"
              />
              {errors.departure && <p className="text-xs text-destructive">{errors.departure}</p>}
            </div>
          ) : (
            <>
              {isMetroMode && (
                <div className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg mb-2">
                  🚇 Sélectionnez les villes puis les stations de métro (Paris ou Londres)
                </div>
              )}
              
              <div className="space-y-2">
                <Label className="text-muted-foreground">Départ</Label>
                <CityAutocomplete
                  value={departure}
                  onChange={(city) => {
                    setDeparture(city);
                    setDepartureTrainStation(null);
                    setDepartureBusStation(null);
                    setDepartureMetroStation(null);
                  }}
                  placeholder="Ville de départ"
                />
                {errors.departure && <p className="text-xs text-destructive">{errors.departure}</p>}
                
                {/* Train station selector for French cities */}
                {transportType === 'train' && departure && (
                  <TrainStationSelect
                    cityName={departure.city}
                    countryCode={departure.country}
                    value={departureTrainStation}
                    onChange={setDepartureTrainStation}
                    label="Gare de départ"
                  />
                )}
                
                {/* Bus station selector for French cities */}
                {transportType === 'bus' && departure && (
                  <BusStationSelect
                    cityName={departure.city}
                    countryCode={departure.country}
                    value={departureBusStation}
                    onChange={setDepartureBusStation}
                    label="Gare routière de départ"
                  />
                )}
                
                {/* Metro station selector for Paris/London */}
                {transportType === 'metro' && departure && isCityWithMetro(departure.city, departure.country) && (
                  <MetroStationSelect
                    city={isCityWithMetro(departure.city, departure.country)!}
                    value={departureMetroStation}
                    onChange={setDepartureMetroStation}
                    label="Station de départ"
                  />
                )}
              </div>

              {departure && arrival && (
                <div className="flex justify-center py-2">
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <span className="flag-emoji">{getFlag(departure.country)}</span>
                    <span>{departureMetroStation || departureTrainStation || departureBusStation || departure.city}</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    {stopovers.filter(s => s.city).map((stop, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="flag-emoji">{getFlag(stop.country)}</span>
                        <span>{stop.city}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </span>
                    ))}
                    <span className="flag-emoji">{getFlag(arrival.country)}</span>
                    <span>{arrivalMetroStation || arrivalTrainStation || arrivalBusStation || arrival.city}</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-muted-foreground">Arrivée</Label>
                <CityAutocomplete
                  value={arrival}
                  onChange={(city) => {
                    setArrival(city);
                    setArrivalTrainStation(null);
                    setArrivalBusStation(null);
                    setArrivalMetroStation(null);
                  }}
                  placeholder="Ville d'arrivée"
                />
                {errors.arrival && <p className="text-xs text-destructive">{errors.arrival}</p>}
                
                {/* Train station selector for French cities */}
                {transportType === 'train' && arrival && (
                  <TrainStationSelect
                    cityName={arrival.city}
                    countryCode={arrival.country}
                    value={arrivalTrainStation}
                    onChange={setArrivalTrainStation}
                    label="Gare d'arrivée"
                  />
                )}
                
                {/* Bus station selector for French cities */}
                {transportType === 'bus' && arrival && (
                  <BusStationSelect
                    cityName={arrival.city}
                    countryCode={arrival.country}
                    value={arrivalBusStation}
                    onChange={setArrivalBusStation}
                    label="Gare routière d'arrivée"
                  />
                )}
                
                {/* Metro station selector for Paris/London */}
                {transportType === 'metro' && arrival && isCityWithMetro(arrival.city, arrival.country) && (
                  <MetroStationSelect
                    city={isCityWithMetro(arrival.city, arrival.country)!}
                    value={arrivalMetroStation}
                    onChange={setArrivalMetroStation}
                    label="Station d'arrivée"
                  />
                )}
              </div>

              <StopoverInput stopovers={stopovers} onChange={setStopovers} />
            </>
          )}
        </div>

        {/* Dates & Times - Hide times for logement and frais */}
        <div className="glass-card p-4 space-y-4">
          {transportType === 'frais' ? (
            // Frais: just a single date field
            <div className="space-y-2">
              <Label className="text-muted-foreground">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className={cn('input-glass pl-10', errors.date && 'border-destructive')}
                  required
                />
              </div>
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    {transportType === 'logement' ? 'Date d\'arrivée' : 'Date de départ'}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className={cn('input-glass pl-10', errors.date && 'border-destructive')}
                    />
                  </div>
                  {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                </div>
                {transportType !== 'logement' && (
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
                )}
                {transportType === 'logement' && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Date de départ</Label>
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
                )}
              </div>
              
              {transportType !== 'logement' && (
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
              )}
            </>
          )}
        </div>

        {/* Distance & CO2 (hidden for logement) */}
        {(departure && arrival) && transportType !== 'logement' && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Distance estimée</span>
              </div>
              <span className="font-semibold">
                {calculatedDistance ? `${calculatedDistance.toLocaleString()} km` : `${distanceKm} km`}
              </span>
            </div>
            {estimatedCo2 > 0 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Empreinte CO₂</span>
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

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Notes (optionnel)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Motif du déplacement, références..."
            className="input-glass min-h-[80px]"
          />
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="btn-primary w-full" 
          disabled={updateTrip.isPending}
        >
          {updateTrip.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </form>
    </PageLayout>
  );
}

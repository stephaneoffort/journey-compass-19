import { useState, useEffect, useMemo, useRef } from 'react';
import { CityAutocomplete } from './CityAutocomplete';
import { StationAutocomplete } from './StationAutocomplete';
import { TrainStationSelect } from './TrainStationSelect';
import { BusStationSelect } from './BusStationSelect';
import { MetroStationSelect, isCityWithMetro } from './MetroStationSelect';
import { StopoverInput } from './StopoverInput';
import { TransportOptions } from './TransportOptions';
import { CityData, getCityCoordinates } from '@/data/cityCoordinates';
import { Station } from '@/data/parisStations';
import { Location, TransportType, BookingStatus, CarType, transportLabels, co2PerKm } from '@/types/trip';
import { TransportIcon } from '@/components/transport/TransportIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ArrowRight, Calendar, Clock, Save, Loader2, Route, Upload, Camera, FileText } from 'lucide-react';
import { calculateRouteDistance } from '@/utils/distance';
import { toast } from 'sonner';

const transportTypes: TransportType[] = ['plane', 'train', 'car', 'bus', 'boat', 'metro'];

export interface TripFormData {
  departureCity: string;
  departureCountry: string;
  departureCountryName: string;
  arrivalCity: string;
  arrivalCountry: string;
  arrivalCountryName: string;
  via: Location[];
  departureDate: string;
  departureTime?: string;
  returnDate?: string;
  arrivalTime?: string;
  transportType: TransportType;
  company?: string;
  carType?: CarType;
  ticketNumber?: string;
  seatNumber?: string;
  bookingStatus: BookingStatus;
  price?: number;
  distanceKm: number;
  notes?: string;
}

interface TripFormProps {
  onSubmit: (data: TripFormData, invoiceFiles?: File[]) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  tripNumber?: number;
}

export function TripForm({ onSubmit, isLoading, submitLabel = 'Enregistrer', tripNumber }: TripFormProps) {
  // Invoice upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [pendingInvoices, setPendingInvoices] = useState<File[]>([]);
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
  const [stopovers, setStopovers] = useState<Location[]>([]);
  
  // Metro stations (for Paris metro trips)
  const [departureStation, setDepartureStation] = useState<Station | null>(null);
  const [arrivalStation, setArrivalStation] = useState<Station | null>(null);
  
  // Train stations (for French train trips)
  const [departureTrainStation, setDepartureTrainStation] = useState<string | null>(null);
  const [arrivalTrainStation, setArrivalTrainStation] = useState<string | null>(null);
  
  // Bus stations (for French bus trips)
  const [departureBusStation, setDepartureBusStation] = useState<string | null>(null);
  const [arrivalBusStation, setArrivalBusStation] = useState<string | null>(null);
  
  // Metro stations (for Paris/London metro trips with city selection)
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
    setTicketNumber('');
    setSeatNumber('');
    // Reset cities/stations when switching between metro and other types
    if (type === 'metro') {
      setDeparture(null);
      setArrival(null);
      setStopovers([]);
    } else {
      setDepartureStation(null);
      setArrivalStation(null);
    }
  };

  // For metro, use station names as city names
  const isMetroInParis = transportType === 'metro';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: typeof errors = {};
    
    if (isMetroInParis) {
      // Metro mode: need city + station
      if (!departure) newErrors.departure = 'Ville de départ requise';
      if (!arrival) newErrors.arrival = 'Ville d\'arrivée requise';
      
      // Check if cities support metro and require station selection
      if (departure && isCityWithMetro(departure.city, departure.country) && !departureMetroStation && !departureStation) {
        newErrors.departure = 'Station de départ requise';
      }
      if (arrival && isCityWithMetro(arrival.city, arrival.country) && !arrivalMetroStation && !arrivalStation) {
        newErrors.arrival = 'Station d\'arrivée requise';
      }
    } else {
      if (!departure) newErrors.departure = 'Ville de départ requise';
      if (!arrival) newErrors.arrival = 'Ville d\'arrivée requise';
    }
    
    if (!departureDate) newErrors.date = 'Date de départ requise';
    if ((bookingStatus === 'trouve' || bookingStatus === 'achete') && !price) {
      newErrors.price = 'Prix requis pour ce statut';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // For metro, set a default distance based on metro (average ~5km per trip)
    let finalDistance = distanceKm ? parseInt(distanceKm) : 0;
    if (isMetroInParis && !distanceKm) {
      finalDistance = 5; // Default metro distance
    } else if (!distanceKm && !allCitiesKnown) {
      setErrors({ departure: 'Distance requise pour les villes non reconnues' });
      return;
    }

    // Prepare city data - for metro use station name if selected
    const depStationName = departureMetroStation || departureStation?.name;
    const arrStationName = arrivalMetroStation || arrivalStation?.name;
    
    const depCity = isMetroInParis && depStationName ? depStationName : departure!.city;
    const depCountry = departure!.country || 'XX';
    const depCountryName = departure!.countryName || departure!.city;
    const arrCity = isMetroInParis && arrStationName ? arrStationName : arrival!.city;
    const arrCountry = arrival!.country || 'XX';
    const arrCountryName = arrival!.countryName || arrival!.city;

    await onSubmit({
      departureCity: depCity,
      departureCountry: depCountry,
      departureCountryName: depCountryName,
      arrivalCity: arrCity,
      arrivalCountry: arrCountry,
      arrivalCountryName: arrCountryName,
      via: isMetroInParis ? [] : stopovers.filter(s => s.city),
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
    }, pendingInvoices.length > 0 ? pendingInvoices : undefined);
  };

  const handleInvoiceSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const validFiles: File[] = [];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    
    for (const file of Array.from(files)) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Type de fichier non supporté: ${file.name}`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Fichier trop volumineux: ${file.name} (max 10MB)`);
        continue;
      }
      validFiles.push(file);
    }
    
    setPendingInvoices(prev => [...prev, ...validFiles]);
    
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removePendingInvoice = (index: number) => {
    setPendingInvoices(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {tripNumber && (
        <div className="flex items-center gap-2 text-primary font-medium">
          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
            {tripNumber}
          </span>
          <span>Déplacement #{tripNumber}</span>
        </div>
      )}

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
                'flex flex-col items-center gap-1 p-3 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                transportType === type
                  ? `transport-${type} ring-2 ring-current`
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <TransportIcon mode={type} bare className="w-6 h-6" />
              <span className="text-xs font-medium">{transportLabels[type]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Transport-specific options */}
      <div className="card-flat p-4 space-y-4">
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
              className={cn(errors.price && 'border-destructive')}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>
        )}

        {/* Invoice Upload (for purchased trips) */}
        {bookingStatus === 'achete' && (
          <div className="space-y-3 pt-2 border-t border-border">
            <Label className="text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Factures / Justificatifs
            </Label>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                Charger
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => cameraInputRef.current?.click()}
                className="flex-1 gap-2"
              >
                <Camera className="w-4 h-4" />
                Scanner
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              multiple
              onChange={(e) => handleInvoiceSelect(e.target.files)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleInvoiceSelect(e.target.files)}
              className="hidden"
            />

            {pendingInvoices.length > 0 && (
              <div className="space-y-2">
                {pendingInvoices.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg text-sm">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removePendingInvoice(index)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG • Max 10MB par fichier
            </p>
          </div>
        )}
      </div>

      {/* Departure & Arrival */}
      <div className="card-flat p-4 space-y-4">
        {isMetroInParis ? (
          <>
            {/* Metro mode: first select cities, then stations */}
            <div className="text-xs text-primary bg-primary/10 px-3 py-2 rounded-lg mb-2">
              🚇 Sélectionnez les villes puis les stations de métro (Paris ou Londres)
            </div>
            
            <div className="space-y-2">
              <Label className="text-muted-foreground">Ville de départ</Label>
              <CityAutocomplete
                value={departure}
                onChange={(city) => {
                  setDeparture(city);
                  setDepartureMetroStation(null);
                  setDepartureStation(null);
                }}
                placeholder="Paris, Londres..."
              />
              {errors.departure && <p className="text-xs text-destructive">{errors.departure}</p>}
              
              {/* Metro station selector if city supports it */}
              {departure && isCityWithMetro(departure.city, departure.country) && (
                <MetroStationSelect
                  city={isCityWithMetro(departure.city, departure.country)!}
                  value={departureMetroStation}
                  onChange={setDepartureMetroStation}
                  label="Station de départ"
                />
              )}
              
              {/* Fallback: use Paris station selector if Paris area detected */}
              {departure && departure.city.toLowerCase() === 'paris' && departure.country === 'FR' && !departureMetroStation && (
                <div className="text-xs text-muted-foreground">
                  Ou rechercher directement :
                  <div className="mt-2">
                    <StationAutocomplete
                      value={departureStation}
                      onChange={setDepartureStation}
                      placeholder="Rechercher une station..."
                    />
                  </div>
                </div>
              )}
            </div>

            {(departureMetroStation || departureStation) && (arrivalMetroStation || arrivalStation) && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>🚇</span>
                  <span>{departureMetroStation || departureStation?.name}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  <span>{arrivalMetroStation || arrivalStation?.name}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-muted-foreground">Ville d'arrivée</Label>
              <CityAutocomplete
                value={arrival}
                onChange={(city) => {
                  setArrival(city);
                  setArrivalMetroStation(null);
                  setArrivalStation(null);
                }}
                placeholder="Paris, Londres..."
              />
              {errors.arrival && <p className="text-xs text-destructive">{errors.arrival}</p>}
              
              {/* Metro station selector if city supports it */}
              {arrival && isCityWithMetro(arrival.city, arrival.country) && (
                <MetroStationSelect
                  city={isCityWithMetro(arrival.city, arrival.country)!}
                  value={arrivalMetroStation}
                  onChange={setArrivalMetroStation}
                  label="Station d'arrivée"
                />
              )}
              
              {/* Fallback: use Paris station selector if Paris area detected */}
              {arrival && arrival.city.toLowerCase() === 'paris' && arrival.country === 'FR' && !arrivalMetroStation && (
                <div className="text-xs text-muted-foreground">
                  Ou rechercher directement :
                  <div className="mt-2">
                    <StationAutocomplete
                      value={arrivalStation}
                      onChange={setArrivalStation}
                      placeholder="Rechercher une station..."
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Regular cities for other transport types */}
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
            </div>

            {departure && arrival && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <span>{departureBusStation || departureTrainStation || departure.city}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{departure.country}</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                  {stopovers.filter(s => s.city).map((stop, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span>{stop.city}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{stop.country}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </span>
                  ))}
                  <span>{arrivalBusStation || arrivalTrainStation || arrival.city}</span>
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{arrival.country}</span>
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
            </div>

            <StopoverInput stopovers={stopovers} onChange={setStopovers} />
          </>
        )}
      </div>

      {/* Dates & Times */}
      <div className="card-flat p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Date de départ</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={cn('pl-10', errors.date && 'border-destructive')}
              />
            </div>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Heure de départ</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="pl-10"
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
                className="pl-10"
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
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Distance & CO2 */}
      {((departure && arrival) || (departureStation && arrivalStation)) && (
        <div className="card-flat p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Distance estimée</span>
            </div>
            <span className="font-semibold">
              {isMetroInParis 
                ? '~5 km' 
                : calculatedDistance 
                  ? `${calculatedDistance.toLocaleString()} km` 
                  : 'Calcul...'}
            </span>
          </div>
          {(isMetroInParis || estimatedCo2 > 0) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground">Empreinte CO₂</span>
              <span className={cn(
                'font-semibold',
                estimatedCo2 > 200 ? 'text-[hsl(var(--transport-car))]' : 'text-[hsl(var(--transport-train))]'
              )}>
                {isMetroInParis ? '0.04' : estimatedCo2.toFixed(1)} kg
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
          className="min-h-[80px]"
        />
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        className="btn-primary w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            {submitLabel}
          </>
        )}
      </Button>
    </form>
  );
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { CityAutocomplete } from './CityAutocomplete';
import { StopoverInput } from './StopoverInput';
import { TransportOptions } from './TransportOptions';
import { CityData, getCityCoordinates } from '@/data/cityCoordinates';
import { Location, TransportType, BookingStatus, CarType, transportEmoji, transportLabels, co2PerKm, getFlag } from '@/types/trip';
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: typeof errors = {};
    
    if (!departure) newErrors.departure = 'Ville de départ requise';
    if (!arrival) newErrors.arrival = 'Ville d\'arrivée requise';
    if (!departureDate) newErrors.date = 'Date de départ requise';
    if ((bookingStatus === 'trouve' || bookingStatus === 'achete') && !price) {
      newErrors.price = 'Prix requis pour ce statut';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!distanceKm && !allCitiesKnown) {
      setErrors({ departure: 'Distance requise pour les villes non reconnues' });
      return;
    }

    const finalDistance = distanceKm ? parseInt(distanceKm) : 0;

    await onSubmit({
      departureCity: departure!.city,
      departureCountry: departure!.country || 'XX',
      departureCountryName: departure!.countryName || departure!.city,
      arrivalCity: arrival!.city,
      arrivalCountry: arrival!.country || 'XX',
      arrivalCountryName: arrival!.countryName || arrival!.city,
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
      <div className="glass-card p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Départ</Label>
          <CityAutocomplete
            value={departure}
            onChange={setDeparture}
            placeholder="Ville de départ"
          />
          {errors.departure && <p className="text-xs text-destructive">{errors.departure}</p>}
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
            onChange={setArrival}
            placeholder="Ville d'arrivée"
          />
          {errors.arrival && <p className="text-xs text-destructive">{errors.arrival}</p>}
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
                className={cn('input-glass pl-10', errors.date && 'border-destructive')}
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

      {/* Distance & CO2 */}
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

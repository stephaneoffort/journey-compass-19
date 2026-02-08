import { TransportType, CarType, BookingStatus, AccommodationType, airlines, busCompanies, carTypeLabels, bookingStatusLabels, bookingStatusEmoji, accommodationTypeLabels } from '@/types/trip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface TransportOptionsProps {
  transportType: TransportType;
  company: string;
  setCompany: (value: string) => void;
  carType: CarType | '';
  setCarType: (value: CarType | '') => void;
  accommodationType?: AccommodationType | '';
  setAccommodationType?: (value: AccommodationType | '') => void;
  ticketNumber: string;
  setTicketNumber: (value: string) => void;
  seatNumber: string;
  setSeatNumber: (value: string) => void;
  bookingStatus: BookingStatus;
  setBookingStatus: (value: BookingStatus) => void;
}

export function TransportOptions({
  transportType,
  company,
  setCompany,
  carType,
  setCarType,
  accommodationType,
  setAccommodationType,
  ticketNumber,
  setTicketNumber,
  seatNumber,
  setSeatNumber,
  bookingStatus,
  setBookingStatus,
}: TransportOptionsProps) {
  const showCompanySelect = transportType === 'plane' || transportType === 'bus';
  const showCarType = transportType === 'car';
  const showAccommodationType = transportType === 'logement';
  const showTicketInfo = transportType === 'plane' || transportType === 'train' || transportType === 'bus';

  const companyOptions = transportType === 'plane' ? airlines : busCompanies;
  const companyLabel = transportType === 'plane' ? 'Compagnie aérienne' : 'Compagnie de bus';

  return (
    <div className="space-y-4">
      {/* Booking Status */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">Statut de réservation</Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(bookingStatusLabels) as BookingStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setBookingStatus(status)}
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-xl transition-all text-sm font-medium',
                bookingStatus === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <span>{bookingStatusEmoji[status]}</span>
              <span>{bookingStatusLabels[status]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Company Select (Plane/Bus) */}
      {showCompanySelect && (
        <div className="space-y-2">
          <Label className="text-muted-foreground">{companyLabel}</Label>
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="input-glass">
              <SelectValue placeholder={`Choisir ${companyLabel.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {companyOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Car Type */}
      {showCarType && (
        <div className="space-y-2">
          <Label className="text-muted-foreground">Type de véhicule</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(carTypeLabels) as CarType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCarType(type)}
                className={cn(
                  'p-3 rounded-xl transition-all text-sm font-medium text-center',
                  carType === type
                    ? 'bg-transport-car/20 text-transport-car ring-2 ring-transport-car'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {carTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Accommodation Type */}
      {showAccommodationType && setAccommodationType && (
        <div className="space-y-2">
          <Label className="text-muted-foreground">Type d'hébergement</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(accommodationTypeLabels) as AccommodationType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccommodationType(type)}
                className={cn(
                  'flex items-center justify-center gap-2 p-3 rounded-xl transition-all text-sm font-medium',
                  accommodationType === type
                    ? 'bg-amber-500/20 text-amber-600 ring-2 ring-amber-500'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                <span>{type === 'hotel' ? '🏨' : '🏠'}</span>
                <span>{accommodationTypeLabels[type]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Ticket and Seat Numbers (Plane/Train/Bus) */}
      {showTicketInfo && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">N° billet/vol</Label>
            <Input
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="Ex: AF1234"
              className="input-glass"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">N° place</Label>
            <Input
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value)}
              placeholder="Ex: 12A"
              className="input-glass"
            />
          </div>
        </div>
      )}
    </div>
  );
}

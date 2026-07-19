export type TransportType = 'plane' | 'train' | 'car' | 'bus' | 'boat' | 'metro' | 'logement' | 'frais';
export type TripStatus = 'completed' | 'planned' | 'cancelled';
export type BookingStatus = 'recherche' | 'trouve' | 'achete';
export type CarType = 'taxi' | 'uber' | 'bolt' | 'blablacar' | 'personnel';
export type AccommodationType = 'hotel' | 'airbnb';

export const transportLabels: Record<TransportType, string> = {
  plane: 'Avion',
  train: 'Train',
  car: 'Voiture',
  bus: 'Bus',
  boat: 'Bateau',
  metro: 'Métro',
  logement: 'Logement',
  frais: 'Frais divers',
};

export const transportEmoji: Record<TransportType, string> = {
  plane: '✈️',
  train: '🚄',
  car: '🚗',
  bus: '🚌',
  boat: '🚢',
  metro: '🚇',
  logement: '🏨',
  frais: '💰',
};

export const bookingStatusLabels: Record<BookingStatus, string> = {
  recherche: 'En recherche',
  trouve: 'Trouvé',
  achete: 'Acheté',
};

export const bookingStatusEmoji: Record<BookingStatus, string> = {
  recherche: '🔍',
  trouve: '✓',
  achete: '🎫',
};

export const carTypeLabels: Record<CarType, string> = {
  taxi: 'Taxi',
  uber: 'Uber',
  bolt: 'Bolt',
  blablacar: 'BlaBlaCar',
  personnel: 'Véhicule personnel',
};

export const accommodationTypeLabels: Record<AccommodationType, string> = {
  hotel: 'Hôtel',
  airbnb: 'Airbnb',
};

// CO2 emissions in kg per km
export const co2PerKm: Record<TransportType, number> = {
  plane: 0.255,
  train: 0.014,
  car: 0.171,
  bus: 0.089,
  boat: 0.245,
  metro: 0.008,
  logement: 0,
  frais: 0, // No CO2 for miscellaneous expenses
};

export interface Location {
  city: string;
  country: string;
  countryName: string;
  lat?: number;
  lng?: number;
}

export interface Trip {
  id: string;
  voyageId?: string;
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
  accommodationType?: AccommodationType;
  ticketNumber?: string;
  seatNumber?: string;
  bookingStatus: BookingStatus;
  price?: number;
  distanceKm: number;
  co2Kg: number;
  status: TripStatus;
  notes?: string;
  departureStation?: string;
  arrivalStation?: string;
  tollExpense?: number;
  parkingExpense?: number;
  otherExpense?: number;
  invoiceUrls: string[];
  createdAt: string;
  updatedAt: string;
}

// Country code to flag emoji
export function getFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏳️';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Airlines
export const airlines = [
  'Air France',
  'Lufthansa',
  'British Airways',
  'KLM',
  'Iberia',
  'Alitalia',
  'Swiss',
  'Austrian Airlines',
  'Brussels Airlines',
  'TAP Portugal',
  'SAS',
  'Finnair',
  'Norwegian',
  'Ryanair',
  'EasyJet',
  'Vueling',
  'Transavia',
  'Wizz Air',
  'Eurowings',
  'Aegean Airlines',
  'LOT Polish Airlines',
  'Czech Airlines',
  'Aer Lingus',
  'Icelandair',
  'Turkish Airlines',
  'Emirates',
  'Qatar Airways',
  'Etihad',
  'Autre',
];

// Bus companies
export const busCompanies = [
  'FlixBus',
  'BlaBlaBus',
  'Eurolines',
  'OUIBUS',
  'Megabus',
  'National Express',
  'Alsa',
  'RegioJet',
  'Marino Bus',
  'Itabus',
  'Autre',
];

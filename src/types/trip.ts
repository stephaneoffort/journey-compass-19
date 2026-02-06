export type TransportType = 'plane' | 'train' | 'car' | 'bus' | 'boat' | 'metro';

export type TripStatus = 'planned' | 'completed' | 'cancelled';

export interface Location {
  city: string;
  country: string;
  countryName: string;
}

export interface Trip {
  id: string;
  departureCity: string;
  departureCountry: string;
  departureCountryName: string;
  arrivalCity: string;
  arrivalCountry: string;
  arrivalCountryName: string;
  via: Location[];
  departureDate: string;
  returnDate?: string;
  transportType: TransportType;
  distanceKm: number;
  co2Kg: number;
  status: TripStatus;
  notes?: string;
  invoiceUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TripStats {
  totalTrips: number;
  totalDistanceKm: number;
  totalCo2Kg: number;
  tripsByTransport: Record<TransportType, number>;
}

export const transportLabels: Record<TransportType, string> = {
  plane: 'Avion',
  train: 'Train',
  car: 'Voiture',
  bus: 'Bus',
  boat: 'Bateau',
  metro: 'Métro',
};

export const transportEmoji: Record<TransportType, string> = {
  plane: '✈️',
  train: '🚄',
  car: '🚗',
  bus: '🚌',
  boat: '⛴️',
  metro: '🚇',
};

// CO2 emissions in kg per km per passenger
export const co2PerKm: Record<TransportType, number> = {
  plane: 0.255,
  train: 0.014,
  car: 0.171,
  bus: 0.089,
  boat: 0.245,
  metro: 0.003,
};

export const countryFlags: Record<string, string> = {
  FR: '🇫🇷',
  ES: '🇪🇸',
  IT: '🇮🇹',
  DE: '🇩🇪',
  GB: '🇬🇧',
  US: '🇺🇸',
  PT: '🇵🇹',
  BE: '🇧🇪',
  NL: '🇳🇱',
  CH: '🇨🇭',
  AT: '🇦🇹',
  JP: '🇯🇵',
  CN: '🇨🇳',
  BR: '🇧🇷',
  CA: '🇨🇦',
  AU: '🇦🇺',
  MA: '🇲🇦',
  TN: '🇹🇳',
  GR: '🇬🇷',
  HR: '🇭🇷',
  PL: '🇵🇱',
  CZ: '🇨🇿',
  SE: '🇸🇪',
  NO: '🇳🇴',
  DK: '🇩🇰',
  FI: '🇫🇮',
  IE: '🇮🇪',
  MX: '🇲🇽',
  AR: '🇦🇷',
  TH: '🇹🇭',
  VN: '🇻🇳',
  KR: '🇰🇷',
  IN: '🇮🇳',
  AE: '🇦🇪',
  EG: '🇪🇬',
  ZA: '🇿🇦',
};

export function getFlag(countryCode: string): string {
  return countryFlags[countryCode] || '🏳️';
}

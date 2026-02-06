import { Trip, TripStats, TransportType } from '@/types/trip';

export const mockTrips: Trip[] = [
  {
    id: '1',
    departureCity: 'Paris',
    departureCountry: 'FR',
    departureCountryName: 'France',
    arrivalCity: 'Barcelona',
    arrivalCountry: 'ES',
    arrivalCountryName: 'Espagne',
    via: [],
    departureDate: '2024-02-15',
    returnDate: '2024-02-18',
    transportType: 'train',
    distanceKm: 1037,
    co2Kg: 14.5,
    status: 'completed',
    notes: 'Réunion client',
    invoiceUrls: [],
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: '2',
    departureCity: 'Paris',
    departureCountry: 'FR',
    departureCountryName: 'France',
    arrivalCity: 'Tokyo',
    arrivalCountry: 'JP',
    arrivalCountryName: 'Japon',
    via: [{ city: 'Dubai', country: 'AE', countryName: 'Émirats arabes unis' }],
    departureDate: '2024-01-20',
    returnDate: '2024-01-28',
    transportType: 'plane',
    distanceKm: 9714,
    co2Kg: 2477,
    status: 'completed',
    notes: 'Conférence Tech',
    invoiceUrls: [],
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: '3',
    departureCity: 'Lyon',
    departureCountry: 'FR',
    departureCountryName: 'France',
    arrivalCity: 'Milan',
    arrivalCountry: 'IT',
    arrivalCountryName: 'Italie',
    via: [],
    departureDate: '2024-02-25',
    transportType: 'car',
    distanceKm: 475,
    co2Kg: 81.2,
    status: 'planned',
    invoiceUrls: [],
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z',
  },
  {
    id: '4',
    departureCity: 'Paris',
    departureCountry: 'FR',
    departureCountryName: 'France',
    arrivalCity: 'Londres',
    arrivalCountry: 'GB',
    arrivalCountryName: 'Royaume-Uni',
    via: [],
    departureDate: '2024-02-10',
    returnDate: '2024-02-12',
    transportType: 'train',
    distanceKm: 459,
    co2Kg: 6.4,
    status: 'completed',
    invoiceUrls: [],
    createdAt: '2024-02-05T11:00:00Z',
    updatedAt: '2024-02-05T11:00:00Z',
  },
  {
    id: '5',
    departureCity: 'Marseille',
    departureCountry: 'FR',
    departureCountryName: 'France',
    arrivalCity: 'Ajaccio',
    arrivalCountry: 'FR',
    arrivalCountryName: 'France',
    via: [],
    departureDate: '2024-01-05',
    returnDate: '2024-01-08',
    transportType: 'boat',
    distanceKm: 384,
    co2Kg: 94.1,
    status: 'completed',
    invoiceUrls: [],
    createdAt: '2024-01-02T16:00:00Z',
    updatedAt: '2024-01-02T16:00:00Z',
  },
  {
    id: '6',
    departureCity: 'Paris',
    departureCountry: 'FR',
    departureCountryName: 'France',
    arrivalCity: 'Amsterdam',
    arrivalCountry: 'NL',
    arrivalCountryName: 'Pays-Bas',
    via: [{ city: 'Bruxelles', country: 'BE', countryName: 'Belgique' }],
    departureDate: '2024-03-01',
    transportType: 'bus',
    distanceKm: 504,
    co2Kg: 44.9,
    status: 'planned',
    invoiceUrls: [],
    createdAt: '2024-02-22T08:00:00Z',
    updatedAt: '2024-02-22T08:00:00Z',
  },
];

export function calculateStats(trips: Trip[]): TripStats {
  const completedTrips = trips.filter(t => t.status === 'completed');
  
  const tripsByTransport = completedTrips.reduce((acc, trip) => {
    acc[trip.transportType] = (acc[trip.transportType] || 0) + 1;
    return acc;
  }, {} as Record<TransportType, number>);

  return {
    totalTrips: completedTrips.length,
    totalDistanceKm: completedTrips.reduce((sum, t) => sum + t.distanceKm, 0),
    totalCo2Kg: completedTrips.reduce((sum, t) => sum + t.co2Kg, 0),
    tripsByTransport,
  };
}

export function groupTripsByMonth(trips: Trip[]): Record<string, Trip[]> {
  return trips.reduce((acc, trip) => {
    const date = new Date(trip.departureDate);
    const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);
}

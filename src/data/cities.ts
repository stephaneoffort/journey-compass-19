export interface CityData {
  city: string;
  country: string;
  countryName: string;
}

export const popularCities: CityData[] = [
  { city: 'Paris', country: 'FR', countryName: 'France' },
  { city: 'Lyon', country: 'FR', countryName: 'France' },
  { city: 'Marseille', country: 'FR', countryName: 'France' },
  { city: 'Bordeaux', country: 'FR', countryName: 'France' },
  { city: 'Nice', country: 'FR', countryName: 'France' },
  { city: 'Toulouse', country: 'FR', countryName: 'France' },
  { city: 'Nantes', country: 'FR', countryName: 'France' },
  { city: 'Strasbourg', country: 'FR', countryName: 'France' },
  { city: 'Lille', country: 'FR', countryName: 'France' },
  { city: 'Montpellier', country: 'FR', countryName: 'France' },
  { city: 'Barcelona', country: 'ES', countryName: 'Espagne' },
  { city: 'Madrid', country: 'ES', countryName: 'Espagne' },
  { city: 'Valencia', country: 'ES', countryName: 'Espagne' },
  { city: 'Seville', country: 'ES', countryName: 'Espagne' },
  { city: 'Rome', country: 'IT', countryName: 'Italie' },
  { city: 'Milan', country: 'IT', countryName: 'Italie' },
  { city: 'Florence', country: 'IT', countryName: 'Italie' },
  { city: 'Venice', country: 'IT', countryName: 'Italie' },
  { city: 'Naples', country: 'IT', countryName: 'Italie' },
  { city: 'Turin', country: 'IT', countryName: 'Italie' },
  { city: 'Bari', country: 'IT', countryName: 'Italie' },
  { city: 'Berlin', country: 'DE', countryName: 'Allemagne' },
  { city: 'Munich', country: 'DE', countryName: 'Allemagne' },
  { city: 'Frankfurt', country: 'DE', countryName: 'Allemagne' },
  { city: 'Hamburg', country: 'DE', countryName: 'Allemagne' },
  { city: 'Londres', country: 'GB', countryName: 'Royaume-Uni' },
  { city: 'Manchester', country: 'GB', countryName: 'Royaume-Uni' },
  { city: 'Edinburgh', country: 'GB', countryName: 'Royaume-Uni' },
  { city: 'Amsterdam', country: 'NL', countryName: 'Pays-Bas' },
  { city: 'Rotterdam', country: 'NL', countryName: 'Pays-Bas' },
  { city: 'Bruxelles', country: 'BE', countryName: 'Belgique' },
  { city: 'Anvers', country: 'BE', countryName: 'Belgique' },
  { city: 'Genève', country: 'CH', countryName: 'Suisse' },
  { city: 'Zurich', country: 'CH', countryName: 'Suisse' },
  { city: 'Lisbonne', country: 'PT', countryName: 'Portugal' },
  { city: 'Porto', country: 'PT', countryName: 'Portugal' },
  { city: 'Vienne', country: 'AT', countryName: 'Autriche' },
  { city: 'Athènes', country: 'GR', countryName: 'Grèce' },
  { city: 'Prague', country: 'CZ', countryName: 'Tchéquie' },
  { city: 'Varsovie', country: 'PL', countryName: 'Pologne' },
  { city: 'Cracovie', country: 'PL', countryName: 'Pologne' },
  { city: 'Stockholm', country: 'SE', countryName: 'Suède' },
  { city: 'Copenhague', country: 'DK', countryName: 'Danemark' },
  { city: 'Oslo', country: 'NO', countryName: 'Norvège' },
  { city: 'Helsinki', country: 'FI', countryName: 'Finlande' },
  { city: 'Dublin', country: 'IE', countryName: 'Irlande' },
  { city: 'New York', country: 'US', countryName: 'États-Unis' },
  { city: 'Los Angeles', country: 'US', countryName: 'États-Unis' },
  { city: 'San Francisco', country: 'US', countryName: 'États-Unis' },
  { city: 'Miami', country: 'US', countryName: 'États-Unis' },
  { city: 'Toronto', country: 'CA', countryName: 'Canada' },
  { city: 'Montréal', country: 'CA', countryName: 'Canada' },
  { city: 'Tokyo', country: 'JP', countryName: 'Japon' },
  { city: 'Osaka', country: 'JP', countryName: 'Japon' },
  { city: 'Kyoto', country: 'JP', countryName: 'Japon' },
  { city: 'Séoul', country: 'KR', countryName: 'Corée du Sud' },
  { city: 'Shanghai', country: 'CN', countryName: 'Chine' },
  { city: 'Pékin', country: 'CN', countryName: 'Chine' },
  { city: 'Hong Kong', country: 'CN', countryName: 'Chine' },
  { city: 'Bangkok', country: 'TH', countryName: 'Thaïlande' },
  { city: 'Singapour', country: 'SG', countryName: 'Singapour' },
  { city: 'Sydney', country: 'AU', countryName: 'Australie' },
  { city: 'Melbourne', country: 'AU', countryName: 'Australie' },
  { city: 'Dubai', country: 'AE', countryName: 'Émirats arabes unis' },
  { city: 'Le Caire', country: 'EG', countryName: 'Égypte' },
  { city: 'Casablanca', country: 'MA', countryName: 'Maroc' },
  { city: 'Marrakech', country: 'MA', countryName: 'Maroc' },
  { city: 'Tunis', country: 'TN', countryName: 'Tunisie' },
  { city: 'Ajaccio', country: 'FR', countryName: 'France' },
  { city: 'Bastia', country: 'FR', countryName: 'France' },
];

export function searchCities(query: string): CityData[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return popularCities
    .filter(city => {
      const normalizedCity = city.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalizedCountry = city.countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedCity.includes(normalizedQuery) || normalizedCountry.includes(normalizedQuery);
    })
    .slice(0, 8);
}

export interface CityWithCoordinates {
  city: string;
  country: string;
  countryName: string;
  lat: number;
  lng: number;
}

export const citiesWithCoordinates: CityWithCoordinates[] = [
  // France
  { city: 'Paris', country: 'FR', countryName: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'Lyon', country: 'FR', countryName: 'France', lat: 45.7640, lng: 4.8357 },
  { city: 'Marseille', country: 'FR', countryName: 'France', lat: 43.2965, lng: 5.3698 },
  { city: 'Bordeaux', country: 'FR', countryName: 'France', lat: 44.8378, lng: -0.5792 },
  { city: 'Nice', country: 'FR', countryName: 'France', lat: 43.7102, lng: 7.2620 },
  { city: 'Toulouse', country: 'FR', countryName: 'France', lat: 43.6047, lng: 1.4442 },
  { city: 'Nantes', country: 'FR', countryName: 'France', lat: 47.2184, lng: -1.5536 },
  { city: 'Strasbourg', country: 'FR', countryName: 'France', lat: 48.5734, lng: 7.7521 },
  { city: 'Lille', country: 'FR', countryName: 'France', lat: 50.6292, lng: 3.0573 },
  { city: 'Montpellier', country: 'FR', countryName: 'France', lat: 43.6108, lng: 3.8767 },
  { city: 'Rennes', country: 'FR', countryName: 'France', lat: 48.1173, lng: -1.6778 },
  { city: 'Grenoble', country: 'FR', countryName: 'France', lat: 45.1885, lng: 5.7245 },
  { city: 'Dijon', country: 'FR', countryName: 'France', lat: 47.3220, lng: 5.0415 },
  { city: 'Angers', country: 'FR', countryName: 'France', lat: 47.4784, lng: -0.5632 },
  { city: 'Clermont-Ferrand', country: 'FR', countryName: 'France', lat: 45.7772, lng: 3.0870 },
  { city: 'Reims', country: 'FR', countryName: 'France', lat: 49.2583, lng: 4.0317 },
  { city: 'Toulon', country: 'FR', countryName: 'France', lat: 43.1242, lng: 5.9280 },
  { city: 'Le Havre', country: 'FR', countryName: 'France', lat: 49.4944, lng: 0.1079 },
  { city: 'Saint-Étienne', country: 'FR', countryName: 'France', lat: 45.4397, lng: 4.3872 },
  { city: 'Metz', country: 'FR', countryName: 'France', lat: 49.1193, lng: 6.1757 },
  { city: 'Nancy', country: 'FR', countryName: 'France', lat: 48.6921, lng: 6.1844 },
  { city: 'Caen', country: 'FR', countryName: 'France', lat: 49.1829, lng: -0.3707 },
  { city: 'Orléans', country: 'FR', countryName: 'France', lat: 47.9029, lng: 1.9039 },
  { city: 'Mulhouse', country: 'FR', countryName: 'France', lat: 47.7508, lng: 7.3359 },
  { city: 'Rouen', country: 'FR', countryName: 'France', lat: 49.4432, lng: 1.0999 },
  { city: 'Brest', country: 'FR', countryName: 'France', lat: 48.3904, lng: -4.4861 },
  { city: 'Perpignan', country: 'FR', countryName: 'France', lat: 42.6887, lng: 2.8948 },
  { city: 'Amiens', country: 'FR', countryName: 'France', lat: 49.8941, lng: 2.2958 },
  { city: 'Tours', country: 'FR', countryName: 'France', lat: 47.3941, lng: 0.6848 },
  { city: 'Limoges', country: 'FR', countryName: 'France', lat: 45.8336, lng: 1.2611 },
  { city: 'Ajaccio', country: 'FR', countryName: 'France', lat: 41.9192, lng: 8.7386 },
  { city: 'Bastia', country: 'FR', countryName: 'France', lat: 42.6970, lng: 9.4503 },

  // Espagne
  { city: 'Madrid', country: 'ES', countryName: 'Espagne', lat: 40.4168, lng: -3.7038 },
  { city: 'Barcelone', country: 'ES', countryName: 'Espagne', lat: 41.3851, lng: 2.1734 },
  { city: 'Valence', country: 'ES', countryName: 'Espagne', lat: 39.4699, lng: -0.3763 },
  { city: 'Séville', country: 'ES', countryName: 'Espagne', lat: 37.3891, lng: -5.9845 },
  { city: 'Bilbao', country: 'ES', countryName: 'Espagne', lat: 43.2630, lng: -2.9350 },
  { city: 'Malaga', country: 'ES', countryName: 'Espagne', lat: 36.7213, lng: -4.4214 },
  { city: 'Saragosse', country: 'ES', countryName: 'Espagne', lat: 41.6488, lng: -0.8891 },
  { city: 'Alicante', country: 'ES', countryName: 'Espagne', lat: 38.3452, lng: -0.4810 },
  { city: 'Grenade', country: 'ES', countryName: 'Espagne', lat: 37.1773, lng: -3.5986 },
  { city: 'Palma de Majorque', country: 'ES', countryName: 'Espagne', lat: 39.5696, lng: 2.6502 },
  { city: 'Las Palmas', country: 'ES', countryName: 'Espagne', lat: 28.1235, lng: -15.4363 },
  { city: 'Saint-Sébastien', country: 'ES', countryName: 'Espagne', lat: 43.3183, lng: -1.9812 },
  { city: 'Cordoue', country: 'ES', countryName: 'Espagne', lat: 37.8882, lng: -4.7794 },
  { city: 'Murcie', country: 'ES', countryName: 'Espagne', lat: 37.9922, lng: -1.1307 },
  { city: 'Salamanque', country: 'ES', countryName: 'Espagne', lat: 40.9701, lng: -5.6635 },

  // Italie
  { city: 'Rome', country: 'IT', countryName: 'Italie', lat: 41.9028, lng: 12.4964 },
  { city: 'Milan', country: 'IT', countryName: 'Italie', lat: 45.4642, lng: 9.1900 },
  { city: 'Naples', country: 'IT', countryName: 'Italie', lat: 40.8518, lng: 14.2681 },
  { city: 'Turin', country: 'IT', countryName: 'Italie', lat: 45.0703, lng: 7.6869 },
  { city: 'Florence', country: 'IT', countryName: 'Italie', lat: 43.7696, lng: 11.2558 },
  { city: 'Venise', country: 'IT', countryName: 'Italie', lat: 45.4408, lng: 12.3155 },
  { city: 'Bologne', country: 'IT', countryName: 'Italie', lat: 44.4949, lng: 11.3426 },
  { city: 'Gênes', country: 'IT', countryName: 'Italie', lat: 44.4056, lng: 8.9463 },
  { city: 'Palerme', country: 'IT', countryName: 'Italie', lat: 38.1157, lng: 13.3615 },
  { city: 'Catane', country: 'IT', countryName: 'Italie', lat: 37.5079, lng: 15.0830 },
  { city: 'Bari', country: 'IT', countryName: 'Italie', lat: 41.1171, lng: 16.8719 },
  { city: 'Vérone', country: 'IT', countryName: 'Italie', lat: 45.4384, lng: 10.9916 },
  { city: 'Pise', country: 'IT', countryName: 'Italie', lat: 43.7228, lng: 10.4017 },
  { city: 'Sienne', country: 'IT', countryName: 'Italie', lat: 43.3188, lng: 11.3308 },
  { city: 'Padoue', country: 'IT', countryName: 'Italie', lat: 45.4064, lng: 11.8768 },

  // Allemagne
  { city: 'Berlin', country: 'DE', countryName: 'Allemagne', lat: 52.5200, lng: 13.4050 },
  { city: 'Munich', country: 'DE', countryName: 'Allemagne', lat: 48.1351, lng: 11.5820 },
  { city: 'Francfort', country: 'DE', countryName: 'Allemagne', lat: 50.1109, lng: 8.6821 },
  { city: 'Hambourg', country: 'DE', countryName: 'Allemagne', lat: 53.5511, lng: 9.9937 },
  { city: 'Cologne', country: 'DE', countryName: 'Allemagne', lat: 50.9375, lng: 6.9603 },
  { city: 'Düsseldorf', country: 'DE', countryName: 'Allemagne', lat: 51.2277, lng: 6.7735 },
  { city: 'Stuttgart', country: 'DE', countryName: 'Allemagne', lat: 48.7758, lng: 9.1829 },
  { city: 'Dresde', country: 'DE', countryName: 'Allemagne', lat: 51.0504, lng: 13.7373 },
  { city: 'Leipzig', country: 'DE', countryName: 'Allemagne', lat: 51.3397, lng: 12.3731 },
  { city: 'Hanovre', country: 'DE', countryName: 'Allemagne', lat: 52.3759, lng: 9.7320 },
  { city: 'Nuremberg', country: 'DE', countryName: 'Allemagne', lat: 49.4521, lng: 11.0767 },
  { city: 'Brême', country: 'DE', countryName: 'Allemagne', lat: 53.0793, lng: 8.8017 },
  { city: 'Dortmund', country: 'DE', countryName: 'Allemagne', lat: 51.5136, lng: 7.4653 },
  { city: 'Essen', country: 'DE', countryName: 'Allemagne', lat: 51.4556, lng: 7.0116 },
  { city: 'Bonn', country: 'DE', countryName: 'Allemagne', lat: 50.7374, lng: 7.0982 },

  // Royaume-Uni
  { city: 'Londres', country: 'GB', countryName: 'Royaume-Uni', lat: 51.5074, lng: -0.1278 },
  { city: 'Manchester', country: 'GB', countryName: 'Royaume-Uni', lat: 53.4808, lng: -2.2426 },
  { city: 'Birmingham', country: 'GB', countryName: 'Royaume-Uni', lat: 52.4862, lng: -1.8904 },
  { city: 'Glasgow', country: 'GB', countryName: 'Royaume-Uni', lat: 55.8642, lng: -4.2518 },
  { city: 'Liverpool', country: 'GB', countryName: 'Royaume-Uni', lat: 53.4084, lng: -2.9916 },
  { city: 'Édimbourg', country: 'GB', countryName: 'Royaume-Uni', lat: 55.9533, lng: -3.1883 },
  { city: 'Bristol', country: 'GB', countryName: 'Royaume-Uni', lat: 51.4545, lng: -2.5879 },
  { city: 'Leeds', country: 'GB', countryName: 'Royaume-Uni', lat: 53.8008, lng: -1.5491 },
  { city: 'Cardiff', country: 'GB', countryName: 'Royaume-Uni', lat: 51.4816, lng: -3.1791 },
  { city: 'Belfast', country: 'GB', countryName: 'Royaume-Uni', lat: 54.5973, lng: -5.9301 },
  { city: 'Newcastle', country: 'GB', countryName: 'Royaume-Uni', lat: 54.9783, lng: -1.6178 },
  { city: 'Sheffield', country: 'GB', countryName: 'Royaume-Uni', lat: 53.3811, lng: -1.4701 },
  { city: 'Cambridge', country: 'GB', countryName: 'Royaume-Uni', lat: 52.2053, lng: 0.1218 },
  { city: 'Oxford', country: 'GB', countryName: 'Royaume-Uni', lat: 51.7520, lng: -1.2577 },
  { city: 'Brighton', country: 'GB', countryName: 'Royaume-Uni', lat: 50.8225, lng: -0.1372 },

  // Pays-Bas
  { city: 'Amsterdam', country: 'NL', countryName: 'Pays-Bas', lat: 52.3676, lng: 4.9041 },
  { city: 'Rotterdam', country: 'NL', countryName: 'Pays-Bas', lat: 51.9244, lng: 4.4777 },
  { city: 'La Haye', country: 'NL', countryName: 'Pays-Bas', lat: 52.0705, lng: 4.3007 },
  { city: 'Utrecht', country: 'NL', countryName: 'Pays-Bas', lat: 52.0907, lng: 5.1214 },
  { city: 'Eindhoven', country: 'NL', countryName: 'Pays-Bas', lat: 51.4416, lng: 5.4697 },
  { city: 'Groningue', country: 'NL', countryName: 'Pays-Bas', lat: 53.2194, lng: 6.5665 },
  { city: 'Maastricht', country: 'NL', countryName: 'Pays-Bas', lat: 50.8514, lng: 5.6910 },

  // Belgique
  { city: 'Bruxelles', country: 'BE', countryName: 'Belgique', lat: 50.8503, lng: 4.3517 },
  { city: 'Anvers', country: 'BE', countryName: 'Belgique', lat: 51.2194, lng: 4.4025 },
  { city: 'Gand', country: 'BE', countryName: 'Belgique', lat: 51.0543, lng: 3.7174 },
  { city: 'Liège', country: 'BE', countryName: 'Belgique', lat: 50.6326, lng: 5.5797 },
  { city: 'Bruges', country: 'BE', countryName: 'Belgique', lat: 51.2093, lng: 3.2247 },
  { city: 'Charleroi', country: 'BE', countryName: 'Belgique', lat: 50.4108, lng: 4.4446 },
  { city: 'Namur', country: 'BE', countryName: 'Belgique', lat: 50.4674, lng: 4.8720 },

  // Suisse
  { city: 'Zurich', country: 'CH', countryName: 'Suisse', lat: 47.3769, lng: 8.5417 },
  { city: 'Genève', country: 'CH', countryName: 'Suisse', lat: 46.2044, lng: 6.1432 },
  { city: 'Bâle', country: 'CH', countryName: 'Suisse', lat: 47.5596, lng: 7.5886 },
  { city: 'Berne', country: 'CH', countryName: 'Suisse', lat: 46.9480, lng: 7.4474 },
  { city: 'Lausanne', country: 'CH', countryName: 'Suisse', lat: 46.5197, lng: 6.6323 },
  { city: 'Lucerne', country: 'CH', countryName: 'Suisse', lat: 47.0502, lng: 8.3093 },

  // Autriche
  { city: 'Vienne', country: 'AT', countryName: 'Autriche', lat: 48.2082, lng: 16.3738 },
  { city: 'Salzbourg', country: 'AT', countryName: 'Autriche', lat: 47.8095, lng: 13.0550 },
  { city: 'Innsbruck', country: 'AT', countryName: 'Autriche', lat: 47.2692, lng: 11.4041 },
  { city: 'Graz', country: 'AT', countryName: 'Autriche', lat: 47.0707, lng: 15.4395 },
  { city: 'Linz', country: 'AT', countryName: 'Autriche', lat: 48.3069, lng: 14.2858 },

  // Portugal
  { city: 'Lisbonne', country: 'PT', countryName: 'Portugal', lat: 38.7223, lng: -9.1393 },
  { city: 'Porto', country: 'PT', countryName: 'Portugal', lat: 41.1579, lng: -8.6291 },
  { city: 'Faro', country: 'PT', countryName: 'Portugal', lat: 37.0194, lng: -7.9322 },
  { city: 'Funchal', country: 'PT', countryName: 'Portugal', lat: 32.6669, lng: -16.9241 },
  { city: 'Coimbra', country: 'PT', countryName: 'Portugal', lat: 40.2033, lng: -8.4103 },
  { city: 'Braga', country: 'PT', countryName: 'Portugal', lat: 41.5454, lng: -8.4265 },

  // Pologne
  { city: 'Varsovie', country: 'PL', countryName: 'Pologne', lat: 52.2297, lng: 21.0122 },
  { city: 'Cracovie', country: 'PL', countryName: 'Pologne', lat: 50.0647, lng: 19.9450 },
  { city: 'Wroclaw', country: 'PL', countryName: 'Pologne', lat: 51.1079, lng: 17.0385 },
  { city: 'Gdansk', country: 'PL', countryName: 'Pologne', lat: 54.3520, lng: 18.6466 },
  { city: 'Poznan', country: 'PL', countryName: 'Pologne', lat: 52.4064, lng: 16.9252 },
  { city: 'Lodz', country: 'PL', countryName: 'Pologne', lat: 51.7592, lng: 19.4560 },
  { city: 'Katowice', country: 'PL', countryName: 'Pologne', lat: 50.2649, lng: 19.0238 },

  // Tchéquie
  { city: 'Prague', country: 'CZ', countryName: 'Tchéquie', lat: 50.0755, lng: 14.4378 },
  { city: 'Brno', country: 'CZ', countryName: 'Tchéquie', lat: 49.1951, lng: 16.6068 },
  { city: 'Ostrava', country: 'CZ', countryName: 'Tchéquie', lat: 49.8209, lng: 18.2625 },
  { city: 'Plzen', country: 'CZ', countryName: 'Tchéquie', lat: 49.7384, lng: 13.3736 },

  // Hongrie
  { city: 'Budapest', country: 'HU', countryName: 'Hongrie', lat: 47.4979, lng: 19.0402 },
  { city: 'Debrecen', country: 'HU', countryName: 'Hongrie', lat: 47.5316, lng: 21.6273 },
  { city: 'Szeged', country: 'HU', countryName: 'Hongrie', lat: 46.2530, lng: 20.1414 },

  // Grèce
  { city: 'Athènes', country: 'GR', countryName: 'Grèce', lat: 37.9838, lng: 23.7275 },
  { city: 'Thessalonique', country: 'GR', countryName: 'Grèce', lat: 40.6401, lng: 22.9444 },
  { city: 'Héraklion', country: 'GR', countryName: 'Grèce', lat: 35.3387, lng: 25.1442 },
  { city: 'Rhodes', country: 'GR', countryName: 'Grèce', lat: 36.4349, lng: 28.2176 },
  { city: 'Corfou', country: 'GR', countryName: 'Grèce', lat: 39.6243, lng: 19.9217 },
  { city: 'Santorin', country: 'GR', countryName: 'Grèce', lat: 36.3932, lng: 25.4615 },
  { city: 'Mykonos', country: 'GR', countryName: 'Grèce', lat: 37.4467, lng: 25.3289 },

  // Scandinavie
  { city: 'Stockholm', country: 'SE', countryName: 'Suède', lat: 59.3293, lng: 18.0686 },
  { city: 'Göteborg', country: 'SE', countryName: 'Suède', lat: 57.7089, lng: 11.9746 },
  { city: 'Malmö', country: 'SE', countryName: 'Suède', lat: 55.6050, lng: 13.0038 },
  { city: 'Uppsala', country: 'SE', countryName: 'Suède', lat: 59.8586, lng: 17.6389 },
  { city: 'Copenhague', country: 'DK', countryName: 'Danemark', lat: 55.6761, lng: 12.5683 },
  { city: 'Aarhus', country: 'DK', countryName: 'Danemark', lat: 56.1629, lng: 10.2039 },
  { city: 'Odense', country: 'DK', countryName: 'Danemark', lat: 55.4038, lng: 10.4024 },
  { city: 'Oslo', country: 'NO', countryName: 'Norvège', lat: 59.9139, lng: 10.7522 },
  { city: 'Bergen', country: 'NO', countryName: 'Norvège', lat: 60.3913, lng: 5.3221 },
  { city: 'Trondheim', country: 'NO', countryName: 'Norvège', lat: 63.4305, lng: 10.3951 },
  { city: 'Stavanger', country: 'NO', countryName: 'Norvège', lat: 58.9700, lng: 5.7331 },
  { city: 'Helsinki', country: 'FI', countryName: 'Finlande', lat: 60.1699, lng: 24.9384 },
  { city: 'Tampere', country: 'FI', countryName: 'Finlande', lat: 61.4978, lng: 23.7610 },
  { city: 'Turku', country: 'FI', countryName: 'Finlande', lat: 60.4518, lng: 22.2666 },
  { city: 'Reykjavik', country: 'IS', countryName: 'Islande', lat: 64.1466, lng: -21.9426 },

  // Irlande
  { city: 'Dublin', country: 'IE', countryName: 'Irlande', lat: 53.3498, lng: -6.2603 },
  { city: 'Cork', country: 'IE', countryName: 'Irlande', lat: 51.8985, lng: -8.4756 },
  { city: 'Galway', country: 'IE', countryName: 'Irlande', lat: 53.2707, lng: -9.0568 },
  { city: 'Limerick', country: 'IE', countryName: 'Irlande', lat: 52.6638, lng: -8.6267 },

  // Europe de l'Est
  { city: 'Bucarest', country: 'RO', countryName: 'Roumanie', lat: 44.4268, lng: 26.1025 },
  { city: 'Cluj-Napoca', country: 'RO', countryName: 'Roumanie', lat: 46.7712, lng: 23.6236 },
  { city: 'Timisoara', country: 'RO', countryName: 'Roumanie', lat: 45.7489, lng: 21.2087 },
  { city: 'Sofia', country: 'BG', countryName: 'Bulgarie', lat: 42.6977, lng: 23.3219 },
  { city: 'Plovdiv', country: 'BG', countryName: 'Bulgarie', lat: 42.1354, lng: 24.7453 },
  { city: 'Varna', country: 'BG', countryName: 'Bulgarie', lat: 43.2141, lng: 27.9147 },
  { city: 'Belgrade', country: 'RS', countryName: 'Serbie', lat: 44.7866, lng: 20.4489 },
  { city: 'Zagreb', country: 'HR', countryName: 'Croatie', lat: 45.8150, lng: 15.9819 },
  { city: 'Split', country: 'HR', countryName: 'Croatie', lat: 43.5081, lng: 16.4402 },
  { city: 'Dubrovnik', country: 'HR', countryName: 'Croatie', lat: 42.6507, lng: 18.0944 },
  { city: 'Ljubljana', country: 'SI', countryName: 'Slovénie', lat: 46.0569, lng: 14.5058 },
  { city: 'Bratislava', country: 'SK', countryName: 'Slovaquie', lat: 48.1486, lng: 17.1077 },
  { city: 'Riga', country: 'LV', countryName: 'Lettonie', lat: 56.9496, lng: 24.1052 },
  { city: 'Vilnius', country: 'LT', countryName: 'Lituanie', lat: 54.6872, lng: 25.2797 },
  { city: 'Tallinn', country: 'EE', countryName: 'Estonie', lat: 59.4370, lng: 24.7536 },
  { city: 'Kiev', country: 'UA', countryName: 'Ukraine', lat: 50.4501, lng: 30.5234 },
  { city: 'Lviv', country: 'UA', countryName: 'Ukraine', lat: 49.8397, lng: 24.0297 },
  { city: 'Minsk', country: 'BY', countryName: 'Biélorussie', lat: 53.9006, lng: 27.5590 },

  // Autres pays européens
  { city: 'Luxembourg', country: 'LU', countryName: 'Luxembourg', lat: 49.6116, lng: 6.1319 },
  { city: 'Monaco', country: 'MC', countryName: 'Monaco', lat: 43.7384, lng: 7.4246 },
  { city: 'Andorre-la-Vieille', country: 'AD', countryName: 'Andorre', lat: 42.5063, lng: 1.5218 },
  { city: 'La Valette', country: 'MT', countryName: 'Malte', lat: 35.8989, lng: 14.5146 },
  { city: 'Nicosie', country: 'CY', countryName: 'Chypre', lat: 35.1856, lng: 33.3823 },
  { city: 'Tirana', country: 'AL', countryName: 'Albanie', lat: 41.3275, lng: 19.8187 },
  { city: 'Podgorica', country: 'ME', countryName: 'Monténégro', lat: 42.4304, lng: 19.2594 },
  { city: 'Sarajevo', country: 'BA', countryName: 'Bosnie-Herzégovine', lat: 43.8563, lng: 18.4131 },
  { city: 'Skopje', country: 'MK', countryName: 'Macédoine du Nord', lat: 41.9981, lng: 21.4254 },
  { city: 'Pristina', country: 'XK', countryName: 'Kosovo', lat: 42.6629, lng: 21.1655 },
  { city: 'Istanbul', country: 'TR', countryName: 'Turquie', lat: 41.0082, lng: 28.9784 },

  // Hors Europe (destinations populaires)
  { city: 'New York', country: 'US', countryName: 'États-Unis', lat: 40.7128, lng: -74.0060 },
  { city: 'Los Angeles', country: 'US', countryName: 'États-Unis', lat: 34.0522, lng: -118.2437 },
  { city: 'San Francisco', country: 'US', countryName: 'États-Unis', lat: 37.7749, lng: -122.4194 },
  { city: 'Miami', country: 'US', countryName: 'États-Unis', lat: 25.7617, lng: -80.1918 },
  { city: 'Chicago', country: 'US', countryName: 'États-Unis', lat: 41.8781, lng: -87.6298 },
  { city: 'Toronto', country: 'CA', countryName: 'Canada', lat: 43.6532, lng: -79.3832 },
  { city: 'Montréal', country: 'CA', countryName: 'Canada', lat: 45.5017, lng: -73.5673 },
  { city: 'Vancouver', country: 'CA', countryName: 'Canada', lat: 49.2827, lng: -123.1207 },
  { city: 'Tokyo', country: 'JP', countryName: 'Japon', lat: 35.6762, lng: 139.6503 },
  { city: 'Osaka', country: 'JP', countryName: 'Japon', lat: 34.6937, lng: 135.5023 },
  { city: 'Kyoto', country: 'JP', countryName: 'Japon', lat: 35.0116, lng: 135.7681 },
  { city: 'Séoul', country: 'KR', countryName: 'Corée du Sud', lat: 37.5665, lng: 126.9780 },
  { city: 'Shanghai', country: 'CN', countryName: 'Chine', lat: 31.2304, lng: 121.4737 },
  { city: 'Pékin', country: 'CN', countryName: 'Chine', lat: 39.9042, lng: 116.4074 },
  { city: 'Hong Kong', country: 'HK', countryName: 'Hong Kong', lat: 22.3193, lng: 114.1694 },
  { city: 'Bangkok', country: 'TH', countryName: 'Thaïlande', lat: 13.7563, lng: 100.5018 },
  { city: 'Singapour', country: 'SG', countryName: 'Singapour', lat: 1.3521, lng: 103.8198 },
  { city: 'Sydney', country: 'AU', countryName: 'Australie', lat: -33.8688, lng: 151.2093 },
  { city: 'Melbourne', country: 'AU', countryName: 'Australie', lat: -37.8136, lng: 144.9631 },
  { city: 'Dubai', country: 'AE', countryName: 'Émirats arabes unis', lat: 25.2048, lng: 55.2708 },
  { city: 'Le Caire', country: 'EG', countryName: 'Égypte', lat: 30.0444, lng: 31.2357 },
  { city: 'Casablanca', country: 'MA', countryName: 'Maroc', lat: 33.5731, lng: -7.5898 },
  { city: 'Marrakech', country: 'MA', countryName: 'Maroc', lat: 31.6295, lng: -7.9811 },
  { city: 'Tunis', country: 'TN', countryName: 'Tunisie', lat: 36.8065, lng: 10.1815 },
  { city: 'Alger', country: 'DZ', countryName: 'Algérie', lat: 36.7538, lng: 3.0588 },
  { city: 'Dakar', country: 'SN', countryName: 'Sénégal', lat: 14.7167, lng: -17.4677 },
  { city: 'Abidjan', country: 'CI', countryName: 'Côte d\'Ivoire', lat: 5.3600, lng: -4.0083 },
];

// European countries (France first, then alphabetically sorted)
const europeanCountriesList = [
  { code: 'FR', name: 'France' },
  { code: 'AL', name: 'Albanie' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'AD', name: 'Andorre' },
  { code: 'AT', name: 'Autriche' },
  { code: 'BE', name: 'Belgique' },
  { code: 'BY', name: 'Biélorussie' },
  { code: 'BA', name: 'Bosnie-Herzégovine' },
  { code: 'BG', name: 'Bulgarie' },
  { code: 'CY', name: 'Chypre' },
  { code: 'HR', name: 'Croatie' },
  { code: 'DK', name: 'Danemark' },
  { code: 'ES', name: 'Espagne' },
  { code: 'EE', name: 'Estonie' },
  { code: 'FI', name: 'Finlande' },
  { code: 'GR', name: 'Grèce' },
  { code: 'HU', name: 'Hongrie' },
  { code: 'IE', name: 'Irlande' },
  { code: 'IS', name: 'Islande' },
  { code: 'IT', name: 'Italie' },
  { code: 'XK', name: 'Kosovo' },
  { code: 'LV', name: 'Lettonie' },
  { code: 'LT', name: 'Lituanie' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MK', name: 'Macédoine du Nord' },
  { code: 'MT', name: 'Malte' },
  { code: 'MC', name: 'Monaco' },
  { code: 'ME', name: 'Monténégro' },
  { code: 'NO', name: 'Norvège' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'PL', name: 'Pologne' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Roumanie' },
  { code: 'GB', name: 'Royaume-Uni' },
  { code: 'RS', name: 'Serbie' },
  { code: 'SK', name: 'Slovaquie' },
  { code: 'SI', name: 'Slovénie' },
  { code: 'SE', name: 'Suède' },
  { code: 'CH', name: 'Suisse' },
  { code: 'CZ', name: 'Tchéquie' },
  { code: 'TR', name: 'Turquie' },
  { code: 'UA', name: 'Ukraine' },
];

// Non-European countries (alphabetically sorted)
const otherCountriesList = [
  { code: 'DZ', name: 'Algérie' },
  { code: 'AU', name: 'Australie' },
  { code: 'CA', name: 'Canada' },
  { code: 'CN', name: 'Chine' },
  { code: 'KR', name: 'Corée du Sud' },
  { code: 'CI', name: 'Côte d\'Ivoire' },
  { code: 'EG', name: 'Égypte' },
  { code: 'AE', name: 'Émirats arabes unis' },
  { code: 'US', name: 'États-Unis' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'JP', name: 'Japon' },
  { code: 'MA', name: 'Maroc' },
  { code: 'SN', name: 'Sénégal' },
  { code: 'SG', name: 'Singapour' },
  { code: 'TH', name: 'Thaïlande' },
  { code: 'TN', name: 'Tunisie' },
];

// Combined list: European countries first, then others
export const europeanCountries = [...europeanCountriesList, ...otherCountriesList];

export interface CityData {
  city: string;
  country: string;
  countryName: string;
  lat?: number;
  lng?: number;
}

export function searchCities(query: string): CityData[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  return citiesWithCoordinates
    .filter(city => {
      const normalizedCity = city.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalizedCountry = city.countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return normalizedCity.includes(normalizedQuery) || normalizedCountry.includes(normalizedQuery);
    })
    .slice(0, 10);
}

export function getCityCoordinates(cityName: string, countryCode: string): { lat: number; lng: number } | null {
  // First try exact match with country code
  let city = citiesWithCoordinates.find(
    c => c.city.toLowerCase() === cityName.toLowerCase() && c.country === countryCode
  );
  
  // If not found and country code is empty or different, try matching by city name only
  if (!city) {
    city = citiesWithCoordinates.find(
      c => c.city.toLowerCase() === cityName.toLowerCase()
    );
  }
  
  return city ? { lat: city.lat, lng: city.lng } : null;
}

export function isCityKnown(cityName: string): boolean {
  const normalizedQuery = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return citiesWithCoordinates.some(city => {
    const normalizedCity = city.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedCity === normalizedQuery;
  });
}

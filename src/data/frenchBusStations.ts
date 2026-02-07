// Gares routières françaises par ville

export interface BusStation {
  name: string;
  city: string;
  type: 'principale' | 'secondaire';
}

export const frenchBusStations: BusStation[] = ([
  // Paris
  { name: 'Paris Bercy Seine', city: 'Paris', type: 'principale' },
  { name: 'Paris Gallieni', city: 'Paris', type: 'principale' },
  { name: 'Paris La Défense', city: 'Paris', type: 'secondaire' },
  { name: 'Paris Porte Maillot', city: 'Paris', type: 'secondaire' },

  // Lyon
  { name: 'Lyon Perrache (Gare routière)', city: 'Lyon', type: 'principale' },
  { name: 'Lyon Part-Dieu (Gare routière)', city: 'Lyon', type: 'principale' },

  // Marseille
  { name: 'Marseille Saint-Charles (Gare routière)', city: 'Marseille', type: 'principale' },

  // Bordeaux
  { name: 'Bordeaux Saint-Jean (Gare routière)', city: 'Bordeaux', type: 'principale' },

  // Lille
  { name: 'Lille Europe (Gare routière)', city: 'Lille', type: 'principale' },
  { name: 'Lille Flandres (Gare routière)', city: 'Lille', type: 'secondaire' },

  // Toulouse
  { name: 'Toulouse Matabiau (Gare routière)', city: 'Toulouse', type: 'principale' },
  { name: 'Toulouse Arènes', city: 'Toulouse', type: 'secondaire' },

  // Nice
  { name: 'Nice Côte d\'Azur (Gare routière)', city: 'Nice', type: 'principale' },

  // Nantes
  { name: 'Nantes (Gare routière)', city: 'Nantes', type: 'principale' },

  // Strasbourg
  { name: 'Strasbourg (Gare routière)', city: 'Strasbourg', type: 'principale' },

  // Montpellier
  { name: 'Montpellier Sabines', city: 'Montpellier', type: 'principale' },

  // Rennes
  { name: 'Rennes (Gare routière)', city: 'Rennes', type: 'principale' },

  // Grenoble
  { name: 'Grenoble (Gare routière)', city: 'Grenoble', type: 'principale' },

  // Dijon
  { name: 'Dijon (Gare routière)', city: 'Dijon', type: 'principale' },

  // Reims
  { name: 'Reims (Gare routière)', city: 'Reims', type: 'principale' },

  // Le Mans
  { name: 'Le Mans (Gare routière)', city: 'Le Mans', type: 'principale' },

  // Tours
  { name: 'Tours (Gare routière)', city: 'Tours', type: 'principale' },

  // Angers
  { name: 'Angers (Gare routière)', city: 'Angers', type: 'principale' },

  // Clermont-Ferrand
  { name: 'Clermont-Ferrand (Gare routière)', city: 'Clermont-Ferrand', type: 'principale' },

  // Toulon
  { name: 'Toulon (Gare routière)', city: 'Toulon', type: 'principale' },

  // Le Havre
  { name: 'Le Havre (Gare routière)', city: 'Le Havre', type: 'principale' },

  // Saint-Étienne
  { name: 'Saint-Étienne (Gare routière)', city: 'Saint-Étienne', type: 'principale' },

  // Metz
  { name: 'Metz (Gare routière)', city: 'Metz', type: 'principale' },

  // Nancy
  { name: 'Nancy (Gare routière)', city: 'Nancy', type: 'principale' },

  // Caen
  { name: 'Caen (Gare routière)', city: 'Caen', type: 'principale' },

  // Orléans
  { name: 'Orléans (Gare routière)', city: 'Orléans', type: 'principale' },

  // Mulhouse
  { name: 'Mulhouse (Gare routière)', city: 'Mulhouse', type: 'principale' },

  // Rouen
  { name: 'Rouen (Gare routière)', city: 'Rouen', type: 'principale' },

  // Brest
  { name: 'Brest (Gare routière)', city: 'Brest', type: 'principale' },

  // Perpignan
  { name: 'Perpignan (Gare routière)', city: 'Perpignan', type: 'principale' },

  // Amiens
  { name: 'Amiens (Gare routière)', city: 'Amiens', type: 'principale' },

  // Limoges
  { name: 'Limoges (Gare routière)', city: 'Limoges', type: 'principale' },

  // Besançon
  { name: 'Besançon (Gare routière)', city: 'Besançon', type: 'principale' },

  // Avignon
  { name: 'Avignon (Gare routière)', city: 'Avignon', type: 'principale' },

  // Aix-en-Provence
  { name: 'Aix-en-Provence (Gare routière)', city: 'Aix-en-Provence', type: 'principale' },

  // Valence
  { name: 'Valence (Gare routière)', city: 'Valence', type: 'principale' },

  // Nîmes
  { name: 'Nîmes (Gare routière)', city: 'Nîmes', type: 'principale' },

  // Poitiers
  { name: 'Poitiers (Gare routière)', city: 'Poitiers', type: 'principale' },

  // La Rochelle
  { name: 'La Rochelle (Gare routière)', city: 'La Rochelle', type: 'principale' },

  // Angoulême
  { name: 'Angoulême (Gare routière)', city: 'Angoulême', type: 'principale' },

  // Bayonne
  { name: 'Bayonne (Gare routière)', city: 'Bayonne', type: 'principale' },

  // Biarritz
  { name: 'Biarritz (Gare routière)', city: 'Biarritz', type: 'principale' },

  // Pau
  { name: 'Pau (Gare routière)', city: 'Pau', type: 'principale' },

  // Cannes
  { name: 'Cannes (Gare routière)', city: 'Cannes', type: 'principale' },

  // Antibes
  { name: 'Antibes (Gare routière)', city: 'Antibes', type: 'principale' },

  // Monaco
  { name: 'Monaco (Gare routière)', city: 'Monaco', type: 'principale' },

  // Vannes
  { name: 'Vannes (Gare routière)', city: 'Vannes', type: 'principale' },

  // Lorient
  { name: 'Lorient (Gare routière)', city: 'Lorient', type: 'principale' },

  // Quimper
  { name: 'Quimper (Gare routière)', city: 'Quimper', type: 'principale' },

  // Saint-Malo
  { name: 'Saint-Malo (Gare routière)', city: 'Saint-Malo', type: 'principale' },

  // Colmar
  { name: 'Colmar (Gare routière)', city: 'Colmar', type: 'principale' },

  // Chambéry
  { name: 'Chambéry (Gare routière)', city: 'Chambéry', type: 'principale' },

  // Annecy
  { name: 'Annecy (Gare routière)', city: 'Annecy', type: 'principale' },

  // Troyes
  { name: 'Troyes (Gare routière)', city: 'Troyes', type: 'principale' },

  // Dunkerque
  { name: 'Dunkerque (Gare routière)', city: 'Dunkerque', type: 'principale' },

  // Calais
  { name: 'Calais (Gare routière)', city: 'Calais', type: 'principale' },

  // Arras
  { name: 'Arras (Gare routière)', city: 'Arras', type: 'principale' },

  // Chartres
  { name: 'Chartres (Gare routière)', city: 'Chartres', type: 'principale' },

  // Blois
  { name: 'Blois (Gare routière)', city: 'Blois', type: 'principale' },

  // Bourges
  { name: 'Bourges (Gare routière)', city: 'Bourges', type: 'principale' },

  // Niort
  { name: 'Niort (Gare routière)', city: 'Niort', type: 'principale' },

  // Périgueux
  { name: 'Périgueux (Gare routière)', city: 'Périgueux', type: 'principale' },

  // Carcassonne
  { name: 'Carcassonne (Gare routière)', city: 'Carcassonne', type: 'principale' },

  // Narbonne
  { name: 'Narbonne (Gare routière)', city: 'Narbonne', type: 'principale' },

  // Béziers
  { name: 'Béziers (Gare routière)', city: 'Béziers', type: 'principale' },

  // Arles
  { name: 'Arles (Gare routière)', city: 'Arles', type: 'principale' },

  // Gap
  { name: 'Gap (Gare routière)', city: 'Gap', type: 'principale' },

  // Fréjus
  { name: 'Fréjus (Gare routière)', city: 'Fréjus', type: 'principale' },

  // Saint-Raphaël
  { name: 'Saint-Raphaël (Gare routière)', city: 'Saint-Raphaël', type: 'principale' },
] as BusStation[]).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export function getBusStationsForCity(cityName: string): BusStation[] {
  const normalizedCity = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return frenchBusStations.filter(station => {
    const normalizedStationCity = station.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedStationCity === normalizedCity;
  });
}

export function hasMultipleBusStations(cityName: string): boolean {
  return getBusStationsForCity(cityName).length > 1;
}

export function getBusStationTypeEmoji(type: 'principale' | 'secondaire'): string {
  return type === 'principale' ? '🚏' : '🚐';
}

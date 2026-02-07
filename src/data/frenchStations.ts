// Gares SNCF françaises par ville

export interface TrainStation {
  name: string;
  city: string;
  type: 'tgv' | 'ter' | 'both';
}

export const frenchTrainStations: TrainStation[] = ([
  // Paris
  { name: 'Paris Gare du Nord', city: 'Paris', type: 'both' },
  { name: 'Paris Gare de Lyon', city: 'Paris', type: 'both' },
  { name: 'Paris Gare Montparnasse', city: 'Paris', type: 'both' },
  { name: 'Paris Gare de l\'Est', city: 'Paris', type: 'both' },
  { name: 'Paris Gare Saint-Lazare', city: 'Paris', type: 'both' },
  { name: 'Paris Gare d\'Austerlitz', city: 'Paris', type: 'both' },
  { name: 'Paris Bercy', city: 'Paris', type: 'both' },
  { name: 'Massy TGV', city: 'Paris', type: 'tgv' },
  { name: 'Marne-la-Vallée Chessy', city: 'Paris', type: 'tgv' },
  { name: 'Aéroport CDG TGV', city: 'Paris', type: 'tgv' },

  // Lyon
  { name: 'Lyon Part-Dieu', city: 'Lyon', type: 'both' },
  { name: 'Lyon Perrache', city: 'Lyon', type: 'both' },
  { name: 'Lyon Saint-Exupéry TGV', city: 'Lyon', type: 'tgv' },

  // Marseille
  { name: 'Marseille Saint-Charles', city: 'Marseille', type: 'both' },

  // Bordeaux
  { name: 'Bordeaux Saint-Jean', city: 'Bordeaux', type: 'both' },

  // Lille
  { name: 'Lille Flandres', city: 'Lille', type: 'both' },
  { name: 'Lille Europe', city: 'Lille', type: 'tgv' },

  // Toulouse
  { name: 'Toulouse Matabiau', city: 'Toulouse', type: 'both' },

  // Nice
  { name: 'Nice Ville', city: 'Nice', type: 'both' },

  // Nantes
  { name: 'Nantes', city: 'Nantes', type: 'both' },

  // Strasbourg
  { name: 'Strasbourg Ville', city: 'Strasbourg', type: 'both' },

  // Montpellier
  { name: 'Montpellier Saint-Roch', city: 'Montpellier', type: 'both' },
  { name: 'Montpellier Sud de France', city: 'Montpellier', type: 'tgv' },

  // Rennes
  { name: 'Rennes', city: 'Rennes', type: 'both' },

  // Grenoble
  { name: 'Grenoble', city: 'Grenoble', type: 'both' },

  // Dijon
  { name: 'Dijon Ville', city: 'Dijon', type: 'both' },

  // Reims
  { name: 'Reims', city: 'Reims', type: 'both' },
  { name: 'Champagne-Ardenne TGV', city: 'Reims', type: 'tgv' },

  // Le Mans
  { name: 'Le Mans', city: 'Le Mans', type: 'both' },

  // Tours
  { name: 'Tours', city: 'Tours', type: 'both' },
  { name: 'Saint-Pierre-des-Corps', city: 'Tours', type: 'tgv' },

  // Angers
  { name: 'Angers Saint-Laud', city: 'Angers', type: 'both' },

  // Clermont-Ferrand
  { name: 'Clermont-Ferrand', city: 'Clermont-Ferrand', type: 'both' },

  // Toulon
  { name: 'Toulon', city: 'Toulon', type: 'both' },

  // Le Havre
  { name: 'Le Havre', city: 'Le Havre', type: 'both' },

  // Saint-Étienne
  { name: 'Saint-Étienne Châteaucreux', city: 'Saint-Étienne', type: 'both' },

  // Metz
  { name: 'Metz Ville', city: 'Metz', type: 'both' },
  { name: 'Lorraine TGV', city: 'Metz', type: 'tgv' },

  // Nancy
  { name: 'Nancy Ville', city: 'Nancy', type: 'both' },

  // Caen
  { name: 'Caen', city: 'Caen', type: 'both' },

  // Orléans
  { name: 'Orléans', city: 'Orléans', type: 'both' },

  // Mulhouse
  { name: 'Mulhouse Ville', city: 'Mulhouse', type: 'both' },

  // Rouen
  { name: 'Rouen Rive Droite', city: 'Rouen', type: 'both' },

  // Brest
  { name: 'Brest', city: 'Brest', type: 'both' },

  // Perpignan
  { name: 'Perpignan', city: 'Perpignan', type: 'both' },

  // Amiens
  { name: 'Amiens', city: 'Amiens', type: 'both' },
  { name: 'TGV Haute Picardie', city: 'Amiens', type: 'tgv' },

  // Limoges
  { name: 'Limoges Bénédictins', city: 'Limoges', type: 'both' },

  // Besançon
  { name: 'Besançon Viotte', city: 'Besançon', type: 'both' },
  { name: 'Besançon Franche-Comté TGV', city: 'Besançon', type: 'tgv' },

  // Avignon
  { name: 'Avignon Centre', city: 'Avignon', type: 'ter' },
  { name: 'Avignon TGV', city: 'Avignon', type: 'tgv' },

  // Aix-en-Provence
  { name: 'Aix-en-Provence TGV', city: 'Aix-en-Provence', type: 'tgv' },

  // Valence
  { name: 'Valence Ville', city: 'Valence', type: 'both' },
  { name: 'Valence TGV', city: 'Valence', type: 'tgv' },

  // Nîmes
  { name: 'Nîmes Centre', city: 'Nîmes', type: 'both' },
  { name: 'Nîmes Pont du Gard', city: 'Nîmes', type: 'tgv' },

  // Poitiers
  { name: 'Poitiers', city: 'Poitiers', type: 'both' },
  { name: 'Futuroscope', city: 'Poitiers', type: 'tgv' },

  // La Rochelle
  { name: 'La Rochelle Ville', city: 'La Rochelle', type: 'both' },

  // Angoulême
  { name: 'Angoulême', city: 'Angoulême', type: 'both' },

  // Bayonne
  { name: 'Bayonne', city: 'Bayonne', type: 'both' },

  // Biarritz
  { name: 'Biarritz', city: 'Biarritz', type: 'both' },

  // Pau
  { name: 'Pau', city: 'Pau', type: 'both' },

  // Tarbes
  { name: 'Tarbes', city: 'Tarbes', type: 'both' },

  // Lourdes
  { name: 'Lourdes', city: 'Lourdes', type: 'both' },

  // Agen
  { name: 'Agen', city: 'Agen', type: 'both' },

  // Cannes
  { name: 'Cannes', city: 'Cannes', type: 'both' },

  // Antibes
  { name: 'Antibes', city: 'Antibes', type: 'both' },

  // Monaco
  { name: 'Monaco Monte-Carlo', city: 'Monaco', type: 'ter' },

  // Menton
  { name: 'Menton', city: 'Menton', type: 'ter' },

  // Ajaccio
  { name: 'Ajaccio', city: 'Ajaccio', type: 'ter' },

  // Bastia
  { name: 'Bastia', city: 'Bastia', type: 'ter' },

  // Vannes
  { name: 'Vannes', city: 'Vannes', type: 'both' },

  // Lorient
  { name: 'Lorient', city: 'Lorient', type: 'both' },

  // Quimper
  { name: 'Quimper', city: 'Quimper', type: 'both' },

  // Saint-Brieuc
  { name: 'Saint-Brieuc', city: 'Saint-Brieuc', type: 'both' },

  // Saint-Malo
  { name: 'Saint-Malo', city: 'Saint-Malo', type: 'both' },

  // Colmar
  { name: 'Colmar', city: 'Colmar', type: 'both' },

  // Belfort
  { name: 'Belfort Montbéliard TGV', city: 'Belfort', type: 'tgv' },
  { name: 'Belfort Ville', city: 'Belfort', type: 'ter' },

  // Chambéry
  { name: 'Chambéry Challes-les-Eaux', city: 'Chambéry', type: 'both' },

  // Annecy
  { name: 'Annecy', city: 'Annecy', type: 'both' },

  // Bourg-en-Bresse
  { name: 'Bourg-en-Bresse', city: 'Bourg-en-Bresse', type: 'both' },

  // Troyes
  { name: 'Troyes', city: 'Troyes', type: 'both' },

  // Charleville-Mézières
  { name: 'Charleville-Mézières', city: 'Charleville-Mézières', type: 'both' },

  // Épinal
  { name: 'Épinal', city: 'Épinal', type: 'both' },

  // Thionville
  { name: 'Thionville', city: 'Thionville', type: 'both' },

  // Dunkerque
  { name: 'Dunkerque', city: 'Dunkerque', type: 'both' },

  // Calais
  { name: 'Calais Ville', city: 'Calais', type: 'both' },
  { name: 'Calais Fréthun', city: 'Calais', type: 'tgv' },

  // Boulogne
  { name: 'Boulogne Ville', city: 'Boulogne-sur-Mer', type: 'both' },

  // Arras
  { name: 'Arras', city: 'Arras', type: 'both' },

  // Lens
  { name: 'Lens', city: 'Lens', type: 'both' },

  // Douai
  { name: 'Douai', city: 'Douai', type: 'both' },

  // Valenciennes
  { name: 'Valenciennes', city: 'Valenciennes', type: 'both' },

  // Chartres
  { name: 'Chartres', city: 'Chartres', type: 'both' },

  // Blois
  { name: 'Blois Chambord', city: 'Blois', type: 'both' },

  // Bourges
  { name: 'Bourges', city: 'Bourges', type: 'both' },

  // Châteauroux
  { name: 'Châteauroux', city: 'Châteauroux', type: 'both' },

  // Niort
  { name: 'Niort', city: 'Niort', type: 'both' },

  // Rochefort
  { name: 'Rochefort', city: 'Rochefort', type: 'both' },

  // Saintes
  { name: 'Saintes', city: 'Saintes', type: 'both' },

  // Périgueux
  { name: 'Périgueux', city: 'Périgueux', type: 'both' },

  // Brive-la-Gaillarde
  { name: 'Brive-la-Gaillarde', city: 'Brive-la-Gaillarde', type: 'both' },

  // Montauban
  { name: 'Montauban Ville Bourbon', city: 'Montauban', type: 'both' },

  // Albi
  { name: 'Albi Ville', city: 'Albi', type: 'both' },

  // Castres
  { name: 'Castres', city: 'Castres', type: 'ter' },

  // Carcassonne
  { name: 'Carcassonne', city: 'Carcassonne', type: 'both' },

  // Narbonne
  { name: 'Narbonne', city: 'Narbonne', type: 'both' },

  // Béziers
  { name: 'Béziers', city: 'Béziers', type: 'both' },

  // Sète
  { name: 'Sète', city: 'Sète', type: 'both' },

  // Arles
  { name: 'Arles', city: 'Arles', type: 'both' },

  // Orange
  { name: 'Orange', city: 'Orange', type: 'both' },

  // Carpentras
  { name: 'Carpentras', city: 'Carpentras', type: 'ter' },

  // Gap
  { name: 'Gap', city: 'Gap', type: 'ter' },

  // Briançon
  { name: 'Briançon', city: 'Briançon', type: 'ter' },

  // Digne-les-Bains
  { name: 'Digne-les-Bains', city: 'Digne-les-Bains', type: 'ter' },

  // Draguignan
  { name: 'Les Arcs Draguignan', city: 'Draguignan', type: 'both' },

  // Fréjus
  { name: 'Fréjus', city: 'Fréjus', type: 'ter' },

  // Saint-Raphaël
  { name: 'Saint-Raphaël Valescure', city: 'Saint-Raphaël', type: 'both' },

  // Hyères
  { name: 'Hyères', city: 'Hyères', type: 'ter' },

  // La Ciotat
  { name: 'La Ciotat', city: 'La Ciotat', type: 'ter' },

  // Aubagne
  { name: 'Aubagne', city: 'Aubagne', type: 'both' },

  // Miramas
  { name: 'Miramas', city: 'Miramas', type: 'both' },

  // Istres
  { name: 'Istres', city: 'Istres', type: 'ter' },

  // Martigues
  { name: 'Martigues', city: 'Martigues', type: 'ter' },

  // Salon-de-Provence
  { name: 'Salon', city: 'Salon-de-Provence', type: 'ter' },

  // Vitrolles
  { name: 'Vitrolles Aéroport Marseille Provence', city: 'Vitrolles', type: 'both' },

  // Évian
  { name: 'Évian-les-Bains', city: 'Évian-les-Bains', type: 'ter' },

  // Thonon
  { name: 'Thonon-les-Bains', city: 'Thonon-les-Bains', type: 'ter' },

  // Albertville
  { name: 'Albertville', city: 'Albertville', type: 'ter' },

  // Modane
  { name: 'Modane', city: 'Modane', type: 'both' },

  // Saint-Jean-de-Maurienne
  { name: 'Saint-Jean-de-Maurienne', city: 'Saint-Jean-de-Maurienne', type: 'both' },

  // Bourg-Saint-Maurice
  { name: 'Bourg-Saint-Maurice', city: 'Bourg-Saint-Maurice', type: 'both' },

  // Aime
  { name: 'Aime La Plagne', city: 'Aime', type: 'ter' },

  // Moûtiers
  { name: 'Moûtiers Salins Brides-les-Bains', city: 'Moûtiers', type: 'both' },
] as TrainStation[]).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

export function getStationsForCity(cityName: string): TrainStation[] {
  const normalizedCity = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return frenchTrainStations.filter(station => {
    const normalizedStationCity = station.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedStationCity === normalizedCity;
  });
}

export function hasMultipleStations(cityName: string): boolean {
  return getStationsForCity(cityName).length > 1;
}

export function getStationTypeLabel(type: 'tgv' | 'ter' | 'both'): string {
  switch (type) {
    case 'tgv': return 'TGV';
    case 'ter': return 'TER';
    case 'both': return 'TGV/TER';
  }
}

export function getStationTypeEmoji(type: 'tgv' | 'ter' | 'both'): string {
  switch (type) {
    case 'tgv': return '🚄';
    case 'ter': return '🚃';
    case 'both': return '🚄';
  }
}

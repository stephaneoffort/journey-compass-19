// Stations de métro (Tube) et Overground de Londres
// Triées par ordre alphabétique

export interface LondonStation {
  name: string;
  lines: string[];
  type: 'tube' | 'overground' | 'dlr' | 'elizabeth' | 'both';
  zone: 'central' | 'outer';
}

const stationsData: LondonStation[] = [
  // Central London - Tube
  { name: 'Aldgate', lines: ['Circle', 'Metropolitan'], type: 'tube', zone: 'central' },
  { name: 'Aldgate East', lines: ['District', 'Hammersmith & City'], type: 'tube', zone: 'central' },
  { name: 'Angel', lines: ['Northern'], type: 'tube', zone: 'central' },
  { name: 'Baker Street', lines: ['Circle', 'Hammersmith & City', 'Jubilee', 'Metropolitan', 'Bakerloo'], type: 'tube', zone: 'central' },
  { name: 'Bank', lines: ['Central', 'Northern', 'Waterloo & City', 'DLR'], type: 'both', zone: 'central' },
  { name: 'Barbican', lines: ['Circle', 'Hammersmith & City', 'Metropolitan'], type: 'tube', zone: 'central' },
  { name: 'Bayswater', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Blackfriars', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Bond Street', lines: ['Central', 'Jubilee', 'Elizabeth'], type: 'both', zone: 'central' },
  { name: 'Borough', lines: ['Northern'], type: 'tube', zone: 'central' },
  { name: 'Cannon Street', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Chancery Lane', lines: ['Central'], type: 'tube', zone: 'central' },
  { name: 'Charing Cross', lines: ['Bakerloo', 'Northern'], type: 'tube', zone: 'central' },
  { name: 'Covent Garden', lines: ['Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Earl\'s Court', lines: ['District', 'Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Edgware Road (Circle)', lines: ['Circle', 'District', 'Hammersmith & City'], type: 'tube', zone: 'central' },
  { name: 'Edgware Road (Bakerloo)', lines: ['Bakerloo'], type: 'tube', zone: 'central' },
  { name: 'Elephant & Castle', lines: ['Bakerloo', 'Northern'], type: 'tube', zone: 'central' },
  { name: 'Embankment', lines: ['Bakerloo', 'Circle', 'District', 'Northern'], type: 'tube', zone: 'central' },
  { name: 'Euston', lines: ['Northern', 'Victoria'], type: 'tube', zone: 'central' },
  { name: 'Euston Square', lines: ['Circle', 'Hammersmith & City', 'Metropolitan'], type: 'tube', zone: 'central' },
  { name: 'Farringdon', lines: ['Circle', 'Hammersmith & City', 'Metropolitan', 'Elizabeth'], type: 'both', zone: 'central' },
  { name: 'Gloucester Road', lines: ['Circle', 'District', 'Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Goodge Street', lines: ['Northern'], type: 'tube', zone: 'central' },
  { name: 'Great Portland Street', lines: ['Circle', 'Hammersmith & City', 'Metropolitan'], type: 'tube', zone: 'central' },
  { name: 'Green Park', lines: ['Jubilee', 'Piccadilly', 'Victoria'], type: 'tube', zone: 'central' },
  { name: 'High Street Kensington', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Holborn', lines: ['Central', 'Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Hyde Park Corner', lines: ['Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Kennington', lines: ['Northern'], type: 'tube', zone: 'central' },
  { name: 'King\'s Cross St Pancras', lines: ['Circle', 'Hammersmith & City', 'Metropolitan', 'Northern', 'Piccadilly', 'Victoria'], type: 'tube', zone: 'central' },
  { name: 'Knightsbridge', lines: ['Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Lambeth North', lines: ['Bakerloo'], type: 'tube', zone: 'central' },
  { name: 'Lancaster Gate', lines: ['Central'], type: 'tube', zone: 'central' },
  { name: 'Leicester Square', lines: ['Northern', 'Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Liverpool Street', lines: ['Central', 'Circle', 'Hammersmith & City', 'Metropolitan', 'Elizabeth'], type: 'both', zone: 'central' },
  { name: 'London Bridge', lines: ['Jubilee', 'Northern'], type: 'tube', zone: 'central' },
  { name: 'Mansion House', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Marble Arch', lines: ['Central'], type: 'tube', zone: 'central' },
  { name: 'Marylebone', lines: ['Bakerloo'], type: 'tube', zone: 'central' },
  { name: 'Monument', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Moorgate', lines: ['Circle', 'Hammersmith & City', 'Metropolitan', 'Northern', 'Elizabeth'], type: 'both', zone: 'central' },
  { name: 'Notting Hill Gate', lines: ['Central', 'Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Old Street', lines: ['Northern'], type: 'tube', zone: 'central' },
  { name: 'Oxford Circus', lines: ['Bakerloo', 'Central', 'Victoria'], type: 'tube', zone: 'central' },
  { name: 'Paddington', lines: ['Bakerloo', 'Circle', 'District', 'Hammersmith & City', 'Elizabeth'], type: 'both', zone: 'central' },
  { name: 'Piccadilly Circus', lines: ['Bakerloo', 'Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Pimlico', lines: ['Victoria'], type: 'tube', zone: 'central' },
  { name: 'Queensway', lines: ['Central'], type: 'tube', zone: 'central' },
  { name: 'Regent\'s Park', lines: ['Bakerloo'], type: 'tube', zone: 'central' },
  { name: 'Russell Square', lines: ['Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Sloane Square', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'South Kensington', lines: ['Circle', 'District', 'Piccadilly'], type: 'tube', zone: 'central' },
  { name: 'Southwark', lines: ['Jubilee'], type: 'tube', zone: 'central' },
  { name: 'St James\'s Park', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'St Paul\'s', lines: ['Central'], type: 'tube', zone: 'central' },
  { name: 'Temple', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Tottenham Court Road', lines: ['Central', 'Northern', 'Elizabeth'], type: 'both', zone: 'central' },
  { name: 'Tower Hill', lines: ['Circle', 'District'], type: 'tube', zone: 'central' },
  { name: 'Victoria', lines: ['Circle', 'District', 'Victoria'], type: 'tube', zone: 'central' },
  { name: 'Warren Street', lines: ['Northern', 'Victoria'], type: 'tube', zone: 'central' },
  { name: 'Waterloo', lines: ['Bakerloo', 'Jubilee', 'Northern', 'Waterloo & City'], type: 'tube', zone: 'central' },
  { name: 'Westminster', lines: ['Circle', 'District', 'Jubilee'], type: 'tube', zone: 'central' },

  // Outer London
  { name: 'Acton Town', lines: ['District', 'Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Barking', lines: ['District', 'Hammersmith & City', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Brixton', lines: ['Victoria'], type: 'tube', zone: 'outer' },
  { name: 'Camden Town', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Canary Wharf', lines: ['Jubilee', 'Elizabeth', 'DLR'], type: 'both', zone: 'outer' },
  { name: 'Clapham Common', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Clapham North', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Clapham South', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'East Ham', lines: ['District', 'Hammersmith & City'], type: 'tube', zone: 'outer' },
  { name: 'Ealing Broadway', lines: ['Central', 'District', 'Elizabeth'], type: 'both', zone: 'outer' },
  { name: 'Finsbury Park', lines: ['Piccadilly', 'Victoria'], type: 'tube', zone: 'outer' },
  { name: 'Fulham Broadway', lines: ['District'], type: 'tube', zone: 'outer' },
  { name: 'Greenwich', lines: ['DLR'], type: 'dlr', zone: 'outer' },
  { name: 'Hammersmith', lines: ['Circle', 'District', 'Hammersmith & City', 'Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Hampstead', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Heathrow Terminal 2 & 3', lines: ['Piccadilly', 'Elizabeth'], type: 'both', zone: 'outer' },
  { name: 'Heathrow Terminal 4', lines: ['Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Heathrow Terminal 5', lines: ['Piccadilly', 'Elizabeth'], type: 'both', zone: 'outer' },
  { name: 'Highbury & Islington', lines: ['Victoria', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Highgate', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Hounslow Central', lines: ['Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Hounslow East', lines: ['Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Hounslow West', lines: ['Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Kilburn', lines: ['Jubilee'], type: 'tube', zone: 'outer' },
  { name: 'Lewisham', lines: ['DLR'], type: 'dlr', zone: 'outer' },
  { name: 'Morden', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'North Greenwich', lines: ['Jubilee'], type: 'tube', zone: 'outer' },
  { name: 'Putney Bridge', lines: ['District'], type: 'tube', zone: 'outer' },
  { name: 'Richmond', lines: ['District', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Shepherd\'s Bush', lines: ['Central'], type: 'tube', zone: 'outer' },
  { name: 'Stratford', lines: ['Central', 'Jubilee', 'Elizabeth', 'DLR', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Swiss Cottage', lines: ['Jubilee'], type: 'tube', zone: 'outer' },
  { name: 'Tooting Bec', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Tooting Broadway', lines: ['Northern'], type: 'tube', zone: 'outer' },
  { name: 'Tottenham Hale', lines: ['Victoria', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Upminster', lines: ['District'], type: 'tube', zone: 'outer' },
  { name: 'Walthamstow Central', lines: ['Victoria', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Wembley Central', lines: ['Bakerloo', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Wembley Park', lines: ['Jubilee', 'Metropolitan'], type: 'tube', zone: 'outer' },
  { name: 'West Ham', lines: ['District', 'Hammersmith & City', 'Jubilee', 'DLR'], type: 'both', zone: 'outer' },
  { name: 'Whitechapel', lines: ['District', 'Hammersmith & City', 'Overground', 'Elizabeth'], type: 'both', zone: 'outer' },
  { name: 'Willesden Junction', lines: ['Bakerloo', 'Overground'], type: 'both', zone: 'outer' },
  { name: 'Wimbledon', lines: ['District'], type: 'tube', zone: 'outer' },
  { name: 'Wood Green', lines: ['Piccadilly'], type: 'tube', zone: 'outer' },
  { name: 'Woolwich Arsenal', lines: ['Elizabeth', 'DLR'], type: 'both', zone: 'outer' },
];

export const londonStations = stationsData.sort((a, b) => a.name.localeCompare(b.name, 'en'));

export function searchLondonStations(query: string): LondonStation[] {
  if (!query || query.length < 1) return londonStations.slice(0, 20);
  
  const normalizedQuery = query.toLowerCase();
  
  return londonStations
    .filter(station => station.name.toLowerCase().includes(normalizedQuery))
    .slice(0, 20);
}

export function getLondonStationTypeLabel(type: LondonStation['type']): string {
  switch (type) {
    case 'tube': return 'Tube';
    case 'overground': return 'Overground';
    case 'dlr': return 'DLR';
    case 'elizabeth': return 'Elizabeth';
    case 'both': return 'Multiple';
  }
}

export function getLondonStationTypeEmoji(type: LondonStation['type']): string {
  switch (type) {
    case 'tube': return '🚇';
    case 'overground': return '🚆';
    case 'dlr': return '🚈';
    case 'elizabeth': return '🟣';
    case 'both': return '🚇🚆';
  }
}

// Line colors for London Tube
export const londonLineColors: Record<string, string> = {
  'Bakerloo': 'bg-amber-700 text-white',
  'Central': 'bg-red-600 text-white',
  'Circle': 'bg-yellow-400 text-black',
  'District': 'bg-green-600 text-white',
  'Hammersmith & City': 'bg-pink-400 text-black',
  'Jubilee': 'bg-gray-500 text-white',
  'Metropolitan': 'bg-purple-800 text-white',
  'Northern': 'bg-black text-white',
  'Piccadilly': 'bg-blue-700 text-white',
  'Victoria': 'bg-cyan-500 text-white',
  'Waterloo & City': 'bg-teal-400 text-black',
  'DLR': 'bg-teal-500 text-white',
  'Overground': 'bg-orange-500 text-white',
  'Elizabeth': 'bg-purple-500 text-white',
};

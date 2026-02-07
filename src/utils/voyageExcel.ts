import * as XLSX from 'xlsx';
import { VoyageWithTrips } from '@/types/voyage';
import { transportLabels, bookingStatusLabels } from '@/types/trip';

export function generateVoyageExcel(voyage: VoyageWithTrips) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  };

  const voyageName = voyage.name || formatDate(voyage.startDate);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // ===== Sheet 1: Résumé =====
  const summaryData = [
    ['FEUILLE DE VOYAGE'],
    [],
    ['Nom du voyage', voyageName],
    ['Date de début', formatDate(voyage.startDate)],
    ['Date de fin', voyage.endDate ? formatDate(voyage.endDate) : '-'],
    [],
    ['RÉCAPITULATIF'],
    ['Nombre de trajets', voyage.trips.length],
    ['Distance totale (km)', voyage.totalDistanceKm],
    ['Émissions CO₂ (kg)', Math.round(voyage.totalCo2Kg * 100) / 100],
    ['Coût total (€)', Math.round(voyage.totalPrice * 100) / 100],
    [],
    ['Généré le', new Date().toLocaleDateString('fr-FR')],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }];
  
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');

  // ===== Sheet 2: Détail des trajets =====
  const tripsHeader = [
    '#',
    'Date départ',
    'Heure départ',
    'Ville départ',
    'Pays départ',
    'Ville arrivée',
    'Pays arrivée',
    'Heure arrivée',
    'Transport',
    'Compagnie',
    'N° Billet/Vol',
    'N° Place',
    'Distance (km)',
    'CO₂ (kg)',
    'Prix (€)',
    'Statut',
    'Notes',
  ];

  const tripsData = voyage.trips.map((trip, index) => [
    index + 1,
    formatDate(trip.departureDate),
    formatTime(trip.departureTime),
    trip.departureCity,
    trip.departureCountryName,
    trip.arrivalCity,
    trip.arrivalCountryName,
    formatTime(trip.arrivalTime),
    transportLabels[trip.transportType],
    trip.company || '',
    trip.ticketNumber || '',
    trip.seatNumber || '',
    trip.distanceKm,
    Math.round(trip.co2Kg * 100) / 100,
    trip.price || '',
    bookingStatusLabels[trip.bookingStatus] || '',
    trip.notes || '',
  ]);

  // Add totals row
  const totalsRow = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'TOTAL',
    voyage.totalDistanceKm,
    Math.round(voyage.totalCo2Kg * 100) / 100,
    Math.round(voyage.totalPrice * 100) / 100,
    '',
    '',
  ];

  const wsTrips = XLSX.utils.aoa_to_sheet([tripsHeader, ...tripsData, [], totalsRow]);
  
  // Set column widths
  wsTrips['!cols'] = [
    { wch: 5 },   // #
    { wch: 15 },  // Date départ
    { wch: 12 },  // Heure départ
    { wch: 15 },  // Ville départ
    { wch: 15 },  // Pays départ
    { wch: 15 },  // Ville arrivée
    { wch: 15 },  // Pays arrivée
    { wch: 12 },  // Heure arrivée
    { wch: 12 },  // Transport
    { wch: 15 },  // Compagnie
    { wch: 15 },  // N° Billet
    { wch: 10 },  // N° Place
    { wch: 12 },  // Distance
    { wch: 10 },  // CO2
    { wch: 10 },  // Prix
    { wch: 12 },  // Statut
    { wch: 30 },  // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsTrips, 'Détail trajets');

  // ===== Sheet 3: Escales (si présentes) =====
  const tripsWithStopovers = voyage.trips.filter(t => t.via && t.via.length > 0);
  
  if (tripsWithStopovers.length > 0) {
    const stopoversHeader = ['Trajet', 'Départ', 'Escale', 'Pays escale', 'Arrivée'];
    const stopoversData: (string | number)[][] = [];

    tripsWithStopovers.forEach((trip, tripIndex) => {
      trip.via.forEach((stopover, stopIndex) => {
        stopoversData.push([
          tripIndex + 1,
          trip.departureCity,
          stopover.city,
          stopover.countryName,
          trip.arrivalCity,
        ]);
      });
    });

    const wsStopovers = XLSX.utils.aoa_to_sheet([stopoversHeader, ...stopoversData]);
    wsStopovers['!cols'] = [
      { wch: 8 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(wb, wsStopovers, 'Escales');
  }

  // Generate and download file
  const fileName = `voyage-${voyageName.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüç\s-]/gi, '').replace(/\s+/g, '-').toLowerCase()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

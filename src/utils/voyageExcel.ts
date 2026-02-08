import * as XLSX from 'xlsx';
import { VoyageWithTrips } from '@/types/voyage';
import { transportLabels, bookingStatusLabels } from '@/types/trip';
import { supabase } from '@/integrations/supabase/client';

interface InvoiceWithUrl {
  tripId: string;
  fileName: string;
  url: string;
}

async function fetchInvoicesForTrips(tripIds: string[]): Promise<Map<string, InvoiceWithUrl[]>> {
  const invoiceMap = new Map<string, InvoiceWithUrl[]>();
  
  if (tripIds.length === 0) return invoiceMap;

  // Fetch all invoices for these trips
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .in('trip_id', tripIds);

  if (error || !invoices) return invoiceMap;

  // Get signed URLs for each invoice
  for (const invoice of invoices) {
    const { data: urlData } = await supabase.storage
      .from('invoices')
      .createSignedUrl(invoice.file_path, 86400); // 24h validity

    if (urlData?.signedUrl) {
      const existing = invoiceMap.get(invoice.trip_id) || [];
      existing.push({
        tripId: invoice.trip_id,
        fileName: invoice.file_name,
        url: urlData.signedUrl,
      });
      invoiceMap.set(invoice.trip_id, existing);
    }
  }

  return invoiceMap;
}

export async function generateVoyageExcel(voyage: VoyageWithTrips) {
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

  // Fetch invoices for all trips
  const tripIds = voyage.trips.map(t => t.id);
  const invoiceMap = await fetchInvoicesForTrips(tripIds);

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
    [],
    ['Note', 'Les liens de téléchargement des factures sont valides pendant 24h.'],
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
    'Factures',
  ];

  const tripsData = voyage.trips.map((trip, index) => {
    const tripInvoices = invoiceMap.get(trip.id) || [];
    const invoiceInfo = tripInvoices.length > 0 
      ? tripInvoices.map(inv => inv.fileName).join(', ')
      : 'Aucune';

    return [
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
      invoiceInfo,
    ];
  });

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
    { wch: 40 },  // Factures
  ];

  XLSX.utils.book_append_sheet(wb, wsTrips, 'Détail trajets');

  // ===== Sheet 3: Factures =====
  const invoicesHeader = ['#', 'Trajet', 'Date', 'Fichier', 'Lien de téléchargement'];
  const invoicesData: (string | number)[][] = [];

  voyage.trips.forEach((trip, tripIndex) => {
    const tripInvoices = invoiceMap.get(trip.id) || [];
    tripInvoices.forEach((invoice) => {
      invoicesData.push([
        tripIndex + 1,
        `${trip.departureCity} → ${trip.arrivalCity}`,
        formatDate(trip.departureDate),
        invoice.fileName,
        invoice.url,
      ]);
    });
  });

  if (invoicesData.length > 0) {
    const wsInvoices = XLSX.utils.aoa_to_sheet([invoicesHeader, ...invoicesData]);
    wsInvoices['!cols'] = [
      { wch: 5 },   // #
      { wch: 30 },  // Trajet
      { wch: 15 },  // Date
      { wch: 30 },  // Fichier
      { wch: 80 },  // Lien
    ];
    XLSX.utils.book_append_sheet(wb, wsInvoices, 'Factures');
  }

  // ===== Sheet 4: Escales (si présentes) =====
  const tripsWithStopovers = voyage.trips.filter(t => t.via && t.via.length > 0);
  
  if (tripsWithStopovers.length > 0) {
    const stopoversHeader = ['Trajet', 'Départ', 'Escale', 'Pays escale', 'Arrivée'];
    const stopoversData: (string | number)[][] = [];

    tripsWithStopovers.forEach((trip, tripIndex) => {
      trip.via.forEach((stopover) => {
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

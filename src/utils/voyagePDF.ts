import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VoyageWithTrips } from '@/types/voyage';
import { transportLabels, bookingStatusLabels } from '@/types/trip';

export function generateVoyagePDF(voyage: VoyageWithTrips) {
  const doc = new jsPDF();
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '-';
    return timeStr.slice(0, 5);
  };

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Feuille de voyage', 14, 20);

  // Voyage name
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const voyageName = voyage.name || formatDate(voyage.startDate);
  doc.text(voyageName, 14, 30);

  // Dates
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  let dateText = `Du ${formatDate(voyage.startDate)}`;
  if (voyage.endDate && voyage.endDate !== voyage.startDate) {
    dateText += ` au ${formatDate(voyage.endDate)}`;
  }
  doc.text(dateText, 14, 38);

  // Summary box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(14, 44, 182, 25, 3, 3, 'FD');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  // Summary stats
  doc.text('TRAJETS', 30, 52);
  doc.text('DISTANCE', 70, 52);
  doc.text('CO₂', 115, 52);
  doc.text('COÛT TOTAL', 155, 52);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(voyage.trips.length.toString(), 30, 63);
  doc.text(`${voyage.totalDistanceKm.toLocaleString('fr-FR')} km`, 70, 63);
  doc.text(`${voyage.totalCo2Kg.toFixed(1)} kg`, 115, 63);
  doc.text(`${voyage.totalPrice.toFixed(2)} €`, 155, 63);

  // Trips table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Détail des déplacements', 14, 80);

  const tableData = voyage.trips.map((trip, index) => [
    (index + 1).toString(),
    formatDate(trip.departureDate),
    `${trip.departureCity} → ${trip.arrivalCity}`,
    transportLabels[trip.transportType],
    `${trip.distanceKm.toLocaleString('fr-FR')} km`,
    `${trip.co2Kg.toFixed(1)} kg`,
    trip.price ? `${trip.price.toFixed(2)} €` : '-',
    bookingStatusLabels[trip.bookingStatus] || '-',
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['#', 'Date', 'Trajet', 'Transport', 'Distance', 'CO₂', 'Prix', 'Statut']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 25 },
      2: { cellWidth: 50 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 22 },
    },
  });

  // Get final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Trip details section
  if (voyage.trips.some(t => t.notes || t.company || t.ticketNumber || t.seatNumber)) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Informations complémentaires', 14, finalY + 15);

    let detailY = finalY + 25;
    
    voyage.trips.forEach((trip, index) => {
      if (trip.notes || trip.company || trip.ticketNumber || trip.seatNumber) {
        // Check if we need a new page
        if (detailY > 270) {
          doc.addPage();
          detailY = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Trajet ${index + 1}: ${trip.departureCity} → ${trip.arrivalCity}`, 14, detailY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        detailY += 6;

        if (trip.company) {
          doc.text(`Compagnie: ${trip.company}`, 20, detailY);
          detailY += 5;
        }
        if (trip.ticketNumber) {
          doc.text(`N° billet/vol: ${trip.ticketNumber}`, 20, detailY);
          detailY += 5;
        }
        if (trip.seatNumber) {
          doc.text(`N° place: ${trip.seatNumber}`, 20, detailY);
          detailY += 5;
        }
        if (trip.departureTime || trip.arrivalTime) {
          doc.text(`Horaires: ${formatTime(trip.departureTime)} → ${formatTime(trip.arrivalTime)}`, 20, detailY);
          detailY += 5;
        }
        if (trip.notes) {
          const noteLines = doc.splitTextToSize(`Notes: ${trip.notes}`, 170);
          doc.text(noteLines, 20, detailY);
          detailY += noteLines.length * 5;
        }
        
        detailY += 5;
      }
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Généré le ${new Date().toLocaleDateString('fr-FR')} - Page ${i}/${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  // Download
  const fileName = `voyage-${voyageName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
}

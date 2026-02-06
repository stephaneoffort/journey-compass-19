import { useParams, useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { mockTrips } from '@/data/mockTrips';
import { transportEmoji, transportLabels, getFlag } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Route, Leaf, FileText, Upload, Trash2, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const trip = mockTrips.find(t => t.id === id);

  if (!trip) {
    return (
      <PageLayout>
        <div className="page-header safe-top">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="page-title">Trajet introuvable</h1>
        </div>
      </PageLayout>
    );
  }

  const statusLabels = {
    completed: { label: 'Terminé', class: 'bg-transport-train/20 text-transport-train' },
    planned: { label: 'Prévu', class: 'bg-transport-plane/20 text-transport-plane' },
    cancelled: { label: 'Annulé', class: 'bg-destructive/20 text-destructive' },
  };

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      </div>

      <div className="px-5 space-y-6">
        {/* Header */}
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <span className="text-3xl">{transportEmoji[trip.transportType]}</span>
            </div>
            <span className={cn('px-3 py-1 rounded-full text-xs font-medium', statusLabels[trip.status].class)}>
              {statusLabels[trip.status].label}
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-xl font-semibold mb-2">
            <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
            <span>{trip.departureCity}</span>
            <span className="text-muted-foreground">→</span>
            {trip.via.length > 0 && trip.via.map((stop, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="flag-emoji">{getFlag(stop.country)}</span>
                <span className="text-base">{stop.city}</span>
                <span className="text-muted-foreground">→</span>
              </span>
            ))}
            <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
            <span>{trip.arrivalCity}</span>
          </div>
          
          <p className="text-muted-foreground">
            {transportLabels[trip.transportType]} • {trip.departureCountryName} → {trip.arrivalCountryName}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
            <div className="font-semibold">
              {new Date(trip.departureDate).toLocaleDateString('fr-FR', { 
                day: 'numeric',
                month: 'short'
              })}
            </div>
            <div className="text-xs text-muted-foreground">Départ</div>
          </div>
          
          <div className="glass-card p-4 text-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            <Route className="w-5 h-5 mx-auto mb-2 text-transport-train" />
            <div className="font-semibold">{trip.distanceKm.toLocaleString('fr-FR')}</div>
            <div className="text-xs text-muted-foreground">km</div>
          </div>
          
          <div className="glass-card p-4 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
            <Leaf className="w-5 h-5 mx-auto mb-2 text-transport-car" />
            <div className="font-semibold">{trip.co2Kg.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground">kg CO₂</div>
          </div>
        </div>

        {/* Notes */}
        {trip.notes && (
          <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '250ms' }}>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes
            </h3>
            <p className="text-sm text-muted-foreground">{trip.notes}</p>
          </div>
        )}

        {/* Invoices */}
        <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Justificatifs
          </h3>
          
          {trip.invoiceUrls.length > 0 ? (
            <div className="space-y-2">
              {trip.invoiceUrls.map((url, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{url}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">Aucun justificatif</p>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Ajouter un fichier
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '350ms' }}>
          <Button variant="outline" className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

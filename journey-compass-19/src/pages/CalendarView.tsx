import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { useTrips } from '@/hooks/useTrips';
import { transportEmoji, transportLabels, getFlag } from '@/types/trip';
import { ChevronLeft, ChevronRight, Loader2, X, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CalendarView() {
  const { data: trips = [], isLoading } = useTrips();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const tripsByDate = useMemo(() => {
    const map: Record<string, typeof trips> = {};
    trips.forEach(trip => {
      const dateKey = trip.departureDate;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(trip);
    });
    return map;
  }, [trips]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const selectedTrips = selectedDate ? tripsByDate[selectedDate] || [] : [];

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDialogOpen(true);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDate(null);
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const days = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header safe-top">
        <h1 className="page-title">Calendrier</h1>
        <p className="page-subtitle">Vue mensuelle de vos trajets</p>
      </div>

      <div className="px-5">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold capitalize">{monthName}</h2>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrips = tripsByDate[dateStr] || [];
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(dateStr)}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-sm',
                  isSelected && 'bg-primary text-primary-foreground',
                  !isSelected && isToday && 'ring-2 ring-primary/50',
                  !isSelected && dayTrips.length > 0 && 'bg-secondary',
                  !isSelected && dayTrips.length === 0 && 'hover:bg-secondary/50'
                )}
              >
                <span className={cn('font-medium', isToday && !isSelected && 'text-primary')}>
                  {day}
                </span>
                {dayTrips.length > 0 && (
                  <div className="flex gap-0.5">
                    {dayTrips.slice(0, 3).map((trip, i) => (
                      <span 
                        key={i} 
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-primary-foreground' : `bg-transport-${trip.transportType}`
                        )}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trip details popup */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {selectedDate && new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
              })}
            </DialogTitle>
          </DialogHeader>
          
          {selectedTrips.length > 0 ? (
            <div className="space-y-4 mt-2">
              {selectedTrips.map(trip => (
                <div 
                  key={trip.id} 
                  className="p-4 rounded-xl bg-secondary/50 border border-border"
                >
                  {/* Transport type header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{transportEmoji[trip.transportType]}</span>
                    <div>
                      <div className="font-semibold text-foreground">
                        {transportLabels[trip.transportType]}
                      </div>
                      {trip.company && (
                        <div className="text-sm text-muted-foreground">{trip.company}</div>
                      )}
                    </div>
                  </div>

                  {/* Route or location */}
                  {trip.transportType === 'logement' ? (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
                      <span className="font-medium">{trip.departureCity}</span>
                    </div>
                  ) : trip.transportType !== 'frais' && (
                    <div className="flex items-center gap-2 text-sm mb-3 flex-wrap">
                      <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
                      <span className="font-medium">{trip.departureCity}</span>
                      {trip.departureStation && (
                        <span className="text-muted-foreground text-xs">({trip.departureStation})</span>
                      )}
                      <span className="text-muted-foreground">→</span>
                      <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
                      <span className="font-medium">{trip.arrivalCity}</span>
                      {trip.arrivalStation && (
                        <span className="text-muted-foreground text-xs">({trip.arrivalStation})</span>
                      )}
                    </div>
                  )}

                  {/* Dates and times */}
                  <div className="space-y-2 text-sm">
                    {trip.transportType === 'logement' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Arrivée:</span>
                          <span>{new Date(trip.departureDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {trip.returnDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Départ:</span>
                            <span>{new Date(trip.returnDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </>
                    ) : trip.transportType !== 'frais' && (
                      <>
                        {trip.departureTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Départ:</span>
                            <span>{trip.departureTime.slice(0, 5)}</span>
                          </div>
                        )}
                        {trip.arrivalTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Arrivée:</span>
                            <span>{trip.arrivalTime.slice(0, 5)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Distance and CO2 for transport types */}
                  {trip.transportType !== 'logement' && trip.transportType !== 'frais' && trip.distanceKm > 0 && (
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      {trip.distanceKm.toLocaleString('fr-FR')} km • {trip.co2Kg.toFixed(0)} kg CO₂
                    </div>
                  )}

                  {/* Price if available */}
                  {trip.price && (
                    <div className="mt-2 text-sm font-medium text-primary">
                      {trip.price.toLocaleString('fr-FR')} €
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm py-4 text-center">
              Aucun déplacement ce jour
            </p>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

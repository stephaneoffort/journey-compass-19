import { useState, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { mockTrips } from '@/data/mockTrips';
import { transportEmoji, getFlag } from '@/types/trip';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const tripsByDate = useMemo(() => {
    const map: Record<string, typeof mockTrips> = {};
    mockTrips.forEach(trip => {
      const dateKey = trip.departureDate;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(trip);
    });
    return map;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedTrips = selectedDate ? tripsByDate[selectedDate] || [] : [];

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
                onClick={() => setSelectedDate(dateStr)}
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

        {/* Selected date details */}
        {selectedDate && (
          <div className="glass-card p-4 animate-slide-up">
            <h3 className="font-medium mb-3">
              {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            {selectedTrips.length > 0 ? (
              <div className="space-y-3">
                {selectedTrips.map(trip => (
                  <div key={trip.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <span className="text-2xl">{transportEmoji[trip.transportType]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="flag-emoji">{getFlag(trip.departureCountry)}</span>
                        {trip.departureCity}
                        <span className="text-muted-foreground">→</span>
                        <span className="flag-emoji">{getFlag(trip.arrivalCountry)}</span>
                        {trip.arrivalCity}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {trip.distanceKm.toLocaleString('fr-FR')} km • {trip.co2Kg.toFixed(0)} kg CO₂
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Aucun trajet ce jour</p>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

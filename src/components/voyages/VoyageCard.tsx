import { Trip } from '@/types/trip';
import { LegTimeline } from './LegTimeline';
import { StatsRow } from './StatsRow';

interface VoyageCardProps {
  name: string;
  dateLabel: string;
  trips: Trip[];
  totalDistanceKm: number;
  totalCo2Kg: number;
  totalPrice: number;
  onAddTrip: (e: React.MouseEvent) => void;
}

export function VoyageCard({
  name,
  dateLabel,
  trips,
  totalDistanceKm,
  totalCo2Kg,
  totalPrice,
  onAddTrip,
}: VoyageCardProps) {
  const stepCount = trips.length + (trips.length > 0 ? 1 : 0);

  return (
    <article className="rounded-xl border border-border bg-card">
      <header className="flex items-start justify-between p-4 pb-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight truncate">{name}</h2>
          <p className="text-xs mt-0.5 text-muted-foreground">{dateLabel}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-secondary text-secondary-foreground">
            {stepCount} étape{stepCount > 1 ? 's' : ''}
          </span>
          <button
            type="button"
            onClick={onAddTrip}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Ajouter un déplacement"
            title="Ajouter un déplacement"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </header>

      <div className="px-4">
        <LegTimeline trips={trips} />
      </div>

      <StatsRow distanceKm={totalDistanceKm} co2Kg={totalCo2Kg} price={totalPrice} />
    </article>
  );
}

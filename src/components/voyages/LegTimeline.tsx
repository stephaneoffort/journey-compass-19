import { useState } from 'react';
import { Trip } from '@/types/trip';
import { TransportIcon, LegMode } from '@/components/transport/TransportIcon';

interface Leg {
  key: string;
  city: string;
  countryCode: string;
  mode: LegMode;
}

interface LegTimelineProps {
  trips: Trip[];
  maxVisible?: number;
}

function buildLegs(trips: Trip[]): Leg[] {
  if (trips.length === 0) return [];

  const legs: Leg[] = [
    {
      key: 'start',
      city: trips[0].departureCity,
      countryCode: trips[0].departureCountry,
      mode: 'start',
    },
  ];

  trips.forEach((trip) => {
    legs.push({
      key: trip.id,
      city: trip.arrivalCity,
      countryCode: trip.arrivalCountry,
      mode: trip.transportType,
    });
  });

  return legs;
}

export function LegTimeline({ trips, maxVisible = 4 }: LegTimelineProps) {
  const [expanded, setExpanded] = useState(false);
  const legs = buildLegs(trips);

  if (legs.length === 0) return null;

  const shownLegs = expanded ? legs : legs.slice(0, maxVisible);
  const hidden = legs.length - shownLegs.length;

  return (
    <div>
      <ol className="relative">
        {shownLegs.map((leg, i) => (
          <li key={leg.key} className="flex gap-3 relative pb-3 last:pb-1">
            {i < shownLegs.length - 1 && (
              <span className="absolute left-[13px] top-7 bottom-0 w-px bg-border" aria-hidden="true" />
            )}
            <TransportIcon mode={leg.mode} />
            <div className="min-w-0 pt-1">
              <p className="text-sm truncate">
                {leg.city}
                <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                  {leg.countryCode}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
      {hidden > 0 && !expanded && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(true);
          }}
          className="text-xs font-medium mb-2 ml-10 text-muted-foreground hover:underline"
        >
          + {hidden} autre{hidden > 1 ? 's' : ''} étape{hidden > 1 ? 's' : ''}
        </button>
      )}
      {expanded && legs.length > maxVisible && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(false);
          }}
          className="text-xs font-medium mb-2 ml-10 text-muted-foreground hover:underline"
        >
          Réduire
        </button>
      )}
    </div>
  );
}

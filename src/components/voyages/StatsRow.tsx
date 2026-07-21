import { cn } from '@/lib/utils';

interface StatsRowProps {
  distanceKm: number;
  co2Kg: number;
  price?: number;
  co2WarnThresholdKg?: number;
}

export function StatsRow({ distanceKm, co2Kg, price, co2WarnThresholdKg = 1000 }: StatsRowProps) {
  const heavyCo2 = co2Kg > co2WarnThresholdKg;

  return (
    <footer className="flex items-center gap-6 px-4 py-3 mt-1 border-t border-border text-sm">
      <div>
        <span className="font-semibold">{Math.round(distanceKm).toLocaleString('fr-FR')}</span>
        <span className="ml-1 text-xs text-muted-foreground">km</span>
      </div>
      <div>
        <span
          className={cn(
            'font-semibold',
            heavyCo2 ? 'text-[hsl(var(--transport-car))]' : 'text-[hsl(var(--transport-train))]'
          )}
        >
          {co2Kg.toFixed(0)}
        </span>
        <span className="ml-1 text-xs text-muted-foreground">kg CO₂</span>
      </div>
      {!!price && price > 0 && (
        <div className="ml-auto">
          <span className="font-semibold">{price.toFixed(0)}€</span>
          <span className="ml-1 text-xs text-muted-foreground">total</span>
        </div>
      )}
    </footer>
  );
}

import { TripEstimate } from '@/hooks/useTripEstimate';
import { cn } from '@/lib/utils';
import { Clock, Leaf, Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TripEstimateCardProps {
  estimate: TripEstimate | null;
  isLoading: boolean;
  error: string | null;
  onRequestEstimate: () => void;
  canEstimate: boolean;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

export function TripEstimateCard({
  estimate,
  isLoading,
  error,
  onRequestEstimate,
  canEstimate,
}: TripEstimateCardProps) {
  if (isLoading) {
    return (
      <div className="card-flat p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Estimation IA en cours...</span>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-flat p-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
        {canEstimate && (
          <button
            type="button"
            onClick={onRequestEstimate}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Réessayer
          </button>
        )}
      </div>
    );
  }

  if (!estimate && canEstimate) {
    return (
      <div className="card-flat p-4">
        <button
          type="button"
          onClick={onRequestEstimate}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">Estimer avec l'IA</span>
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Obtenez une estimation du temps de trajet et de l'empreinte CO₂
        </p>
      </div>
    );
  }

  if (!estimate) return null;

  const confidenceColors = {
    high: 'text-green-500',
    medium: 'text-yellow-500',
    low: 'text-orange-500',
  };

  const confidenceLabels = {
    high: 'Haute fiabilité',
    medium: 'Fiabilité moyenne',
    low: 'Estimation approximative',
  };

  return (
    <div className="card-flat p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Estimation IA</span>
        </div>
        <span className={cn('text-xs', confidenceColors[estimate.confidence])}>
          {confidenceLabels[estimate.confidence]}
        </span>
      </div>

      {/* Duration */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Durée estimée</span>
        </div>
        <div className="text-right">
          <span className="font-semibold">
            {formatDuration(estimate.estimatedDurationMinutes)}
          </span>
          <p className="text-xs text-muted-foreground">
            {formatDuration(estimate.durationRange.min)} - {formatDuration(estimate.durationRange.max)}
          </p>
        </div>
      </div>

      {/* CO2 */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
        <div className="flex items-center gap-2">
          <Leaf className={cn(
            'w-4 h-4',
            estimate.estimatedCo2Kg < 20 ? 'text-green-500' :
            estimate.estimatedCo2Kg < 100 ? 'text-yellow-500' : 'text-red-500'
          )} />
          <span className="text-sm text-muted-foreground">Empreinte CO₂</span>
        </div>
        <div className="text-right">
          <span className={cn(
            'font-semibold',
            estimate.estimatedCo2Kg < 20 ? 'text-green-500' :
            estimate.estimatedCo2Kg < 100 ? 'text-yellow-500' : 'text-red-500'
          )}>
            {estimate.estimatedCo2Kg.toFixed(1)} kg
          </span>
          <p className="text-xs text-muted-foreground">
            {estimate.co2Comparison}
          </p>
        </div>
      </div>

      {/* Tips */}
      {estimate.tips && estimate.tips.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium">Conseils</span>
          </div>
          <ul className="space-y-1">
            {estimate.tips.map((tip, index) => (
              <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onRequestEstimate}
        className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
      >
        ↻ Recalculer l'estimation
      </button>
    </div>
  );
}

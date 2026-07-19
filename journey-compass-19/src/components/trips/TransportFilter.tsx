import { TransportType, transportEmoji, transportLabels } from '@/types/trip';
import { cn } from '@/lib/utils';

interface TransportFilterProps {
  selected: TransportType | 'all';
  onChange: (type: TransportType | 'all') => void;
}

const transportTypes: (TransportType | 'all')[] = ['all', 'plane', 'train', 'car', 'bus', 'boat', 'metro'];

export function TransportFilter({ selected, onChange }: TransportFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-5 scrollbar-none">
      {transportTypes.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
            selected === type
              ? type === 'all'
                ? 'bg-primary text-primary-foreground'
                : `transport-${type} ring-2 ring-current`
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          {type === 'all' ? '🌍' : transportEmoji[type]}
          <span>{type === 'all' ? 'Tous' : transportLabels[type]}</span>
        </button>
      ))}
    </div>
  );
}

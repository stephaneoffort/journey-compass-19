import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getBusStationsForCity, BusStation, getBusStationTypeEmoji } from '@/data/frenchBusStations';

interface BusStationSelectProps {
  cityName: string;
  countryCode: string;
  value: string | null;
  onChange: (stationName: string | null) => void;
  label: string;
}

export function BusStationSelect({ cityName, countryCode, value, onChange, label }: BusStationSelectProps) {
  const [stations, setStations] = useState<BusStation[]>([]);

  useEffect(() => {
    // Only show stations for French cities
    if (countryCode === 'FR' && cityName) {
      const cityStations = getBusStationsForCity(cityName);
      setStations(cityStations);
      
      // Auto-select if only one station
      if (cityStations.length === 1 && !value) {
        onChange(cityStations[0].name);
      }
      // Clear selection if city changed and current value not in new stations
      else if (value && !cityStations.find(s => s.name === value)) {
        onChange(null);
      }
    } else {
      setStations([]);
      onChange(null);
    }
  }, [cityName, countryCode]);

  // Don't show if not France or no stations available
  if (countryCode !== 'FR' || stations.length === 0) {
    return null;
  }

  // Don't show selector if only one station (auto-selected)
  if (stations.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
        <span>🚏</span>
        <span>{stations[0].name}</span>
        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
          {getBusStationTypeEmoji(stations[0].type)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <Select value={value || ''} onValueChange={(val) => onChange(val || null)}>
        <SelectTrigger className="input-glass">
          <SelectValue placeholder="Sélectionner une gare routière..." />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {stations.map((station) => (
            <SelectItem key={station.name} value={station.name}>
              <div className="flex items-center gap-2">
                <span>{getBusStationTypeEmoji(station.type)}</span>
                <span>{station.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

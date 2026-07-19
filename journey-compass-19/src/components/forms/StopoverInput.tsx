import { Location, getFlag } from '@/types/trip';
import { CityAutocomplete } from './CityAutocomplete';
import { CityData } from '@/data/cityCoordinates';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface StopoverInputProps {
  stopovers: Location[];
  onChange: (stopovers: Location[]) => void;
}

export function StopoverInput({ stopovers, onChange }: StopoverInputProps) {
  const addStopover = () => {
    onChange([...stopovers, { city: '', country: '', countryName: '' }]);
  };

  const removeStopover = (index: number) => {
    onChange(stopovers.filter((_, i) => i !== index));
  };

  const updateStopover = (index: number, city: CityData | null) => {
    if (!city) return;
    const updated = [...stopovers];
    updated[index] = {
      city: city.city,
      country: city.country,
      countryName: city.countryName,
      lat: city.lat,
      lng: city.lng,
    };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted-foreground">Escales</label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addStopover}
          className="text-primary hover:text-primary/80 h-8"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter une escale
        </Button>
      </div>

      {stopovers.length > 0 && (
        <div className="space-y-2">
          {stopovers.map((stopover, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <CityAutocomplete
                  value={stopover.city ? { 
                    city: stopover.city, 
                    country: stopover.country, 
                    countryName: stopover.countryName,
                    lat: stopover.lat,
                    lng: stopover.lng,
                  } : null}
                  onChange={(city) => updateStopover(index, city)}
                  placeholder={`Escale ${index + 1}`}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStopover(index)}
                className="text-muted-foreground hover:text-destructive h-10 w-10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {stopovers.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground pl-2">
          <span>Itinéraire :</span>
          {stopovers.filter(s => s.city).map((stop, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>→</span>}
              <span className="flag-emoji">{getFlag(stop.country)}</span>
              <span>{stop.city}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { searchCities, CityData } from '@/data/cityCoordinates';
import { getFlag } from '@/types/trip';
import { MapPin, Loader2 } from 'lucide-react';
import { useCustomCities } from '@/hooks/useGeocodeCity';
import { useSearchCity } from '@/hooks/useSearchCity';

interface CityAutocompleteProps {
  value: CityData | null;
  onChange: (city: CityData | null) => void;
  placeholder?: string;
}

export function CityAutocomplete({ value, onChange, placeholder = 'Rechercher une ville...' }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value?.city || '');
  const [localSuggestions, setLocalSuggestions] = useState<CityData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [shouldSearchOnline, setShouldSearchOnline] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: customCities = [] } = useCustomCities();
  
  // Online search - triggered when no local results found
  const { data: onlineResults = [], isLoading: isSearchingOnline } = useSearchCity(
    query,
    shouldSearchOnline && localSuggestions.length === 0
  );

  // Combine local and online results
  const suggestions = localSuggestions.length > 0 ? localSuggestions : onlineResults;

  useEffect(() => {
    if (value) {
      setQuery(value.city);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);
      
      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    const updateRect = () => {
      const el = inputRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setDropdownRect({
        top: r.bottom + 4,
        left: r.left,
        width: r.width,
      });
    };

    if (isOpen) {
      updateRect();
      window.addEventListener('scroll', updateRect, true);
      window.addEventListener('resize', updateRect);
      return () => {
        window.removeEventListener('scroll', updateRect, true);
        window.removeEventListener('resize', updateRect);
      };
    }

    return;
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setFocusedIndex(-1);
    setShouldSearchOnline(false);
    
    if (newQuery.length >= 2) {
      // Search in static cities
      const staticResults = searchCities(newQuery);
      
      // Search in custom cities
      const normalizedQuery = newQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const customResults = customCities.filter(city => {
        const normalizedCity = city.city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedCountry = city.countryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalizedCity.includes(normalizedQuery) || normalizedCountry.includes(normalizedQuery);
      });

      // Merge results, avoiding duplicates
      const allResults = [...staticResults];
      for (const custom of customResults) {
        if (!allResults.some(r => r.city === custom.city && r.country === custom.country)) {
          allResults.push(custom);
        }
      }

      setLocalSuggestions(allResults.slice(0, 10));
      setIsOpen(true);
      
      // If no local results and query is long enough, trigger online search
      if (allResults.length === 0 && newQuery.length >= 3) {
        setShouldSearchOnline(true);
      }
    } else {
      setLocalSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (city: CityData) => {
    setQuery(city.city);
    onChange(city);
    setIsOpen(false);
    setLocalSuggestions([]);
    setShouldSearchOnline(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && suggestions[focusedIndex]) {
          handleSelect(suggestions[focusedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const showLoading = isSearchingOnline && localSuggestions.length === 0;
  const showNoResults = !showLoading && suggestions.length === 0 && query.length >= 3 && isOpen;

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-[250]' : ''}`}> 
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="input-glass pl-10 pr-10"
        />
        {showLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        )}
        {!showLoading && value?.country && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flag-emoji">
            {getFlag(value.country)}
          </span>
        )}
      </div>

      {(() => {
        if (!dropdownRect || !isOpen) return null;
        if (!showLoading && suggestions.length === 0 && !showNoResults) return null;

        const baseClass = "bg-popover border border-border rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto";
        const style: CSSProperties = {
          position: 'fixed',
          top: dropdownRect.top,
          left: dropdownRect.left,
          width: dropdownRect.width,
          zIndex: 2000,
        };

        const content = (
          <div ref={dropdownRef} style={style} className={`${baseClass} animate-fade-in`}>
            {showLoading && (
              <div className="p-4 flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Recherche en ligne...</span>
              </div>
            )}

            {!showLoading && suggestions.length > 0 && (
              <>
                {localSuggestions.length === 0 && onlineResults.length > 0 && (
                  <div className="px-4 py-2 text-xs text-primary border-b border-border bg-primary/5">
                    🌍 Résultats trouvés en ligne (enregistrés automatiquement)
                  </div>
                )}
                {suggestions.map((city, index) => (
                  <div
                    key={`${city.city}-${city.country}`}
                    onClick={() => handleSelect(city)}
                    className={`city-option ${focusedIndex === index ? 'bg-accent' : ''}`}
                  >
                    <span className="flag-emoji">{getFlag(city.country)}</span>
                    <div className="flex-1">
                      <div className="font-medium">{city.city}</div>
                      <div className="text-xs text-muted-foreground">{city.countryName}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {showNoResults && (
              <div className="p-4 text-sm text-muted-foreground">
                Aucune ville trouvée pour "{query}"
              </div>
            )}
          </div>
        );

        return createPortal(content, document.body);
      })()}
    </div>
  );
}

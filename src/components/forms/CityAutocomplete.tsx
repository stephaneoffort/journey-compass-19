import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { searchCities, CityData } from '@/data/cities';
import { getFlag } from '@/types/trip';
import { MapPin } from 'lucide-react';

interface CityAutocompleteProps {
  value: CityData | null;
  onChange: (city: CityData | null) => void;
  placeholder?: string;
}

export function CityAutocomplete({ value, onChange, placeholder = 'Rechercher une ville...' }: CityAutocompleteProps) {
  const [query, setQuery] = useState(value?.city || '');
  const [suggestions, setSuggestions] = useState<CityData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.city);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setFocusedIndex(-1);
    
    if (newQuery.length >= 2) {
      const results = searchCities(newQuery);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    // Allow free text input
    if (newQuery && !value) {
      onChange({ city: newQuery, country: '', countryName: '' });
    }
  };

  const handleSelect = (city: CityData) => {
    setQuery(city.city);
    onChange(city);
    setIsOpen(false);
    setSuggestions([]);
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

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="input-glass pl-10"
        />
        {value?.country && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 flag-emoji">
            {getFlag(value.country)}
          </span>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="city-autocomplete animate-fade-in">
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
        </div>
      )}
    </div>
  );
}

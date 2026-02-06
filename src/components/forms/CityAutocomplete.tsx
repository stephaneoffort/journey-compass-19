import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchCities, CityData, europeanCountries, isCityKnown } from '@/data/cityCoordinates';
import { getFlag } from '@/types/trip';
import { MapPin, Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
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
        setShowAddCity(false);
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
      setIsOpen(true);
      
      // If no results found and query is long enough, show add city option
      if (results.length === 0 && newQuery.length >= 3) {
        setNewCityName(newQuery);
      }
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (city: CityData) => {
    setQuery(city.city);
    onChange(city);
    setIsOpen(false);
    setSuggestions([]);
    setShowAddCity(false);
  };

  const handleAddCustomCity = () => {
    if (newCityName && selectedCountry) {
      const country = europeanCountries.find(c => c.code === selectedCountry);
      if (country) {
        const customCity: CityData = {
          city: newCityName,
          country: country.code,
          countryName: country.name,
          // No coordinates for custom cities
        };
        handleSelect(customCity);
        setShowAddCity(false);
        setNewCityName('');
        setSelectedCountry('');
      }
    }
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
        setShowAddCity(false);
        break;
    }
  };

  const noResultsFound = isOpen && suggestions.length === 0 && query.length >= 3;

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

      {/* No results - show add city option */}
      {noResultsFound && !showAddCity && (
        <div className="city-autocomplete animate-fade-in p-3">
          <p className="text-sm text-muted-foreground mb-2">
            Aucune ville trouvée pour "{query}"
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAddCity(true);
              setNewCityName(query);
            }}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter cette ville
          </Button>
        </div>
      )}

      {/* Add custom city form */}
      {showAddCity && (
        <div className="city-autocomplete animate-fade-in p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Ajouter une ville</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAddCity(false)}
              className="h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <Input
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
            placeholder="Nom de la ville"
            className="input-glass"
          />
          
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="input-glass">
              <SelectValue placeholder="Choisir un pays" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-60">
              {europeanCountries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span className="flag-emoji">{getFlag(country.code)}</span>
                    {country.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            type="button"
            onClick={handleAddCustomCity}
            disabled={!newCityName || !selectedCountry}
            className="w-full btn-primary"
          >
            Ajouter
          </Button>
          
          <p className="text-xs text-muted-foreground">
            ⚠️ La distance ne sera pas calculée automatiquement pour les villes personnalisées
          </p>
        </div>
      )}
    </div>
  );
}

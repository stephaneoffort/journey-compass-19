import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchCities, CityData, europeanCountries } from '@/data/cityCoordinates';
import { getFlag } from '@/types/trip';
import { MapPin, Plus, X, Loader2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGeocodeCity, useCustomCities } from '@/hooks/useGeocodeCity';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const geocodeCity = useGeocodeCity();
  const { data: customCities = [] } = useCustomCities();

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
      // Search in both static cities and custom cities
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

      setSuggestions(allResults.slice(0, 10));
      setIsOpen(true);
      
      // If no results found and query is long enough, show add city option
      if (allResults.length === 0 && newQuery.length >= 3) {
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

  const handleAddCustomCity = async () => {
    if (!newCityName || !selectedCountry) return;

    const country = europeanCountries.find(c => c.code === selectedCountry);
    if (!country) return;

    try {
      const geocodedCity = await geocodeCity.mutateAsync({
        city: newCityName,
        country: country.code,
        countryName: country.name,
      });

      toast({
        title: 'Ville trouvée ! 🎉',
        description: `${geocodedCity.city}, ${geocodedCity.countryName} a été ajoutée.`,
      });

      handleSelect(geocodedCity);
      setShowAddCity(false);
      setNewCityName('');
      setSelectedCountry('');
    } catch (error) {
      toast({
        title: 'Ville non trouvée',
        description: 'Impossible de trouver les coordonnées de cette ville. Vérifiez l\'orthographe.',
        variant: 'destructive',
      });
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
            <Search className="w-4 h-4 mr-2" />
            Rechercher en ligne
          </Button>
        </div>
      )}

      {/* Add custom city form */}
      {showAddCity && (
        <div className="city-autocomplete animate-fade-in p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Rechercher une ville</span>
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
            disabled={!newCityName || !selectedCountry || geocodeCity.isPending}
            className="w-full btn-primary"
          >
            {geocodeCity.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Recherche...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Rechercher et ajouter
              </>
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            🌍 La ville sera recherchée via OpenStreetMap et sauvegardée pour un usage futur.
          </p>
        </div>
      )}
    </div>
  );
}

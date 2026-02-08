import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { parisStations, searchStations, Station, getStationTypeEmoji } from '@/data/parisStations';
import { londonStations, searchLondonStations, LondonStation, getLondonStationTypeEmoji, londonLineColors } from '@/data/londonStations';

type MetroCity = 'paris' | 'london';

interface MetroStationSelectProps {
  city: MetroCity;
  value: string | null;
  onChange: (stationName: string | null) => void;
  label: string;
  placeholder?: string;
}

// Paris metro line colors
const parisLineColors: Record<string, string> = {
  '1': 'bg-yellow-400 text-black',
  '2': 'bg-blue-600 text-white',
  '3': 'bg-yellow-600 text-black',
  '3bis': 'bg-cyan-400 text-black',
  '4': 'bg-purple-600 text-white',
  '5': 'bg-orange-500 text-white',
  '6': 'bg-green-400 text-black',
  '7': 'bg-pink-400 text-black',
  '7bis': 'bg-green-300 text-black',
  '8': 'bg-purple-400 text-black',
  '9': 'bg-yellow-300 text-black',
  '10': 'bg-amber-600 text-white',
  '11': 'bg-amber-800 text-white',
  '12': 'bg-green-600 text-white',
  '13': 'bg-cyan-300 text-black',
  '14': 'bg-purple-800 text-white',
  'A': 'bg-red-600 text-white',
  'B': 'bg-blue-500 text-white',
  'C': 'bg-yellow-500 text-black',
  'D': 'bg-green-500 text-white',
  'E': 'bg-pink-600 text-white',
};

export function MetroStationSelect({ city, value, onChange, label, placeholder }: MetroStationSelectProps) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState<(Station | LondonStation)[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value);
    } else {
      setQuery('');
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
    
    const results = city === 'paris' 
      ? searchStations(newQuery)
      : searchLondonStations(newQuery);
    setSuggestions(results);
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (suggestions.length === 0) {
      const results = city === 'paris' 
        ? searchStations('')
        : searchLondonStations('');
      setSuggestions(results);
    }
    setIsOpen(true);
  };

  const handleSelect = (station: Station | LondonStation) => {
    setQuery(station.name);
    onChange(station.name);
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

  const getLinesBadges = (lines: string[]) => {
    const colors = city === 'paris' ? parisLineColors : londonLineColors;
    
    return lines.slice(0, 5).map(line => (
      <span 
        key={line} 
        className={`inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-bold ${colors[line] || 'bg-gray-500 text-white'}`}
      >
        {line.length > 3 ? line.substring(0, 3) : line}
      </span>
    ));
  };

  const getStationEmoji = (station: Station | LondonStation) => {
    if (city === 'paris') {
      return getStationTypeEmoji((station as Station).type);
    }
    return getLondonStationTypeEmoji((station as LondonStation).type);
  };

  const getZoneLabel = (station: Station | LondonStation) => {
    if (city === 'paris') {
      return (station as Station).zone === 'intramuros' ? 'Paris' : 'Île-de-France';
    }
    return (station as LondonStation).zone === 'central' ? 'Central' : 'Outer London';
  };

  const defaultPlaceholder = city === 'paris' 
    ? 'Rechercher une station...' 
    : 'Search for a station...';

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <div ref={containerRef} className={`relative ${isOpen ? 'z-[250]' : ''}`}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder || defaultPlaceholder}
            className="input-glass pl-10 pr-10"
          />
          {value && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {city === 'paris' ? '🚇' : '🚇'}
            </span>
          )}
        </div>

        {(() => {
          if (!dropdownRect || !isOpen || suggestions.length === 0) return null;

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
              {suggestions.map((station, index) => (
                <div
                  key={station.name}
                  onClick={() => handleSelect(station)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent ${focusedIndex === index ? 'bg-accent' : ''}`}
                >
                  <span>{getStationEmoji(station)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{station.name}</div>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      {getLinesBadges(station.lines)}
                      <span className="text-xs text-muted-foreground ml-2">
                        {getZoneLabel(station)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );

          return createPortal(content, document.body);
        })()}
      </div>
    </div>
  );
}

// Helper to check if a city supports metro stations
export function isCityWithMetro(cityName: string, countryCode: string): MetroCity | null {
  const normalizedCity = cityName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normalizedCountry = countryCode?.toUpperCase() || '';
  
  // Paris and Île-de-France
  if (normalizedCountry === 'FR' || normalizedCountry === 'FRA') {
    const parisAreas = ['paris', 'ile-de-france', 'ile de france', 'idf'];
    if (parisAreas.some(area => normalizedCity.includes(area)) || normalizedCity === 'paris') {
      return 'paris';
    }
  }
  
  // London
  if (normalizedCountry === 'GB' || normalizedCountry === 'UK' || normalizedCountry === 'GBR') {
    const londonAreas = ['london', 'londres'];
    if (londonAreas.some(area => normalizedCity.includes(area))) {
      return 'london';
    }
  }
  
  return null;
}

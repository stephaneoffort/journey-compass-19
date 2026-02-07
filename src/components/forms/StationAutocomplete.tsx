import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '@/components/ui/input';
import { searchStations, Station, getStationTypeEmoji } from '@/data/parisStations';
import { MapPin } from 'lucide-react';

interface StationAutocompleteProps {
  value: Station | null;
  onChange: (station: Station | null) => void;
  placeholder?: string;
}

export function StationAutocomplete({ value, onChange, placeholder = 'Rechercher une station...' }: StationAutocompleteProps) {
  const [query, setQuery] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.name);
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
    
    const results = searchStations(newQuery);
    setSuggestions(results);
    setIsOpen(true);
  };

  const handleFocus = () => {
    if (suggestions.length === 0) {
      const results = searchStations('');
      setSuggestions(results);
    }
    setIsOpen(true);
  };

  const handleSelect = (station: Station) => {
    setQuery(station.name);
    onChange(station);
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
    return lines.map(line => {
      // Colors for metro lines
      const lineColors: Record<string, string> = {
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
      
      return (
        <span 
          key={line} 
          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${lineColors[line] || 'bg-gray-500 text-white'}`}
        >
          {line}
        </span>
      );
    });
  };

  return (
    <div ref={containerRef} className={`relative ${isOpen ? 'z-[250]' : ''}`}> 
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="input-glass pl-10 pr-10"
        />
        {value && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {getStationTypeEmoji(value.type)}
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
                <span>{getStationTypeEmoji(station.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{station.name}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {getLinesBadges(station.lines)}
                    <span className="text-xs text-muted-foreground ml-2">
                      {station.zone === 'intramuros' ? 'Paris' : 'Île-de-France'}
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
  );
}

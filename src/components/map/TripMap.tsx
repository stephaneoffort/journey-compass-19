import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trip, getFlag, transportEmoji } from '@/types/trip';
import { getCityCoordinates } from '@/data/cityCoordinates';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CityData {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface TripMapProps {
  trips: Trip[];
  customCities?: { city: string; country: string; lat: number; lng: number }[];
}

function createNumberedIcon(num: number, isFirst: boolean, isLast: boolean) {
  const bg = isFirst ? '#22c55e' : isLast ? '#ef4444' : 'hsl(var(--primary))';
  return L.divIcon({
    className: 'custom-numbered-marker',
    html: `<div style="
      background: ${bg};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
    }
  }, [points, map]);
  return null;
}

function resolveCoords(city: string, country: string, customCities?: TripMapProps['customCities']): { lat: number; lng: number } | null {
  const known = getCityCoordinates(city, country);
  if (known) return known;
  const custom = customCities?.find(c => c.city.toLowerCase() === city.toLowerCase() && c.country === country);
  if (custom) return { lat: custom.lat, lng: custom.lng };
  return null;
}

export function TripMap({ trips, customCities }: TripMapProps) {
  // Sort trips chronologically
  const sortedTrips = useMemo(() =>
    [...trips]
      .filter(t => t.transportType !== 'logement' && t.transportType !== 'frais')
      .sort((a, b) => a.departureDate.localeCompare(b.departureDate) || (a.departureTime || '').localeCompare(b.departureTime || '')),
    [trips]
  );

  // Build ordered waypoints with coordinates
  const waypoints = useMemo(() => {
    const result: { num: number; city: string; country: string; lat: number; lng: number; trip: Trip }[] = [];
    let num = 1;

    for (const trip of sortedTrips) {
      const depCoords = resolveCoords(trip.departureCity, trip.departureCountry, customCities);
      if (depCoords) {
        // Avoid duplicate consecutive points
        const last = result[result.length - 1];
        if (!last || last.city !== trip.departureCity || last.country !== trip.departureCountry) {
          result.push({ num: num++, city: trip.departureCity, country: trip.departureCountry, ...depCoords, trip });
        }
      }

      // Stopovers
      for (const stop of trip.via || []) {
        const stopCoords = resolveCoords(stop.city, stop.country, customCities);
        if (stopCoords) {
          result.push({ num: num++, city: stop.city, country: stop.country, ...stopCoords, trip });
        }
      }

      const arrCoords = resolveCoords(trip.arrivalCity, trip.arrivalCountry, customCities);
      if (arrCoords) {
        result.push({ num: num++, city: trip.arrivalCity, country: trip.arrivalCountry, ...arrCoords, trip });
      }
    }

    return result;
  }, [sortedTrips, customCities]);

  // Build polyline segments
  const polylinePoints = useMemo(() =>
    waypoints.map(w => [w.lat, w.lng] as [number, number]),
    [waypoints]
  );

  if (waypoints.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-muted-foreground">
        <p>Aucun lieu avec coordonnées trouvé pour afficher la carte.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden rounded-xl" style={{ height: '450px' }}>
      <MapContainer
        center={[waypoints[0].lat, waypoints[0].lng]}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={polylinePoints} />

        {/* Route line */}
        <Polyline
          positions={polylinePoints}
          pathOptions={{ color: 'hsl(221, 83%, 53%)', weight: 3, opacity: 0.6, dashArray: '8 4' }}
        />

        {/* Numbered markers */}
        {waypoints.map((wp, i) => (
          <Marker
            key={`${wp.num}-${wp.city}`}
            position={[wp.lat, wp.lng]}
            icon={createNumberedIcon(wp.num, i === 0, i === waypoints.length - 1)}
          >
            <Popup>
              <div style={{ minWidth: 140 }}>
                <strong>{getFlag(wp.country)} {wp.city}</strong>
                <br />
                <span style={{ fontSize: 12 }}>
                  {transportEmoji[wp.trip.transportType]} {format(new Date(wp.trip.departureDate), 'dd MMM yyyy', { locale: fr })}
                </span>
                <br />
                <span style={{ fontSize: 11, color: '#888' }}>Étape n°{wp.num}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

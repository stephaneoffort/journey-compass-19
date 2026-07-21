import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { setViewportWidth } from "@/test/setup";

// Mock leaflet + react-leaflet so we can render without a real DOM map.
vi.mock("leaflet", () => ({
  default: {
    divIcon: (opts: any) => opts,
    latLngBounds: (pts: any[]) => ({ pts }),
    latLng: (a: number, b: number) => [a, b],
  },
}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, style }: any) => (
    <div data-testid="map-container" style={style}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: any) => (
    <div data-testid="marker" data-pos={position.join(",")}>{children}</div>
  ),
  Polyline: ({ positions }: any) => (
    <div data-testid="polyline" data-count={positions.length} />
  ),
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ fitBounds: () => {} }),
}));

vi.mock("@/data/cityCoordinates", () => ({
  getCityCoordinates: (city: string) => {
    const map: Record<string, { lat: number; lng: number }> = {
      Paris: { lat: 48.85, lng: 2.35 },
      Lyon: { lat: 45.75, lng: 4.85 },
      Rome: { lat: 41.9, lng: 12.5 },
    };
    return map[city] || null;
  },
}));

import { TripMap } from "./TripMap";

const trips: any[] = [
  {
    id: "t1",
    transportType: "train",
    departureDate: "2026-07-10",
    departureTime: "08:00",
    departureCity: "Paris",
    departureCountry: "FR",
    arrivalCity: "Lyon",
    arrivalCountry: "FR",
    via: [],
  },
  {
    id: "t2",
    transportType: "plane",
    departureDate: "2026-07-11",
    departureTime: "09:00",
    departureCity: "Lyon",
    departureCountry: "FR",
    arrivalCity: "Rome",
    arrivalCountry: "IT",
    via: [],
  },
];

describe("TripMap Leaflet rendering", () => {
  beforeEach(() => setViewportWidth(1440));

  it.each([390, 768, 1440])("renders the map with markers at %ipx", (w) => {
    setViewportWidth(w);
    render(<TripMap trips={trips} />);
    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    // Paris -> Lyon (dedup) -> Rome = 3 markers
    expect(screen.getAllByTestId("marker")).toHaveLength(3);
    expect(screen.getByTestId("polyline").getAttribute("data-count")).toBe("3");
  });

  it("shows empty state when no coordinates resolve", () => {
    render(<TripMap trips={[{ ...trips[0], departureCity: "Nowhere", arrivalCity: "Void", arrivalCountry: "ZZ", departureCountry: "ZZ" }]} />);
    expect(screen.getByText(/Aucun lieu avec coordonnées/i)).toBeInTheDocument();
  });
});

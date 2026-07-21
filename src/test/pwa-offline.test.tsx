import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, render, screen, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Tests du comportement hors-ligne des écrans et du cache des données essentielles.
 *
 * Objectif : garantir que lorsque le réseau tombe (navigator.onLine = false ou
 * requêtes Supabase en échec), l'utilisateur continue de voir ses données
 * grâce au cache React Query (qui double le cache Workbox NetworkFirst du SW).
 */

// --- Mocks -----------------------------------------------------------------
const mockFrom = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "user-offline-1" } }),
}));

// Import APRÈS les mocks
import { useTrips, useCreateTrip } from "@/hooks/useTrips";

// --- Helpers ---------------------------------------------------------------
function setOnline(value: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value,
  });
  window.dispatchEvent(new Event(value ? "online" : "offline"));
}

function makeClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

function buildQueryChain(result: { data?: any; error?: any }) {
  const chain: any = {
    select: vi.fn(() => chain),
    order: vi.fn(() => Promise.resolve(result)),
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => chain),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return chain;
}

const sampleRow = {
  id: "trip-1",
  voyage_id: null,
  departure_city: "Paris",
  departure_country: "FR",
  departure_country_name: "France",
  arrival_city: "Lyon",
  arrival_country: "FR",
  arrival_country_name: "France",
  via: [],
  departure_date: "2026-08-01",
  departure_time: "08:00",
  return_date: null,
  arrival_time: "10:00",
  transport_type: "train",
  company: "SNCF",
  car_type: null,
  accommodation_type: null,
  ticket_number: null,
  seat_number: null,
  booking_status: "confirme",
  price: "80",
  distance_km: 465,
  co2_kg: "12.5",
  status: "planned",
  notes: null,
  departure_station: null,
  arrival_station: null,
  toll_expense: null,
  parking_expense: null,
  other_expense: null,
  created_at: "2026-07-01",
  updated_at: "2026-07-01",
};

// --- Tests -----------------------------------------------------------------
describe("PWA — comportement hors-ligne des écrans et cache des données", () => {
  beforeEach(() => {
    mockFrom.mockReset();
    setOnline(true);
  });

  afterEach(() => {
    setOnline(true);
  });

  it("détecte les événements online/offline émis par le navigateur", () => {
    const offlineHandler = vi.fn();
    const onlineHandler = vi.fn();
    window.addEventListener("offline", offlineHandler);
    window.addEventListener("online", onlineHandler);

    setOnline(false);
    expect(navigator.onLine).toBe(false);
    expect(offlineHandler).toHaveBeenCalledTimes(1);

    setOnline(true);
    expect(navigator.onLine).toBe(true);
    expect(onlineHandler).toHaveBeenCalledTimes(1);

    window.removeEventListener("offline", offlineHandler);
    window.removeEventListener("online", onlineHandler);
  });

  it("useTrips sert les trajets depuis le cache React Query quand on passe offline", async () => {
    const client = makeClient();

    // 1) Premier fetch online — réussi
    mockFrom.mockReturnValueOnce(buildQueryChain({ data: [sampleRow], error: null }));
    const { result, rerender } = renderHook(() => useTrips(), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].departureCity).toBe("Paris");

    // 2) Passage offline — les requêtes Supabase échouent
    setOnline(false);
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: new Error("Network Error") }));

    // 3) Nouveau montage (ex: navigation entre écrans en offline) : les données
    // restent lisibles depuis le cache, sans casser l'écran.
    rerender();
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.[0].arrivalCity).toBe("Lyon");
  });

  it("un nouvel écran monté hors-ligne récupère instantanément les données depuis le cache partagé", async () => {
    const client = makeClient();

    // Seed du cache avec un premier écran en ligne
    mockFrom.mockReturnValueOnce(buildQueryChain({ data: [sampleRow], error: null }));
    const first = renderHook(() => useTrips(), { wrapper: wrapper(client) });
    await waitFor(() => expect(first.result.current.isSuccess).toBe(true));

    // Passage offline
    setOnline(false);
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: new Error("offline") }));

    // Un tout nouveau composant/écran monte : il doit voir immédiatement la donnée cachée
    const second = renderHook(() => useTrips(), { wrapper: wrapper(client) });
    expect(second.result.current.data).toBeDefined();
    expect(second.result.current.data?.[0].id).toBe("trip-1");
  });

  it("une mutation de création remonte une erreur claire lorsque l'utilisateur est offline", async () => {
    const client = makeClient();
    setOnline(false);
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: new Error("Failed to fetch") }));

    const { result } = renderHook(() => useCreateTrip(), { wrapper: wrapper(client) });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          departureCity: "Paris",
          departureCountry: "FR",
          departureCountryName: "France",
          arrivalCity: "Lyon",
          arrivalCountry: "FR",
          arrivalCountryName: "France",
          via: [],
          departureDate: "2026-08-01",
          transportType: "train" as any,
          distanceKm: 465,
        });
      } catch {
        /* attendu */
      }
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error)?.message).toMatch(/fetch|offline|network/i);
  });

  it("un écran de liste affiche les données mises en cache même quand le réseau est coupé", async () => {
    const client = makeClient();

    // Pré-remplit le cache comme si l'utilisateur avait déjà chargé la page une fois
    client.setQueryData(["trips", "user-offline-1"], [
      {
        id: "trip-cached",
        departureCity: "Marseille",
        arrivalCity: "Nice",
        transportType: "train",
      },
    ]);

    setOnline(false);
    mockFrom.mockReturnValue(buildQueryChain({ data: null, error: new Error("offline") }));

    function OfflineTripsList() {
      const { data } = useTrips();
      if (!data?.length) return <p>Aucun trajet</p>;
      return (
        <ul>
          {data.map((t: any) => (
            <li key={t.id}>
              {t.departureCity} → {t.arrivalCity}
            </li>
          ))}
        </ul>
      );
    }

    render(
      <QueryClientProvider client={client}>
        <OfflineTripsList />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Marseille → Nice")).toBeInTheDocument();
    expect(screen.queryByText("Aucun trajet")).not.toBeInTheDocument();
  });
});

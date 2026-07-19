export interface Voyage {
  id: string;
  userId: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed from trips
  trips?: import('./trip').Trip[];
  totalDistanceKm?: number;
  totalCo2Kg?: number;
  totalPrice?: number;
  startDate?: string;
  endDate?: string;
}

export interface VoyageInsert {
  name?: string;
}

export interface VoyageWithTrips extends Voyage {
  trips: import('./trip').Trip[];
}

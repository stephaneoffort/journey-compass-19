// Haversine formula to calculate distance between two points on Earth
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(R * c);
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate total route distance including stopovers
export function calculateRouteDistance(
  points: Array<{ lat: number; lng: number } | null>
): number | null {
  const validPoints = points.filter((p): p is { lat: number; lng: number } => p !== null);
  
  if (validPoints.length < 2) return null;
  
  let totalDistance = 0;
  for (let i = 0; i < validPoints.length - 1; i++) {
    totalDistance += calculateDistance(
      validPoints[i].lat,
      validPoints[i].lng,
      validPoints[i + 1].lat,
      validPoints[i + 1].lng
    );
  }
  
  return totalDistance;
}

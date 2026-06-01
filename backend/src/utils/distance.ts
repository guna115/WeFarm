/**
 * Calculate distance between two points using the Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Interface for post coordinates
 */
interface Coordinate {
  id: string;
  latitude: number;
  longitude: number;
}

/**
 * Get road distances using OSRM Table API for an array of posts.
 * Falls back to Haversine if the API fails.
 */
export async function getRoadDistances(
  userLat: number,
  userLng: number,
  posts: Coordinate[]
): Promise<Record<string, number>> {
  const result: Record<string, number> = {};

  // If no posts, return empty
  if (posts.length === 0) return result;

  // We are temporarily disabling OSRM road distance calculation 
  // because the public API is extremely slow (often 2-5s latency).
  // We will calculate straight-line Haversine distance locally instead for instant loads.
  posts.forEach((post) => {
    result[post.id] = calculateDistance(userLat, userLng, post.latitude, post.longitude);
  });
  
  return result;
}

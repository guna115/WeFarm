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

  try {
    // OSRM requires coordinates in longitude,latitude format
    // First coordinate is the user (origin)
    let coordinatesString = `${userLng},${userLat}`;
    
    // Append all post coordinates (destinations)
    posts.forEach((post) => {
      coordinatesString += `;${post.longitude},${post.latitude}`;
    });

    // Request the table from source 0 (the user) to all other points
    const url = `http://router.project-osrm.org/table/v1/driving/${coordinatesString}?sources=0`;
    
    // 5-second timeout for the fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.distances || !data.distances[0]) {
      throw new Error('Invalid OSRM response format');
    }

    // distances[0] contains distance from user (index 0) to all points (including user itself at index 0)
    // distances[0][0] = distance to user (should be 0)
    // distances[0][1] = distance to post 1, etc.
    const distancesArray = data.distances[0];

    posts.forEach((post, index) => {
      // index + 1 because the first element in distancesArray is the user itself
      let distanceMeters = distancesArray[index + 1];
      
      if (distanceMeters === null || distanceMeters === undefined) {
        // Fallback for individual post if routing failed to that specific point
        const fallbackKm = calculateDistance(userLat, userLng, post.latitude, post.longitude);
        result[post.id] = fallbackKm;
      } else {
        // Convert meters to km and round to 1 decimal
        result[post.id] = Math.round((distanceMeters / 1000) * 10) / 10;
      }
    });

    return result;

  } catch (error) {
    console.error('[Distance API] OSRM failed, falling back to Haversine straight-line:', error);
    
    // Global fallback: Calculate Haversine for all posts
    posts.forEach((post) => {
      result[post.id] = calculateDistance(userLat, userLng, post.latitude, post.longitude);
    });
    
    return result;
  }
}

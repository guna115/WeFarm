'use client';

import { useState, useEffect, useCallback } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface UseLocationReturn {
  location: Location | null;
  error: string | null;
  loading: boolean;
  requestLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          perm = await Geolocation.requestPermissions();
        }

        if (perm.location === 'granted' || perm.coarseLocation === 'granted') {
          const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLoading(false);
          return;
        } else {
          setError('Location permission denied. Showing all nurseries.');
          setLoading(false);
          return;
        }
      }
    } catch (nativeErr) {
      console.warn('Native geolocation failed, falling back to browser GPS', nativeErr);
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred.');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 5 * 60 * 1000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { location, error, loading, requestLocation };
}

/**
 * Calculate distance between two coordinates using the Haversine formula
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
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Central API URL configuration.
 * - On Vercel (production): uses the Render backend directly
 * - On localhost (development): uses local backend
 */
const getApiUrl = (): string => {
  // On native mobile app (Android/iOS via Capacitor), localhost points to the phone itself.
  // We must always route mobile app requests to the production cloud backend.
  if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
    return 'https://wefarm-api.onrender.com/api';
  }

  // If explicitly set via environment variable, use that (for web development/deployment)
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api') {
    let url = process.env.NEXT_PUBLIC_API_URL;
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }

  // In browser: check if we're on localhost or production web
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    return 'https://wefarm-api.onrender.com/api';
  }

  // Server-side rendering fallback
  return 'https://wefarm-api.onrender.com/api';
};

export const API_URL = getApiUrl();

/**
 * Central API URL configuration.
 * - On Vercel (production): uses the Render backend directly
 * - On localhost (development): uses local backend
 */
const getApiUrl = (): string => {
  // If explicitly set via environment variable, use that
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL !== '/api') {
    let url = process.env.NEXT_PUBLIC_API_URL;
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }

  // In browser: check if we're on localhost or production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
    // Production (Vercel, any other host)
    return 'https://wefarm-api.onrender.com/api';
  }

  // Server-side rendering fallback
  return 'https://wefarm-api.onrender.com/api';
};

export const API_URL = getApiUrl();

/**
 * Central configuration for API URL.
 * In production (Vercel), uses the Render backend.
 * In development, uses localhost.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://wefarm-api.onrender.com/api'
    : 'http://localhost:5000/api');

// Dynamic API configuration based on environment
export const HOST_API = import.meta.env.VITE_API_URL || 'https://api.vivaclub.io';
export const HOST_APP = import.meta.env.VITE_APP_URL || 'https://app.vivaclub.io';

// export const HOST_API = 'https://api.vivaclub.io';
// export const HOST_API = 'http://65.21.112.153:3000';
// export const HOST_API = 'https://vivaclub-backend.onrender.com';
// export const HOST_API = 'http://192.168.86.22:3000';

// Development fallback
if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
  console.warn('VITE_API_URL not set, using localhost:3000 for development');
}
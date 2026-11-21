// Centralized API configuration for local & cloud deployments

export const getApiUrl = (endpoint) => {
  // 1. Check for user-defined cloud backend URL in localStorage
  const customCloudUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('ganpati_mandal_cloud_url') 
    : null;
    
  // 2. Check for Vite environment variable VITE_API_URL
  const envUrl = import.meta.env.VITE_API_URL;

  // 3. If hosted on Vercel or external domain, automatically fallback to live Render cloud server!
  const isVercelOrExternal = typeof window !== 'undefined' && 
    (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('github.io'));
  const defaultCloudUrl = isVercelOrExternal ? 'https://mahadev-yuvak-mandal.onrender.com' : '';

  const base = customCloudUrl || envUrl || defaultCloudUrl || '';
  const cleanBase = base.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${cleanBase}${cleanEndpoint}`;
};

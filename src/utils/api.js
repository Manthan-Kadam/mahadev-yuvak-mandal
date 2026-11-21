// Centralized API configuration for local & cloud deployments

export const getApiUrl = (endpoint) => {
  // 1. Check for user-defined cloud backend URL in localStorage or window
  const customCloudUrl = typeof window !== 'undefined' 
    ? localStorage.getItem('ganpati_mandal_cloud_url') 
    : null;
    
  // 2. Check for Vite environment variable VITE_API_URL
  const envUrl = import.meta.env.VITE_API_URL;

  const base = customCloudUrl || envUrl || '';
  const cleanBase = base.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${cleanBase}${cleanEndpoint}`;
};

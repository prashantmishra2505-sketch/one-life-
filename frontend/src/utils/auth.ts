import { useState, useEffect } from 'react';

export const isCitizenAuthenticated = () => {
  return sessionStorage.getItem('citizen_authenticated') === 'true';
};

export const getCitizenId = () => {
  return sessionStorage.getItem('citizen_id');
};

export const clearCitizenAuth = () => {
  sessionStorage.removeItem('citizen_authenticated');
  sessionStorage.removeItem('citizen_id');
  sessionStorage.removeItem('citizen_login_redirect');
  // Dispatch event so hooks update immediately
  window.dispatchEvent(new Event('citizen_auth_change'));
};

export const setCitizenAuth = (id: string) => {
  sessionStorage.setItem('citizen_authenticated', 'true');
  sessionStorage.setItem('citizen_id', id);
  // Dispatch event so hooks update immediately
  window.dispatchEvent(new Event('citizen_auth_change'));
};

export function useCitizenAuth() {
  const [auth, setAuth] = useState(isCitizenAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => {
      setAuth(isCitizenAuthenticated());
    };

    window.addEventListener('citizen_auth_change', handleAuthChange);
    // Also listen to storage events for cross-tab sync if needed
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('citizen_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return auth;
}

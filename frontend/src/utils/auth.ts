import { useState, useEffect } from 'react';

// CITIZEN AUTH
export const isCitizenAuthenticated = () => {
  return !!sessionStorage.getItem('citizen_token');
};

export const getCitizenId = () => {
  return sessionStorage.getItem('citizen_id');
};

export const getCitizenToken = () => {
  return sessionStorage.getItem('citizen_token');
};

export const clearCitizenAuth = () => {
  sessionStorage.removeItem('citizen_token');
  sessionStorage.removeItem('citizen_id');
  sessionStorage.removeItem('citizen_login_redirect');
  window.dispatchEvent(new Event('citizen_auth_change'));
};

export const setCitizenAuth = (id: string, token: string) => {
  sessionStorage.setItem('citizen_token', token);
  sessionStorage.setItem('citizen_id', id);
  window.dispatchEvent(new Event('citizen_auth_change'));
};

export function useCitizenAuth() {
  const [auth, setAuth] = useState(isCitizenAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => setAuth(isCitizenAuthenticated());
    window.addEventListener('citizen_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('citizen_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return auth;
}

// OFFICER AUTH
export const isOfficerAuthenticated = () => {
  return !!sessionStorage.getItem('officer_token');
};

export const getOfficerToken = () => {
  return sessionStorage.getItem('officer_token');
};

export const getOfficerName = () => {
  return sessionStorage.getItem('officer_name');
};

export const clearOfficerAuth = () => {
  sessionStorage.removeItem('officer_token');
  sessionStorage.removeItem('officer_id');
  sessionStorage.removeItem('officer_name');
  window.dispatchEvent(new Event('officer_auth_change'));
};

export const setOfficerAuth = (id: string, token: string, name?: string) => {
  sessionStorage.setItem('officer_token', token);
  sessionStorage.setItem('officer_id', id);
  if (name) sessionStorage.setItem('officer_name', name);
  window.dispatchEvent(new Event('officer_auth_change'));
};

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Controlla se c'è un token al caricamento o quando cambia la pagina
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, [pathname]); // Si riattiva se l'utente naviga

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      router.push('/signin');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

import { API_URL } from '@/lib/config';

export interface SellerProfile {
  id: string;
  phone_number: string;
  nursery_name: string;
  owner_name: string;
  whatsapp_number?: string;
  address: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  courier_available: boolean;
  profile_complete: boolean;
}

interface AuthContextType {
  // Auth state
  user: { phoneNumber: string } | null;
  token: string | null;
  loading: boolean;

  // Seller state
  seller: SellerProfile | null;
  profileComplete: boolean;

  // Actions
  devLogin: (phone: string) => void;
  refreshToken: () => Promise<string | null>;
  refreshSellerProfile: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  seller: null,
  profileComplete: false,
  devLogin: () => {},
  refreshToken: async () => null,
  refreshSellerProfile: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ phoneNumber: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileComplete = seller?.profile_complete ?? false;

  // Dev login — just stores phone number, no real auth
  const devLogin = useCallback((phone: string) => {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    const devUser = { phoneNumber: formattedPhone };
    setUser(devUser);
    setToken('dev-token');
    localStorage.setItem('wefarm-dev-user', JSON.stringify(devUser));
  }, []);

  // Fetch seller profile from backend (dev mode — no auth header)
  const refreshSellerProfile = useCallback(async () => {
    if (!user?.phoneNumber) return;
    try {
      const res = await fetch(
        `${API_URL}/seller/profile-by-phone?phone=${encodeURIComponent(user.phoneNumber)}`
      );
      if (res.ok) {
        const data = await res.json();
        setSeller(data.seller);
      } else {
        setSeller(null);
      }
    } catch {
      setSeller(null);
    }
  }, [user]);

  const refreshToken = useCallback(async () => {
    return token;
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSeller(null);
    localStorage.removeItem('wefarm-dev-user');
  }, []);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wefarm-dev-user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setToken('dev-token');
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  // Fetch seller profile when user changes
  useEffect(() => {
    if (user?.phoneNumber) {
      refreshSellerProfile();
    }
  }, [user, refreshSellerProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        seller,
        profileComplete,
        devLogin,
        refreshToken,
        refreshSellerProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { AuthContextType };

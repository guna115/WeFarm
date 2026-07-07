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
  profileLoading: boolean;

  // Seller state
  seller: SellerProfile | null;
  profileComplete: boolean;

  // Actions
  devLogin: (phone: string) => void;
  refreshToken: () => Promise<string | null>;
  refreshSellerProfile: (phoneToFetch?: string) => Promise<SellerProfile | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  profileLoading: false,
  seller: null,
  profileComplete: false,
  devLogin: () => {},
  refreshToken: async () => null,
  refreshSellerProfile: async () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ phoneNumber: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const profileComplete = seller?.profile_complete ?? false;

  // Dev login — just stores phone number, no real auth
  const devLogin = useCallback((phone: string) => {
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    const devUser = { phoneNumber: formattedPhone };
    setUser(devUser);
    setToken('dev-token');
    localStorage.setItem('wefarm-dev-user', JSON.stringify(devUser));
  }, []);

  // Fetch seller profile from backend
  const refreshSellerProfile = useCallback(async (phoneToFetch?: string): Promise<SellerProfile | null> => {
    const targetPhone = phoneToFetch || user?.phoneNumber;
    if (!targetPhone) {
      setSeller(null);
      setProfileLoading(false);
      return null;
    }
    try {
      setProfileLoading(true);
      const res = await fetch(
        `${API_URL}/seller/profile-by-phone?phone=${encodeURIComponent(targetPhone)}`
      );
      if (res.ok) {
        const data = await res.json();
        const loadedSeller = data.seller || null;
        setSeller(loadedSeller);
        setProfileLoading(false);
        return loadedSeller;
      } else {
        setSeller(null);
        setProfileLoading(false);
        return null;
      }
    } catch {
      setSeller(null);
      setProfileLoading(false);
      return null;
    }
  }, [user]);

  const refreshToken = useCallback(async () => {
    return token;
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setSeller(null);
    setProfileLoading(false);
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
      refreshSellerProfile(user.phoneNumber);
    } else {
      setSeller(null);
      setProfileLoading(false);
    }
  }, [user, refreshSellerProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        profileLoading,
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

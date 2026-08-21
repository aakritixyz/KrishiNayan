"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  apiJson,
  ApiError,
  getStoredToken,
  setStoredToken,
} from "@/lib/api";

export type AuthUser = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  language: string;
  profile_completed: boolean;
  identity_verification_status: string;
};

export type Profile = {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  language: string;
  state: string | null;
  district: string | null;
  village: string | null;
  farm_size_acres: number | null;
  crops: string[];
  irrigation_type: string | null;
  farmer_category: string | null;
  profile_completed: boolean;
  completion_percent: number;
  missing_fields: string[];
  identity_verification_status: string;
  identity_verification_provider: string | null;
  identity_verified_at: string | null;
};

export type ProfileUpdateInput = Partial<{
  full_name: string;
  language: string;
  state: string;
  district: string;
  village: string;
  farm_size_acres: number;
  crops: string[];
  irrigation_type: string;
  farmer_category: string;
}>;

type RegisterInput = {
  full_name: string;
  email?: string;
  phone?: string;
  password: string;
  language?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    if (!getStoredToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await apiJson<AuthUser>("/auth/me");
      setUser(currentUser);
    } catch (error) {
      // Expired/invalid token - clear it so we don't keep retrying.
      if (error instanceof ApiError && error.status === 401) {
        setStoredToken(null);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadCurrentUser();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCurrentUser]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const data = await apiJson<{ access_token: string; user: AuthUser }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ identifier, password }),
        }
      );

      setStoredToken(data.access_token);
      setUser(data.user);
    },
    []
  );

  const register = useCallback(async (input: RegisterInput) => {
    const data = await apiJson<{ access_token: string; user: AuthUser }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    );

    setStoredToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
    // Best-effort server call; the client-side token clear above is
    // what actually ends the session, so we don't await/block on it.
    apiJson("/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser: loadCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

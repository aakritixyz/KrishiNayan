"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  role: "farmer" | "officer";
  institutional_id: string | null;
  organisation: string | null;
  designation: string | null;
  access_state: string | null;
  access_district: string | null;
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
  login: (identifier: string, password: string) => Promise<AuthUser>;
  officerLogin: (institutionalId: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  continueAsGuest: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Invalidates any in-flight /auth/me request when the active session changes.
  // This prevents a stale officer response from restoring the officer session
  // after the user explicitly chooses Guest mode.
  const sessionEpochRef = useRef(0);

  const loadCurrentUser = useCallback(async () => {
    const requestEpoch = sessionEpochRef.current;

    if (!getStoredToken()) {
      if (requestEpoch === sessionEpochRef.current) {
        setUser(null);
        setIsLoading(false);
      }
      return;
    }

    try {
      const currentUser = await apiJson<AuthUser>("/auth/me");
      if (requestEpoch === sessionEpochRef.current) {
        setUser(currentUser);
      }
    } catch (error) {
      if (requestEpoch !== sessionEpochRef.current) return;

      // Expired/invalid token - clear it so we don't keep retrying.
      if (error instanceof ApiError && error.status === 401) {
        setStoredToken(null);
      }
      setUser(null);
    } finally {
      if (requestEpoch === sessionEpochRef.current) {
        setIsLoading(false);
      }
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

      sessionEpochRef.current += 1;
      setStoredToken(data.access_token);
      setUser(data.user);
      setIsLoading(false);
      return data.user;
    },
    []
  );


  const officerLogin = useCallback(
    async (institutionalId: string, password: string) => {
      const data = await apiJson<{ access_token: string; user: AuthUser }>(
        "/auth/officer-login",
        {
          method: "POST",
          body: JSON.stringify({
            institutional_id: institutionalId,
            password,
          }),
        }
      );

      sessionEpochRef.current += 1;
      setStoredToken(data.access_token);
      setUser(data.user);
      setIsLoading(false);
      return data.user;
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

    sessionEpochRef.current += 1;
    setStoredToken(data.access_token);
    setUser(data.user);
    setIsLoading(false);
  }, []);

  const clearClientSession = useCallback(() => {
    sessionEpochRef.current += 1;
    setStoredToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    // JWT auth is stateless in this prototype. Clearing the browser token is
    // the authoritative sign-out; calling /auth/logout after clearing it would
    // only produce a 401 because there is no token left to send.
    clearClientSession();
  }, [clearClientSession]);

  const continueAsGuest = useCallback(() => {
    // Guest mode must always start from a clean unauthenticated session.
    // In particular, this removes any previously stored officer token.
    clearClientSession();
  }, [clearClientSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        officerLogin,
        register,
        logout,
        continueAsGuest,
        refreshUser: loadCurrentUser,
      }}
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

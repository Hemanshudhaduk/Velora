// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken as getStoredToken, getUser, setToken as storeToken, setUser as storeUser, clearAuth } from "@/utils/localStore";

export type User = {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  role?: string | null;
};

type SignUpPayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<any>;
  signInWithGoogle: (credential: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
  fetchWithAuth: (path: string, options?: RequestInit, opts?: { useCookies?: boolean }) => Promise<any>;
  getToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE =
  (import.meta && (import.meta as any).env?.VITE_API_BASE_URL) ||
  (process.env.REACT_APP_API_BASE_URL as string) ||
  "https://clothing-store-server.vercel.app";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(() => getStoredToken());
  const [user, setUserState] = useState<User | null>(() => {
    const su = getUser();
    return su ? (su as User) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Helper function to get current token
  const getToken = (): string | null => {
    return token || getStoredToken();
  };

  // fetch helper — supports cookie-based auth (useCookies: true) or bearer token header
  const fetchWithAuth = async (path: string, options: RequestInit = {}, opts: { useCookies?: boolean } = {}) => {
    const tokenNow = getToken();
    const url = `${API_BASE}${path}`;
    const headers: Record<string, string> = {};

    // don't set content-type for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (!opts.useCookies && tokenNow) {
      headers["Authorization"] = `Bearer ${tokenNow}`;
    }

    const res = await fetch(url, {
      credentials: opts.useCookies ? "include" : "same-origin",
      ...options,
      headers: {
        ...(options.headers as Record<string, string> || {}),
        ...headers,
      },
    });

    const text = await res.text().catch(() => "");
    let json: any = null;
    try { 
      json = text ? JSON.parse(text) : null; 
    } catch { 
      json = null; 
    }

    if (!res.ok) {
      const message = (json && (json.message || json.error)) || res.statusText || "Request failed";
      const error: any = new Error(message);
      error.status = res.status;
      error.payload = json;
      throw error;
    }
    return json;
  };

  // Refresh profile — only sign out on 401/403 (invalid token)
  const refreshProfile = async () => {
    const tokenNow = getToken();
    if (!tokenNow) return;
    
    try {
      const res = await fetchWithAuth("/api/profile/me", { method: "GET" }, { useCookies: false });
      if (res && res.success && res.data && res.data.user) {
        setUserState(res.data.user as User);
        storeUser(res.data.user);
      } else {
        console.warn("Unexpected profile response", res);
      }
    } catch (err: any) {
      // If unauthorized -> clear auth. Otherwise keep user and show console
      if (err?.status === 401 || err?.status === 403) {
        signOut();
      } else {
        console.warn("Profile refresh error", err);
      }
    }
  };

  // initial hydrate + refresh profile
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const storedToken = getStoredToken();
        if (storedToken) {
          setTokenState(storedToken);
          await refreshProfile();
        } else {
          const storedUser = getUser();
          if (storedUser && mounted) setUserState(storedUser as User);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign in — uses standard /api/auth/signin shape and saves token+user
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "same-origin",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Sign in failed");
      }

      const tokenFromServer = data?.data?.token ?? data?.token;
      const userFromServer = data?.data?.user ?? data?.user;

      if (!tokenFromServer || !userFromServer) {
        if (data.success && data.data?.user && !tokenFromServer) {
          // cookie-based: user returned, token handled via cookie by server
          setUserState(data.data.user as User);
          storeUser(data.data.user);
          setTokenState(null);
          storeToken(null);
          return;
        }
        throw new Error("Invalid sign-in response from server");
      }

      setTokenState(tokenFromServer);
      setUserState(userFromServer as User);
      storeToken(tokenFromServer);
      storeUser(userFromServer);
    } catch (error: any) {
      throw new Error(error.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  // Sign up — returns server response (OTP flow). No auto-login.
  const signUp = async (payload: SignUpPayload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Signup failed");
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  const signInWithGoogle = async (credential: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
        credentials: "same-origin",
      });
      
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Google sign-in failed");
      }

      const tokenFromServer = data?.data?.token;
      const userFromServer = data?.data?.user;

      if (!tokenFromServer || !userFromServer) {
        throw new Error("Invalid Google sign-in response");
      }

      setTokenState(tokenFromServer);
      setUserState(userFromServer as User);
      storeToken(tokenFromServer);
      storeUser(userFromServer);
    } catch (error: any) {
      throw new Error(error.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setTokenState(null);
    setUserState(null);
    clearAuth();
    navigate("/", { replace: true });
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token),
    signIn,
    signUp,
    signOut,
    refreshProfile,
    fetchWithAuth,
    signInWithGoogle,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
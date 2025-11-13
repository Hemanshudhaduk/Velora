// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, getUser, setToken, setUser, TOKEN_KEY, USER_KEY } from "@/utils/localStore";

type User = { id: string; name: string; email: string };

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * NOTE: This is a local/mock auth provider that stores a fake token & user
 * in localStorage. Replace signIn/signUp implementation with real API calls later.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUserState] = useState<User | null>(() => getUser() as User | null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setTokenState(getToken());
    setUserState(getUser() as User | null);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock verification: accept any non-empty password
      if (!email || !password) throw new Error("Invalid credentials");

      // Create a fake token and user
      const fakeToken = btoa(`${email}:${Date.now()}`);
      const fakeUser: User = { id: String(Date.now()), name: email.split("@")[0], email };

      setToken(fakeToken);
      setUser(fakeUser);
      setTokenState(fakeToken);
      setUserState(fakeUser);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // In mock, simply create account and auto-signin
      if (!email || !password || !name) throw new Error("Missing fields");

      const fakeToken = btoa(`${email}:${Date.now()}`);
      const fakeUser: User = { id: String(Date.now()), name, email };

      setToken(fakeToken);
      setUser(fakeUser);
      setTokenState(fakeToken);
      setUserState(fakeUser);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    setTokenState(null);
    setUserState(null);
    // optional: navigate to home
    navigate("/", { replace: true });
  };

  useEffect(() => {
    // persist token & user
    setToken(token);
    setUser(user);
  }, [token, user]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: Boolean(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const c = useContext(AuthContext);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
};

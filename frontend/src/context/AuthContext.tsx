import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, saveToken, clearToken } from "@/src/lib/api";

export type User = {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  grade?: string;
  school?: string;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signInAsGuest: () => Promise<void>;
  processGoogleSessionToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const u = await api.get<User>("/auth/me");
      setUser(u);
    } catch {
      setUser(null);
      await clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signInAsGuest = useCallback(async () => {
    const res = await api.post<{ token: string; user: User }>("/auth/guest");
    await saveToken(res.token);
    setUser(res.user);
  }, []);

  const processGoogleSessionToken = useCallback(async (session_token: string) => {
    const res = await api.post<{ token: string; user: User }>("/auth/session", { session_token });
    await saveToken(res.token);
    setUser(res.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    await clearToken();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, signInAsGuest, processGoogleSessionToken, signOut, refresh }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tokenStore } from "./api/client";

export interface CurrentUser {
  email: string;
  id?: number;
  fullName?: string;
  exp?: number;
}

function decodeJwt(token: string): CurrentUser | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    const email = json.email ?? json.sub ?? json.username;
    if (!email) return null;
    return { email, id: json.id ?? json.userId, fullName: json.fullName ?? json.name, exp: json.exp };
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const t = tokenStore.get();
    if (t) {
      const u = decodeJwt(t);
      if (u && (!u.exp || u.exp * 1000 > Date.now())) setUser(u);
      else tokenStore.clear();
    }
  }, []);

  const setToken = (token: string) => {
    tokenStore.set(token);
    setUser(decodeJwt(token));
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
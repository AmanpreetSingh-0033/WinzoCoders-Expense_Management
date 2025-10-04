import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthPayload, LoginInput, SignupInput, Role, User, Company } from "@shared/api";

interface AuthContextValue {
  user: User | null;
  company: Company | null;
  token: string | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthPayload>;
  signup: (input: SignupInput) => Promise<AuthPayload>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("auth");
    if (data) {
      const parsed = JSON.parse(data) as AuthPayload;
      setUser(parsed.user);
      setCompany(parsed.company);
      setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error("Login failed");
    const payload = (await res.json()) as AuthPayload;
    setUser(payload.user);
    setCompany(payload.company);
    setToken(payload.token);
    localStorage.setItem("auth", JSON.stringify(payload));
    return payload;
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const res = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (!res.ok) throw new Error("Signup failed");
    const payload = (await res.json()) as AuthPayload;
    setUser(payload.user);
    setCompany(payload.company);
    setToken(payload.token);
    localStorage.setItem("auth", JSON.stringify(payload));
    return payload;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCompany(null);
    setToken(null);
    localStorage.removeItem("auth");
  }, []);

  const hasRole = useCallback((...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role as Role);
  }, [user]);

  const value = useMemo(() => ({ user, company, token, loading, login, signup, logout, hasRole }), [user, company, token, loading, login, signup, logout, hasRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthHeader() {
  const { token } = useAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

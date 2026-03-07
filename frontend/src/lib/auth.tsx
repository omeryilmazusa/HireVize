"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    api
      .get<AuthUser>("/api/v1/profile")
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const u = await api.post<AuthUser>("/api/v1/auth/login", {
        email,
        password,
      });
      setUser(u);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      first_name: string,
      last_name: string
    ) => {
      const u = await api.post<AuthUser>("/api/v1/auth/register", {
        email,
        password,
        first_name,
        last_name,
      });
      setUser(u);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(async () => {
    await api.post("/api/v1/auth/logout", {});
    setUser(null);
    router.push("/signin");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

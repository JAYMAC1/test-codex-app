import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  postcode?: string;
  emailVerifiedAt?: string | null;
  streetGroupId?: string | null;
  townId?: string | null;
  addressRole?: "OWNER" | "RESIDENT" | null;
  isAdmin?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("cc_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get("/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("cc_token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      token,
      async login(newToken: string) {
        localStorage.setItem("cc_token", newToken);
        setToken(newToken);
      },
      logout() {
        localStorage.removeItem("cc_token");
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

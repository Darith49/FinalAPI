import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, isApiAvailable, tokenStore, ApiUser } from "@/lib/api";

export type UserRole = "admin" | "restaurant" | "delivery" | "customer";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  restaurantSlug?: string;
  phone?: string;
};

const STORAGE = "saveur_auth_user";

type LoginResult = { ok: boolean; error?: string; user?: AuthUser };
type SignupInput = { name: string; email: string; password: string; role?: UserRole; phone?: string };

type AuthCtx = {
  user: AuthUser | null;
  apiOnline: boolean;
  checkingApi: boolean;
  login: (emailOrUsername: string, password: string) => Promise<LoginResult>;
  signup: (data: SignupInput) => Promise<LoginResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function fromApi(u: ApiUser, fallbackName?: string): AuthUser {
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ").trim();
  return {
    id: String(u.id),
    name: fullName || fallbackName || u.username,
    email: u.email,
    username: u.username,
    role: u.role,
    phone: u.phone,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(STORAGE) || "null"); } catch { return null; }
  });
  const [apiOnline, setApiOnline] = useState(false);
  const [checkingApi, setCheckingApi] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const online = await isApiAvailable();
      if (cancelled) return;
      setApiOnline(online);
      setCheckingApi(false);
      if (online && tokenStore.access) {
        try {
          const me = await api.me();
          if (!cancelled) setUser(fromApi(me));
        } catch {
          tokenStore.clear();
          if (!cancelled) setUser(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE, JSON.stringify(user));
    else localStorage.removeItem(STORAGE);
  }, [user]);

  const refreshUser = async () => {
    try {
      const me = await api.me();
      setUser(fromApi(me));
    } catch {
      tokenStore.clear();
      setUser(null);
    }
  };

  const login: AuthCtx["login"] = async (emailOrUsername, password) => {
    if (!apiOnline) {
      return { ok: false, error: "Backend is offline. Start the Django server (python manage.py runserver) and refresh." };
    }
    const id = (emailOrUsername || "").trim();
    const pwd = password || "";
    if (!id || !pwd) return { ok: false, error: "Please enter your email and password." };

    try {
      const { user: u } = await api.login(id, pwd);
      const mapped = fromApi(u);
      setUser(mapped);
      return { ok: true, user: mapped };
    } catch (e) {
      const err = e as Error;
      return { ok: false, error: err.message || "Login failed" };
    }
  };

  const signup: AuthCtx["signup"] = async ({ name, email, password, role = "customer", phone }) => {
    if (!apiOnline) {
      return { ok: false, error: "Backend is offline. Start the Django server (python manage.py runserver) and refresh." };
    }
    const trimmedName = (name || "").trim();
    const normEmail = (email || "").trim().toLowerCase();
    if (!trimmedName || !normEmail || !password) return { ok: false, error: "Please fill in name, email and password." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

    const [first_name, ...rest] = trimmedName.split(/\s+/);
    const last_name = rest.join(" ");
    const baseUsername = normEmail.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_") || "user";
    const username = `${baseUsername}_${Math.random().toString(36).slice(2, 6)}`;

    try {
      const { user: u } = await api.register({ username, email: normEmail, password, role, phone, first_name, last_name });
      const mapped = fromApi(u, trimmedName);
      setUser(mapped);
      return { ok: true, user: mapped };
    } catch (e) {
      return { ok: false, error: (e as Error).message || "Sign-up failed" };
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, apiOnline, checkingApi, login, signup, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

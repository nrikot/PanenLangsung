"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
  verificationStatus: string;
}

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function getCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function cacheUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCachedUser());
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

  const fetchUser = useCallback(async (opts?: { silent?: boolean }) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    const silent = opts?.silent ?? false;

    try {
      const supabase = createClient();
      const { data: { user: sbUser } } = await supabase.auth.getUser();

      if (!sbUser) {
        if (!silent) {
          setUser(null);
          setSupabaseUser(null);
          cacheUser(null);
        }
        return;
      }

      setSupabaseUser(sbUser);

      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        const authUser: AuthUser = {
          id: u.id,
          email: u.email,
          role: u.role,
          name: u.name,
          verificationStatus: u.verificationStatus ?? "pending",
        };
        setUser(authUser);
        cacheUser(authUser);
      } else {
        if (!silent) {
          setUser(null);
          cacheUser(null);
        }
      }
    } catch {
      if (!silent) {
        setUser(null);
        setSupabaseUser(null);
        cacheUser(null);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    cacheUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    let mounted = true;

    setLoading(false);
    fetchUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (!mounted) return;
        if (event === "SIGNED_IN") {
          await fetchUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSupabaseUser(null);
          cacheUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

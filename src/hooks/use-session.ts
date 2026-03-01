"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import React from "react";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
};

type SessionContextType = {
  user: SessionUser | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType>({
  user: null,
  isLoading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else if (res.status === 401) {
        setUser(null);
      }
      // For other errors (5xx, network), keep current user to avoid unexpected logout
    } catch {
      // Network error — keep current user state
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Even if logout request fails, still clear client state
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return React.createElement(
    SessionContext.Provider,
    { value: { user, isLoading, refresh, logout } },
    children
  );
}

export function useSession() {
  return useContext(SessionContext);
}

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { trpc } from "./trpc";
import type { SessionUser } from "@shared/types";
import { requestStorageAccessIfEmbedded } from "./storage-access";

// Frontend auth seam. Wraps the tRPC auth router so pages consume a single
// `useAuth()` — they never see the session mechanism (cookie/JWT/SSO). Mirrors
// the server AuthProvider abstraction (DESIGN §5.1).
//
// There is NO signup: the site has exactly one admin, bootstrapped server-side.
// `login` takes the admin username + password and hits `admin.login`, which is
// rate-limited on the server.
interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const utils = trpc.useUtils();
  const me = trpc.auth.me.useQuery();
  const loginM = trpc.admin.login.useMutation();
  const logoutM = trpc.auth.logout.useMutation();

  const value = useMemo<AuthContextValue>(
    () => ({
      user: me.data ?? null,
      isLoading: me.isLoading,
      login: async (username, password) => {
        await requestStorageAccessIfEmbedded();
        await loginM.mutateAsync({ username, password });
        await utils.auth.me.invalidate();
      },
      logout: async () => {
        await requestStorageAccessIfEmbedded();
        await logoutM.mutateAsync();
        await utils.auth.me.invalidate();
      },
    }),
    [me.data, me.isLoading, loginM, logoutM, utils],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

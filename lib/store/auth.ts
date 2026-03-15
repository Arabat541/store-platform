import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  token: string | null;
  user: { userId: number; email: string; name: string; role: string } | null;
  setAuth: (token: string, user: AuthStore["user"]) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => {
        set({ token: null, user: null });
        document.cookie = "auth-token=; path=/; max-age=0";
        window.location.href = "/login";
      },
      isAuthenticated: () => !!get().token,
    }),
    { name: "auth-storage" }
  )
);

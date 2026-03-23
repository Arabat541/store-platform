import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

interface CustomerAuthStore {
  token: string | null;
  customer: Customer | null;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  setAuth: (token: string, customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useCustomerAuthStore = create<CustomerAuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      customer: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setAuth: (token, customer) => {
        set({ token, customer });
        document.cookie = `customer-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      },
      updateCustomer: (customer) => set({ customer }),
      logout: () => {
        set({ token: null, customer: null });
        document.cookie = "customer-token=; path=/; max-age=0";
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "customer-auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

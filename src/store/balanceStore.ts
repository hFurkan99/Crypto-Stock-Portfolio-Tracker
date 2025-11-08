import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BalanceState {
  balance: number;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => boolean; // returns true if success
  reset: () => void;
}

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      balance: 0,
      deposit: (amount: number) => {
        set((s) => ({ balance: +(s.balance + amount) }));
      },
      withdraw: (amount: number) => {
        const b = get().balance;
        if (b < amount) return false;
        set((s) => ({ balance: +(s.balance - amount) }));
        return true;
      },
      reset: () => set({ balance: 0 }),
    }),
    { name: "crypto-portfolio-balance" }
  )
);

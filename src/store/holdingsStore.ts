import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Holding } from "@/types/holding.types";

interface HoldingsState {
  holdings: Holding[];
  addHolding: (
    holding: Omit<Holding, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateHolding: (id: string, holding: Partial<Holding>) => void;
  deleteHolding: (id: string) => void;
  getHolding: (id: string) => Holding | undefined;
}

export const useHoldingsStore = create<HoldingsState>()(
  persist(
    (set, get) => ({
      holdings: [],

      addHolding: (holding) => {
        const newHolding: Holding = {
          ...holding,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          holdings: [...state.holdings, newHolding],
        }));
      },

      updateHolding: (id, updates) => {
        set((state) => ({
          holdings: state.holdings.map((h) =>
            h.id === id
              ? { ...h, ...updates, updatedAt: new Date().toISOString() }
              : h
          ),
        }));
      },

      deleteHolding: (id) => {
        set((state) => ({
          holdings: state.holdings.filter((h) => h.id !== id),
        }));
      },

      getHolding: (id) => {
        return get().holdings.find((h) => h.id === id);
      },
    }),
    {
      name: "crypto-portfolio-holdings",
    }
  )
);

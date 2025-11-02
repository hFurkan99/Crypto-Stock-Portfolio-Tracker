import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistItem } from "@/types/watchlist.types";

interface WatchlistState {
  watchlist: WatchlistItem[];
  addToWatchlist: (item: Omit<WatchlistItem, "id" | "addedAt">) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (coinId: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchlist: [],

      addToWatchlist: (item) => {
        const newItem: WatchlistItem = {
          ...item,
          id: crypto.randomUUID(),
          addedAt: new Date().toISOString(),
        };
        set((state) => ({
          watchlist: [...state.watchlist, newItem],
        }));
      },

      removeFromWatchlist: (id) => {
        set((state) => ({
          watchlist: state.watchlist.filter((item) => item.id !== id),
        }));
      },

      isInWatchlist: (coinId) => {
        return get().watchlist.some((item) => item.coinId === coinId);
      },
    }),
    {
      name: "crypto-portfolio-watchlist",
    }
  )
);
